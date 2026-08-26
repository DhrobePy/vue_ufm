import { q as defineEventHandler, aq as query } from '../../../nitro/nitro.mjs';
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

const dashboard_get = defineEventHandler(async () => {
  const [accounts, pendingTxns] = await Promise.all([
    // All active bank_tx_accounts with computed balance
    query(
      `SELECT a.id, a.bank_name, a.account_name, a.account_number, a.branch_name,
              a.account_type, a.opening_balance, a.status,
              COALESCE(SUM(CASE WHEN t.entry_type='credit' AND t.status='approved' THEN t.amount ELSE 0 END), 0) AS total_credits,
              COALESCE(SUM(CASE WHEN t.entry_type='debit'  AND t.status='approved' THEN t.amount ELSE 0 END), 0) AS total_debits,
              a.opening_balance
              + COALESCE(SUM(CASE WHEN t.entry_type='credit' AND t.status='approved' THEN t.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN t.entry_type='debit'  AND t.status='approved' THEN t.amount ELSE 0 END), 0) AS balance
       FROM bank_tx_accounts a
       LEFT JOIN bank_transactions t ON t.bank_tx_account_id = a.id
       WHERE a.status = 'active'
       GROUP BY a.id
       ORDER BY a.bank_name`
    ),
    // Recent pending transactions for approval queue
    query(
      `SELECT t.id, t.transaction_number, t.transaction_date, t.description,
              t.entry_type, t.amount, t.reference_number, t.payee_payer_name, t.status,
              a.bank_name, a.account_name, a.account_number
       FROM bank_transactions t
       JOIN bank_tx_accounts a ON a.id = t.bank_tx_account_id
       WHERE t.status = 'pending'
       ORDER BY t.created_at DESC
       LIMIT 20`
    )
  ]);
  const stats = {
    total_balance: accounts.reduce((s, a) => s + Number(a.balance || 0), 0),
    pending_count: pendingTxns.length,
    pending_amount: pendingTxns.reduce((s, t) => s + Number(t.amount || 0), 0),
    deposits_today: 0,
    // computed below
    withdrawals_today: 0
  };
  return { accounts, stats, pendingTxns };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
