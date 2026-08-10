import { q as defineEventHandler, R as getRouterParam, as as readBody, m as createError, X as getUserSession, L as getRequestIP, z as getDb, aG as reverseBankTransactionJE, af as postBankTransferJE, ae as postBankTransactionJE } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
  var _a, _b, _c, _d, _e, _f, _g;
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const { action } = body;
  if (!["approve", "reject", "unpost", "update"].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: "Invalid action" });
  }
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const userName = (_d = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _d : "System";
  const role = ((_f = (_e = session == null ? void 0 : session.user) == null ? void 0 : _e.role) != null ? _f : "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(role);
  const ip = (_g = getRequestIP(event)) != null ? _g : null;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[txn]] = await conn.query(
      `SELECT t.* FROM bank_transactions t WHERE t.id = ?`,
      [id]
    );
    if (!txn) throw createError({ statusCode: 404, statusMessage: "Transaction not found" });
    if (action === "unpost") {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: "Only admin can unpost transactions" });
      if (txn.status === "unposted") throw createError({ statusCode: 400, statusMessage: "Transaction is already unposted" });
      const oldStatus = txn.status;
      if (txn.journal_entry_id) {
        await reverseBankTransactionJE(conn, txn.journal_entry_id, userId, `Unposted by ${userName}`);
      }
      await conn.query(
        `UPDATE bank_transactions SET status = 'unposted', updated_at = NOW() WHERE id = ?`,
        [id]
      );
      await conn.query(
        `INSERT INTO bank_tx_audit_log (transaction_id, action, action_by_user_id, action_by_username, ip_address, old_values, new_values, notes)
         VALUES (?, 'unposted', ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          userName,
          ip,
          JSON.stringify({ status: oldStatus }),
          JSON.stringify({ status: "unposted" }),
          body.notes || null
        ]
      );
      await conn.commit();
      return { message: "Transaction unposted successfully" };
    }
    if (action === "update") {
      if (!isAdmin && txn.status !== "pending") {
        throw createError({ statusCode: 403, statusMessage: "Only admin can edit non-pending transactions" });
      }
      const setParts = [];
      const vals = [];
      const old = {};
      const nw = {};
      if (body.description !== void 0) {
        setParts.push("description = ?");
        vals.push(body.description);
        old.description = txn.description;
        nw.description = body.description;
      }
      if (body.amount !== void 0) {
        setParts.push("amount = ?");
        vals.push(body.amount);
        old.amount = txn.amount;
        nw.amount = body.amount;
      }
      if (body.reference_number !== void 0) {
        setParts.push("reference_number = ?");
        vals.push(body.reference_number);
        old.reference_number = txn.reference_number;
        nw.reference_number = body.reference_number;
      }
      if (body.cheque_number !== void 0) {
        setParts.push("cheque_number = ?");
        vals.push(body.cheque_number);
        old.cheque_number = txn.cheque_number;
        nw.cheque_number = body.cheque_number;
      }
      if (body.payee_payer_name !== void 0) {
        setParts.push("payee_payer_name = ?");
        vals.push(body.payee_payer_name);
        old.payee_payer_name = txn.payee_payer_name;
        nw.payee_payer_name = body.payee_payer_name;
      }
      if (body.special_note !== void 0) {
        setParts.push("special_note = ?");
        vals.push(body.special_note);
        old.special_note = txn.special_note;
        nw.special_note = body.special_note;
      }
      if (body.transaction_date !== void 0) {
        setParts.push("transaction_date = ?");
        vals.push(body.transaction_date);
        old.transaction_date = txn.transaction_date;
        nw.transaction_date = body.transaction_date;
      }
      if (body.transaction_type_id !== void 0) {
        setParts.push("transaction_type_id = ?");
        vals.push(body.transaction_type_id);
        old.transaction_type_id = txn.transaction_type_id;
        nw.transaction_type_id = body.transaction_type_id;
      }
      if (setParts.length) {
        setParts.push("updated_at = NOW()");
        await conn.query(`UPDATE bank_transactions SET ${setParts.join(", ")} WHERE id = ?`, [...vals, id]);
        await conn.query(
          `INSERT INTO bank_tx_audit_log (transaction_id, action, action_by_user_id, action_by_username, ip_address, old_values, new_values)
           VALUES (?, 'updated', ?, ?, ?, ?, ?)`,
          [id, userId, userName, ip, JSON.stringify(old), JSON.stringify(nw)]
        );
      }
      await conn.commit();
      return { message: "Transaction updated successfully" };
    }
    if (txn.status !== "pending") {
      throw createError({ statusCode: 400, statusMessage: `Transaction is ${txn.status} \u2014 cannot ${action}` });
    }
    const newStatus = action === "approve" ? "approved" : "rejected";
    let journalEntryId = null;
    let pairedJournalEntryId = null;
    if (action === "approve") {
      if (txn.transfer_pair_id) {
        const [[pair]] = await conn.query(`SELECT * FROM bank_transactions WHERE id = ?`, [txn.transfer_pair_id]);
        if (pair && pair.status === "approved" && pair.journal_entry_id) {
          journalEntryId = pair.journal_entry_id;
        } else {
          const debitLeg = txn.entry_type === "debit" ? txn : pair;
          const creditLeg = txn.entry_type === "credit" ? txn : pair;
          journalEntryId = await postBankTransferJE(conn, {
            fromTxnId: debitLeg.id,
            toTxnId: creditLeg.id,
            fromBankTxAccountId: debitLeg.bank_tx_account_id,
            toBankTxAccountId: creditLeg.bank_tx_account_id,
            amount: Number(txn.amount),
            date: String(txn.transaction_date).slice(0, 10),
            description: txn.description,
            userId
          });
          pairedJournalEntryId = journalEntryId;
        }
      } else {
        journalEntryId = await postBankTransactionJE(conn, {
          txnId: txn.id,
          transactionNumber: txn.transaction_number,
          bankTxAccountId: txn.bank_tx_account_id,
          entryType: txn.entry_type,
          amount: Number(txn.amount),
          date: String(txn.transaction_date).slice(0, 10),
          description: txn.description,
          transactionTypeId: txn.transaction_type_id,
          userId
        });
      }
    }
    await conn.query(
      `UPDATE bank_transactions
       SET status = ?, special_note = COALESCE(?, special_note), journal_entry_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [newStatus, body.notes || null, journalEntryId, id]
    );
    if (pairedJournalEntryId && txn.transfer_pair_id) {
      await conn.query(
        `UPDATE bank_transactions SET status = 'approved', journal_entry_id = ?, updated_at = NOW() WHERE id = ?`,
        [pairedJournalEntryId, txn.transfer_pair_id]
      );
    }
    await conn.query(
      `INSERT INTO bank_tx_audit_log (transaction_id, action, action_by_user_id, action_by_username, ip_address, old_values, new_values, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        action === "approve" ? "approved" : "rejected",
        userId,
        userName,
        ip,
        JSON.stringify({ status: "pending" }),
        JSON.stringify({ status: newStatus }),
        body.notes || null
      ]
    );
    await conn.commit();
    return { message: `Transaction ${action}d successfully` };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
