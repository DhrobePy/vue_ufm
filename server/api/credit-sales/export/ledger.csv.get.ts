import { query } from '~/server/utils/db'
import { RUNNING_BALANCE_SQL } from '~/server/utils/ledgerSql'

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Customer ledger CSV — optional ?customer_id= & ?from= & ?to= filters. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const inner = q.customer_id ? 'WHERE l.customer_id = ?' : ''
  const outer: string[] = []
  const params: any[] = q.customer_id ? [Number(q.customer_id)] : []
  if (q.from) { outer.push('t.d >= ?'); params.push(String(q.from)) }
  if (q.to)   { outer.push('t.d <= ?'); params.push(String(q.to)) }

  const rows = await query<any>(
    `SELECT * FROM (
       SELECT DATE_FORMAT(l.transaction_date, '%Y-%m-%d') AS d, l.id, l.customer_id, c.name AS customer, l.transaction_type, l.invoice_number,
              l.description, l.debit_amount, l.credit_amount, ${RUNNING_BALANCE_SQL} AS balance
       FROM customer_ledger l JOIN customers c ON c.id = l.customer_id
       ${inner}
     ) t ${outer.length ? 'WHERE ' + outer.join(' AND ') : ''}
     ORDER BY t.customer_id, t.d, t.id
     LIMIT 50000`,
    params,
  )

  const header = 'Date,Customer,Type,Reference,Description,Debit,Credit,Balance'
  const lines = rows.map((r: any) => [
    r.d, r.customer, r.transaction_type,
    r.invoice_number, r.description, r.debit_amount, r.credit_amount, r.balance,
  ].map(csvCell).join(','))

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition',
    `attachment; filename="customer-ledger-${new Date().toISOString().slice(0, 10)}.csv"`)
  return '﻿' + [header, ...lines].join('\n')
})
