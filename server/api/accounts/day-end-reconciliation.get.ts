import { query, queryOne } from '~/server/utils/db'
import { isAccountsRole, isAdminRole } from '~/server/utils/creditOrders'

/**
 * GET /api/accounts/day-end-reconciliation?date=YYYY-MM-DD
 *
 * Read-only diagnostic — never writes or auto-adjusts anything. Surfaces
 * four independent checks side by side so accounts can spot drift between a
 * cached/module balance and the ledger-truth GL balance before closing the
 * day:
 *   1. Bank      — bank_tx_accounts module balance vs GL bank_accounts balance
 *                  (same comparison as /api/bank/reconciliation, date-scoped)
 *   2. Petty Cash — branch_petty_cash_accounts.current_balance (cached) vs the
 *                   balance_after of its latest transaction (ledger-truth),
 *                   plus today's cash_verification_log entry if one exists
 *   3. AR        — SUM(customer_ledger) as of date vs SUM of every GL account
 *                   typed 'Accounts Receivable' as of date
 *   4. AP        — SUM(suppliers.current_balance) (live cache) vs SUM of
 *                   every GL account typed 'Accounts Payable' as of date
 *
 * Petty cash and AP cached figures are live-mutated fields with no history,
 * so they're always "as of now" — only the GL and ledger sides are cut off
 * at the selected date. This is called out explicitly in the response
 * rather than silently presenting a mismatched-precision comparison.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role) && !isAdminRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })

  const q = getQuery(event)
  const date = (q.date as string) || new Date().toISOString().slice(0, 10)
  const isToday = date === new Date().toISOString().slice(0, 10)

  // ── 1. Bank ──────────────────────────────────────────────────────────────
  const bankAccounts = await query<any>(
    `SELECT id, bank_name, account_name, account_number, opening_balance FROM bank_tx_accounts WHERE status = 'active'`,
  )
  const bank = await Promise.all(bankAccounts.map(async (acc: any) => {
    const moduleMove = await queryOne<any>(
      `SELECT COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) AS net
       FROM bank_transactions
       WHERE bank_tx_account_id = ? AND status IN ('approved','pending') AND transaction_date <= ?`,
      [acc.id, date],
    )
    const moduleBalance = Number(acc.opening_balance ?? 0) + Number(moduleMove?.net ?? 0)

    const glAccount = await queryOne<any>(
      `SELECT chart_of_account_id, COALESCE(opening_balance, 0) AS opening_balance
       FROM bank_accounts WHERE account_number = ? LIMIT 1`,
      [acc.account_number],
    )
    let glBalance: number | null = null
    if (glAccount?.chart_of_account_id) {
      const glMove = await queryOne<any>(
        `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS net
         FROM transaction_lines tl
         JOIN journal_entries je ON je.id = tl.journal_entry_id
         WHERE tl.account_id = ? AND je.transaction_date <= ?`,
        [glAccount.chart_of_account_id, date],
      )
      glBalance = Number(glAccount.opening_balance) + Number(glMove?.net ?? 0)
    }

    return {
      id: acc.id, bank_name: acc.bank_name, account_name: acc.account_name,
      module_balance: Number(moduleBalance.toFixed(2)),
      gl_balance: glBalance === null ? null : Number(glBalance.toFixed(2)),
      variance: glBalance === null ? null : Number((glBalance - moduleBalance).toFixed(2)),
    }
  }))

  // ── 2. Petty Cash ────────────────────────────────────────────────────────
  const pettyAccounts = await query<any>(
    `SELECT pca.id, pca.branch_id, pca.account_name, pca.current_balance, b.name AS branch_name
     FROM branch_petty_cash_accounts pca
     LEFT JOIN branches b ON b.id = pca.branch_id
     WHERE pca.status = 'active'`,
  )
  const pettyCash = await Promise.all(pettyAccounts.map(async (acc: any) => {
    const latest = await queryOne<any>(
      `SELECT balance_after FROM branch_petty_cash_transactions
       WHERE account_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 1`,
      [acc.id],
    )
    const ledgerBalance = latest ? Number(latest.balance_after) : Number(acc.current_balance)
    const verification = await queryOne<any>(
      `SELECT expected_cash, actual_cash, variance, status
       FROM cash_verification_log
       WHERE branch_id = ? AND DATE(verification_date) = ?
       ORDER BY id DESC LIMIT 1`,
      [acc.branch_id, date],
    )
    return {
      id: acc.id, branch_name: acc.branch_name ?? `#${acc.branch_id}`, account_name: acc.account_name,
      cached_balance: Number(acc.current_balance),
      ledger_balance: Number(ledgerBalance.toFixed(2)),
      variance: Number((Number(acc.current_balance) - ledgerBalance).toFixed(2)),
      day_verification: verification ?? null,
    }
  }))

  // ── 3. AR ────────────────────────────────────────────────────────────────
  const arLedger = await queryOne<any>(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM customer_ledger WHERE transaction_date <= ?`,
    [date],
  )
  const arGl = await queryOne<any>(
    `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS bal
     FROM transaction_lines tl
     JOIN journal_entries je ON je.id = tl.journal_entry_id
     JOIN chart_of_accounts coa ON coa.id = tl.account_id
     WHERE coa.account_type = 'Accounts Receivable' AND je.transaction_date <= ?`,
    [date],
  )
  const ar = {
    ledger_balance: Number(arLedger?.bal ?? 0),
    gl_balance: Number(arGl?.bal ?? 0),
    variance: Number((Number(arGl?.bal ?? 0) - Number(arLedger?.bal ?? 0)).toFixed(2)),
  }

  // ── 4. AP ────────────────────────────────────────────────────────────────
  const apCached = await queryOne<any>(
    `SELECT COALESCE(SUM(current_balance), 0) AS bal FROM suppliers`,
  )
  const apGl = await queryOne<any>(
    `SELECT COALESCE(SUM(tl.credit_amount - tl.debit_amount), 0) AS bal
     FROM transaction_lines tl
     JOIN journal_entries je ON je.id = tl.journal_entry_id
     JOIN chart_of_accounts coa ON coa.id = tl.account_id
     WHERE coa.account_type = 'Accounts Payable' AND je.transaction_date <= ?`,
    [date],
  )
  const ap = {
    cached_balance: Number(apCached?.bal ?? 0),
    gl_balance: Number(apGl?.bal ?? 0),
    variance: Number((Number(apCached?.bal ?? 0) - Number(apGl?.bal ?? 0)).toFixed(2)),
  }

  return { date, is_today: isToday, bank, petty_cash: pettyCash, ar, ap }
})
