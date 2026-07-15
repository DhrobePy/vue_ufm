import { n as defineEventHandler, C as getQuery, a8 as query } from '../../../nitro/nitro.mjs';
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
    SELECT lr.*, e.first_name, e.last_name,
           p.name AS position_name, d.name AS department_name,
           DATEDIFF(lr.end_date, lr.start_date) + 1 AS days_count
    FROM hr_leaves lr
    JOIN hr_employees e ON lr.employee_id = e.id
    LEFT JOIN hr_positions p ON e.position_id = p.id
    LEFT JOIN hr_departments d ON p.department_id = d.id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += " AND lr.status = ?";
    params.push(status);
  }
  if (employeeId) {
    sql += " AND lr.employee_id = ?";
    params.push(employeeId);
  }
  sql += " ORDER BY lr.created_at DESC";
  const requests = await query(sql, params);
  return { requests };
});

export { index_get as default };
//# sourceMappingURL=index.get8.mjs.map
