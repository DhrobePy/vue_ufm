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
  const date = q.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const employeeId = q.employeeId ? Number(q.employeeId) : null;
  const month = q.month;
  const view = q.view || "daily";
  if (view === "employee" && employeeId) {
    const rows2 = await query(`
      SELECT a.*, e.first_name, e.last_name
      FROM hr_attendance a
      JOIN hr_employees e ON a.employee_id = e.id
      WHERE a.employee_id = ?
      ORDER BY a.date DESC
      LIMIT 90
    `, [employeeId]);
    return { attendance: rows2 };
  }
  if (view === "monthly" && month) {
    const [y, m] = month.split("-");
    const rows2 = await query(`
      SELECT a.*, e.first_name, e.last_name, e.id AS emp_id
      FROM hr_attendance a
      JOIN hr_employees e ON a.employee_id = e.id
      WHERE YEAR(a.date) = ? AND MONTH(a.date) = ?
      ORDER BY a.date DESC, e.first_name
    `, [y, m]);
    return { attendance: rows2 };
  }
  const rows = await query(`
    SELECT a.*, e.first_name, e.last_name
    FROM hr_attendance a
    JOIN hr_employees e ON a.employee_id = e.id
    WHERE a.date = ?
    ORDER BY e.first_name
  `, [date]);
  const allActive = await query(`
    SELECT id, first_name, last_name, status FROM hr_employees
    WHERE status = 'active' ORDER BY first_name
  `);
  return { attendance: rows, employees: allActive, date };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
