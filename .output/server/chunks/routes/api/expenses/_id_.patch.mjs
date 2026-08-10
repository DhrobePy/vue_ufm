import { q as defineEventHandler, R as getRouterParam, m as createError, X as getUserSession, as as readBody, z as getDb, g as auditLog } from '../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid expense ID" });
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const userName = (_a = session.user.name) != null ? _a : `User ${userId}`;
  const body = await readBody(event);
  const {
    expense_date,
    category_id,
    subcategory_id,
    unit_quantity,
    per_unit_cost,
    total_amount,
    payment_method,
    bank_account_id,
    cash_account_id,
    payment_reference,
    employee_id,
    handled_by_person,
    branch_id,
    remarks
  } = body != null ? body : {};
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[exp]] = await conn.query(`SELECT * FROM expense_vouchers WHERE id = ? FOR UPDATE`, [id]);
    if (!exp) throw createError({ statusCode: 404, statusMessage: "Expense not found" });
    if (exp.status !== "pending")
      throw createError({ statusCode: 400, statusMessage: `Cannot edit \u2014 voucher is "${exp.status}", only pending vouchers can be edited` });
    const total = total_amount != null ? Number(total_amount) : Number(exp.total_amount);
    if (!total || total <= 0) throw createError({ statusCode: 400, statusMessage: "total_amount must be greater than 0" });
    if (payment_method === "cash" && !cash_account_id && !exp.cash_account_id)
      throw createError({ statusCode: 400, statusMessage: "A petty-cash account is required for cash payment" });
    if (payment_method === "bank" && !bank_account_id && !exp.bank_account_id)
      throw createError({ statusCode: 400, statusMessage: "A bank account is required for bank payment" });
    await conn.query(
      `UPDATE expense_vouchers SET
         expense_date       = ?,
         category_id        = ?,
         subcategory_id     = ?,
         unit_quantity      = ?,
         per_unit_cost      = ?,
         total_amount       = ?,
         payment_method     = ?,
         bank_account_id    = ?,
         cash_account_id    = ?,
         payment_reference  = ?,
         employee_id        = ?,
         handled_by_person  = ?,
         branch_id          = ?,
         remarks            = ?,
         updated_at         = NOW()
       WHERE id = ?`,
      [
        expense_date != null ? expense_date : exp.expense_date,
        category_id != null ? category_id : exp.category_id,
        (_b = subcategory_id != null ? subcategory_id : exp.subcategory_id) != null ? _b : null,
        (_c = unit_quantity != null ? unit_quantity : exp.unit_quantity) != null ? _c : null,
        (_d = per_unit_cost != null ? per_unit_cost : exp.per_unit_cost) != null ? _d : null,
        total,
        payment_method != null ? payment_method : exp.payment_method,
        payment_method === "bank" ? bank_account_id != null ? bank_account_id : exp.bank_account_id : payment_method === "cash" ? null : exp.bank_account_id,
        payment_method === "cash" ? cash_account_id != null ? cash_account_id : exp.cash_account_id : payment_method === "bank" ? null : exp.cash_account_id,
        (_e = payment_reference != null ? payment_reference : exp.payment_reference) != null ? _e : null,
        (_f = employee_id != null ? employee_id : exp.employee_id) != null ? _f : null,
        (_g = handled_by_person != null ? handled_by_person : exp.handled_by_person) != null ? _g : null,
        (_h = branch_id != null ? branch_id : exp.branch_id) != null ? _h : null,
        (_i = remarks != null ? remarks : exp.remarks) != null ? _i : null,
        id
      ]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "expenses",
      recordType: "expense_voucher",
      recordId: id,
      referenceNumber: exp.voucher_number,
      description: `Pending expense ${exp.voucher_number} edited by ${userName}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
