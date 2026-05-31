import { getDb } from '~/server/utils/db'

/**
 * PATCH /api/credit-sales/production-queue/reorder
 * Body: { ids: number[] }   — ordered array of credit_order ids
 * Admin / superadmin only.
 * Writes production_seq = 1, 2, 3 … for each id in the supplied order.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = (session?.user?.role ?? '').toLowerCase()

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can reorder the production queue' })
  }

  const body = await readBody(event)
  const ids  = body?.ids

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ids array is required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    for (let i = 0; i < ids.length; i++) {
      await conn.query(
        `UPDATE credit_orders SET production_seq = ?, updated_at = NOW() WHERE id = ?`,
        [i + 1, Number(ids[i])],
      )
    }

    await conn.commit()
    return { ok: true, count: ids.length }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
