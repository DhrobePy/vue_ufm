import { query } from '~/server/utils/db'

/**
 * GET /api/bank/accounts
 * The ONE unified bank-account list — bank_accounts (GL-linked) joined to its
 * mirrored bank_tx_accounts row (via legacy_tx_account_id) for the
 * transaction-derived balance. Replaces the old split view where
 * /bank/accounts showed a bank_tx_accounts grid AND a separate
 * "GL-Linked Accounts" section from a different table.
 */
export default defineEventHandler(async () => {
  const accounts = await query(
    `SELECT ba.id, ba.bank_name, ba.account_name, ba.account_number, ba.branch_name,
            ba.account_type, ba.status, ba.chart_of_account_id, ba.legacy_tx_account_id,
            tx.id AS tx_account_id,
            COALESCE(tx.opening_balance, ba.initial_balance, 0)
              + COALESCE(SUM(CASE WHEN t.entry_type='credit' AND t.status='approved' THEN t.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN t.entry_type='debit'  AND t.status='approved' THEN t.amount ELSE 0 END), 0) AS balance
     FROM bank_accounts ba
     LEFT JOIN bank_tx_accounts tx ON tx.id = ba.legacy_tx_account_id
     LEFT JOIN bank_transactions t ON t.bank_tx_account_id = tx.id
     WHERE ba.status = 'active' OR ba.status IS NULL
     GROUP BY ba.id
     ORDER BY ba.bank_name`,
  ) as any[]

  return {
    accounts,
    total_balance: accounts.reduce((s, a) => s + Number(a.balance || 0), 0),
  }
})
