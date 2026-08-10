import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const departmentId = q.departmentId ? Number(q.departmentId) : null;
  let sql = `
    SELECT p.*, d.name AS department_name
    FROM hr_positions p
    LEFT JOIN hr_departments d ON p.department_id = d.id
    WHERE 1=1
  `;
  const params = [];
  if (departmentId) {
    sql += " AND p.department_id = ?";
    params.push(departmentId);
  }
  sql += " ORDER BY d.name, p.name";
  const positions = await query(sql, params);
  return { positions };
});

export { index_get as default };
//# sourceMappingURL=index.get12.mjs.map
