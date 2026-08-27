import { q as defineEventHandler, J as getQuery, as as queryOne, m as createError, ar as query } from '../../../nitro/nitro.mjs';
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

const glLedger_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const accountId = q.account ? Number(q.account) : null;
  const from = q.from || null;
  const to = q.to || null;
  const type = q.type || "";
  const page = Math.max(1, Number(q.page || 1));
  const per = Math.min(200, Number(q.per || 50));
  const offset = (page - 1) * per;
  if (!accountId)
    return { transactions: [], total: 0, page, per, totalCredits: 0, totalDebits: 0, bankAccount: null };
  const bankAccount = await queryOne(
    `SELECT id, bank_name, account_name, account_number, chart_of_account_id
     FROM bank_accounts WHERE id = ?`,
    [accountId]
  );
  if (!bankAccount)
    throw createError({ statusCode: 404, statusMessage: "Bank account not found" });
  const glAccountId = bankAccount.chart_of_account_id;
  if (!glAccountId)
    return {
      transactions: [],
      total: 0,
      page,
      per,
      totalCredits: 0,
      totalDebits: 0,
      bankAccount,
      note: "This bank account has no GL account linked (chart_of_account_id is null)"
    };
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
  if (type === "credit") {
    conditions.push("tl.debit_amount  > 0");
  }
  if (type === "debit") {
    conditions.push("tl.credit_amount > 0");
  }
  const where = `WHERE ${conditions.join(" AND ")}`;
  const [rows, totRow, sumRow] = await Promise.all([
    query(
      `SELECT
         tl.id,
         je.id            AS journal_entry_id,
         je.transaction_date,
         je.description,
         je.related_document_type,
         je.related_document_id,
         je.is_reversed,
         tl.debit_amount,
         tl.credit_amount,
         tl.description   AS line_description,
         u.display_name   AS posted_by
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       LEFT JOIN users u ON u.id = je.created_by_user_id
       ${where}
       ORDER BY je.transaction_date DESC, je.id DESC, tl.id DESC
       LIMIT ? OFFSET ?`,
      [...params, per, offset]
    ),
    queryOne(
      `SELECT COUNT(*) AS total
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       ${where}`,
      params
    ),
    queryOne(
      `SELECT
         -- Money IN  = bank account was debited (DR)
         COALESCE(SUM(CASE WHEN tl.debit_amount  > 0 AND je.is_reversed = 0 THEN tl.debit_amount  ELSE 0 END), 0) AS total_credits,
         -- Money OUT = bank account was credited (CR)
         COALESCE(SUM(CASE WHEN tl.credit_amount > 0 AND je.is_reversed = 0 THEN tl.credit_amount ELSE 0 END), 0) AS total_debits
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       ${where}`,
      params
    )
  ]);
  const transactions = rows.map((r) => {
    var _a;
    return {
      id: r.id,
      journal_entry_id: r.journal_entry_id,
      transaction_date: r.transaction_date,
      description: r.description,
      line_description: r.line_description,
      source: (_a = r.related_document_type) != null ? _a : "General",
      source_id: r.related_document_id,
      is_reversed: Boolean(r.is_reversed),
      // Bank-statement perspective: DR to bank = money in (credit), CR from bank = money out (debit)
      entry_type: Number(r.debit_amount) > 0 ? "credit" : "debit",
      amount: Number(r.debit_amount) > 0 ? Number(r.debit_amount) : Number(r.credit_amount),
      debit_amount: Number(r.debit_amount),
      credit_amount: Number(r.credit_amount),
      reference_number: `JE-${r.journal_entry_id}`,
      bank_name: bankAccount.bank_name,
      posted_by: r.posted_by,
      status: r.is_reversed ? "reversed" : "approved"
    };
  });
  return {
    transactions,
    total: Number((totRow == null ? void 0 : totRow.total) || 0),
    page,
    per,
    totalCredits: Number((sumRow == null ? void 0 : sumRow.total_credits) || 0),
    totalDebits: Number((sumRow == null ? void 0 : sumRow.total_debits) || 0),
    bankAccount,
    glAccountId
  };
});

export { glLedger_get as default };
//# sourceMappingURL=gl-ledger.get.mjs.map
