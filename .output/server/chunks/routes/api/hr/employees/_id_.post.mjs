import { n as defineEventHandler, H as getRouterParam, a7 as readBody, j as createError, a4 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__post = defineEventHandler(async (event) => {
  var _a;
  const id = parseInt((_a = getRouterParam(event, "id")) != null ? _a : "0");
  const body = await readBody(event);
  const { action } = body;
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  if (action === "update_employee") {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      position_id,
      branch_id,
      hire_date,
      base_salary,
      status,
      bank_name,
      bank_account,
      bank_branch,
      nid,
      dob,
      gender,
      blood_group,
      emergency_contact
    } = body;
    await query(
      `UPDATE hr_employees SET
      first_name=?, last_name=?, email=?, phone=?, address=?,
      position_id=?, branch_id=?, hire_date=?, base_salary=?, status=?,
      bank_name=?, bank_account=?, bank_branch=?,
      nid=?, dob=?, gender=?, blood_group=?, emergency_contact=?
      WHERE id=?`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        address || null,
        position_id || null,
        branch_id || null,
        hire_date || null,
        base_salary || 0,
        status || "active",
        bank_name || null,
        bank_account || null,
        bank_branch || null,
        nid || null,
        dob || null,
        gender || null,
        blood_group || null,
        emergency_contact || null,
        id
      ]
    );
    return { ok: true };
  }
  if (action === "save_salary_structure") {
    const {
      basic_salary = 0,
      house_allowance = 0,
      transport_allowance = 0,
      medical_allowance = 0,
      other_allowances = 0,
      provident_fund = 0,
      tax_deduction = 0,
      other_deductions = 0
    } = body;
    const gross = +basic_salary + +house_allowance + +transport_allowance + +medical_allowance + +other_allowances;
    const net = gross - +provident_fund - +tax_deduction - +other_deductions;
    await query(
      `INSERT INTO hr_salary_structures
        (employee_id, basic_salary, house_allowance, transport_allowance, medical_allowance,
         other_allowances, provident_fund, tax_deduction, other_deductions, gross_salary, net_salary)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        basic_salary=VALUES(basic_salary), house_allowance=VALUES(house_allowance),
        transport_allowance=VALUES(transport_allowance), medical_allowance=VALUES(medical_allowance),
        other_allowances=VALUES(other_allowances), provident_fund=VALUES(provident_fund),
        tax_deduction=VALUES(tax_deduction), other_deductions=VALUES(other_deductions),
        gross_salary=VALUES(gross_salary), net_salary=VALUES(net_salary)`,
      [
        id,
        basic_salary,
        house_allowance,
        transport_allowance,
        medical_allowance,
        other_allowances,
        provident_fund,
        tax_deduction,
        other_deductions,
        gross,
        net
      ]
    );
    return { ok: true };
  }
  if (action === "add_attendance") {
    const { date, status, clock_in, clock_out } = body;
    await query(
      `INSERT INTO hr_attendance (employee_id, branch_id, date, status, clock_in, clock_out, manual_entry)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        status=VALUES(status), clock_in=VALUES(clock_in),
        clock_out=VALUES(clock_out), manual_entry=1`,
      [
        id,
        body.branch_id || 1,
        date,
        status,
        clock_in || null,
        clock_out || null
      ]
    );
    return { ok: true };
  }
  if (action === "delete_attendance") {
    const { date } = body;
    await query("DELETE FROM hr_attendance WHERE employee_id = ? AND date = ?", [id, date]);
    return { ok: true };
  }
  if (action === "add_payroll") {
    const { pay_period_start, pay_period_end, gross_salary, deductions, net_salary, status } = body;
    await query(
      `INSERT INTO hr_payrolls
        (employee_id, branch_id, pay_period_start, pay_period_end, gross_salary, deductions, net_salary, status)
      VALUES (?,?,?,?,?,?,?,?)`,
      [
        id,
        body.branch_id || 1,
        pay_period_start,
        pay_period_end,
        gross_salary,
        deductions,
        net_salary,
        status || "paid"
      ]
    );
    return { ok: true };
  }
  if (action === "add_loan") {
    const { amount, installments, installment_type, loan_date } = body;
    const monthly = Math.ceil(+amount / Math.max(1, +installments));
    await query(
      `INSERT INTO hr_loans
        (employee_id, branch_id, loan_date, amount, installments, monthly_payment, installment_type, status)
      VALUES (?,?,?,?,?,?,?,?)`,
      [
        id,
        body.branch_id || 1,
        loan_date,
        amount,
        installments,
        monthly,
        installment_type || "monthly",
        "active"
      ]
    );
    return { ok: true };
  }
  if (action === "update_loan") {
    const { loan_id, status } = body;
    await query("UPDATE hr_loans SET status=? WHERE id=? AND employee_id=?", [status, loan_id, id]);
    return { ok: true };
  }
  if (action === "add_leave") {
    const { leave_type, start_date, end_date, reason, status } = body;
    await query(
      `INSERT INTO hr_leaves (employee_id, branch_id, leave_type, start_date, end_date, reason, status)
      VALUES (?,?,?,?,?,?,?)`,
      [id, body.branch_id || 1, leave_type, start_date, end_date, reason || null, status || "pending"]
    );
    return { ok: true };
  }
  if (action === "update_leave") {
    const { leave_id, status } = body;
    await query("UPDATE hr_leaves SET status=? WHERE id=? AND employee_id=?", [status, leave_id, id]);
    return { ok: true };
  }
  if (action === "delete_leave") {
    const { leave_id } = body;
    await query("DELETE FROM hr_leaves WHERE id=? AND employee_id=?", [leave_id, id]);
    return { ok: true };
  }
  if (action === "add_document") {
    const { name, category, file_type, file_path, expiry_date, notes } = body;
    await query(
      `INSERT INTO hr_documents (employee_id, name, category, file_type, file_path, expiry_date, notes)
      VALUES (?,?,?,?,?,?,?)`,
      [
        id,
        name,
        category || "general",
        file_type || null,
        file_path || null,
        expiry_date || null,
        notes || null
      ]
    );
    return { ok: true };
  }
  if (action === "delete_document") {
    const { doc_id } = body;
    await query("DELETE FROM hr_documents WHERE id=? AND employee_id=?", [doc_id, id]);
    return { ok: true };
  }
  if (action === "assign_asset") {
    const { asset_id, assigned_on, due_date, condition_in, notes } = body;
    await query(
      `INSERT INTO hr_asset_assignments (asset_id, employee_id, assigned_on, due_date, condition_in, notes)
      VALUES (?,?,?,?,?,?)`,
      [asset_id, id, assigned_on, due_date || null, condition_in || "good", notes || null]
    );
    await query("UPDATE hr_assets SET status='assigned' WHERE id=?", [asset_id]);
    return { ok: true };
  }
  if (action === "return_asset") {
    const { assignment_id, asset_id, condition_out } = body;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    await query(
      `UPDATE hr_asset_assignments SET returned_on=?, condition_out=? WHERE id=?`,
      [today, condition_out || "good", assignment_id]
    );
    await query("UPDATE hr_assets SET status='available' WHERE id=?", [asset_id]);
    return { ok: true };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action: " + action });
});

export { _id__post as default };
//# sourceMappingURL=_id_.post.mjs.map
