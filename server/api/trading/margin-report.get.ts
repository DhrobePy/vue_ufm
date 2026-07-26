import { query } from '~/server/utils/db'

/** GET /api/trading/margin-report — per-commodity revenue/COGS/margin for a date range + sale detail. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const now = new Date()
  const from = String(q.date_from || `${now.toISOString().slice(0, 7)}-01`)
  const to   = String(q.date_to   || now.toISOString().slice(0, 10))
  const commodityId = q.commodity_id ? Number(q.commodity_id) : null

  const where: string[] = [`s.status = 'posted'`, 's.sale_date BETWEEN ? AND ?']
  const params: any[] = [from, to]
  if (commodityId) { where.push('s.commodity_id = ?'); params.push(commodityId) }

  const [byCommodity, detail] = await Promise.all([
    query<any>(
      `SELECT s.commodity_id, pc.name AS commodity_name, pc.unit,
              COUNT(*) AS sales_count,
              COALESCE(SUM(s.quantity), 0) AS qty,
              COALESCE(SUM(s.total_amount), 0) AS revenue,
              COALESCE(SUM(s.cogs_amount), 0) AS cogs
       FROM commodity_sales s
       JOIN purchase_commodities pc ON pc.id = s.commodity_id
       WHERE ${where.join(' AND ')}
       GROUP BY s.commodity_id
       ORDER BY revenue DESC`, params),
    query<any>(
      `SELECT s.id, s.sale_number, s.sale_date, s.origin, s.quantity, s.unit,
              s.unit_price, s.total_amount, s.cogs_amount,
              c.name AS customer_name, pc.name AS commodity_name
       FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id
       JOIN purchase_commodities pc ON pc.id = s.commodity_id
       WHERE ${where.join(' AND ')}
       ORDER BY s.sale_date DESC, s.id DESC
       LIMIT 500`, params),
  ])

  for (const r of byCommodity as any[]) {
    r.margin = Number(r.revenue) - Number(r.cogs)
    r.margin_pct = Number(r.revenue) > 0 ? Math.round((r.margin / Number(r.revenue)) * 1000) / 10 : 0
  }
  return { period: { from, to }, by_commodity: byCommodity, sales: detail }
})
