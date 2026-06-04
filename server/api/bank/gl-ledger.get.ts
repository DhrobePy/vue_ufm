import { query, queryOne } from '~/server/utils/db'

/**
 * GET /api/bank/gl-ledger
 * Returns all journal-entry transaction_lines for a given bank_account
 * (identified via bank_accounts.chart_of_account_id).
 *
 * Bank-statement orientation (asset account perspective):
 *   DR to bank account = money coming IN  → displayed as "Credit (In)"
 *   CR to bank account = money going OUT  → displayed as "Debit (Out)"
 *
 * Query params:
 *   account   — bank_accounts.id (optional; returns empty if omitted)
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

  // No account selected yet → return empty payload (no error)
  if (!accountId)
    return { transactions: [], total: 0, page, per, totalCredits: 0, totalDebits: 0, bankAccount: null }

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

  // Build filter conditions
  const conditions: string[] = ['tl.account_id = ?']
  const params: any[]        = [glAccountId]

  if (from) { conditions.push('je.transaction_date >= ?'); params.push(from) }
  if (to)   { conditions.push('je.transaction_date <= ?'); params.push(to) }

  // Bank-statement type filter:
  //   'credit' = money IN  = debit to the bank account  (debit_amount  > 0)
  //   'debit'  = money OUT = credit to the bank account (credit_amount > 0)
  if (type === 'credit') { conditions.push('tl.debit_amount  > 0') }
  if (type === 'debit')  { conditions.push('tl.credit_amount > 0') }

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
         -- Money IN  = bank account was debited (DR)
         COALESCE(SUM(CASE WHEN tl.debit_amount  > 0 AND je.is_reversed = 0 THEN tl.debit_amount  ELSE 0 END), 0) AS total_credits,
         -- Money OUT = bank account was credited (CR)
         COALESCE(SUM(CASE WHEN tl.credit_amount > 0 AND je.is_reversed = 0 THEN tl.credit_amount ELSE 0 END), 0) AS total_debits
       FROM transaction_lines tl
       JOIN journal_entries je ON je.id = tl.journal_entry_id
       ${where}`,
      params,
    ) as any,
  ])

  // Shape rows using bank-statement perspective:
  //   debit_amount  > 0 → money came IN  → entry_type = 'credit'
  //   credit_amount > 0 → money went OUT → entry_type = 'debit'
  const transactions = (rows as any[]).map(r => ({
    id:               r.id,
    journal_entry_id: r.journal_entry_id,
    transaction_date: r.transaction_date,
    description:      r.description,
    line_description: r.line_description,
    source:           r.related_document_type ?? 'General',
    source_id:        r.related_document_id,
    is_reversed:      Boolean(r.is_reversed),
    // Bank-statement perspective: DR to bank = money in (credit), CR from bank = money out (debit)
    entry_type:       Number(r.debit_amount) > 0 ? 'credit' : 'debit',
    amount:           Number(r.debit_amount) > 0 ? Number(r.debit_amount) : Number(r.credit_amount),
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
