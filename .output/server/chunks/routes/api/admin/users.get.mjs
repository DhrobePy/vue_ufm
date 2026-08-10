import { q as defineEventHandler, J as getQuery, ap as query, aq as queryOne } from '../../../nitro/nitro.mjs';
import 'node:child_process';
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

const users_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const where = [];
  const params = [];
  if (search) {
    where.push("(u.display_name LIKE ? OR u.email LIKE ? OR u.role LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [users, stats] = await Promise.all([
    query(
      `SELECT u.id, u.display_name, u.email, u.role, u.status,
              u.last_login, u.created_at
       FROM users u
       ${w}
       ORDER BY u.display_name`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'active')    AS active,
         SUM(status = 'pending')   AS pending,
         SUM(status = 'suspended') AS suspended
       FROM users`
    )
  ]);
  return { users, stats };
});

export { users_get as default };
//# sourceMappingURL=users.get.mjs.map
