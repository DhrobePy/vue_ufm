import { n as defineEventHandler, N as getUserSession, j as createError, a7 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const employees_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const employees = await query(
    `SELECT id, first_name, last_name
     FROM hr_employees
     WHERE status = 'active' OR status IS NULL
     ORDER BY first_name`
  );
  return { employees };
});

export { employees_get as default };
//# sourceMappingURL=employees.get.mjs.map
