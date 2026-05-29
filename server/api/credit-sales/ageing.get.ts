import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  // Per-customer ageing: buckets based on days since order_date for unpaid/partial balances
  const rows = await query(
    `SELECT
       c.id AS customer_id,
       c.name AS customer,
       c.status,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 0  AND 30  THEN o.balance_due ELSE 0 END) AS current_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 31 AND 60  THEN o.balance_due ELSE 0 END) AS d30_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 61 AND 90  THEN o.balance_due ELSE 0 END) AS d60_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) BETWEEN 91 AND 120 THEN o.balance_due ELSE 0 END) AS d90_amt,
       SUM(CASE WHEN DATEDIFF(CURDATE(), o.order_date) > 120              THEN o.balance_due ELSE 0 END) AS d120_amt,
       SUM(o.balance_due) AS total
     FROM credit_orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.balance_due > 0
       AND o.status NOT IN ('cancelled', 'rejected')
     GROUP BY c.id, c.name, c.status
     HAVING total > 0
     ORDER BY total DESC`,
  ) as any[]

  // Compute bucket summary totals
  const buckets = [
    { label: 'Current (0–30d)', key: 'current_amt', color: '#10b981' },
    { label: '31–60 days',      key: 'd30_amt',     color: '#eab308' },
    { label: '61–90 days',      key: 'd60_amt',     color: '#f97316' },
    { label: '91–120 days',     key: 'd90_amt',     color: '#ef4444' },
    { label: '120+ days',       key: 'd120_amt',    color: '#7f1d1d' },
  ]

  const summary = buckets.map(b => ({
    label: b.label,
    color: b.color,
    value: rows.reduce((s, r) => s + Number(r[b.key] ?? 0), 0),
    count: rows.filter(r => Number(r[b.key] ?? 0) > 0).length,
  }))

  return { rows, summary }
})
