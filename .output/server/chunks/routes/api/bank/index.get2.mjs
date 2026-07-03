import { j as defineEventHandler, u as getQuery, Y as query, Z as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const account = q.account ? Number(q.account) : null;
  const from = q.from || null;
  const to = q.to || null;
  const type = q.type || "";
  const status = q.status || "";
  const page = Math.max(1, Number(q.page || 1));
  const per = Math.min(100, Number(q.per || 50));
  const offset = (page - 1) * per;
  const conditions = [];
  const params = [];
  if (account) {
    conditions.push("t.bank_tx_account_id = ?");
    params.push(account);
  }
  if (from) {
    conditions.push("t.transaction_date >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("t.transaction_date <= ?");
    params.push(to);
  }
  if (type) {
    conditions.push("t.entry_type = ?");
    params.push(type);
  }
  if (status) {
    conditions.push("t.status = ?");
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows, totals, summary] = await Promise.all([
    query(
      `SELECT t.id, t.transaction_number, t.transaction_date, t.description,
              t.entry_type, t.amount, t.reference_number, t.cheque_number,
              t.payee_payer_name, t.special_note, t.status,
              a.bank_name, a.account_name, a.account_number
       FROM bank_transactions t
       JOIN bank_tx_accounts a ON a.id = t.bank_tx_account_id
       ${where}
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      [...params, per, offset]
    ),
    queryOne(
      `SELECT COUNT(*) AS total FROM bank_transactions t ${where}`,
      params
    ),
    queryOne(
      `SELECT
         COALESCE(SUM(CASE WHEN t.entry_type='credit' AND t.status='approved' THEN t.amount END), 0) AS total_credits,
         COALESCE(SUM(CASE WHEN t.entry_type='debit'  AND t.status='approved' THEN t.amount END), 0) AS total_debits
       FROM bank_transactions t ${where}`,
      params
    )
  ]);
  return {
    transactions: rows,
    total: Number((totals == null ? void 0 : totals.total) || 0),
    page,
    per,
    totalCredits: Number((summary == null ? void 0 : summary.total_credits) || 0),
    totalDebits: Number((summary == null ? void 0 : summary.total_debits) || 0)
  };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
