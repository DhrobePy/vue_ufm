import { n as defineEventHandler, C as getQuery, a8 as queryOne, a7 as query } from '../../../nitro/nitro.mjs';
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
  const employeeId = q.employeeId ? Number(q.employeeId) : null;
  if (employeeId) {
    const [employee, structure] = await Promise.all([
      queryOne(`SELECT e.*, p.name AS position_name, d.name AS department_name
                FROM hr_employees e
                LEFT JOIN hr_positions p ON e.position_id = p.id
                LEFT JOIN hr_departments d ON p.department_id = d.id
                WHERE e.id = ?`, [employeeId]),
      queryOne("SELECT * FROM hr_salary_structures WHERE employee_id = ?", [employeeId])
    ]);
    return { employee, structure };
  }
  const rows = await query(`
    SELECT e.id, e.first_name, e.last_name, e.status, e.base_salary,
           p.name AS position_name, d.name AS department_name,
           ss.gross_salary, ss.net_salary, ss.updated_date
    FROM hr_employees e
    LEFT JOIN hr_positions p ON e.position_id = p.id
    LEFT JOIN hr_departments d ON p.department_id = d.id
    LEFT JOIN hr_salary_structures ss ON ss.employee_id = e.id
    WHERE e.status != 'terminated'
    ORDER BY e.first_name
  `);
  return { employees: rows };
});

export { index_get as default };
//# sourceMappingURL=index.get13.mjs.map
