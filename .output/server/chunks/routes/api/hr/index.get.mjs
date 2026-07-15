import { n as defineEventHandler, C as getQuery, a7 as query } from '../../../nitro/nitro.mjs';
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
  const employeeId = q.employeeId ? Number(q.employeeId) : null;
  let sql = `
    SELECT sa.*, e.first_name, e.last_name, p.name AS position_name
    FROM hr_salary_advances sa
    JOIN hr_employees e ON sa.employee_id = e.id
    LEFT JOIN hr_positions p ON e.position_id = p.id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += " AND sa.status = ?";
    params.push(status);
  }
  if (employeeId) {
    sql += " AND sa.employee_id = ?";
    params.push(employeeId);
  }
  sql += " ORDER BY sa.advance_date DESC";
  const advances = await query(sql, params);
  const employees = await query(`SELECT id, first_name, last_name FROM hr_employees WHERE status = 'active' ORDER BY first_name`);
  return { advances, employees };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
