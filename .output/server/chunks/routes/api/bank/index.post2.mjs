import { m as defineEventHandler, a3 as readBody, i as createError, t as getDb } from '../../../nitro/nitro.mjs';
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
  var _a;
  const body = await readBody(event);
  const {
    bank_tx_account_id,
    transaction_date,
    description,
    entry_type,
    amount,
    reference_number,
    cheque_number,
    payee_payer_name,
    special_note
  } = body;
  if (!bank_tx_account_id || !transaction_date || !description || !entry_type || !amount) {
    throw createError({ statusCode: 422, statusMessage: "bank_tx_account_id, transaction_date, description, entry_type and amount are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM bank_transactions WHERE DATE(created_at) = CURDATE()`
    );
    const seq = String(((_a = cnt.n) != null ? _a : 0) + 1).padStart(4, "0");
    const txnNo = `BTX-${today}-${seq}`;
    const [[acct]] = await conn.query(`SELECT id FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [bank_tx_account_id]);
    if (!acct) throw createError({ statusCode: 404, statusMessage: "Bank account not found or inactive" });
    const [result] = await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, reference_number, cheque_number, payee_payer_name,
          special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)`,
      [
        txnNo,
        bank_tx_account_id,
        transaction_date,
        description,
        entry_type,
        amount,
        reference_number || null,
        cheque_number || null,
        payee_payer_name || null,
        special_note || null
      ]
    );
    await conn.commit();
    return { id: result.insertId, transaction_number: txnNo, message: "Transaction created \u2014 pending approval" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
