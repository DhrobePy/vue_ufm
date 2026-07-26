import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { ADMIN_ROLES, ACTION_LIMIT_KEYS } from '~/server/utils/creditOrders'

/** Set / clear one user's delegated approval limit (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role   = ((session?.user as any)?.role ?? '').toLowerCase()
  const adminId = Number((session?.user as any)?.id ?? 0)
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const body     = await readBody(event)
  const userId   = Number(body?.user_id)
  const orderCap = Math.max(0, Number(body?.max_order_amount ?? 0))
  const txnCap   = Math.max(0, Number(body?.max_transaction_amount ?? 0))
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'user_id required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    if (orderCap <= 0 && txnCap <= 0) {
      await conn.query(`DELETE FROM user_approval_limits WHERE user_id = ?`, [userId])
    } else {
      await conn.query(
        `INSERT INTO user_approval_limits (user_id, max_order_amount, max_transaction_amount, set_by_user_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE max_order_amount = VALUES(max_order_amount),
                                 max_transaction_amount = VALUES(max_transaction_amount),
                                 set_by_user_id = VALUES(set_by_user_id)`,
        [userId, orderCap, txnCap, adminId],
      )
    }
    // Per-action overrides — 0/blank clears an action back to the defaults
    if (body?.action_limits && typeof body.action_limits === 'object') {
      for (const key of ACTION_LIMIT_KEYS) {
        if (body.action_limits[key] === undefined) continue
        const amt = Math.max(0, Number(body.action_limits[key]) || 0)
        if (amt <= 0) {
          await conn.query(`DELETE FROM user_action_limits WHERE user_id = ? AND action_key = ?`, [userId, key])
        } else {
          await conn.query(
            `INSERT INTO user_action_limits (user_id, action_key, max_amount, set_by_user_id)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE max_amount = VALUES(max_amount), set_by_user_id = VALUES(set_by_user_id)`,
            [userId, key, amt, adminId],
          )
        }
      }
    }

    await auditLog(conn, {
      userId: adminId,
      action: 'user_updated',
      module: 'credit_sales',
      recordType: 'user_approval_limit',
      recordId: userId,
      description: orderCap > 0 || txnCap > 0
        ? `Authority for user #${userId}: order approval ৳${orderCap.toLocaleString()}, transaction ৳${txnCap.toLocaleString()}`
        : `Authority limits for user #${userId} removed`,
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
