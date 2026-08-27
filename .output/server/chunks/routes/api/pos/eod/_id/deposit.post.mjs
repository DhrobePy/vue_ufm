import { q as defineEventHandler, X as getUserSession, m as createError, R as getRouterParam, at as readBody, z as getDb, g as auditLog } from '../../../../../nitro/nitro.mjs';
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

const deposit_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts/Admin only" });
  const userId = Number(session.user.id);
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event).catch(() => ({}));
  const reference = String((_c = body == null ? void 0 : body.deposit_reference) != null ? _c : "").trim();
  const bankAccountId = Number(body == null ? void 0 : body.bank_account_id);
  if (!reference) throw createError({ statusCode: 400, statusMessage: "A deposit reference is required" });
  if (!bankAccountId) throw createError({ statusCode: 400, statusMessage: "A destination bank account is required" });
  const conn = await getDb().getConnection();
  try {
    await conn.beginTransaction();
    const [[row]] = await conn.query(`SELECT * FROM cash_verification_log WHERE id = ? FOR UPDATE`, [id]);
    if (!row) throw createError({ statusCode: 404, statusMessage: "EOD entry not found" });
    if (row.status !== "approved") throw createError({ statusCode: 409, statusMessage: "Only approved EOD counts can be marked deposited" });
    if (row.deposited_at) throw createError({ statusCode: 409, statusMessage: "Already marked deposited" });
    const amount = Number(row.actual_cash);
    const [[pcAcc]] = await conn.query(
      `SELECT id, chart_of_account_id, current_balance FROM branch_petty_cash_accounts
       WHERE branch_id = ? FOR UPDATE`,
      [row.branch_id]
    );
    if (!(pcAcc == null ? void 0 : pcAcc.chart_of_account_id))
      throw createError({ statusCode: 400, statusMessage: "No active petty cash GL account configured for this branch" });
    const [[bankAcc]] = await conn.query(
      `SELECT chart_of_account_id, bank_name FROM bank_accounts WHERE id = ?`,
      [bankAccountId]
    );
    if (!(bankAcc == null ? void 0 : bankAcc.chart_of_account_id))
      throw createError({ statusCode: 400, statusMessage: "Invalid bank account" });
    const [jeRes] = await conn.query(
      `INSERT INTO journal_entries (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
       VALUES (CURDATE(), ?, 'PosDeposit', ?, ?)`,
      [`POS Cash Deposit \u2014 EOD #${id} \xB7 ${(_d = bankAcc.bank_name) != null ? _d : "Bank"} \xB7 ref ${reference}`, id, userId]
    );
    const jeId = jeRes.insertId;
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, 0, ?)`,
      [jeId, bankAcc.chart_of_account_id, amount, `Bank deposit \u2014 EOD #${id}`]
    );
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, 0, ?, ?)`,
      [jeId, pcAcc.chart_of_account_id, amount, `Cash out for deposit \u2014 EOD #${id}`]
    );
    const newBalance = Number(pcAcc.current_balance) - amount;
    await conn.query(
      `INSERT INTO branch_petty_cash_transactions
         (account_id, branch_id, transaction_type, amount, balance_after,
          reference_type, reference_id, description, created_by_user_id, transaction_date)
       VALUES (?, ?, 'transfer_out', ?, ?, 'pos_eod_deposit', ?, ?, ?, CURDATE())`,
      [pcAcc.id, row.branch_id, amount, newBalance, id, `Deposited to bank \u2014 EOD #${id} \xB7 ref ${reference}`, userId]
    );
    await conn.query(
      `UPDATE branch_petty_cash_accounts SET current_balance = ? WHERE id = ?`,
      [newBalance, pcAcc.id]
    );
    await conn.query(
      `UPDATE cash_verification_log
       SET deposited_at = NOW(), deposited_by_user_id = ?, deposit_reference = ?,
           deposit_bank_account_id = ?, deposit_journal_entry_id = ?
       WHERE id = ?`,
      [userId, reference, bankAccountId, jeId, id]
    );
    await auditLog(conn, {
      userId,
      action: "updated",
      module: "other",
      recordType: "cash_verification",
      recordId: id,
      description: `EOD cash deposit confirmed \u2014 \u09F3${amount.toLocaleString()} to ${(_e = bankAcc.bank_name) != null ? _e : "bank"} \xB7 ref ${reference} \xB7 JE #${jeId}`,
      severity: "info"
    });
    await conn.commit();
    return { ok: true, journal_entry_id: jeId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { deposit_post as default };
//# sourceMappingURL=deposit.post.mjs.map
