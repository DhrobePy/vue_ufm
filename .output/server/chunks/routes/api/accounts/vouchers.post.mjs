import { q as defineEventHandler, as as readBody, X as getUserSession, m as createError, z as getDb } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const vouchers_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    voucher_date,
    expense_account_id,
    payment_account_id,
    amount,
    paid_to,
    description,
    reference_number,
    branch_id
  } = body != null ? body : {};
  if (!voucher_date || !expense_account_id || !payment_account_id || !amount || !paid_to || !description)
    throw createError({ statusCode: 400, statusMessage: "voucher_date, expense_account_id, payment_account_id, amount, paid_to, and description are required" });
  if (Number(amount) <= 0)
    throw createError({ statusCode: 400, statusMessage: "Amount must be greater than 0" });
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM debit_vouchers WHERE DATE(voucher_date) = CURDATE()`
    );
    const seq = String(Math.floor(1e3 + Math.random() * 9e3));
    const voucherNo = `DV-${today}-${seq}`;
    const [result] = await conn.query(
      `INSERT INTO debit_vouchers
         (voucher_number, voucher_date, expense_account_id, payment_account_id,
          amount, paid_to, description, reference_number, branch_id,
          created_by_user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        voucherNo,
        voucher_date,
        Number(expense_account_id),
        Number(payment_account_id),
        Number(amount),
        paid_to,
        description,
        reference_number || null,
        branch_id ? Number(branch_id) : null,
        userId
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId, voucher_number: voucherNo };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { vouchers_post as default };
//# sourceMappingURL=vouchers.post.mjs.map
