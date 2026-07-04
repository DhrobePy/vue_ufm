import { m as defineEventHandler, a2 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const inventory_get = defineEventHandler(async () => {
  const variants = await query(
    `SELECT pv.id, pv.sku, pv.weight_variant, pv.grade, pv.status,
            p.id AS product_id, p.base_name AS product_name, p.category,
            pv.stock_qty,
            pv.reserved_qty,
            pv.reorder_level,
            COALESCE(pp.unit_price, pv.unit_price, 0) AS unit_price
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     LEFT JOIN (
       SELECT variant_id, MIN(unit_price) AS unit_price
       FROM product_prices
       WHERE is_active = 1
       GROUP BY variant_id
     ) pp ON pp.variant_id = pv.id
     WHERE pv.status = 'active' AND p.status = 'active'
     ORDER BY p.category, p.base_name, pv.weight_variant`
  );
  return { variants, rawMaterials: [] };
});

export { inventory_get as default };
//# sourceMappingURL=inventory.get.mjs.map
