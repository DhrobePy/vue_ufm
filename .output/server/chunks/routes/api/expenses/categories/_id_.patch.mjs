import { n as defineEventHandler, j as createError, ab as readBody, a8 as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a;
  const id = Number((_a = event.context.params) == null ? void 0 : _a.id);
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid category ID" });
  const body = await readBody(event);
  const { name, description, code, is_active } = body != null ? body : {};
  const sets = [];
  const params = [];
  if (name !== void 0) {
    sets.push("category_name = ?");
    params.push(name.trim());
  }
  if (description !== void 0) {
    sets.push("description = ?");
    params.push((description == null ? void 0 : description.trim()) || null);
  }
  if (code !== void 0) {
    sets.push("category_code = ?");
    params.push((code == null ? void 0 : code.trim()) || null);
  }
  if (is_active !== void 0) {
    sets.push("is_active = ?");
    params.push(is_active ? 1 : 0);
  }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  params.push(id);
  await query(
    `UPDATE expense_categories SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`,
    params
  );
  return { ok: true };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
