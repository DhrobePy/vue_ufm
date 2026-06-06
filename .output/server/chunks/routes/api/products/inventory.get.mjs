import { h as defineEventHandler, J as query } from '../../../nitro/nitro.mjs';
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
            COALESCE(SUM(inv.quantity), 0)  AS stock_qty,
            COALESCE(pp.unit_price, 0)       AS unit_price
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     LEFT JOIN inventory inv ON inv.variant_id = pv.id
     LEFT JOIN product_prices pp ON pp.variant_id = pv.id AND pp.is_active = 1
     WHERE pv.status = 'active' AND p.status = 'active'
     GROUP BY pv.id, pp.unit_price
     ORDER BY p.category, p.base_name, pv.weight_variant`
  );
  return { variants, rawMaterials: [] };
});

export { inventory_get as default };
//# sourceMappingURL=inventory.get.mjs.map
