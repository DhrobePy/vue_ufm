import { query } from '~/server/utils/db'

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Customer list CSV — honours the same ?search= and ?type= filters as the list page. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const search = String(q.search ?? '')
  const type = String(q.type ?? '')
  const where: string[] = []
  const params: unknown[] = []
  if (search) {
    where.push('(c.name LIKE ? OR c.business_name LIKE ? OR c.phone_number LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (type) { where.push('c.customer_type = ?'); params.push(type) }

  const rows = await query<any>(
    `SELECT c.id, c.name, c.business_name, c.customer_type, c.phone_number, c.business_address,
            c.credit_limit, c.current_balance, c.status
     FROM customers c
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY c.name
     LIMIT 20000`,
    params,
  )

  const header = 'ID,Name,Business,Type,Phone,Address,Credit Limit,Outstanding,Status'
  const lines = rows.map((r: any) => [
    r.id, r.name, r.business_name, r.customer_type, r.phone_number, r.business_address,
    r.credit_limit, r.current_balance, r.status,
  ].map(csvCell).join(','))

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`)
  return '﻿' + [header, ...lines].join('\n')
})
