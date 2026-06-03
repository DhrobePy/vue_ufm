import { query, queryOne } from '~/server/utils/db'

/**
 * GET /api/bank/gl-ledger
 * Returns all journal-entry transaction_lines for a given bank_account
 * (identified via bank_accounts.chart_of_account_id).
 *
 * Used by the Bank Statement page to show expense payments, customer
 * payment receipts, and any other GL-posted entries that touch the account.
 *
 * Query params:
 *   account   — bank_accounts.id (required)
 *   from      — date filter start  (YYYY-MM-DD)
 *   to        — date filter end    (YYYY-MM-DD)
 *   type      — 'credit' | 'debit' | '' (all)
 *   page      — pagination
 *   per       — page size (max 200)
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const accountId = q.account ? Number(q.account) : null
  const from      = (q.from as string) || null
  const to        = (q.to   as string) || null
  const type      = (q.type as string) || ''
  const page      = Math.max(1, Number(q.page || 1))
  const per       = Math.min(200, Number(q.per || 50))
  const offset    = (page - 1) * per

  if (!accountId)
    throw createError({ statusCode: 400, statusMessage: 'account is required' })

  // Resolve the GL account id linked to this bank account
  const bankAccount = await queryOne<any>(
    `SELECT id, bank_name, account_name, account_number, chart_of_account_id
     FROM bank_accounts WHERE id = ?`,
    [accountId],
  )
  if (!bankAccount)
    throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })

  const glAccountId = bankAccount.chart_of_account_id
  if (!glAccountId)
    return {
      transactions: [],
      total: 0,
      page,
      per,
      totalCredits: 0,
      totalDebits: 0,
      bankAccount,
      note: 'This bank account has no GL account linked (chart_of_account_id is null)',
    }

  // Build filter conditions for journal_entries
  const conditions: string[] = ['tl.account_id = ?']
  const params: any[]        = [glAccountId]

  if (from) { conditions.push('je.transaction_date >= ?'); params.push(from) }
  if (to)   { conditions.push('je.transaction_date <= ?'); params.push(to) }

  // type filter: credit = money coming INTO this account (credit_amount > 0)
  //              debit  = money going OUT of this account  (debit_amount  > 0)
  if (type === 'credit') { conditions.push('tl.credit_amount > 0') }
  if (type === 'debit')  { conditions.push('tl.debit_amount  > 0') }

  const where = `WHERE ${conditions.join(' AND ')}`

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
      [...params, per, offset],
    ) as any[],

    queryOne(
      `SELECT COUNT(*) AS total
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       ${where}`,
      params,
    ) as any,

    queryOne(
      `SELECT
         COALESCE(SUM(CASE WHEN tl.credit_amount > 0 AND je.is_reversed = 0 THEN tl.credit_amount ELSE 0 END), 0) AS total_credits,
         COALESCE(SUM(CASE WHEN tl.debit_amount  > 0 AND je.is_reversed = 0 THEN tl.debit_amount  ELSE 0 END), 0) AS total_debits
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       ${where}`,
      params,
    ) as any,
  ])

  // Shape each row for the statement UI
  const transactions = (rows as any[]).map(r => ({
    id:               r.id,
    journal_entry_id: r.journal_entry_id,
    transaction_date: r.transaction_date,
    description:      r.description,
    line_description: r.line_description,
    source:           r.related_document_type ?? 'General',
    source_id:        r.related_document_id,
    is_reversed:      Boolean(r.is_reversed),
    // For display consistency with bank_transactions: credit = money in, debit = money out
    entry_type:       Number(r.credit_amount) > 0 ? 'credit' : 'debit',
    amount:           Number(r.credit_amount) > 0 ? Number(r.credit_amount) : Number(r.debit_amount),
    debit_amount:     Number(r.debit_amount),
    credit_amount:    Number(r.credit_amount),
    reference_number: `JE-${r.journal_entry_id}`,
    bank_name:        bankAccount.bank_name,
    posted_by:        r.posted_by,
    status:           r.is_reversed ? 'reversed' : 'approved',
  }))

  return {
    transactions,
    total:        Number(totRow?.total || 0),
    page,
    per,
    totalCredits: Number(sumRow?.total_credits || 0),
    totalDebits:  Number(sumRow?.total_debits  || 0),
    bankAccount,
    glAccountId,
  }
})
