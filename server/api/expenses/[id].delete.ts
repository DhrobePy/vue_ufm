import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * DELETE /api/expenses/:id
 * Hard-deletes a pending expense voucher.
 * Only status='pending' expenses may be deleted.
 */
export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid expense ID' })

  const session   = await getUserSession(event)
  const actorId   = session?.user?.id   ?? 1
  const actorName = session?.user?.name ?? session?.user?.email ?? 'System'

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[expense]] = await conn.query<any>(
      `SELECT id, voucher_number, status, total_amount FROM expense_vouchers WHERE id = ?`,
      [id],
    )
    if (!expense) throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
    if (expense.status !== 'pending')
      throw createError({ statusCode: 400, statusMessage: `Only pending expenses can be deleted (current status: ${expense.status})` })

    const batchId = await recycleBegin(conn, {
      entityType: 'expense_voucher', label: expense.voucher_number, userId: actorId, userName: actorName,
    })
    await recycleArchiveDelete(conn, batchId, 'expense_vouchers', 'id', id)
    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId:          actorId,
      action:          'deleted',
      module:          'expenses',
      recordType:      'expense_voucher',
      recordId:        id,
      referenceNumber: expense.voucher_number,
      description:     `Expense voucher ${expense.voucher_number} (৳${Number(expense.total_amount).toLocaleString()}) deleted by ${actorName}`,
      severity:        'warning',
    })

    await conn.commit()
    return { ok: true, message: `${expense.voucher_number} deleted` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
