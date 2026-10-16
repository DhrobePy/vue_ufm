import { query, queryOne } from '~/server/utils/db'

/**
 * GET /api/customers/:id/statement?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Account statement: opening balance (everything before `from`), every ledger line in the period,
 * running balance, closing balance. Balances are ledger truth (SUM debit − SUM credit).
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const q = getQuery(event)
  const iso = /^\d{4}-\d{2}-\d{2}$/
  const to = iso.test(String(q.to)) ? String(q.to) : new Date().toISOString().slice(0, 10)
  const from = iso.test(String(q.from)) ? String(q.from) : `${to.slice(0, 4)}-01-01`

  const customer = await queryOne<any>(`SELECT id, name, business_name, phone_number, email, business_address, credit_limit, customer_type FROM customers WHERE id = ?`, [id])
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  const opening = await queryOne<any>(
    `SELECT COALESCE(SUM(debit_amount),0) - COALESCE(SUM(credit_amount),0) b FROM customer_ledger WHERE customer_id = ? AND transaction_date < ?`, [id, from])
  const rows = await query<any>(
    `SELECT transaction_date date, transaction_type type, COALESCE(invoice_number, reference_id) ref, description,
            debit_amount debit, credit_amount credit
     FROM customer_ledger WHERE customer_id = ? AND transaction_date BETWEEN ? AND ? ORDER BY transaction_date, id`, [id, from, to])
  let running = Number(opening?.b ?? 0)
  const lines = rows.map((r: any) => ({ ...r, debit: Number(r.debit), credit: Number(r.credit), balance: (running += Number(r.debit) - Number(r.credit)) }))
  return {
    customer, from, to, openingBalance: Number(opening?.b ?? 0), lines,
    totalDebit: lines.reduce((s: number, l: any) => s + l.debit, 0), totalCredit: lines.reduce((s: number, l: any) => s + l.credit, 0),
    closingBalance: running,
  }
})
