import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, G as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const categories_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const { name, description, code } = body != null ? body : {};
  if (!(name == null ? void 0 : name.trim()))
    throw createError({ statusCode: 400, statusMessage: "name is required" });
  const result = await query(
    `INSERT INTO expense_categories
       (category_code, category_name, description, is_active, created_by_user_id)
     VALUES (?, ?, ?, 1, ?)`,
    [(code == null ? void 0 : code.trim()) || null, name.trim(), (description == null ? void 0 : description.trim()) || null, userId]
  );
  return { ok: true, id: result.insertId };
});

export { categories_post as default };
//# sourceMappingURL=categories.post.mjs.map
