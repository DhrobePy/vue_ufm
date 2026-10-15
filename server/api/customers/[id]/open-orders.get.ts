import { query } from '~/server/utils/db'
import { userCanAction } from '~/server/utils/permissions'

/** Orders with an outstanding balance, for the payment-allocation UI. */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  if (!customerId) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const wantHidden = getQuery(event).hidden === '1'
  const canHide = await userCanAction({
    userId: Number(session.user.id), role: String(session.user.role ?? '').toLowerCase(),
    module: 'credit_sales', page: 'collect', action: 'hide_invoice', roleFallback: [], explicit: true,
  })
  if (wantHidden && !canHide)
    throw createError({ statusCode: 403, statusMessage: 'You are not allowed to view hidden invoices' })

  const orders = await query(
    `SELECT id, order_number, order_date, status, total_amount, amount_paid,
            advance_paid, balance_due,
            status IN ('goods_on_board','shipped','dispatched','delivered','completed') AS is_dispatched
     FROM credit_orders
     WHERE customer_id = ?
       AND balance_due > 0
       AND status NOT IN ('cancelled','rejected')
       AND ${wantHidden ? '' : 'NOT '}EXISTS (SELECT 1 FROM credit_order_collection_hides h WHERE h.order_id = credit_orders.id)
     ORDER BY order_date ASC, id ASC`,
    [customerId],
  )
  return { orders, canHide }
})
