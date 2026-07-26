import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { isAccountsRole } from '~/server/utils/creditOrders'

/** Reject a queued payment request — no writes, just closes the queue entry. */
export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid request id' })

  const note = body?.note ? String(body.note).slice(0, 255) : null

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
       SET status = 'rejected', decided_by_user_id = ?, decided_at = NOW(), decision_note = ?
       WHERE id = ?`,
      [userId, note, id],
    )

    // commodity_sale_edit is the only request type with its own durable
    // tracking row — rejecting the queue entry must also close that row.
    if (req.request_type === 'commodity_sale_edit') {
      try {
        const payload = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload
        if (payload?.edit_id) {
          await conn.query(
            `UPDATE commodity_sale_edits
             SET status = 'rejected', decided_by_user_id = ?, decided_at = NOW()
             WHERE id = ? AND status = 'pending_approval'`,
            [userId, Number(payload.edit_id)],
          )
        }
      } catch { /* malformed payload — queue entry is still closed */ }
    }
    await auditLog(conn, {
      userId, action: 'rejected', module: 'credit_sales',
      recordType: 'credit_pending_request', recordId: id,
      description: `Rejected queued ${req.request_type} — ${req.reference_label}${note ? ` · ${note}` : ''}`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(`❌ <b>Queued Payment Rejected</b>\n${req.reference_label}\nby ${userName}${note ? `\nReason: ${note}` : ''}`)
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
