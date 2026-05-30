import { g as defineEventHandler, E as query } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const items_get = defineEventHandler(async () => {
  const items = await query(
    `SELECT fi.*, fic.name AS category_name
     FROM fleet_items fi
     LEFT JOIN fleet_item_categories fic ON fic.id = fi.category_id
     ORDER BY fi.item_name`
  );
  return { items };
});

export { items_get as default };
//# sourceMappingURL=items.get.mjs.map
