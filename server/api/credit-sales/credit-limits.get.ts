import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const customers = await query(
    `SELECT c.id, c.name, c.business_address AS area, c.credit_limit,
            c.current_balance AS outstanding, c.status,
            COALESCE(
              (SELECT SUM(o.balance_due)
               FROM credit_orders o
               WHERE o.customer_id = c.id
                 AND o.status NOT IN ('cancelled','rejected')
                 AND o.required_date < CURDATE()
                 AND o.balance_due > 0),
              0
            ) AS overdue
     FROM customers c
     WHERE c.customer_type = 'Credit'
       AND c.status != 'blacklisted'
     ORDER BY c.current_balance DESC`,
  ) as any[]

  const stats = await queryOne(
    `SELECT
       COALESCE(SUM(credit_limit),   0) AS total_limit,
       COALESCE(SUM(current_balance),0) AS total_outstanding
     FROM customers
     WHERE customer_type = 'Credit'`,
  ) as any

  return { customers, stats }
})
