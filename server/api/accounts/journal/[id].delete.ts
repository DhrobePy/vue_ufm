import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  const userId = session?.user?.id ?? 1

  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const db = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[je]] = await conn.query<any>(
      `SELECT id, description, is_reversed, related_document_type, related_document_id FROM journal_entries WHERE id = ?`, [id]
    )
    if (!je) throw createError({ statusCode: 404, statusMessage: 'Journal entry not found' })
    if (je.is_reversed) throw createError({ statusCode: 400, statusMessage: 'Cannot delete a reversed journal entry' })
    // Check if it reverses another entry
    const [[linked]] = await conn.query<any>(
      `SELECT id FROM journal_entries WHERE reversed_by_entry_id = ?`, [id]
    )
    if (linked) throw createError({ statusCode: 400, statusMessage: 'Cannot delete — this entry has been reversed' })

    const batchId = await recycleBegin(conn, {
      entityType: 'journal_entry', label: je.description ? `JE-${id}: ${je.description}` : `JE-${id}`,
      userId, userName: (session?.user as any)?.name ?? `User ${userId}`,
    })

    await recycleArchiveDelete(conn, batchId, 'transaction_lines', 'journal_entry_id', id)
    await recycleArchiveDelete(conn, batchId, 'journal_entries', 'id', id)

    // If linked to an expense, clear the journal_entry_id
    if (je.related_document_type === 'ExpenseVoucher' && je.related_document_id) {
      await recycleSnapshotBefore(conn, batchId, 'expense_vouchers', 'id', je.related_document_id)
      await conn.query(
        `UPDATE expense_vouchers SET journal_entry_id = NULL WHERE id = ? AND journal_entry_id = ?`,
        [je.related_document_id, id]
      )
    }

    await recycleFinalize(conn, batchId)

    await auditLog(conn, {
      userId, action: 'deleted', module: 'accounts', recordType: 'journal_entry',
      recordId: id, referenceNumber: `JE-${id}`,
      description: `Journal entry JE-${id} deleted by user ${userId}`,
      severity: 'critical',
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
