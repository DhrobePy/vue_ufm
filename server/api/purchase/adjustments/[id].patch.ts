import { getDb, queryOne } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * Handles approve / post / cancel actions on an adjustment note.
 * When posted, updates the PO's balance_payable:
 *   DAN (debit)  → increases balance_payable (we owe more)
 *   CAN (credit) → decreases balance_payable (supplier owes reduction)
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body    = await readBody(event)
  const action  = body?.action as 'approve' | 'post' | 'cancel'
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  if (!['admin', 'superadmin'].includes(((session?.user as any)?.role ?? '').toLowerCase()))
    throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin can approve, post or cancel adjustment notes' })

  if (!['approve', 'post', 'cancel'].includes(action))
    throw createError({ statusCode: 400, statusMessage: 'action must be approve, post, or cancel' })

  const note = await queryOne(
    `SELECT * FROM purchase_adjustment_notes WHERE id = ?`, [id],
  ) as any
  if (!note) throw createError({ statusCode: 404, statusMessage: 'Note not found' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    if (action === 'approve') {
      if (note.status !== 'draft')
        throw createError({ statusCode: 400, statusMessage: 'Only draft notes can be approved' })

      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [userId, id],
      )
      await auditLog(conn, {
        userId,
        action:          'adj_approved',
        module:          'purchase',
        recordType:      'adjustment_note',
        recordId:        id,
        referenceNumber: note.note_number,
        description:     `Adjustment Note ${note.note_number} approved · ৳${Number(note.amount).toLocaleString()} · PO ${note.po_number}`,
        severity:        'info',
      })

    } else if (action === 'post') {
      if (note.status !== 'approved')
        throw createError({ statusCode: 400, statusMessage: 'Only approved notes can be posted' })

      // Legacy effects: the PO's running adjustment total and payable move by the note; a CAN also becomes supplier credit (usable on a later payment)
      const delta = note.note_type === 'debit' ? Number(note.amount) : -Number(note.amount)
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET total_adjustment_amount = COALESCE(total_adjustment_amount, 0) + ?,
             balance_payable         = GREATEST(0, COALESCE(balance_payable, 0) + ?),
             updated_at              = NOW()
         WHERE id = ?`,
        [delta, delta, note.purchase_order_id],
      )
      if (note.note_type === 'credit') {
        await conn.query(
          `INSERT INTO supplier_balance_adjustments (supplier_id, purchase_order_id, adjustment_note_id, type, amount, description, created_by_user_id)
           VALUES (?, ?, ?, 'credit', ?, ?, ?)`,
          [note.supplier_id, note.purchase_order_id, note.id, Number(note.amount), `Credit from CAN ${note.note_number}: ${note.description ?? ''}`.slice(0, 500), userId])
      }
      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status = 'posted', posted_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [id],
      )
      const effectLabel = note.note_type === 'debit' ? 'increases payable by' : 'reduces payable by'
      await auditLog(conn, {
        userId,
        action:          'adj_posted',
        module:          'purchase',
        recordType:      'adjustment_note',
        recordId:        id,
        referenceNumber: note.note_number,
        description:     `Adjustment Note ${note.note_number} posted — ${effectLabel} ৳${Number(note.amount).toLocaleString()} · PO ${note.po_number}`,
        severity:        'warning',
      })

    } else if (action === 'cancel') {
      if (note.status === 'posted')
        throw createError({ statusCode: 400, statusMessage: 'Cannot cancel a posted note' })
      if (note.status === 'cancelled')
        throw createError({ statusCode: 400, statusMessage: 'Note is already cancelled' })

      const cancelReason = String(body?.cancel_reason ?? '').trim()
      if (!cancelReason) throw createError({ statusCode: 400, statusMessage: 'Cancellation reason is required' })
      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status      = 'cancelled',
             description = CONCAT(COALESCE(description, ''), '\n[CANCELLED: ', ?, ']'),
             updated_at  = NOW()
         WHERE id = ?`,
        [cancelReason, id],
      )
      await auditLog(conn, {
        userId,
        action:          'adj_cancelled',
        module:          'purchase',
        recordType:      'adjustment_note',
        recordId:        id,
        referenceNumber: note.note_number,
        description:     `Adjustment Note ${note.note_number} cancelled · Reason: ${cancelReason}`,
        severity:        'warning',
      })
    }

    await conn.commit()
    return { ok: true, action }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
