import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole, getUserActionLimit } from '~/server/utils/creditOrders'

/**
 * POST /api/pos/exit/:order/clear — "Clear for Exit" at the gate. A pure-cash
 * sale is already Paid and clears on creation; this endpoint is for a
 * Partial/Unpaid sale whose credit portion is within the clearing user's
 * delegated pos_exit_release ৳ limit (or they're admin).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number(session.user.id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

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
    if (order.exit_status === 'cleared') {
      await conn.commit()
      return { ok: true, already_cleared: true }
    }

    if (!isAdminRole(role)) {
      const cap = await getUserActionLimit(conn, userId, 'pos_exit_release')
      const creditAmt = Number(order.credit_amount)
      if (cap === null || creditAmt > cap)
        throw createError({
          statusCode: 403,
          statusMessage: cap === null
            ? 'No exit-release limit has been delegated to your account — request approval instead'
            : `Exceeds your exit-release limit of ৳${cap.toLocaleString()} — request approval instead`,
        })
    }

    await conn.query(
      `UPDATE orders SET exit_status = 'cleared', exit_cleared_by_user_id = ?, exit_cleared_at = NOW() WHERE id = ?`,
      [userId, orderId],
    )
    await auditLog(conn, {
      userId, action: 'updated', module: 'other', recordType: 'pos_order', recordId: orderId,
      referenceNumber: order.order_number,
      description: `POS exit cleared for ${order.order_number} — ৳${Number(order.credit_amount).toLocaleString()} on credit — by ${userName}`,
      severity: 'info',
    })
    await conn.commit()
    sendTelegram(
      `🟢 <b>POS Exit Cleared</b>\n${order.order_number}${order.customer_name ? ` — ${order.customer_name}` : ''}\n` +
      `৳${Number(order.credit_amount).toLocaleString()} on credit — cleared by ${userName}`, 'dispatch')
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
