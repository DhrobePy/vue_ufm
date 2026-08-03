import { q as defineEventHandler, J as getQuery, an as query, ao as queryOne, m as createError } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const unifiedLedger_get = defineEventHandler(async (event) => {
  var _a, _b;
  const q = getQuery(event);
  const accountId = q.account ? Number(q.account) : null;
  const from = q.from || null;
  const to = q.to || null;
  const accounts = await query(
    `SELECT id, bank_name, account_name, account_number
     FROM bank_accounts
     WHERE chart_of_account_id IS NOT NULL
       AND (status = 'active' OR status IS NULL)
     ORDER BY bank_name`
  );
  if (!accountId) {
    return {
      transactions: [],
      opening_balance: 0,
      closing_balance: 0,
      totalCredits: 0,
      totalDebits: 0,
      bankAccount: null,
      accounts
    };
  }
  const bankAccount = await queryOne(
    `SELECT id, bank_name, account_name, account_number, account_type,
            chart_of_account_id
     FROM bank_accounts WHERE id = ?`,
    [accountId]
  );
  if (!bankAccount)
    throw createError({ statusCode: 404, statusMessage: "Bank account not found" });
  const glAccountId = bankAccount.chart_of_account_id;
  if (!glAccountId) {
    return {
      transactions: [],
      opening_balance: 0,
      closing_balance: 0,
      totalCredits: 0,
      totalDebits: 0,
      bankAccount,
      accounts,
      note: "This bank account has no GL account linked (chart_of_account_id is null)"
    };
  }
  let seedBalance = 0;
  try {
    const ob = await queryOne(
      `SELECT COALESCE(opening_balance, 0) AS ob FROM bank_accounts WHERE id = ?`,
      [accountId]
    );
    seedBalance = Number((_a = ob == null ? void 0 : ob.ob) != null ? _a : 0);
  } catch {
  }
  const openingBalanceConfigured = seedBalance > 0;
  let openingBalance = seedBalance;
  if (from && openingBalanceConfigured) {
    const beforeRow = await queryOne(
      `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS net
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       WHERE tl.account_id = ?
         AND je.transaction_date < ?`,
      [glAccountId, from]
    );
    openingBalance = seedBalance + Number((_b = beforeRow == null ? void 0 : beforeRow.net) != null ? _b : 0);
  }
  const conditions = ["tl.account_id = ?"];
  const params = [glAccountId];
  if (from) {
    conditions.push("je.transaction_date >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("je.transaction_date <= ?");
    params.push(to);
  }
  const where = `WHERE ${conditions.join(" AND ")}`;
  const rows = await query(
    `SELECT
       tl.id,
       je.id                   AS journal_entry_id,
       je.transaction_date,
       je.description          AS je_description,
       je.related_document_type,
       je.related_document_id,
       COALESCE(je.is_reversed, 0) AS is_reversed,
       tl.debit_amount,
       tl.credit_amount,
       tl.description          AS line_description,
       u.display_name          AS posted_by
     FROM transaction_lines tl
     JOIN journal_entries je ON je.id = tl.journal_entry_id
     LEFT JOIN users u ON u.id = je.created_by_user_id
     ${where}
     ORDER BY je.transaction_date ASC, je.id ASC, tl.id ASC
     LIMIT 2000`,
    params
  );
  let running = openingBalance;
  let totalCredits = 0;
  let totalDebits = 0;
  const transactions = rows.map((r) => {
    var _a2, _b2, _c;
    const dr = Number((_a2 = r.debit_amount) != null ? _a2 : 0);
    const cr = Number((_b2 = r.credit_amount) != null ? _b2 : 0);
    const isReversed = Number(r.is_reversed) === 1;
    running += dr - cr;
    totalCredits += dr;
    totalDebits += cr;
    const description = r.je_description || r.line_description || "";
    const lineDiff = r.line_description && r.line_description !== description ? r.line_description : null;
    return {
      id: r.id,
      journal_entry_id: r.journal_entry_id,
      transaction_date: r.transaction_date,
      description,
      line_description: lineDiff,
      source: (_c = r.related_document_type) != null ? _c : "Manual",
      source_id: r.related_document_id,
      is_reversed: isReversed,
      credit_in: dr,
      // money INTO the bank account (bank was DR'd)
      debit_out: cr,
      // money OUT of the bank account (bank was CR'd)
      balance: running
    };
  });
  const closingBalance = running;
  return {
    transactions,
    opening_balance: openingBalance,
    closing_balance: closingBalance,
    totalCredits,
    totalDebits,
    bankAccount,
    glAccountId,
    accounts,
    opening_balance_configured: openingBalanceConfigured
  };
});

export { unifiedLedger_get as default };
//# sourceMappingURL=unified-ledger.get.mjs.map
