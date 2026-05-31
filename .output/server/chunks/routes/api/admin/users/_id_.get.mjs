import { h as defineEventHandler, v as getRouterParam, e as createError, H as queryOne } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  const user = await queryOne(
    `SELECT id, display_name, email, role, status, last_login, created_at
     FROM users WHERE id = ?`,
    [id]
  );
  if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
  return { user };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
