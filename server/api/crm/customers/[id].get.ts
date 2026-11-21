import { query } from '~/server/utils/db'
import { scopedHealth } from '~/server/utils/crm'

/** GET /api/crm/customers/:id — one customer's CRM card: health, reasons, next steps, recent orders and payments, contact log, tasks. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const me = (await scopedHealth(event)).find(r => r.id === id)
  if (!me) throw createError({ statusCode: 404, statusMessage: 'Customer not found (or outside your branch)' })
  const [orders, payments, interactions, tasks] = await Promise.all([
    query<any>(`SELECT id, order_number, order_date, total_amount AS amount, balance_due AS due, status FROM credit_orders WHERE customer_id = ? ORDER BY order_date DESC, id DESC LIMIT 10`, [id]),
    query<any>(`SELECT payment_number, payment_date, amount, payment_method AS method FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL ORDER BY payment_date DESC, id DESC LIMIT 10`, [id]),
    query<any>(`SELECT i.id, i.channel, i.direction, i.summary, i.outcome, i.created_at, i.via_agent, u.display_name AS by_user FROM crm_interactions i LEFT JOIN users u ON u.id = i.user_id WHERE i.party_type = 'customer' AND i.party_id = ? ORDER BY i.id DESC LIMIT 30`, [id]),
    query<any>(`SELECT t.id, t.kind, t.title, t.due_date, t.promise_amount, t.status, t.created_by_agent, u.display_name AS assigned_to FROM crm_tasks t LEFT JOIN users u ON u.id = t.assigned_user_id WHERE t.party_type = 'customer' AND t.party_id = ? ORDER BY (t.status = 'open') DESC, t.due_date, t.id DESC LIMIT 30`, [id]),
  ])
  return { customer: me, orders, payments, interactions, tasks }
})
