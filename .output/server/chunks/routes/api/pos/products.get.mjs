import { m as defineEventHandler, x as getQuery, a1 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const products_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const branchId = q.branch_id ? Number(q.branch_id) : 1;
  const products = await query(
    `SELECT pv.id, pv.sku, pv.weight_variant, pv.grade,
            p.id AS product_id, p.base_name, p.category,
            COALESCE(pp.unit_price, pv.unit_price, 0)             AS price,
            GREATEST(0, pv.stock_qty - pv.reserved_qty)           AS stock
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id AND p.status = 'active'
     LEFT JOIN (
       SELECT variant_id, unit_price
       FROM product_prices
       WHERE is_active = 1 AND branch_id = ?
     ) pp ON pp.variant_id = pv.id
     WHERE pv.status = 'active'
     ORDER BY p.category, p.base_name, pv.weight_variant`,
    [branchId]
  );
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
  return { products, categories };
});

export { products_get as default };
//# sourceMappingURL=products.get.mjs.map
