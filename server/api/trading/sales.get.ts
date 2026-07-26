import { query } from '~/server/utils/db'

/** GET /api/trading/sales — filterable sale history (date range, customer, commodity, origin, search). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const where: string[] = []
  const params: any[] = []
  if (q.date_from)    { where.push('s.sale_date >= ?');    params.push(String(q.date_from)) }
  if (q.date_to)      { where.push('s.sale_date <= ?');    params.push(String(q.date_to)) }
  if (q.customer_id)  { where.push('s.customer_id = ?');   params.push(Number(q.customer_id)) }
  if (q.commodity_id) { where.push('s.commodity_id = ?');  params.push(Number(q.commodity_id)) }
  if (q.origin)       { where.push('s.origin = ?');        params.push(String(q.origin)) }
  if (q.status)       { where.push('s.status = ?');        params.push(String(q.status)) }
  if (q.search) {
    where.push('(s.sale_number LIKE ? OR c.name LIKE ?)')
    params.push(`%${q.search}%`, `%${q.search}%`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const sales = await query<any>(
    `SELECT s.*, c.name AS customer_name, pc.name AS commodity_name,
            u.display_name AS created_by,
            cdc.gate_out_at, cdc.confirmed_at AS delivered_at
     FROM commodity_sales s
     JOIN customers c ON c.id = s.customer_id
     JOIN purchase_commodities pc ON pc.id = s.commodity_id
     LEFT JOIN users u ON u.id = s.created_by_user_id
     LEFT JOIN commodity_dispatch_confirmations cdc ON cdc.sale_id = s.id
     ${whereSql}
     ORDER BY s.sale_date DESC, s.id DESC
     LIMIT 200`,
    params,
  )
  return { sales }
})
