import { p as defineEventHandler, am as readBody, V as getUserSession, l as createError, y as getDb, a3 as nextDocNumber, f as auditLog, aC as sendTelegram } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PROD_ROLES = ["admin", "superadmin", "production manager-srg", "production manager-demra"];
const stockAdjustments_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Production or admin only" });
  const variantId = Number(body == null ? void 0 : body.variant_id);
  const delta = Number(body == null ? void 0 : body.delta);
  const reason = String((_b = body == null ? void 0 : body.reason) != null ? _b : "").trim();
  const notes = (body == null ? void 0 : body.notes) ? String(body.notes).slice(0, 500) : null;
  if (!variantId) throw createError({ statusCode: 400, statusMessage: "variant_id required" });
  if (!delta || !Number.isFinite(delta)) throw createError({ statusCode: 400, statusMessage: "delta must be a non-zero number" });
  if (!reason) throw createError({ statusCode: 400, statusMessage: "reason is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[variant]] = await conn.query(
      `SELECT pv.id, pv.sku, pv.stock_qty, p.base_name AS product_name
       FROM product_variants pv JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [variantId]
    );
    if (!variant) throw createError({ statusCode: 404, statusMessage: "Variant not found" });
    const adjNo = await nextDocNumber(conn, "ADJ", "stock_adjustments", "adj_number");
    const [res] = await conn.query(
      `INSERT INTO stock_adjustments (adj_number, variant_id, delta, reason, notes, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [adjNo, variantId, delta, reason, notes, userId]
    );
    await auditLog(conn, {
      userId,
      action: "other",
      module: "products",
      recordType: "stock_adjustment",
      recordId: res.insertId,
      referenceNumber: adjNo,
      description: `Stock adjustment ${adjNo} for ${variant.product_name} (${variant.sku}) \u2014 ${delta > 0 ? "+" : ""}${delta} \u2014 ${reason} \u2014 pending approval`,
      severity: "warning"
    });
    await conn.commit();
    sendTelegram(
      `\u{1F4E6} <b>Stock Adjustment Recorded</b>
${adjNo} \u2014 ${variant.product_name} (${variant.sku})
${delta > 0 ? "+" : ""}${delta} bags \xB7 ${reason}
Pending approval`
    );
    return { ok: true, adj_number: adjNo, id: res.insertId, status: "pending" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { stockAdjustments_post as default };
//# sourceMappingURL=stock-adjustments.post.mjs.map
