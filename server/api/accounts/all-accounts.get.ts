import { query } from '~/server/utils/db'

/** GET /api/accounts/all-accounts — balance of every non-bank GL account (same rules as legacy accounts/all_accounts.php). */
export default defineEventHandler(async () => {
  const rows = await query<any>(
    `SELECT a.id, a.account_number AS code, a.name, a.account_type AS type, a.normal_balance,
            COALESCE(SUM(l.debit_amount), 0) AS debit, COALESCE(SUM(l.credit_amount), 0) AS credit
     FROM chart_of_accounts a LEFT JOIN transaction_lines l ON l.account_id = a.id
     WHERE a.account_type <> 'Bank'
     GROUP BY a.id, a.account_number, a.name, a.account_type, a.normal_balance
     ORDER BY a.account_number`)
  return { rows: rows.map(r => ({ ...r, debit: Number(r.debit), credit: Number(r.credit),
    balance: String(r.normal_balance ?? '').toLowerCase() === 'debit' ? Number(r.debit) - Number(r.credit) : Number(r.credit) - Number(r.debit) })) }
})
