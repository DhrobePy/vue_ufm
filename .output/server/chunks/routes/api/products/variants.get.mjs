import { h as defineEventHandler, p as getQuery, G as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const variants_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const product = q.product ? Number(q.product) : null;
  const cat = q.category || "";
  const where = ["pv.status = 'active'"];
  const params = [];
  if (product) {
    where.push("pv.product_id = ?");
    params.push(product);
  }
  if (cat) {
    where.push("LOWER(p.category) = LOWER(?)");
    params.push(cat);
  }
  const variants = await query(
    `SELECT pv.id, pv.product_id, pv.weight_variant, pv.grade, pv.sku, pv.weight_kg,
            pv.unit_of_measure, pv.status,
            p.base_name AS product_name, p.category,
            COALESCE(pp.unit_price, 0)       AS unit_price,
            COALESCE(SUM(inv.quantity), 0)   AS stock_qty
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id AND p.status = 'active'
     LEFT JOIN product_prices pp ON pp.variant_id = pv.id AND pp.is_active = 1
     LEFT JOIN inventory inv    ON inv.variant_id = pv.id
     WHERE ${where.join(" AND ")}
     GROUP BY pv.id, pp.unit_price
     ORDER BY p.base_name, pv.weight_variant`,
    params
  );
  const products = await query(
    `SELECT id, base_name AS name, category FROM products WHERE status = 'active' ORDER BY base_name`
  );
  return { variants, products };
});

export { variants_get as default };
//# sourceMappingURL=variants.get.mjs.map
