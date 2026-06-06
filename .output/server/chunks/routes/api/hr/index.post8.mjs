import { h as defineEventHandler, L as readBody, e as createError, K as queryOne, n as getDb, J as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { action } = body != null ? body : {};
  if (action === "create") {
    const { employee_id, amount, installments, monthly_payment, installment_type, loan_date, purpose } = body;
    if (!employee_id || !amount || !installments)
      throw createError({ statusCode: 400, statusMessage: "employee_id, amount, installments required" });
    const existing = await queryOne(
      "SELECT id FROM hr_loans WHERE employee_id = ? AND status = 'active'",
      [employee_id]
    );
    if (existing) throw createError({ statusCode: 400, statusMessage: "Employee already has an active loan" });
    const loanAmount = Number(amount);
    const numInstall = Number(installments);
    const monthlyPay = Number(monthly_payment) || Math.ceil(loanAmount / numInstall);
    const instType = installment_type || "monthly";
    const startDate = loan_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const db = getDb();
    const [res] = await db.query(
      `INSERT INTO hr_loans (employee_id, loan_date, amount, installments, monthly_payment, installment_type, purpose, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [employee_id, startDate, loanAmount, numInstall, monthlyPay, instType, purpose || null]
    );
    const loanId = res.insertId;
    const [startY, startM] = startDate.split("-").map(Number);
    for (let i = 0; i < numInstall; i++) {
      const dueMonth = (startM + i - 1) % 12 + 1;
      const dueYear = startY + Math.floor((startM + i - 1) / 12);
      const dueDate = `${dueYear}-${String(dueMonth).padStart(2, "0")}-25`;
      await db.query(
        "INSERT INTO hr_loan_installments (loan_id, due_date, amount, status) VALUES (?, ?, ?, ?)",
        [loanId, dueDate, monthlyPay, "pending"]
      );
    }
    return { ok: true, loan_id: loanId, message: `Loan created with ${numInstall} installments.` };
  }
  if (action === "mark_paid") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("UPDATE hr_loans SET status = 'paid' WHERE id = ?", [id]);
    await query("UPDATE hr_loan_installments SET status = 'paid', paid_date = CURDATE() WHERE loan_id = ? AND status = 'pending'", [id]);
    return { ok: true, message: "Loan marked as paid." };
  }
  if (action === "cancel") {
    const { id } = body;
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    await query("UPDATE hr_loans SET status = 'cancelled' WHERE id = ?", [id]);
    return { ok: true, message: "Loan cancelled." };
  }
  if (action === "pay_installment") {
    const { installment_id, payroll_id } = body;
    if (!installment_id) throw createError({ statusCode: 400, statusMessage: "installment_id required" });
    await query(
      "UPDATE hr_loan_installments SET status = 'paid', paid_date = CURDATE(), payroll_id = ? WHERE id = ?",
      [payroll_id || null, installment_id]
    );
    const inst = await queryOne("SELECT * FROM hr_loan_installments WHERE id = ?", [installment_id]);
    if (inst) {
      await queryOne("SELECT * FROM hr_loans WHERE id = ?", [inst.loan_id]);
      const [totRow] = await query(
        "SELECT COUNT(*) AS cnt FROM hr_loan_installments WHERE loan_id = ? AND status = 'pending'",
        [inst.loan_id]
      );
      if (Number(totRow.cnt) === 0) {
        await query("UPDATE hr_loans SET status = 'paid' WHERE id = ?", [inst.loan_id]);
      }
    }
    return { ok: true, message: "Installment marked as paid." };
  }
  throw createError({ statusCode: 400, statusMessage: "Unknown action" });
});

export { index_post as default };
//# sourceMappingURL=index.post8.mjs.map
