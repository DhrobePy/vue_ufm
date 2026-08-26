import { q as defineEventHandler, J as getQuery, aq as query, m as createError } from '../../../nitro/nitro.mjs';
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
  const employeeId = q.employeeId ? Number(q.employeeId) : null;
  const status = q.status;
  const loanId = q.loanId ? Number(q.loanId) : null;
  if (loanId) {
    const [loan] = await query(`
      SELECT l.*, e.first_name, e.last_name,
             COALESCE((SELECT SUM(amount) FROM hr_loan_installments WHERE loan_id = l.id AND status = 'paid'), 0) AS paid_amount
      FROM hr_loans l
      JOIN hr_employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `, [loanId]);
    if (!loan) throw createError({ statusCode: 404, statusMessage: "Loan not found" });
    const installments = await query(
      "SELECT * FROM hr_loan_installments WHERE loan_id = ? ORDER BY due_date",
      [loanId]
    );
    return { loan, installments };
  }
  let sql = `
    SELECT l.*,
           e.first_name, e.last_name,
           COALESCE((SELECT SUM(amount) FROM hr_loan_installments WHERE loan_id = l.id AND status = 'paid'), 0) AS paid_amount,
           (SELECT COUNT(*) FROM hr_loan_installments WHERE loan_id = l.id AND status = 'pending') AS pending_installments
    FROM hr_loans l
    JOIN hr_employees e ON l.employee_id = e.id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += " AND l.status = ?";
    params.push(status);
  }
  if (employeeId) {
    sql += " AND l.employee_id = ?";
    params.push(employeeId);
  }
  sql += " ORDER BY l.loan_date DESC";
  const loans = await query(sql, params);
  if (employeeId && loans.length > 0) {
    const loanIds = loans.map((l) => l.id);
    const ph = loanIds.map(() => "?").join(",");
    const installments = await query(
      `SELECT li.*, p.pay_period_start
       FROM hr_loan_installments li
       LEFT JOIN hr_payrolls p ON li.payroll_id = p.id
       WHERE li.loan_id IN (${ph}) ORDER BY li.due_date`,
      loanIds
    );
    return { loans, installments };
  }
  const employees = await query(
    "SELECT id, first_name, last_name FROM hr_employees WHERE status = 'active' ORDER BY first_name"
  );
  return { loans, employees };
});

export { index_get as default };
//# sourceMappingURL=index.get9.mjs.map
