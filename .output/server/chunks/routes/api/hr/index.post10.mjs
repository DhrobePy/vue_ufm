import { q as defineEventHandler, as as readBody, m as createError, aq as queryOne, ap as query, z as getDb } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "prepare") {
    const { pay_period_start, pay_period_end } = body;
    if (!pay_period_start || !pay_period_end)
      throw createError({ statusCode: 400, statusMessage: "Pay period dates required" });
    const existing = await queryOne(`
      SELECT id FROM hr_payrolls
      WHERE pay_period_start = ? AND pay_period_end = ? AND status != 'rejected'
    `, [pay_period_start, pay_period_end]);
    if (existing)
      throw createError({ statusCode: 400, statusMessage: "Payroll for this period has already been prepared." });
    const activeEmployees = await query(`
      SELECT e.*, ss.basic_salary, ss.house_allowance, ss.transport_allowance,
             ss.medical_allowance, ss.other_allowances,
             ss.provident_fund, ss.tax_deduction, ss.other_deductions, ss.gross_salary AS struct_gross
      FROM hr_employees e
      LEFT JOIN hr_salary_structures ss ON ss.employee_id = e.id
      WHERE e.status = 'active'
    `);
    const periodMonth = Number(pay_period_start.slice(5, 7));
    const periodYear = Number(pay_period_start.slice(0, 4));
    const db = getDb();
    let successCount = 0;
    let failCount = 0;
    const preparedIds = [];
    for (const emp of activeEmployees) {
      try {
        const basicSalary = Number(emp.basic_salary) || 0;
        const houseAllowance = Number(emp.house_allowance) || 0;
        const transportAllowance = Number(emp.transport_allowance) || 0;
        const medicalAllowance = Number(emp.medical_allowance) || 0;
        const otherAllowances = Number(emp.other_allowances) || 0;
        const grossSalary = Number(emp.struct_gross) || Number(emp.base_salary) || 0;
        const providentFund = Number(emp.provident_fund) || 0;
        const taxDeduction = Number(emp.tax_deduction) || 0;
        const otherDeductions = Number(emp.other_deductions) || 0;
        const daysInMonth = 30;
        const dailyRate = grossSalary / daysInMonth;
        const [attRow] = await query(`
          SELECT COUNT(*) AS cnt FROM hr_attendance
          WHERE employee_id = ? AND status = 'present'
          AND date BETWEEN ? AND ?
        `, [emp.id, pay_period_start, pay_period_end]);
        const presentDays = Number(attRow.cnt) || 0;
        const absentDays = Math.max(0, daysInMonth - presentDays);
        const absenceDeduction = Math.round(absentDays * dailyRate * 100) / 100;
        const [advRow] = await query(`
          SELECT COALESCE(SUM(amount), 0) AS total FROM hr_salary_advances
          WHERE employee_id = ? AND advance_month = ? AND advance_year = ? AND status = 'approved'
        `, [emp.id, periodMonth, periodYear]);
        const advanceDeduction = Number(advRow.total) || 0;
        const [loanRow] = await query(`
          SELECT COALESCE(SUM(li.amount), 0) AS total
          FROM hr_loan_installments li
          JOIN hr_loans l ON li.loan_id = l.id
          WHERE l.employee_id = ? AND li.status = 'pending'
          AND li.due_date BETWEEN ? AND ?
        `, [emp.id, pay_period_start, pay_period_end]);
        const loanDeduction = Number(loanRow.total) || 0;
        const totalDeductions = absenceDeduction + advanceDeduction + loanDeduction + providentFund + taxDeduction + otherDeductions;
        const netSalary = Math.max(0, grossSalary - totalDeductions);
        const [res] = await db.query(
          `INSERT INTO hr_payrolls (employee_id, pay_period_start, pay_period_end, gross_salary, deductions, net_salary, status)
           VALUES (?, ?, ?, ?, ?, ?, 'pending_approval')`,
          [emp.id, pay_period_start, pay_period_end, grossSalary, totalDeductions, netSalary]
        );
        const payrollId = res.insertId;
        preparedIds.push(payrollId);
        await db.query(
          `INSERT INTO hr_payroll_details
           (payroll_id, basic_salary, house_allowance, transport_allowance, medical_allowance,
            other_allowances, gross_salary, days_in_month, absent_days, daily_rate,
            absence_deduction, salary_advance_deduction, loan_installment_deduction,
            provident_fund, tax_deduction, other_deductions, total_deductions, net_salary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payrollId,
            basicSalary,
            houseAllowance,
            transportAllowance,
            medicalAllowance,
            otherAllowances,
            grossSalary,
            daysInMonth,
            absentDays,
            dailyRate,
            absenceDeduction,
            advanceDeduction,
            loanDeduction,
            providentFund,
            taxDeduction,
            otherDeductions,
            totalDeductions,
            netSalary
          ]
        );
        successCount++;
      } catch {
        failCount++;
      }
    }
    return {
      ok: true,
      success_count: successCount,
      fail_count: failCount,
      prepared_ids: preparedIds,
      message: `Payroll prepared for ${successCount} employees.`
    };
  }
  if (action === "update_record") {
    const {
      payroll_id,
      gross_salary,
      absence_deduction,
      advance_deduction,
      loan_deduction,
      provident_fund,
      tax_deduction,
      other_deductions
    } = body;
    if (!payroll_id) throw createError({ statusCode: 400, statusMessage: "payroll_id required" });
    const gross = Number(gross_salary) || 0;
    const absDed = Number(absence_deduction) || 0;
    const advDed = Number(advance_deduction) || 0;
    const loanDed = Number(loan_deduction) || 0;
    const pfDed = Number(provident_fund) || 0;
    const taxDed = Number(tax_deduction) || 0;
    const othDed = Number(other_deductions) || 0;
    const totalDed = absDed + advDed + loanDed + pfDed + taxDed + othDed;
    const net = Math.max(0, gross - totalDed);
    const db = getDb();
    await db.query(
      "UPDATE hr_payrolls SET gross_salary = ?, deductions = ?, net_salary = ? WHERE id = ? AND status = 'pending_approval'",
      [gross, totalDed, net, payroll_id]
    );
    await db.query(
      `UPDATE hr_payroll_details
       SET gross_salary = ?, absence_deduction = ?, salary_advance_deduction = ?,
           loan_installment_deduction = ?, provident_fund = ?, tax_deduction = ?,
           other_deductions = ?, total_deductions = ?, net_salary = ?
       WHERE payroll_id = ?`,
      [gross, absDed, advDed, loanDed, pfDed, taxDed, othDed, totalDed, net, payroll_id]
    );
    return { ok: true, net_salary: net, message: "Payroll record updated." };
  }
  if (action === "approve") {
    const { payroll_ids } = body;
    if (!Array.isArray(payroll_ids) || !payroll_ids.length)
      throw createError({ statusCode: 400, statusMessage: "payroll_ids required" });
    const placeholders = payroll_ids.map(() => "?").join(",");
    await query(
      `UPDATE hr_payrolls SET status = 'approved' WHERE id IN (${placeholders}) AND status = 'pending_approval'`,
      payroll_ids
    );
    return { ok: true, message: `${payroll_ids.length} payroll(s) approved.` };
  }
  if (action === "reject") {
    const { payroll_ids } = body;
    if (!Array.isArray(payroll_ids) || !payroll_ids.length)
      throw createError({ statusCode: 400, statusMessage: "payroll_ids required" });
    const placeholders = payroll_ids.map(() => "?").join(",");
    await query(`UPDATE hr_payrolls SET status = 'rejected' WHERE id IN (${placeholders})`, payroll_ids);
    return { ok: true, message: "Payrolls rejected." };
  }
  if (action === "pay") {
    const { payroll_ids, payment_note } = body;
    if (!Array.isArray(payroll_ids) || !payroll_ids.length)
      throw createError({ statusCode: 400, statusMessage: "payroll_ids required" });
    const db = getDb();
    for (const pid of payroll_ids) {
      const payrollRow = await queryOne(
        "SELECT * FROM hr_payrolls WHERE id = ? AND status = 'approved'",
        [pid]
      );
      if (!payrollRow) continue;
      await db.query(
        `UPDATE hr_loan_installments li
         JOIN hr_loans l ON li.loan_id = l.id
         SET li.status = 'paid', li.paid_date = CURDATE(), li.payroll_id = ?
         WHERE l.employee_id = ? AND li.status = 'pending'
         AND li.due_date BETWEEN ? AND ?`,
        [pid, payrollRow.employee_id, payrollRow.pay_period_start, payrollRow.pay_period_end]
      );
      const activeLoans = await query(
        "SELECT * FROM hr_loans WHERE employee_id = ? AND status = 'active'",
        [payrollRow.employee_id]
      );
      for (const loan of activeLoans) {
        const [totRow] = await query(
          "SELECT COALESCE(SUM(amount), 0) AS total FROM hr_loan_installments WHERE loan_id = ? AND status = 'paid'",
          [loan.id]
        );
        if (Number(totRow.total) >= Number(loan.amount)) {
          await query("UPDATE hr_loans SET status = 'paid' WHERE id = ?", [loan.id]);
        }
      }
      await db.query(
        `UPDATE hr_salary_advances SET status = 'deducted'
         WHERE employee_id = ? AND advance_month = MONTH(?) AND advance_year = YEAR(?) AND status = 'approved'`,
        [payrollRow.employee_id, payrollRow.pay_period_start, payrollRow.pay_period_start]
      );
      await db.query(
        "UPDATE hr_payrolls SET status = 'paid', paid_at = NOW(), payment_note = ? WHERE id = ?",
        [payment_note || null, pid]
      );
    }
    return { ok: true, message: `${payroll_ids.length} payroll(s) paid.` };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post10.mjs.map
