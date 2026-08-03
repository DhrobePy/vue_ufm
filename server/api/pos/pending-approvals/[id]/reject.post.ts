import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { isAdminRole } from '~/server/utils/creditOrders'

/** POST /api/pos/pending-approvals/:id/reject — checker rejects a queued POS exit release. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number(session.user.id)
  const role   = ((session.user as any).role ?? '').toLowerCase()
  if (!isAdminRole(role) && !['accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })

  const reqId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event).catch(() => ({}))
  const reason = String(body?.reason ?? '').trim()

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[reqRow]] = await conn.query<any>(
      `SELECT * FROM credit_pending_requests WHERE id = ? AND request_type = 'pos_exit_release' FOR UPDATE`, [reqId],
    )
    if (!reqRow) throw createError({ statusCode: 404, statusMessage: 'Request not found' })
    if (reqRow.status !== 'pending') throw createError({ statusCode: 409, statusMessage: `Already ${reqRow.status}` })

    await conn.query(
      `UPDATE credit_pending_requests SET status = 'rejected', decided_by_user_id = ?, decided_at = NOW(), decision_note = ? WHERE id = ?`,
      [userId, reason || null, reqId],
    )
    await auditLog(conn, {
      userId, action: 'rejected', module: 'other', recordType: 'pos_order', recordId: reqRow.order_id,
      description: `POS exit release rejected — ${reason || 'no reason given'}`,
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
