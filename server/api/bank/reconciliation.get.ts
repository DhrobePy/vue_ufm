import { query, queryOne } from '~/server/utils/db'

/**
 * GET /api/bank/reconciliation?account=<bank_tx_accounts.id>
 *
 * Two independent records of the same real-world bank account exist in this
 * app: the standalone bank-transaction module (bank_tx_accounts /
 * bank_transactions — what accounts actually enters day to day) and the
 * GL-linked ledger (bank_accounts / journal entries — the accounting truth).
 * They're matched by account_number, not a shared id. This compares the two
 * and surfaces the variance plus which bank-module entries are still
 * unreconciled against the real statement.
 */
export default defineEventHandler(async (event) => {
  const q         = getQuery(event)
  const accountId = q.account ? Number(q.account) : null

  const accounts = await query(
    `SELECT id, bank_name, account_name, account_number FROM bank_tx_accounts
     WHERE status = 'active' ORDER BY bank_name`,
  ) as any[]

  if (!accountId) {
    return { accounts, account: null, transactions: [], glMatch: null }
  }

  const account = await queryOne<any>(
    `SELECT id, bank_name, account_name, account_number, opening_balance
     FROM bank_tx_accounts WHERE id = ?`,
    [accountId],
  )
  if (!account) throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })

  // Bank-module side: every approved/pending transaction, oldest first, with running balance
  const txnsAsc = await query<any>(
    `SELECT id, transaction_number, transaction_date, entry_type, amount,
            reference_number, payee_payer_name, description, status,
            reconciled_at, reconciled_by_user_id
     FROM bank_transactions
     WHERE bank_tx_account_id = ? AND status IN ('approved', 'pending')
     ORDER BY transaction_date ASC, id ASC`,
    [accountId],
  )
  let running = Number(account.opening_balance ?? 0)
  const transactions = (txnsAsc as any[]).map(t => {
    running += t.entry_type === 'credit' ? Number(t.amount) : -Number(t.amount)
    return { ...t, balance: running }
  }).reverse() // newest first for display

  const bankModuleBalance = running
  const unreconciled = (transactions as any[]).filter(t => t.status === 'approved' && !t.reconciled_at)
  const unreconciledAmount = unreconciled.reduce(
    (s, t) => s + (t.entry_type === 'credit' ? Number(t.amount) : -Number(t.amount)), 0,
  )

  // GL side: find the matching GL-linked bank_accounts row by account_number
  const glAccount = await queryOne<any>(
    `SELECT id, bank_name, account_name, chart_of_account_id,
            COALESCE(opening_balance, 0) AS opening_balance
     FROM bank_accounts WHERE account_number = ? LIMIT 1`,
    [account.account_number],
  )

  let glMatch: any = null
  if (glAccount?.chart_of_account_id) {
    const glMove = await queryOne<any>(
      `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS net
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       WHERE tl.account_id = ?`,
      [glAccount.chart_of_account_id],
    )
    const glBalance = Number(glAccount.opening_balance) + Number(glMove?.net ?? 0)
    glMatch = {
      id: glAccount.id,
      bank_name: glAccount.bank_name,
      account_name: glAccount.account_name,
      balance: glBalance,
    }
  }

  return {
    accounts,
    account,
    transactions,
    bank_module_balance: bankModuleBalance,
    unreconciled_count: unreconciled.length,
    unreconciled_amount: unreconciledAmount,
    glMatch,
    variance: glMatch ? Number((glMatch.balance - bankModuleBalance).toFixed(2)) : null,
  }
})
