import { q as defineEventHandler, as as readBody, m as createError, X as getUserSession, z as getDb, a6 as nextDocNumber } from '../../../nitro/nitro.mjs';
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

const transfer_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const { from_account_id, to_account_id, amount, transfer_date, reference_number, notes } = body;
  if (!from_account_id || !to_account_id || !amount || !transfer_date) {
    throw createError({ statusCode: 422, statusMessage: "from_account_id, to_account_id, amount and transfer_date are required" });
  }
  if (from_account_id === to_account_id) {
    throw createError({ statusCode: 422, statusMessage: "Source and destination accounts must differ" });
  }
  const session = await getUserSession(event);
  const userId = Number((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1);
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[fromAcct]] = await conn.query(`SELECT id, bank_name, account_name FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [from_account_id]);
    const [[toAcct]] = await conn.query(`SELECT id, bank_name, account_name FROM bank_tx_accounts WHERE id = ? AND status = 'active'`, [to_account_id]);
    if (!fromAcct) throw createError({ statusCode: 404, statusMessage: "Source account not found or inactive" });
    if (!toAcct) throw createError({ statusCode: 404, statusMessage: "Destination account not found or inactive" });
    const xferAmt = Number(amount);
    const desc1 = `Transfer to ${toAcct.bank_name} \u2014 ${toAcct.account_name}`;
    const desc2 = `Transfer from ${fromAcct.bank_name} \u2014 ${fromAcct.account_name}`;
    const txnNo1 = await nextDocNumber(conn, "BTX", "bank_transactions", "transaction_number");
    const [r1] = await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, reference_number, special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, 'debit', ?, ?, ?, 'pending', ?)`,
      [txnNo1, from_account_id, transfer_date, desc1, xferAmt, reference_number || null, notes || null, userId]
    );
    const txnNo2 = await nextDocNumber(conn, "BTX", "bank_transactions", "transaction_number");
    const [r2] = await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, reference_number, special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, 'credit', ?, ?, ?, 'pending', ?)`,
      [txnNo2, to_account_id, transfer_date, desc2, xferAmt, reference_number || null, notes || null, userId]
    );
    await conn.query(`UPDATE bank_transactions SET transfer_pair_id = ? WHERE id = ?`, [r2.insertId, r1.insertId]);
    await conn.query(`UPDATE bank_transactions SET transfer_pair_id = ? WHERE id = ?`, [r1.insertId, r2.insertId]);
    await conn.commit();
    return {
      debit_id: r1.insertId,
      credit_id: r2.insertId,
      debit_txn: txnNo1,
      credit_txn: txnNo2,
      message: "Transfer created \u2014 pending approval"
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { transfer_post as default };
//# sourceMappingURL=transfer.post.mjs.map
