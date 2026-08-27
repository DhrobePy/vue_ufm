import { q as defineEventHandler, J as getQuery, as as queryOne, m as createError, ar as query } from '../../../nitro/nitro.mjs';
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
  const view = q.view || "history";
  const payrollId = q.payrollId ? Number(q.payrollId) : null;
  const employeeId = q.employeeId ? Number(q.employeeId) : null;
  const period = q.period;
  if (view === "payslip" && payrollId) {
    const payroll = await queryOne(`
      SELECT p.*, pd.*,
             e.first_name, e.last_name, e.email, e.phone, e.address, e.hire_date, e.bank_name, e.bank_account,
             pos.name AS position_name, d.name AS department_name
      FROM hr_payrolls p
      JOIN hr_employees e ON p.employee_id = e.id
      LEFT JOIN hr_positions pos ON e.position_id = pos.id
      LEFT JOIN hr_departments d ON pos.department_id = d.id
      LEFT JOIN hr_payroll_details pd ON pd.payroll_id = p.id
      WHERE p.id = ?
    `, [payrollId]);
    if (!payroll) throw createError({ statusCode: 404, statusMessage: "Payroll not found" });
    return { payroll };
  }
  if (view === "pending") {
    const rows = await query(`
      SELECT p.*, e.first_name, e.last_name, e.base_salary, e.bank_name, e.bank_account,
             pos.name AS position_name, d.name AS department_name,
             (SELECT COUNT(*) FROM hr_attendance a
              WHERE a.employee_id = e.id AND a.status = 'present'
              AND a.date BETWEEN p.pay_period_start AND p.pay_period_end) AS present_days,
             (SELECT COALESCE(SUM(sa.amount), 0) FROM hr_salary_advances sa
              WHERE sa.employee_id = e.id
              AND sa.advance_month = MONTH(p.pay_period_start)
              AND sa.advance_year  = YEAR(p.pay_period_start)
              AND sa.status = 'approved') AS advance_deduction,
             (SELECT COALESCE(SUM(li.amount), 0) FROM hr_loan_installments li
              JOIN hr_loans l ON li.loan_id = l.id
              WHERE l.employee_id = e.id
              AND li.due_date BETWEEN p.pay_period_start AND p.pay_period_end
              AND li.status = 'pending') AS loan_deduction
      FROM hr_payrolls p
      JOIN hr_employees e ON p.employee_id = e.id
      LEFT JOIN hr_positions pos ON e.position_id = pos.id
      LEFT JOIN hr_departments d ON pos.department_id = d.id
      WHERE p.status = 'pending_approval'
      ORDER BY p.pay_period_start, e.first_name
    `);
    const result = rows.map((r) => {
      const grossSalary = Number(r.gross_salary) || 0;
      const presentDays = Number(r.present_days) || 0;
      const absentDays = Math.max(0, 30 - presentDays);
      const dailyRate = grossSalary / 30;
      return {
        ...r,
        absent_days: absentDays,
        absence_deduction: Math.round(absentDays * dailyRate * 100) / 100
      };
    });
    return { payrolls: result };
  }
  if (view === "approved") {
    const rows = await query(`
      SELECT p.*, e.first_name, e.last_name, e.bank_name, e.bank_account,
             pos.name AS position_name, d.name AS department_name
      FROM hr_payrolls p
      JOIN hr_employees e ON p.employee_id = e.id
      LEFT JOIN hr_positions pos ON e.position_id = pos.id
      LEFT JOIN hr_departments d ON pos.department_id = d.id
      WHERE p.status = 'approved'
      ORDER BY p.pay_period_start, e.first_name
    `);
    return { payrolls: rows };
  }
  let sql = `
    SELECT p.*, e.first_name, e.last_name,
           pos.name AS position_name, d.name AS department_name
    FROM hr_payrolls p
    JOIN hr_employees e ON p.employee_id = e.id
    LEFT JOIN hr_positions pos ON e.position_id = pos.id
    LEFT JOIN hr_departments d ON pos.department_id = d.id
    WHERE 1=1
  `;
  const params = [];
  if (employeeId) {
    sql += " AND p.employee_id = ?";
    params.push(employeeId);
  }
  if (period) {
    sql += " AND DATE_FORMAT(p.pay_period_start, '%Y-%m') = ?";
    params.push(period);
  }
  sql += " ORDER BY p.pay_period_end DESC, e.first_name LIMIT 300";
  const payrolls = await query(sql, params);
  return { payrolls };
});

export { index_get as default };
//# sourceMappingURL=index.get11.mjs.map
