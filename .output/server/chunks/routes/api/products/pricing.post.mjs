import { V as defineEventHandler, bp as requireAction, av as getUserSession, bb as readBody, ab as getDb, J as createError, b5 as priceAutoApplyEnabled, r as applyPriceChangeToOpenOrders } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const pricing_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  await requireAction(
    event,
    { module: "products", page: "pricing", action: "edit", roleFallback: [] },
    "Only admin (or a user granted Products \u2192 Pricing) may change prices"
  );
  const session = await getUserSession(event);
  const changedBy = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.name) != null ? _b : "System";
  const userId = Number((_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.id) != null ? _d : 1);
  const body = await readBody(event);
  const { action, variantId, branchId, unitPrice, effectiveDate, status, priceId } = body != null ? body : {};
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    if (action === "set_price") {
      if (!variantId || !branchId || unitPrice == null)
        throw createError({ statusCode: 400, statusMessage: "variantId, branchId and unitPrice are required" });
      const price = Number(unitPrice);
      if (isNaN(price) || price < 0) throw createError({ statusCode: 400, statusMessage: "Invalid unit price" });
      const date = effectiveDate || new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
      const [[old]] = await conn.query(`SELECT unit_price FROM product_prices WHERE variant_id = ? AND branch_id = ? AND is_active = 1 LIMIT 1`, [variantId, branchId]);
      const oldPrice = old ? Number(old.unit_price) : null;
      await conn.query(`UPDATE product_prices SET is_active = 0 WHERE variant_id = ? AND branch_id = ? AND is_active = 1`, [variantId, branchId]);
      const [res] = await conn.query(
        `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
        [variantId, branchId, price, date, status || "active"]
      );
      await conn.query(
        `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [variantId, branchId, oldPrice, price, oldPrice !== null ? "update" : "set", changedBy]
      );
      let appliedOrders = 0;
      if (await priceAutoApplyEnabled(conn))
        appliedOrders = (await applyPriceChangeToOpenOrders(conn, { variantId: Number(variantId), branchId: Number(branchId), oldPrice, newPrice: price, userId, label: changedBy })).orders;
      await conn.commit();
      return { ok: true, priceId: res.insertId, appliedToOrders: appliedOrders };
    }
    if (action === "deactivate") {
      if (!priceId) throw createError({ statusCode: 400, statusMessage: "priceId is required" });
      const [[row]] = await conn.query(`SELECT variant_id, branch_id, unit_price FROM product_prices WHERE id = ?`, [priceId]);
      await conn.query(`UPDATE product_prices SET is_active = 0, status = 'inactive' WHERE id = ?`, [priceId]);
      if (row) await conn.query(
        `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by) VALUES (?, ?, ?, NULL, 'archive', ?)`,
        [row.variant_id, row.branch_id, Number(row.unit_price), changedBy]
      );
      await conn.commit();
      return { ok: true };
    }
    throw createError({ statusCode: 400, statusMessage: "Unknown action. Use set_price or deactivate." });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { pricing_post as default };
//# sourceMappingURL=pricing.post.mjs.map
