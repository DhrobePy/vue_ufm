import { o as defineEventHandler, a9 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const base_get = defineEventHandler(async () => {
  const products = await query(
    `SELECT p.id, p.base_name, p.base_sku, p.category, p.description, p.status,
            COUNT(pv.id) AS variant_count
     FROM products p
     LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
     WHERE p.status != 'deleted'
     GROUP BY p.id
     ORDER BY p.category, p.base_name`
  );
  return { products };
});

export { base_get as default };
//# sourceMappingURL=base.get.mjs.map
