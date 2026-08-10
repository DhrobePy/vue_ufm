import { q as defineEventHandler, J as getQuery, ap as query, aq as queryOne, m as createError } from '../../../nitro/nitro.mjs';
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

const reconciliation_get = defineEventHandler(async (event) => {
  var _a, _b;
  const q = getQuery(event);
  const accountId = q.account ? Number(q.account) : null;
  const accounts = await query(
    `SELECT id, bank_name, account_name, account_number FROM bank_tx_accounts
     WHERE status = 'active' ORDER BY bank_name`
  );
  if (!accountId) {
    return { accounts, account: null, transactions: [], glMatch: null };
  }
  const account = await queryOne(
    `SELECT id, bank_name, account_name, account_number, opening_balance
     FROM bank_tx_accounts WHERE id = ?`,
    [accountId]
  );
  if (!account) throw createError({ statusCode: 404, statusMessage: "Bank account not found" });
  const txnsAsc = await query(
    `SELECT id, transaction_number, transaction_date, entry_type, amount,
            reference_number, payee_payer_name, description, status,
            reconciled_at, reconciled_by_user_id
     FROM bank_transactions
     WHERE bank_tx_account_id = ? AND status IN ('approved', 'pending')
     ORDER BY transaction_date ASC, id ASC`,
    [accountId]
  );
  let running = Number((_a = account.opening_balance) != null ? _a : 0);
  const transactions = txnsAsc.map((t) => {
    running += t.entry_type === "credit" ? Number(t.amount) : -Number(t.amount);
    return { ...t, balance: running };
  }).reverse();
  const bankModuleBalance = running;
  const unreconciled = transactions.filter((t) => t.status === "approved" && !t.reconciled_at);
  const unreconciledAmount = unreconciled.reduce(
    (s, t) => s + (t.entry_type === "credit" ? Number(t.amount) : -Number(t.amount)),
    0
  );
  const glAccount = await queryOne(
    `SELECT id, bank_name, account_name, chart_of_account_id,
            COALESCE(opening_balance, 0) AS opening_balance
     FROM bank_accounts WHERE account_number = ? LIMIT 1`,
    [account.account_number]
  );
  let glMatch = null;
  if (glAccount == null ? void 0 : glAccount.chart_of_account_id) {
    const glMove = await queryOne(
      `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS net
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       WHERE tl.account_id = ?`,
      [glAccount.chart_of_account_id]
    );
    const glBalance = Number(glAccount.opening_balance) + Number((_b = glMove == null ? void 0 : glMove.net) != null ? _b : 0);
    glMatch = {
      id: glAccount.id,
      bank_name: glAccount.bank_name,
      account_name: glAccount.account_name,
      balance: glBalance
    };
  }
  return {
    accounts,
    account,
    transactions,
    bank_module_balance: bankModuleBalance,
    unreconciled_count: unreconciled.length,
    unreconciled_amount: unreconciledAmount,
    glMatch,
    variance: glMatch ? Number((glMatch.balance - bankModuleBalance).toFixed(2)) : null
  };
});

export { reconciliation_get as default };
//# sourceMappingURL=reconciliation.get.mjs.map
