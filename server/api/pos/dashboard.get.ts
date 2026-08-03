import { query, queryOne } from '~/server/utils/db'

/** GET /api/pos/dashboard — MTD summary tiles, pending approvals, EOD status, branch list. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const monthStart = `${new Date().toISOString().slice(0, 7)}-01`

  const [mtd, todayStats, pendingCount, eodToday, branches] = await Promise.all([
    queryOne<any>(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(cash_amount), 0) AS cash_total, COALESCE(SUM(credit_amount), 0) AS credit_total
       FROM orders WHERE order_type = 'POS' AND DATE(order_date) >= ?`, [monthStart]),
    queryOne<any>(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders WHERE order_type = 'POS' AND DATE(order_date) = CURDATE()`),
    queryOne<any>(
      `SELECT COUNT(*) AS c FROM credit_pending_requests WHERE request_type IN ('pos_exit_release', 'pos_credit_sale') AND status = 'pending'`),
    query<any>(
      `SELECT v.*, b.name AS branch_name FROM cash_verification_log v
       LEFT JOIN branches b ON b.id = v.branch_id
       WHERE v.verification_date = CURDATE()`),
    query<any>(`SELECT id, name FROM branches WHERE status = 'active' ORDER BY name`),
  ])

  return {
    mtd: mtd ?? { order_count: 0, revenue: 0, cash_total: 0, credit_total: 0 },
    today: todayStats ?? { order_count: 0, revenue: 0 },
    pending_approvals: Number(pendingCount?.c ?? 0),
    eod_today: eodToday,
    branches,
  }
})
