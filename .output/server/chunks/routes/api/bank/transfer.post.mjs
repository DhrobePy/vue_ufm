import { p as defineEventHandler, am as readBody, l as createError, V as getUserSession, y as getDb } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d;
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
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM bank_transactions WHERE DATE(created_at) = CURDATE()`
    );
    const seq1 = String(((_c = cnt.n) != null ? _c : 0) + 1).padStart(4, "0");
    const seq2 = String(((_d = cnt.n) != null ? _d : 0) + 2).padStart(4, "0");
    const txnNo1 = `BTX-${today}-${seq1}`;
    const txnNo2 = `BTX-${today}-${seq2}`;
    const xferAmt = Number(amount);
    const desc1 = `Transfer to ${toAcct.bank_name} \u2014 ${toAcct.account_name}`;
    const desc2 = `Transfer from ${fromAcct.bank_name} \u2014 ${fromAcct.account_name}`;
    const [r1] = await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, bank_tx_account_id, transaction_date, description,
          entry_type, amount, reference_number, special_note, status, created_by_user_id)
       VALUES (?, ?, ?, ?, 'debit', ?, ?, ?, 'pending', ?)`,
      [txnNo1, from_account_id, transfer_date, desc1, xferAmt, reference_number || null, notes || null, userId]
    );
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
