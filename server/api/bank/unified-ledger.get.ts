import { query, queryOne } from '~/server/utils/db'

/**
 * GET /api/bank/unified-ledger
 *
 * Real bank-passbook style statement for a GL-linked bank account.
 * Every journal-entry transaction line touching this account's GL ID
 * is returned in reverse-chronological order with a running balance.
 *
 * Opening balance = account.opening_balance + net JE movements BEFORE 'from'
 * Running balance = recalculated per row in Node (oldest→newest), then reversed.
 *
 * Query params:
 *   account  — bank_accounts.id  (omit → returns account list only)
 *   from     — YYYY-MM-DD  (default: all time)
 *   to       — YYYY-MM-DD  (default: all time)
 */
export default defineEventHandler(async (event) => {
  const q         = getQuery(event)
  const accountId = q.account ? Number(q.account) : null
  const from      = (q.from as string) || null
  const to        = (q.to   as string) || null

  // Always return the account selector list (cheap, reused by the selector)
  const accounts = await query(
    `SELECT id, bank_name, account_name, account_number
     FROM bank_accounts
     WHERE chart_of_account_id IS NOT NULL
       AND (status = 'active' OR status IS NULL)
     ORDER BY bank_name`,
  ) as any[]

  if (!accountId) {
    return {
      transactions:    [],
      opening_balance: 0,
      closing_balance: 0,
      totalCredits:    0,
      totalDebits:     0,
      bankAccount:     null,
      accounts,
    }
  }

  // Fetch bank account + GL link — only columns guaranteed to exist
  const bankAccount = await queryOne<any>(
    `SELECT id, bank_name, account_name, account_number, account_type,
            chart_of_account_id
     FROM bank_accounts WHERE id = ?`,
    [accountId],
  )
  if (!bankAccount)
    throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })

  const glAccountId = bankAccount.chart_of_account_id
  if (!glAccountId) {
    return {
      transactions: [], opening_balance: 0, closing_balance: 0,
      totalCredits: 0, totalDebits: 0, bankAccount, accounts,
      note: 'This bank account has no GL account linked (chart_of_account_id is null)',
    }
  }

  // opening_balance column is added by db-migrate; fall back to 0 if not yet present
  let seedBalance = 0
  try {
    const ob = await queryOne<any>(
      `SELECT COALESCE(opening_balance, 0) AS ob FROM bank_accounts WHERE id = ?`,
      [accountId],
    )
    seedBalance = Number(ob?.ob ?? 0)
  } catch { /* column not yet migrated — treat as 0 */ }

  // ── Opening balance = seed + all GL net movements BEFORE 'from' date ────────
  let openingBalance = seedBalance
  if (from) {
    const beforeRow = await queryOne<any>(
      `SELECT COALESCE(SUM(tl.debit_amount - tl.credit_amount), 0) AS net
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       WHERE tl.account_id = ?
         AND je.transaction_date < ?
         AND COALESCE(je.is_reversed, 0) = 0`,
      [glAccountId, from],
    )
    openingBalance = seedBalance + Number(beforeRow?.net ?? 0)
  }

  // ── Fetch all lines in date range — oldest first for running balance calc ────
  const conditions: string[] = ['tl.account_id = ?']
  const params: any[]        = [glAccountId]

  if (from) { conditions.push('je.transaction_date >= ?'); params.push(from) }
  if (to)   { conditions.push('je.transaction_date <= ?'); params.push(to) }

  const where = `WHERE ${conditions.join(' AND ')}`

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
    params,
  ) as any[]

  // ── Build transactions with running balance (oldest → newest) ───────────────
  let running      = openingBalance
  let totalCredits = 0
  let totalDebits  = 0

  const txnsAsc = rows.map((r: any) => {
    const dr         = Number(r.debit_amount  ?? 0)
    const cr         = Number(r.credit_amount ?? 0)
    const isReversed = Number(r.is_reversed)  === 1

    // Bank-asset perspective: DR to bank = money IN (+); CR from bank = money OUT (-)
    if (!isReversed) {
      running      += dr - cr
      totalCredits += dr   // money coming IN
      totalDebits  += cr   // money going OUT
    }
    // Reversed entries still appear (greyed) but don't move the balance

    const description = r.je_description || r.line_description || ''
    const lineDiff    = r.line_description && r.line_description !== description
      ? r.line_description
      : null

    return {
      id:               r.id,
      journal_entry_id: r.journal_entry_id,
      transaction_date: r.transaction_date,
      description,
      line_description: lineDiff,
      source:           r.related_document_type ?? 'Manual',
      source_id:        r.related_document_id,
      is_reversed:      isReversed,
      credit_in:        dr,          // money INTO the bank account (bank was DR'd)
      debit_out:        cr,          // money OUT of the bank account (bank was CR'd)
      balance:          running,
    }
  })

  const closingBalance = running

  // Reverse for newest-first display (standard online banking order)
  const transactions = [...txnsAsc].reverse()

  return {
    transactions,
    opening_balance: openingBalance,
    closing_balance: closingBalance,
    totalCredits,
    totalDebits,
    bankAccount,
    glAccountId,
    accounts,
  }
})
