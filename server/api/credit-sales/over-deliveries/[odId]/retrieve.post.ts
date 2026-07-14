import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { isAccountsRole } from '~/server/utils/creditOrders'

/** Mark an approved resolution='retrieve' over-delivery as physically retrieved. */
export default defineEventHandler(async (event) => {
  const odId    = Number(getRouterParam(event, 'odId'))
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role   = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role) && !['dispatch-srg', 'dispatch-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts, dispatch or admin only' })
  if (!odId) throw createError({ statusCode: 400, statusMessage: 'Invalid over-delivery ID' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[od]] = await conn.query<any>(
      `SELECT * FROM credit_order_over_deliveries WHERE id = ? FOR UPDATE`, [odId],
    )
    if (!od) throw createError({ statusCode: 404, statusMessage: 'Over-delivery not found' })
    if (od.status !== 'approved' || od.resolution !== 'retrieve')
      throw createError({ statusCode: 409, statusMessage: 'Only approved "retrieve" over-deliveries can be marked retrieved' })
    if (od.retrieved_at)
      throw createError({ statusCode: 409, statusMessage: 'Already marked retrieved' })

    await conn.query(
      `UPDATE credit_order_over_deliveries SET retrieved_at = NOW(), retrieved_by_user_id = ? WHERE id = ?`,
      [userId, odId],
    )
    await auditLog(conn, {
      userId, action: 'updated', module: 'credit_sales',
      recordType: 'credit_order_over_delivery', recordId: od.order_id, referenceNumber: od.od_number,
      description: `Over-delivery ${od.od_number} marked retrieved`,
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
