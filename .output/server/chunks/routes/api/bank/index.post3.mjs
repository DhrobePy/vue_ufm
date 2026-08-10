import { q as defineEventHandler, as as readBody, m as createError, X as getUserSession, z as getDb, a6 as nextDocNumber } from '../../../nitro/nitro.mjs';
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
  var _a, _b;
  const body = await readBody(event);
  const {
    bank_tx_account_id,
    transaction_date,
    description,
    entry_type,
    amount,
    transaction_type_id,
    reference_number,
    cheque_number,
    payee_payer_name,
    special_note
  } = body;
  if (!bank_tx_account_id || !transaction_date || !description || !entry_type || !amount) {
    throw createError({ statusCode: 422, statusMessage: "bank_tx_account_id, transaction_date, description, entry_type and amount are required" });
  }
  const session = await getUserSession(event);
  const userId = Number((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const txnNo = await nextDocNumber(conn, "BTX", "bank_transactions", "transaction_number");
    const [[acct]] = await conn.query(`SELECT id FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [bank_tx_account_id]);
    if (!acct) throw createError({ statusCode: 404, statusMessage: "Bank account not found or inactive" });
    const [result] = await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, transaction_type_id, reference_number, cheque_number, payee_payer_name,
          special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        txnNo,
        bank_tx_account_id,
        transaction_date,
        description,
        entry_type,
        amount,
        transaction_type_id || null,
        reference_number || null,
        cheque_number || null,
        payee_payer_name || null,
        special_note || null,
        userId
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
//# sourceMappingURL=index.post3.mjs.map
