import { getDb, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { to_status, comments } = body ?? {}
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  if (!id || !to_status)
    throw createError({ statusCode: 400, statusMessage: 'id and to_status required' })

  const order = await queryOne<{ status: string }>(
    'SELECT status FROM credit_orders WHERE id = ?', [id],
  )
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  const db = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(
      `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [to_status, id],
    )
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, to_status, to_status, userId, comments ?? null],
    )
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }

  return { ok: true, newStatus: to_status }
})
