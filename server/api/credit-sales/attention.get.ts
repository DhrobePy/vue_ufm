import { query } from '~/server/utils/db'

/** GET /api/credit-sales/attention — live "needs action" counters for the Credit Sales dashboard (legacy Sales Hub overview). */
export default defineEventHandler(async () => {
  const count = async (sql: string) => {
    try { return Number(((await query<any>(sql))[0] as any)?.c ?? 0) } catch { return 0 }
  }
  const [escalated, holds, returns, overDeliveries, amendments, paymentApprovals, overdue] = await Promise.all([
    count(`SELECT COUNT(*) c FROM credit_orders WHERE status = 'escalated'`),
    count(`SELECT COUNT(*) c FROM order_approval_conditions oac JOIN credit_orders co ON co.id = oac.order_id
           WHERE oac.dispatch_hold = 1 AND oac.dispatch_cleared = 0 AND co.status IN ('approved','in_production','produced','ready_to_ship')`),
    count(`SELECT COUNT(*) c FROM credit_order_returns WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM credit_order_over_deliveries WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM order_amendments WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM credit_pending_requests WHERE status = 'pending'`),
    count(`SELECT COUNT(*) c FROM credit_orders WHERE status IN ('approved','in_production','produced','ready_to_ship','shipped') AND required_date < CURDATE()`),
  ])
  return { escalated, holds, returns, overDeliveries, amendments, paymentApprovals, overdue }
})
