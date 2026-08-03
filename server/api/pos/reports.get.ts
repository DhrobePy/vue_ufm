import { query } from '~/server/utils/db'

/** GET /api/pos/reports — daily/weekly/monthly/custom-range, branch-filtered POS sales report. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const branchId = q.branch_id ? Number(q.branch_id) : null
  const range = String(q.range ?? 'daily') // daily | weekly | monthly | custom

  const now = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  let from: string, to: string
  if (range === 'custom' && q.date_from && q.date_to) {
    from = String(q.date_from); to = String(q.date_to)
  } else if (range === 'weekly') {
    const d = new Date(now); d.setDate(d.getDate() - 6); from = iso(d); to = iso(now)
  } else if (range === 'monthly') {
    from = `${now.toISOString().slice(0, 7)}-01`; to = iso(now)
  } else {
    from = iso(now); to = iso(now)
  }

  const where: string[] = [`o.order_type = 'POS'`, `DATE(o.order_date) BETWEEN ? AND ?`]
  const params: any[] = [from, to]
  if (branchId) { where.push('o.branch_id = ?'); params.push(branchId) }
  const whereSql = where.join(' AND ')

  const [summary, byDay, byMethod, orders] = await Promise.all([
    query<any>(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS total_revenue,
              COALESCE(SUM(cash_amount), 0) AS cash_total, COALESCE(SUM(credit_amount), 0) AS credit_total,
              COALESCE(SUM(discount_amount), 0) AS discount_total
       FROM orders o WHERE ${whereSql}`, params),
    query<any>(
      `SELECT DATE(o.order_date) AS d, COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders o WHERE ${whereSql} GROUP BY DATE(o.order_date) ORDER BY d`, params),
    query<any>(
      `SELECT o.payment_method, COUNT(*) AS order_count, COALESCE(SUM(cash_amount), 0) AS amount
       FROM orders o WHERE ${whereSql} GROUP BY o.payment_method ORDER BY amount DESC`, params),
    query<any>(
      `SELECT o.id, o.order_number, o.order_date, o.total_amount, o.cash_amount, o.credit_amount,
              o.payment_method, o.payment_status, b.name AS branch_name,
              COALESCE(c.name, 'Walk-in') AS customer_name
       FROM orders o
       LEFT JOIN branches b ON b.id = o.branch_id
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE ${whereSql}
       ORDER BY o.order_date DESC LIMIT 500`, params),
  ])

  return { period: { from, to, range }, summary: summary[0] ?? {}, by_day: byDay, by_method: byMethod, orders }
})
