import { queryOne, query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const [customer, recentOrders, recentPayments] = await Promise.all([
    queryOne(
      `SELECT c.*
       FROM customers c
       WHERE c.id = ?`,
      [id],
    ),
    query(
      `SELECT o.id, o.order_number, o.order_date, o.status, o.total_amount, o.balance_due
       FROM credit_orders o
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC
       LIMIT 10`,
      [id],
    ),
    query(
      `SELECT p.id, p.payment_date, p.amount, p.payment_method, p.reference_number,
              p.allocation_status, p.notes
       FROM customer_payments p
       WHERE p.customer_id = ?
       ORDER BY p.payment_date DESC
       LIMIT 10`,
      [id],
    ),
  ])

  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  return { customer, recentOrders, recentPayments }
})
