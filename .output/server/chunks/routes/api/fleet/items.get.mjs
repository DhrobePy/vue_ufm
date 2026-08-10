import { q as defineEventHandler, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
