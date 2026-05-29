import { getDb, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { action, reason } = body ?? {}   // action: 'approve' | 'reject'
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  if (!id || !action) throw createError({ statusCode: 400, statusMessage: 'id and action required' })

  const expense = await queryOne<{ status: string }>(
    'SELECT status FROM expense_vouchers WHERE id = ?', [id],
  )
  if (!expense) throw createError({ statusCode: 404, statusMessage: 'Expense not found' })

  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  const db = getDb()

  await db.query(
    `UPDATE expense_vouchers
     SET status = ?, approved_by_user_id = ?, approved_at = NOW(),
         rejection_reason = ?, updated_at = NOW()
     WHERE id = ?`,
    [newStatus, userId, action === 'reject' ? (reason ?? null) : null, id],
  )

  return { ok: true, newStatus }
})
