import { q as defineEventHandler, R as getRouterParam, m as createError, ap as queryOne, ao as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  var _a;
  const id = parseInt((_a = getRouterParam(event, "id")) != null ? _a : "0");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [
    employee,
    salaryStructure,
    payrolls,
    attendance,
    attSummary,
    loans,
    loanInstallments,
    leaves,
    leaveSummary,
    documents,
    assets,
    positions,
    branches,
    holidays,
    settingsRows
  ] = await Promise.all([
    // Employee with joined data
    queryOne(`
      SELECT e.*, p.name AS position_name, d.name AS department_name,
             d.id AS department_id, b.name AS branch_name
      FROM hr_employees e
      LEFT JOIN hr_positions p    ON e.position_id = p.id
      LEFT JOIN hr_departments d  ON p.department_id = d.id
      LEFT JOIN branches b        ON b.id = e.branch_id
      WHERE e.id = ?
    `, [id]),
    // Salary structure
    queryOne("SELECT * FROM hr_salary_structures WHERE employee_id = ?", [id]),
    // Payroll history
    query(`SELECT * FROM hr_payrolls WHERE employee_id = ?
           ORDER BY pay_period_start DESC LIMIT 36`, [id]),
    // All attendance records
    query("SELECT * FROM hr_attendance WHERE employee_id = ? ORDER BY date DESC", [id]),
    // Attendance totals
    queryOne(`SELECT
        SUM(status='present')  AS present,
        SUM(status='absent')   AS absent,
        SUM(status='late')     AS late,
        SUM(status='on_leave') AS on_leave
      FROM hr_attendance WHERE employee_id = ?`, [id]),
    // Loans with paid/remaining amounts
    query(`
      SELECT l.*,
        COALESCE(SUM(li.amount),0)           AS paid_amount,
        l.amount - COALESCE(SUM(li.amount),0) AS remaining_amount
      FROM hr_loans l
      LEFT JOIN hr_loan_installments li ON li.loan_id = l.id AND li.status = 'paid'
      WHERE l.employee_id = ?
      GROUP BY l.id
      ORDER BY l.loan_date DESC
    `, [id]),
    // Loan installments with payroll period
    query(`
      SELECT li.*, p.pay_period_start
      FROM hr_loan_installments li
      LEFT JOIN hr_payrolls p ON li.payroll_id = p.id
      WHERE li.loan_id IN (
        SELECT id FROM hr_loans WHERE employee_id = ?
      )
      ORDER BY li.due_date DESC
    `, [id]),
    // Leaves
    query("SELECT * FROM hr_leaves WHERE employee_id = ? ORDER BY start_date DESC", [id]),
    // Leave summary grouped
    query(`
      SELECT leave_type, status,
             COUNT(*)                                    AS cnt,
             SUM(DATEDIFF(end_date, start_date) + 1)    AS days
      FROM hr_leaves WHERE employee_id = ?
      GROUP BY leave_type, status
      ORDER BY leave_type, status
    `, [id]),
    // Documents
    query("SELECT * FROM hr_documents WHERE employee_id = ? ORDER BY uploaded_on DESC", [id]),
    // Asset assignments with asset info
    query(`
      SELECT aa.*, a.name AS asset_name, a.asset_code, a.category
      FROM hr_asset_assignments aa
      JOIN hr_assets a ON a.id = aa.asset_id
      WHERE aa.employee_id = ?
      ORDER BY aa.assigned_on DESC
    `, [id]),
    // All positions for edit modal
    query(`SELECT p.*, d.name AS department_name
           FROM hr_positions p
           JOIN hr_departments d ON d.id = p.department_id
           ORDER BY d.name, p.name`),
    // All branches for edit modal
    query("SELECT id, name FROM branches ORDER BY name"),
    // Holidays for calendar (last + next 6 months)
    query(`SELECT holiday_date, holiday_name, description
           FROM hr_holidays
           WHERE holiday_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             AND holiday_date <= DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
           ORDER BY holiday_date`),
    // HR settings
    query("SELECT name, value FROM hr_settings")
  ]);
  if (!employee) throw createError({ statusCode: 404, statusMessage: "Employee not found" });
  const settings = {};
  for (const row of settingsRows) settings[row.name] = row.value;
  return {
    employee,
    salary_structure: salaryStructure != null ? salaryStructure : null,
    payrolls,
    attendance,
    att_summary: attSummary != null ? attSummary : {},
    loans,
    loan_installments: loanInstallments,
    leaves,
    leave_summary: leaveSummary,
    documents,
    assets,
    positions,
    branches,
    holidays,
    settings
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
