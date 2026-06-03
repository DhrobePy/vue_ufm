import { h as defineEventHandler, I as readBody, w as getUserSession, e as createError, n as getDb, H as queryOne, a as auditLog } from '../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  const {
    expense_date,
    category_id,
    subcategory_id,
    unit_quantity,
    per_unit_cost,
    total_amount,
    payment_method,
    bank_account_id,
    payment_account_name,
    payment_reference,
    employee_id,
    handled_by_person,
    branch_id,
    expense_account_id,
    remarks
  } = body != null ? body : {};
  if (!expense_date || !category_id || !remarks) {
    throw createError({ statusCode: 400, statusMessage: "expense_date, category_id and remarks are required" });
  }
  const method = payment_method != null ? payment_method : "Cash";
  if (["Bank Transfer", "Cheque"].includes(method) && !bank_account_id) {
    throw createError({ statusCode: 400, statusMessage: "bank_account_id is required for Bank Transfer / Cheque payment" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM expense_vouchers WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_g = cnt.n) != null ? _g : 0) + 1).padStart(4, "0");
    const voucherNo = `EXP-${today}-${seq}`;
    const computed_total = total_amount != null ? total_amount : (unit_quantity != null ? unit_quantity : 1) * (per_unit_cost != null ? per_unit_cost : 0);
    let resolvedExpenseAccountId = expense_account_id ? Number(expense_account_id) : null;
    if (!resolvedExpenseAccountId && category_id) {
      const cat = await queryOne(
        `SELECT chart_of_account_id FROM expense_categories WHERE id = ?`,
        [Number(category_id)]
      );
      resolvedExpenseAccountId = (_h = cat == null ? void 0 : cat.chart_of_account_id) != null ? _h : null;
    }
    let resolvedPaymentAccountName = payment_account_name != null ? payment_account_name : null;
    if (!resolvedPaymentAccountName && bank_account_id) {
      const ba = await queryOne(
        `SELECT bank_name, account_number, account_name FROM bank_accounts WHERE id = ?`,
        [Number(bank_account_id)]
      );
      if (ba) resolvedPaymentAccountName = `${ba.bank_name} \u2013 ${ba.account_name} (${ba.account_number})`;
    }
    const [result] = await conn.query(
      `INSERT INTO expense_vouchers
         (voucher_number, expense_date, category_id, subcategory_id,
          unit_quantity, per_unit_cost, total_amount,
          payment_method, bank_account_id, payment_account_name,
          payment_reference, employee_id, handled_by_person,
          expense_account_id, remarks,
          status, branch_id, created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?,
               ?, ?,
               'pending', ?, ?, NOW(), NOW())`,
      [
        voucherNo,
        expense_date,
        Number(category_id),
        subcategory_id ? Number(subcategory_id) : null,
        unit_quantity != null ? unit_quantity : null,
        per_unit_cost != null ? per_unit_cost : null,
        computed_total,
        method,
        bank_account_id ? Number(bank_account_id) : null,
        resolvedPaymentAccountName,
        payment_reference != null ? payment_reference : null,
        employee_id ? Number(employee_id) : null,
        handled_by_person != null ? handled_by_person : null,
        resolvedExpenseAccountId,
        remarks,
        branch_id ? Number(branch_id) : null,
        userId
      ]
    );
    const newId = result.insertId;
    await auditLog(conn, {
      userId,
      action: "created",
      module: "expenses",
      recordType: "expense_voucher",
      recordId: newId,
      referenceNumber: voucherNo,
      description: `Expense voucher ${voucherNo} (\u09F3${Number(computed_total).toLocaleString()}) created by ${actorName}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: newId, voucher_number: voucherNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map
