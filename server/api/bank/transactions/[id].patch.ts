import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id     = Number(getRouterParam(event, 'id'))
  const body   = await readBody(event) as { action: 'approve' | 'reject'; notes?: string }
  const { action, notes } = body

  if (!['approve', 'reject'].includes(action)) {
    throw createError({ statusCode: 422, statusMessage: 'action must be approve or reject' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[txn]] = await conn.query<any>(
      `SELECT t.* FROM bank_transactions t
       WHERE t.id = ? AND t.status = 'pending'`,
      [id],
    )
    if (!txn) throw createError({ statusCode: 404, statusMessage: 'Pending transaction not found' })

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    await conn.query(
      `UPDATE bank_transactions
       SET status = ?, special_note = COALESCE(?, special_note), updated_at = NOW()
       WHERE id = ?`,
      [newStatus, notes || null, id],
    )

    await conn.commit()
    return { message: `Transaction ${action}d successfully` }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})
