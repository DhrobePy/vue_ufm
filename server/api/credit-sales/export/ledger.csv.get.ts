import { query } from '~/server/utils/db'

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Customer ledger CSV — optional ?customer_id= & ?from= & ?to= filters. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const conds: string[] = []
  const params: any[] = []
  if (q.customer_id) { conds.push('l.customer_id = ?'); params.push(Number(q.customer_id)) }
  if (q.from) { conds.push('l.transaction_date >= ?'); params.push(String(q.from)) }
  if (q.to)   { conds.push('l.transaction_date <= ?'); params.push(String(q.to)) }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

  const rows = await query<any>(
    `SELECT l.transaction_date, c.name AS customer, l.transaction_type, l.invoice_number,
            l.description, l.debit_amount, l.credit_amount, l.balance_after
     FROM customer_ledger l
     JOIN customers c ON c.id = l.customer_id
     ${where}
     ORDER BY l.customer_id, l.transaction_date, l.id
     LIMIT 50000`,
    params,
  )

  const header = 'Date,Customer,Type,Reference,Description,Debit,Credit,Balance'
  const lines = rows.map((r: any) => [
    String(r.transaction_date).slice(0, 10), r.customer, r.transaction_type,
    r.invoice_number, r.description, r.debit_amount, r.credit_amount, r.balance_after,
  ].map(csvCell).join(','))

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition',
    `attachment; filename="customer-ledger-${new Date().toISOString().slice(0, 10)}.csv"`)
  return '﻿' + [header, ...lines].join('\n')
})
