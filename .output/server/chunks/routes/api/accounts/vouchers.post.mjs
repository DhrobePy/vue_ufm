import { q as defineEventHandler, at as readBody, X as getUserSession, m as createError, z as getDb, g as auditLog } from '../../../nitro/nitro.mjs';
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
    const dvDatePrefix = new Date(voucher_date).toISOString().slice(0, 10).replace(/-/g, "");
    const [[lastDv]] = await conn.query(
      `SELECT voucher_number FROM debit_vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1`,
      [`DV-${dvDatePrefix}-%`]
    );
    const dvSeq = lastDv ? parseInt(String(lastDv.voucher_number).slice(-4), 10) + 1 : 1;
    const voucherNo = `DV-${dvDatePrefix}-${String(dvSeq).padStart(4, "0")}`;
    const [result] = await conn.query(
      `INSERT INTO debit_vouchers
         (voucher_number, voucher_date, expense_account_id, payment_account_id,
          amount, paid_to, description, reference_number, branch_id,
          created_by_user_id, approved_by_user_id, approved_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'approved')`,
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
        userId,
        userId
      ]
    );
    const voucherId = result.insertId;
    const [jeRes] = await conn.query(
      `INSERT INTO journal_entries
         (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
       VALUES (?, ?, 'debit_vouchers', ?, ?)`,
      [voucher_date, `Debit Voucher #${voucherNo} \u2014 ${description}`.slice(0, 255), voucherId, userId]
    );
    const jeId = jeRes.insertId;
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, 0, ?)`,
      [jeId, Number(expense_account_id), Number(amount), `Payment to ${paid_to} \u2014 ${description}`]
    );
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, 0, ?, ?)`,
      [jeId, Number(payment_account_id), Number(amount), `Payment via debit voucher ${voucherNo}`]
    );
    await conn.query(`UPDATE debit_vouchers SET journal_entry_id = ? WHERE id = ?`, [jeId, voucherId]);
    await auditLog(conn, {
      userId,
      action: "created",
      module: "accounts",
      recordType: "debit_voucher",
      recordId: voucherId,
      referenceNumber: voucherNo,
      description: `Debit voucher ${voucherNo} \u2014 \u09F3${Number(amount).toLocaleString()} to ${paid_to} \xB7 ${description}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, id: voucherId, voucher_number: voucherNo, journal_entry_id: jeId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { vouchers_post as default };
//# sourceMappingURL=vouchers.post.mjs.map
