import { q as defineEventHandler, as as readBody, m as createError, ap as query } from '../../../nitro/nitro.mjs';
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

const items_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { item_code, item_name, unit, category_id, reorder_level, unit_cost, description } = body != null ? body : {};
  if (!item_name) throw createError({ statusCode: 400, statusMessage: "item_name is required" });
  const result = await query(
    `INSERT INTO fleet_items (item_code, item_name, unit, category_id, reorder_level, unit_cost, description)
     VALUES (?,?,?,?,?,?,?)`,
    [
      item_code || null,
      item_name.trim(),
      unit || "pcs",
      category_id ? Number(category_id) : null,
      reorder_level ? Number(reorder_level) : 0,
      unit_cost ? Number(unit_cost) : null,
      description || null
    ]
  );
  return { ok: true, id: result.insertId };
});

export { items_post as default };
//# sourceMappingURL=items.post.mjs.map
