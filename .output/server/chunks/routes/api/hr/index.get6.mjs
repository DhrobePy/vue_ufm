import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const status = q.status;
  let sql = `
    SELECT e.*, p.name AS position_name, d.name AS department_name,
           d.id AS department_id,
           ss.gross_salary AS salary_gross, ss.net_salary AS salary_net
    FROM hr_employees e
    LEFT JOIN hr_positions p ON e.position_id = p.id
    LEFT JOIN hr_departments d ON p.department_id = d.id
    LEFT JOIN hr_salary_structures ss ON ss.employee_id = e.id
  `;
  const params = [];
  if (status) {
    sql += " WHERE e.status = ?";
    params.push(status);
  }
  sql += " ORDER BY e.first_name ASC";
  const [employees, departments, positions] = await Promise.all([
    query(sql, params),
    query("SELECT * FROM hr_departments ORDER BY name"),
    query(`SELECT p.*, d.name AS department_name
           FROM hr_positions p
           JOIN hr_departments d ON p.department_id = d.id
           ORDER BY d.name, p.name`)
  ]);
  return { employees, departments, positions };
});

export { index_get as default };
//# sourceMappingURL=index.get6.mjs.map
