import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'

/** Set / clear one user's delegated approval limit (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role   = ((session?.user as any)?.role ?? '').toLowerCase()
  const adminId = Number((session?.user as any)?.id ?? 0)
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const body   = await readBody(event)
  const userId = Number(body?.user_id)
  const amount = body?.max_order_amount != null ? Number(body.max_order_amount) : null
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'user_id required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    if (amount === null || amount <= 0) {
      await conn.query(`DELETE FROM user_approval_limits WHERE user_id = ?`, [userId])
    } else {
      await conn.query(
        `INSERT INTO user_approval_limits (user_id, max_order_amount, set_by_user_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE max_order_amount = VALUES(max_order_amount),
                                 set_by_user_id = VALUES(set_by_user_id)`,
        [userId, amount, adminId],
      )
    }
    await auditLog(conn, {
      userId: adminId,
      action: 'user_updated',
      module: 'credit_sales',
      recordType: 'user_approval_limit',
      recordId: userId,
      description: amount && amount > 0
        ? `Approval limit for user #${userId} set to ৳${amount.toLocaleString()}`
        : `Approval limit for user #${userId} removed`,
      severity: 'warning',
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
