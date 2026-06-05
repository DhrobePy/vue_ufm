import { h as defineEventHandler, p as getQuery, I as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const pricing_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const category = q.category || "";
  const variantWhere = category ? "AND LOWER(p.category) = LOWER(?)" : "";
  const variantParams = category ? [category] : [];
  const [variants, prices, branches] = await Promise.all([
    query(
      `SELECT pv.id, pv.sku, pv.product_id, pv.weight_variant, pv.grade, pv.unit_of_measure,
              p.base_name AS product_name, p.category
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id AND p.status = 'active'
       WHERE pv.status = 'active' ${variantWhere}
       ORDER BY p.category, p.base_name, pv.grade`,
      variantParams
    ),
    query(
      `SELECT pp.id AS price_id, pp.variant_id, pp.branch_id,
              b.name AS branch_name, b.code AS branch_code,
              pp.unit_price, pp.effective_date, pp.status
       FROM product_prices pp
       JOIN branches b ON b.id = pp.branch_id
       WHERE pp.is_active = 1
       ORDER BY pp.variant_id, pp.branch_id`
    ),
    query(
      `SELECT id, name, code FROM branches WHERE status = 'active' ORDER BY id`
    )
  ]);
  const priceMap = /* @__PURE__ */ new Map();
  for (const p of prices) {
    if (!priceMap.has(p.variant_id)) priceMap.set(p.variant_id, []);
    priceMap.get(p.variant_id).push(p);
  }
  return {
    variants: variants.map((v) => {
      var _a;
      return { ...v, prices: (_a = priceMap.get(v.id)) != null ? _a : [] };
    }),
    branches
  };
});

export { pricing_get as default };
//# sourceMappingURL=pricing.get.mjs.map
