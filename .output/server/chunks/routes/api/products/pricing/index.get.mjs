import { m as defineEventHandler, J as getUserSession, i as createError, G as getRouterParam, a1 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id))
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  const variantId = Number(getRouterParam(event, "variantId"));
  if (!variantId) throw createError({ statusCode: 400, statusMessage: "Invalid variant ID" });
  const [variantRows, prices, changeLogs, branches] = await Promise.all([
    query(
      `SELECT pv.id, pv.sku, pv.weight_variant, pv.grade, pv.unit_of_measure, pv.status,
              p.id AS product_id, p.base_name AS product_name, p.base_sku
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [variantId]
    ),
    query(
      `SELECT pp.id AS price_id, pp.branch_id, b.name AS branch_name, b.code AS branch_code,
              pp.unit_price, pp.effective_date, pp.status, pp.is_active, pp.created_at
       FROM product_prices pp
       JOIN branches b ON b.id = pp.branch_id
       WHERE pp.variant_id = ?
       ORDER BY pp.branch_id ASC, pp.is_active DESC, pp.effective_date DESC, pp.id DESC`,
      [variantId]
    ),
    query(
      `SELECT pcl.id, pcl.branch_id, b.name AS branch_name,
              pcl.old_price, pcl.new_price, pcl.change_type,
              pcl.changed_by, pcl.changed_at, pcl.note
       FROM price_change_log pcl
       JOIN branches b ON b.id = pcl.branch_id
       WHERE pcl.variant_id = ?
       ORDER BY pcl.changed_at DESC
       LIMIT 100`,
      [variantId]
    ),
    query(
      `SELECT id, name, code FROM branches WHERE status = 'active' ORDER BY id`
    )
  ]);
  if (!variantRows.length)
    throw createError({ statusCode: 404, statusMessage: "Variant not found" });
  const variant = variantRows[0];
  const activePrices = {};
  for (const p of prices) {
    if (p.is_active && !activePrices[p.branch_id]) {
      activePrices[p.branch_id] = p;
    }
  }
  return { variant, prices, activePrices, changeLogs, branches };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
