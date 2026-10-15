import { requireAction } from '~/server/utils/permissions'
import { ACCOUNTS_ROLES } from '~/server/utils/creditOrders'
import { getDb } from '~/server/utils/db'

// Bulk-update credit limits: body = { updates: [{ id, credit_limit }] }
export default defineEventHandler(async (event) => {
  await requireAction(event, { module: 'credit_sales', page: 'credit-limits', action: 'update', roleFallback: ACCOUNTS_ROLES },
    'Only Accounts / admin (or a user granted Credit Limits) may change credit limits')
  const { updates } = await readBody(event) ?? {}

  if (!Array.isArray(updates) || !updates.length) {
    throw createError({ statusCode: 400, statusMessage: 'updates array is required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()
    for (const u of updates) {
      if (!u.id || u.credit_limit === undefined) continue
      await conn.query(
        `UPDATE customers SET credit_limit = ?, updated_at = NOW() WHERE id = ?`,
        [Number(u.credit_limit), Number(u.id)],
      )
    }
    await conn.commit()
    return { ok: true, updated: updates.length }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
