import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, ar as readBody, z as getDb } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const PRICING_ROLES = ["admin", "superadmin"];
const _variantId__post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!PRICING_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Only Admin/Superadmin can set sell prices" });
  const variantId = Number(getRouterParam(event, "variantId"));
  if (!variantId) throw createError({ statusCode: 400, statusMessage: "Invalid variant ID" });
  const body = await readBody(event);
  const { branch_id, unit_price, effective_date, status } = body != null ? body : {};
  if (!branch_id || unit_price == null)
    throw createError({ statusCode: 400, statusMessage: "branch_id and unit_price are required" });
  const price = Number(unit_price);
  if (isNaN(price) || price < 0)
    throw createError({ statusCode: 400, statusMessage: "Invalid unit_price" });
  const date = effective_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const priceStatus = ["active", "promotional"].includes(status) ? status : "active";
  const changedBy = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "System";
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [oldRows] = await conn.query(
      `SELECT id, unit_price FROM product_prices
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1 LIMIT 1`,
      [variantId, branch_id]
    );
    const oldPrice = (_f = (_e = oldRows[0]) == null ? void 0 : _e.unit_price) != null ? _f : null;
    const changeType = oldPrice !== null ? "update" : "set";
    await conn.query(
      `UPDATE product_prices SET is_active = 0
       WHERE variant_id = ? AND branch_id = ? AND is_active = 1`,
      [variantId, branch_id]
    );
    const [ins] = await conn.query(
      `INSERT INTO product_prices (variant_id, branch_id, unit_price, effective_date, status, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [variantId, branch_id, price, date, priceStatus]
    );
    await conn.query(
      `INSERT INTO price_change_log (variant_id, branch_id, old_price, new_price, change_type, changed_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variantId, branch_id, oldPrice, price, changeType, changedBy]
    );
    await conn.commit();
    return { ok: true, priceId: ins.insertId, changeType };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _variantId__post as default };
//# sourceMappingURL=_variantId_.post.mjs.map
