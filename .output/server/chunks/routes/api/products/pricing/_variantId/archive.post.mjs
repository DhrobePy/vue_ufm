import { n as defineEventHandler, L as getUserSession, j as createError, I as getRouterParam, a9 as readBody, u as getDb } from '../../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const ACCOUNTS_ROLES = ["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"];
const archive_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ACCOUNTS_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  const variantId = Number(getRouterParam(event, "variantId"));
  if (!variantId) throw createError({ statusCode: 400, statusMessage: "Invalid variant ID" });
  const body = await readBody(event);
  const { branch_id, note } = body != null ? body : {};
  if (!branch_id)
    throw createError({ statusCode: 400, statusMessage: "branch_id is required" });
  const changedBy = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "System";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT id, unit_price FROM product_prices
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1 LIMIT 1`,
      [variantId, branch_id]
    );
    if (!rows.length) {
      await conn.rollback();
      throw createError({ statusCode: 404, statusMessage: "No active price found to archive" });
    }
    const currentPrice = rows[0].unit_price;
    await conn.query(
      `UPDATE product_prices SET is_active = 0, status = 'archived'
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
      [variantId, branch_id]
    );
    await conn.query(
      `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by, note)
       VALUES (?, ?, ?, NULL, 'archive', ?, ?)`,
      [variantId, branch_id, currentPrice, changedBy, note || null]
    );
    await conn.commit();
    return { ok: true, message: "Price archived" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { archive_post as default };
//# sourceMappingURL=archive.post.mjs.map
