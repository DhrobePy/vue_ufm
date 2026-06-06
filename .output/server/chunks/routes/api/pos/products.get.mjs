import { h as defineEventHandler, p as getQuery, J as query } from '../../../nitro/nitro.mjs';
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
    `SELECT pv.id, pv.sku, pv.weight_variant, pv.grade, pv.status,
            p.id AS product_id, p.base_name, p.category,
            COALESCE(pp.unit_price, 0) AS price,
            COALESCE(inv.quantity, 0)  AS stock
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id AND p.status = 'active'
     LEFT JOIN product_prices pp ON pp.variant_id = pv.id
                                AND pp.is_active = 1
                                AND (pp.branch_id = ? OR pp.branch_id IS NULL)
     LEFT JOIN inventory inv ON inv.variant_id = pv.id AND inv.branch_id = ?
     WHERE pv.status = 'active'
     GROUP BY pv.id, pp.id
     ORDER BY p.category, p.base_name, pv.weight_variant`,
    [branchId, branchId]
  );
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
  return { products, categories };
});

export { products_get as default };
//# sourceMappingURL=products.get.mjs.map
