import { n as defineEventHandler, C as getQuery, a8 as query, a9 as queryOne } from '../../../nitro/nitro.mjs';
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
  const q = getQuery(event);
  const search = q.search || "";
  const branchId = q.branch_id ? Number(q.branch_id) : null;
  const statusFilt = q.status || "";
  const where = [];
  const params = [];
  if (search) {
    where.push('(CONCAT(e.first_name," ",e.last_name) LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (branchId) {
    where.push("e.branch_id = ?");
    params.push(branchId);
  }
  if (statusFilt) {
    where.push("e.status = ?");
    params.push(statusFilt);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [employees, stats] = await Promise.all([
    query(
      `SELECT e.id, e.first_name, e.last_name,
              CONCAT(e.first_name, ' ', e.last_name) AS full_name,
              e.email, e.phone, e.hire_date, e.base_salary, e.status,
              e.branch_id, b.name AS branch_name,
              p.title AS position
       FROM employees e
       LEFT JOIN branches b ON b.id = e.branch_id
       LEFT JOIN positions p ON p.id = e.position_id
       ${w}
       ORDER BY e.first_name, e.last_name
       LIMIT 200`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*)                             AS total,
         SUM(e.status = 'active')             AS active,
         COALESCE(SUM(e.base_salary), 0)      AS monthly_payroll,
         COUNT(DISTINCT e.branch_id)          AS branches
       FROM employees e`
    )
  ]);
  return { employees, stats };
});

export { employees_get as default };
//# sourceMappingURL=employees.get.mjs.map
