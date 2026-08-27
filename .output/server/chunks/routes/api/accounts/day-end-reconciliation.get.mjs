import { q as defineEventHandler, X as getUserSession, m as createError, a0 as isAccountsRole, a1 as isAdminRole, J as getQuery, ar as query, as as queryOne } from '../../../nitro/nitro.mjs';
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

const dayEndReconciliation_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const role = ((_a = session.user.role) != null ? _a : "").toLowerCase();
  if (!isAccountsRole(role) && !isAdminRole(role))
    throw createError({ statusCode: 403, statusMessage: "Accounts family or admin only" });
  const q = getQuery(event);
  const date = q.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const isToday = date === (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const bankAccounts = await query(
    `SELECT id, bank_name, account_name, account_number, opening_balance FROM bank_tx_accounts WHERE status = 'active'`
  );
  const bank = await Promise.all(bankAccounts.map(async (acc) => {
    var _a2, _b2, _c2;
    const moduleMove = await queryOne(
      `SELECT COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) AS net
       FROM bank_transactions
       WHERE bank_tx_account_id = ? AND status IN ('approved','pending') AND transaction_date <= ?`,
      [acc.id, date]
    );
    const moduleBalance = Number((_a2 = acc.opening_balance) != null ? _a2 : 0) + Number((_b2 = moduleMove == null ? void 0 : moduleMove.net) != null ? _b2 : 0);
    const glAccount = await queryOne(
      `SELECT chart_of_account_id, COALESCE(opening_balance, 0) AS opening_balance
       FROM bank_accounts WHERE account_number = ? LIMIT 1`,
      [acc.account_number]
    );
    let glBalance = null;
    if (glAccount == null ? void 0 : glAccount.chart_of_account_id) {
      const glMove = await queryOne(
        `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS net
         FROM transaction_lines tl
         JOIN journal_entries je ON je.id = tl.journal_entry_id
         WHERE tl.account_id = ? AND je.transaction_date <= ?`,
        [glAccount.chart_of_account_id, date]
      );
      glBalance = Number(glAccount.opening_balance) + Number((_c2 = glMove == null ? void 0 : glMove.net) != null ? _c2 : 0);
    }
    return {
      id: acc.id,
      bank_name: acc.bank_name,
      account_name: acc.account_name,
      module_balance: Number(moduleBalance.toFixed(2)),
      gl_balance: glBalance === null ? null : Number(glBalance.toFixed(2)),
      variance: glBalance === null ? null : Number((glBalance - moduleBalance).toFixed(2))
    };
  }));
  const pettyAccounts = await query(
    `SELECT pca.id, pca.branch_id, pca.account_name, pca.current_balance, b.name AS branch_name
     FROM branch_petty_cash_accounts pca
     LEFT JOIN branches b ON b.id = pca.branch_id
     WHERE pca.status = 'active'`
  );
  const pettyCash = await Promise.all(pettyAccounts.map(async (acc) => {
    var _a2;
    const latest = await queryOne(
      `SELECT balance_after FROM branch_petty_cash_transactions
       WHERE account_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 1`,
      [acc.id]
    );
    const ledgerBalance = latest ? Number(latest.balance_after) : Number(acc.current_balance);
    const verification = await queryOne(
      `SELECT expected_cash, actual_cash, variance, status
       FROM cash_verification_log
       WHERE branch_id = ? AND DATE(verification_date) = ?
       ORDER BY id DESC LIMIT 1`,
      [acc.branch_id, date]
    );
    return {
      id: acc.id,
      branch_name: (_a2 = acc.branch_name) != null ? _a2 : `#${acc.branch_id}`,
      account_name: acc.account_name,
      cached_balance: Number(acc.current_balance),
      ledger_balance: Number(ledgerBalance.toFixed(2)),
      variance: Number((Number(acc.current_balance) - ledgerBalance).toFixed(2)),
      day_verification: verification != null ? verification : null
    };
  }));
  const arLedger = await queryOne(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM customer_ledger WHERE transaction_date <= ?`,
    [date]
  );
  const arGl = await queryOne(
    `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS bal
     FROM transaction_lines tl
     JOIN journal_entries je ON je.id = tl.journal_entry_id
     JOIN chart_of_accounts coa ON coa.id = tl.account_id
     WHERE coa.account_type = 'Accounts Receivable' AND je.transaction_date <= ?`,
    [date]
  );
  const ar = {
    ledger_balance: Number((_b = arLedger == null ? void 0 : arLedger.bal) != null ? _b : 0),
    gl_balance: Number((_c = arGl == null ? void 0 : arGl.bal) != null ? _c : 0),
    variance: Number((Number((_d = arGl == null ? void 0 : arGl.bal) != null ? _d : 0) - Number((_e = arLedger == null ? void 0 : arLedger.bal) != null ? _e : 0)).toFixed(2))
  };
  const apCached = await queryOne(
    `SELECT COALESCE(SUM(current_balance), 0) AS bal FROM suppliers`
  );
  const apGl = await queryOne(
    `SELECT COALESCE(SUM(tl.credit_amount - tl.debit_amount), 0) AS bal
     FROM transaction_lines tl
     JOIN journal_entries je ON je.id = tl.journal_entry_id
     JOIN chart_of_accounts coa ON coa.id = tl.account_id
     WHERE coa.account_type = 'Accounts Payable' AND je.transaction_date <= ?`,
    [date]
  );
  const ap = {
    cached_balance: Number((_f = apCached == null ? void 0 : apCached.bal) != null ? _f : 0),
    gl_balance: Number((_g = apGl == null ? void 0 : apGl.bal) != null ? _g : 0),
    variance: Number((Number((_h = apCached == null ? void 0 : apCached.bal) != null ? _h : 0) - Number((_i = apGl == null ? void 0 : apGl.bal) != null ? _i : 0)).toFixed(2))
  };
  return { date, is_today: isToday, bank, petty_cash: pettyCash, ar, ap };
});

export { dayEndReconciliation_get as default };
//# sourceMappingURL=day-end-reconciliation.get.mjs.map
