import { q as defineEventHandler, J as getQuery, aq as query } from '../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  var _a;
  const q = getQuery(event);
  const search = q.search || "";
  const branchId = Number(q.branch_id) || null;
  const where = ['p.status = "active"'];
  const params = [];
  if (search) {
    where.push("(p.base_name LIKE ? OR pv.sku LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  const priceSubquery = branchId ? `(SELECT variant_id, unit_price FROM product_prices
        WHERE is_active = 1 AND branch_id = ?
        GROUP BY variant_id) pp` : `(SELECT variant_id, MIN(unit_price) AS unit_price FROM product_prices
        WHERE is_active = 1
        GROUP BY variant_id) pp`;
  const products = await query(
    `SELECT p.id AS product_id, p.base_name, p.category, p.base_sku,
            pv.id AS variant_id, pv.sku, pv.grade, pv.weight_variant,
            pv.weight_kg, pv.unit_of_measure, pv.status AS variant_status,
            pp.unit_price
     FROM products p
     JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
     LEFT JOIN ${priceSubquery} ON pp.variant_id = pv.id
     WHERE ${where.join(" AND ")}
     ORDER BY p.base_name, pv.weight_variant`,
    branchId ? [...params, branchId] : params
  );
  const grouped = {};
  for (const row of products) {
    if (!grouped[row.product_id]) {
      grouped[row.product_id] = {
        id: row.product_id,
        base_name: row.base_name,
        category: row.category,
        base_sku: row.base_sku,
        variants: []
      };
    }
    grouped[row.product_id].variants.push({
      id: row.variant_id,
      sku: row.sku,
      grade: row.grade,
      weight_variant: row.weight_variant,
      weight_kg: row.weight_kg,
      unit_of_measure: row.unit_of_measure,
      unit_price: (_a = row.unit_price) != null ? _a : null
    });
  }
  return { products: Object.values(grouped) };
});

export { index_get as default };
//# sourceMappingURL=index.get6.mjs.map
