import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { isAccountsRole } from '~/server/utils/creditOrders'
import { getAdvanceCredit, suggestAllotment, applyAllotment, type Allotment } from '~/server/utils/advanceCredit'

/**
 * Allot a customer's earlier advance money to their orders (oldest first) and/or their opening due.
 * Body: { allocations: [{payment_id, target:'order'|'opening', order_id?, amount}] }
 *    or { auto: 'orders_first' | 'opening_first', order_id? }   (let the server build the oldest-first plan)
 * The ledger is untouched — the payment credit is already in it; this only decides what the money counts against.
 */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role)) throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })
  const body = await readBody(event)

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    let allots: Allotment[]
    if (body?.auto) {
      const credit = await getAdvanceCredit(conn, customerId)
      allots = suggestAllotment(credit, body.auto === 'opening_first' ? 'opening_first' : 'orders_first',
        { onlyOrderId: body.order_id ? Number(body.order_id) : undefined })
    } else {
      allots = (Array.isArray(body?.allocations) ? body.allocations : []).map((a: any) => ({
        payment_id: Number(a.payment_id), target: a.target === 'opening' ? 'opening' : 'order',
        order_id: a.order_id ? Number(a.order_id) : undefined, amount: Number(a.amount),
      })).filter((a: Allotment) => a.payment_id && a.amount > 0)
    }
    if (!allots.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to allot — no advance credit or no open order/opening due to apply it to' })

    const res = await applyAllotment(conn, customerId, userId, allots, 'allotted by accounts')
    await auditLog(conn, {
      userId, action: 'updated', module: 'credit_sales', recordType: 'customer', recordId: customerId,
      referenceNumber: `CUST-${customerId}`,
      description: `Advance credit ৳${res.total.toLocaleString()} allotted: ${allots.map(a => a.target === 'opening' ? `opening due ৳${a.amount}` : `order #${a.order_id} ৳${a.amount}`).join(', ')}`,
      severity: 'info',
    })
    await conn.commit()
    return { ok: true, ...res }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})
