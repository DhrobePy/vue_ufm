import { getDb } from '~/server/utils/db'
import { isAccountsRole, getOrderGateState } from '~/server/utils/creditOrders'

/**
 * Payment Watch — every order with a dispatch hold that hasn't shipped yet,
 * with live progress toward its clearance condition.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })

  const conn = await getDb().getConnection()
  try {
    const [rows] = await conn.query<any[]>(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.amount_paid,
              o.advance_paid, o.balance_due, o.order_date, o.required_date,
              c.id AS customer_id, c.name AS customer_name, c.credit_limit,
              oac.production_hold, oac.production_released_at,
              oac.dispatch_hold, oac.condition_type, oac.condition_amount,
              oac.auto_release, oac.accounts_note,
              oac.dispatch_cleared, oac.dispatch_cleared_at, oac.dispatch_cleared_note,
              cu.display_name AS cleared_by_name
       FROM order_approval_conditions oac
       JOIN credit_orders o ON o.id = oac.order_id
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users cu ON cu.id = oac.dispatch_cleared_by
       WHERE (oac.dispatch_hold = 1 OR oac.production_hold = 1)
         AND o.status NOT IN ('shipped','dispatched','delivered','completed','cancelled','rejected')
       ORDER BY o.required_date IS NULL, o.required_date ASC, o.id DESC`,
    )

    // Enrich with live condition math (one evaluator — getOrderGateState)
    const orders = []
    for (const r of rows as any[]) {
      const gate = await getOrderGateState(conn, r.id)
      orders.push({
        ...r,
        condition_met: gate.conditionMet,
        current_value: gate.currentValue,
        production_released: gate.productionReleased,
      })
    }
    return { ok: true, orders }
  } finally {
    conn.release()
  }
})
