import { getDb } from '~/server/utils/db'
import { sendTelegram } from '~/server/utils/telegram'
import { queuePendingRequest } from '~/server/utils/creditOrders'

/** POST /api/pos/exit/:order/request-approval — queue gate staff's release request for a checker. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number(session.user.id)
  const userName = (session.user as any).name ?? `User ${userId}`

  const orderId = Number(getRouterParam(event, 'order'))
  if (!orderId) throw createError({ statusCode: 400, statusMessage: 'Invalid order' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[order]] = await conn.query<any>(
      `SELECT o.*, c.name AS customer_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? AND o.order_type = 'POS' FOR UPDATE`, [orderId],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (order.exit_status === 'cleared') { await conn.commit(); return { ok: true, already_cleared: true } }

    const reqId = await queuePendingRequest(conn, {
      requestType: 'pos_exit_release',
      payload: { order_id: orderId },
      orderId,
      customerId: order.customer_id,
      amount: Number(order.credit_amount),
      referenceLabel: `${order.order_number}${order.customer_name ? ` — ${order.customer_name}` : ' — walk-in'} — ৳${Number(order.credit_amount).toLocaleString()} on credit`,
      requestedBy: userId,
      requestedReason: 'POS exit-release requested by gate staff',
    })
    await conn.query(
      `UPDATE orders SET exit_requested_by_user_id = ?, exit_requested_at = NOW() WHERE id = ?`,
      [userId, orderId],
    )
    await conn.commit()
    sendTelegram(
      `⏳ <b>POS Exit Release Requested</b>\n${order.order_number}${order.customer_name ? ` — ${order.customer_name}` : ''}\n` +
      `৳${Number(order.credit_amount).toLocaleString()} on credit — requested by ${userName}`, 'dispatch')
    return { ok: true, pending_request_id: reqId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
