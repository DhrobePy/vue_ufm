import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  // Last 6 complete months (plus current partial month)
  const rows = await query<any[]>(
    `SELECT
       DATE_FORMAT(order_date, '%b %Y') AS month,
       DATE_FORMAT(order_date, '%Y-%m') AS sort_key,
       COALESCE(SUM(total_amount), 0)   AS revenue,
       COUNT(*)                         AS order_count
     FROM credit_orders
     WHERE order_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
       AND status NOT IN ('cancelled', 'rejected')
     GROUP BY DATE_FORMAT(order_date, '%Y-%m')
     ORDER BY sort_key ASC`,
  )
  return rows
})
