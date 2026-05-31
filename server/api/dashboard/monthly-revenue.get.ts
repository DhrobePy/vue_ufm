import { query } from '~/server/utils/db'

/**
 * GET /api/dashboard/monthly-revenue?period=7D|1M|3M|YTD
 * Returns revenue data bucketed appropriately for the requested period.
 */
export default defineEventHandler(async (event) => {
  const period = (getQuery(event).period as string) ?? '1M'

  let sql: string

  if (period === '7D') {
    // Daily buckets, last 7 days
    sql = `SELECT
             DATE_FORMAT(order_date, '%d %b')   AS month,
             DATE_FORMAT(order_date, '%Y-%m-%d') AS sort_key,
             COALESCE(SUM(total_amount), 0)     AS revenue,
             COUNT(*)                           AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             AND status NOT IN ('cancelled','rejected')
           GROUP BY DATE_FORMAT(order_date, '%Y-%m-%d')
           ORDER BY sort_key ASC`
  } else if (period === '1M') {
    // Daily buckets, last 30 days
    sql = `SELECT
             DATE_FORMAT(order_date, '%d %b')   AS month,
             DATE_FORMAT(order_date, '%Y-%m-%d') AS sort_key,
             COALESCE(SUM(total_amount), 0)     AS revenue,
             COUNT(*)                           AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
             AND status NOT IN ('cancelled','rejected')
           GROUP BY DATE_FORMAT(order_date, '%Y-%m-%d')
           ORDER BY sort_key ASC`
  } else if (period === '3M') {
    // Weekly buckets, last 90 days
    sql = `SELECT
             CONCAT(DATE_FORMAT(MIN(order_date), '%d %b'), '–', DATE_FORMAT(MAX(order_date), '%d %b')) AS month,
             YEARWEEK(order_date, 1)            AS sort_key,
             COALESCE(SUM(total_amount), 0)     AS revenue,
             COUNT(*)                           AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 89 DAY)
             AND status NOT IN ('cancelled','rejected')
           GROUP BY YEARWEEK(order_date, 1)
           ORDER BY sort_key ASC`
  } else {
    // YTD or default — monthly buckets, last 6 complete months + current
    sql = `SELECT
             DATE_FORMAT(order_date, '%b %Y')  AS month,
             DATE_FORMAT(order_date, '%Y-%m')  AS sort_key,
             COALESCE(SUM(total_amount), 0)    AS revenue,
             COUNT(*)                          AS order_count
           FROM credit_orders
           WHERE order_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
             AND status NOT IN ('cancelled','rejected')
           GROUP BY DATE_FORMAT(order_date, '%Y-%m')
           ORDER BY sort_key ASC`
  }

  try {
    const rows = await query<any[]>(sql)
    return rows
  } catch {
    return []
  }
})
