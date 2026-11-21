import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  // Customers with outstanding balances (open credit orders)
  const schedule = await query(
    `SELECT
       c.id,
       c.name,
       c.business_address AS area,
       SUM(co.balance_due) AS outstanding
     FROM customers c
     JOIN credit_orders co ON co.customer_id = c.id
     WHERE co.status NOT IN ('completed', 'rejected', 'cancelled')
       AND co.balance_due > 0
     GROUP BY c.id
     ORDER BY outstanding DESC
     LIMIT 30`,
  ) as any[]

  // What was already collected from these customers today (Dhaka date = server date), so each row shows pending / part-paid
  const todays = await query(
    `SELECT customer_id, SUM(amount) AS collected, SUBSTRING_INDEX(GROUP_CONCAT(payment_method ORDER BY id DESC), ',', 1) AS method
     FROM customer_payments WHERE payment_date = CURDATE() GROUP BY customer_id`,
  ) as any[]
  const tmap = new Map(todays.map((t: any) => [t.customer_id, t]))
  for (const v of schedule) {
    const t = tmap.get(v.id)
    v.outstanding = Number(v.outstanding)
    v.collected = Number(t?.collected ?? 0); v.method = t?.method ?? ''
    v.status = v.collected > 0 ? 'partial' : 'pending'
  }

  // Recent collections (last 30)
  const recentCollections = await query(
    `SELECT
       cp.id,
       cp.payment_date  AS date,
       c.name  AS customer,
       cp.amount,
       cp.payment_method AS paymentMode,
       cp.reference_number AS reference,
       COALESCE(u.display_name, 'Field Collector') AS collector
     FROM customer_payments cp
     JOIN customers c ON c.id = cp.customer_id
     LEFT JOIN users u ON u.id = cp.created_by_user_id
     ORDER BY cp.payment_date DESC, cp.id DESC
     LIMIT 30`,
  ) as any[]

  // KPI stats
  const [statsRow] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN payment_date = CURDATE() THEN amount END), 0) AS today_total,
       COALESCE(SUM(CASE WHEN payment_date >= DATE_FORMAT(NOW(),'%Y-%m-01') THEN amount END), 0) AS month_total
     FROM customer_payments`,
  ) as any[]

  return { schedule, recentCollections, stats: statsRow }
})
