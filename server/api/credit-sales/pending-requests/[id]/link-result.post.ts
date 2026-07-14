import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { isAccountsRole } from '~/server/utils/creditOrders'

/**
 * Called by the Approval Requests page right after the checker successfully
 * re-submits the queued payload through the real payment endpoint (under
 * their own session/limit). Marks the queue entry approved and links the
 * resulting customer_payments row — it does not post any money itself.
 */
export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const userId = Number((session.user as any).id)
  const role   = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid request id' })

  const paymentId = Number(body?.payment_id)
  if (!paymentId) throw createError({ statusCode: 400, statusMessage: 'payment_id required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[req]] = await conn.query<any>(
      `SELECT * FROM credit_pending_requests WHERE id = ? FOR UPDATE`, [id],
    )
    if (!req) throw createError({ statusCode: 404, statusMessage: 'Request not found' })
    if (req.status !== 'pending')
      throw createError({ statusCode: 409, statusMessage: `Request already ${req.status}` })
    if (req.requested_by_user_id === userId)
      throw createError({ statusCode: 403, statusMessage: 'You cannot decide your own request' })

    await conn.query(
      `UPDATE credit_pending_requests
       SET status = 'approved', decided_by_user_id = ?, decided_at = NOW(), result_payment_id = ?
       WHERE id = ?`,
      [userId, paymentId, id],
    )
    await auditLog(conn, {
      userId, action: 'approved', module: 'credit_sales',
      recordType: 'credit_pending_request', recordId: id,
      description: `Approved & posted queued ${req.request_type} — ${req.reference_label} (payment #${paymentId})`,
      severity: 'info',
    })

    await conn.commit()
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
