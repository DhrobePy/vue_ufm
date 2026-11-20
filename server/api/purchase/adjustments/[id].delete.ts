import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'
import { recalcPO } from '~/server/utils/recalcPO'

/**
 * DELETE /api/purchase/adjustments/:id — admin / superadmin (legacy rule).
 * A posted note's effect on the PO is reversed first; everything goes to the Recycle Bin so it is restorable.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const session = await getUserSession(event)
  const userId = Number((session?.user as any)?.id ?? 1), userName = (session?.user as any)?.name ?? (session?.user as any)?.email ?? 'System'
  if (!['admin', 'superadmin'].includes(((session?.user as any)?.role ?? '').toLowerCase()))
    throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin can delete an adjustment note' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[note]] = await conn.query<any>(`SELECT * FROM purchase_adjustment_notes WHERE id = ? FOR UPDATE`, [id])
    if (!note) throw createError({ statusCode: 404, statusMessage: 'Adjustment note not found' })

    const batch = await recycleBegin(conn, { entityType: 'adjustment_note', label: `Adjustment Note ${note.note_number} — PO ${note.po_number} · ৳${Number(note.amount).toLocaleString()}`, userId, userName })
    if (note.status === 'posted') {
      const delta = note.note_type === 'debit' ? Number(note.amount) : -Number(note.amount)
      await conn.query(`UPDATE purchase_orders_adnan SET total_adjustment_amount = COALESCE(total_adjustment_amount, 0) - ?, updated_at = NOW() WHERE id = ?`, [delta, note.purchase_order_id])
      if (note.note_type === 'credit') await recycleArchiveDelete(conn, batch, 'supplier_balance_adjustments', 'adjustment_note_id', id)
    }
    await recycleArchiveDelete(conn, batch, 'purchase_adjustment_notes', 'id', id)
    await recycleFinalize(conn, batch)
    if (note.status === 'posted') await recalcPO(conn, Number(note.purchase_order_id))

    await auditLog(conn, { userId, action: 'adj_deleted', module: 'purchase', recordType: 'adjustment_note', recordId: id, referenceNumber: note.note_number,
      description: `Adjustment Note ${note.note_number} deleted by ${userName}${note.status === 'posted' ? ' — financial effect reversed on the PO' : ''}`, severity: 'warning' })
    await conn.commit()
    return { ok: true, message: `Adjustment Note ${note.note_number} deleted.${note.status === 'posted' ? ' Financial effect has been reversed.' : ''}` }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})
