import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAdminRole } from '~/server/utils/creditOrders'

/** POST /api/pos/pending-approvals/:id/approve — checker approves a queued POS exit release. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number(session.user.id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!isAdminRole(role) && !['accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })

  const reqId = Number(getRouterParam(event, 'id'))
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[reqRow]] = await conn.query<any>(
      `SELECT * FROM credit_pending_requests WHERE id = ? AND request_type = 'pos_exit_release' FOR UPDATE`, [reqId],
    )
    if (!reqRow) throw createError({ statusCode: 404, statusMessage: 'Request not found' })
    if (reqRow.status !== 'pending') throw createError({ statusCode: 409, statusMessage: `Already ${reqRow.status}` })

    const [[order]] = await conn.query<any>(
      `SELECT * FROM orders WHERE id = ? AND order_type = 'POS' FOR UPDATE`, [reqRow.order_id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    await conn.query(
      `UPDATE orders SET exit_status = 'cleared', exit_cleared_by_user_id = ?, exit_cleared_at = NOW() WHERE id = ?`,
      [userId, order.id],
    )
    await conn.query(
      `UPDATE credit_pending_requests SET status = 'approved', decided_by_user_id = ?, decided_at = NOW() WHERE id = ?`,
      [userId, reqId],
    )
    await auditLog(conn, {
      userId, action: 'approved', module: 'other', recordType: 'pos_order', recordId: order.id,
      referenceNumber: order.order_number,
      description: `POS exit release approved for ${order.order_number} by ${userName}`,
      severity: 'info',
    })
    await conn.commit()
    sendTelegram(`🟢 <b>POS Exit Release Approved</b>\n${order.order_number} — by ${userName}`, 'dispatch')
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
