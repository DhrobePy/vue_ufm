import { getDb, queryOne } from '~/server/utils/db'

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
    } else if (action === 'post') {
      if (note.status !== 'approved')
        throw createError({ statusCode: 400, statusMessage: 'Only approved notes can be posted' })

      // Update PO balance_payable
      const delta = note.note_type === 'debit' ? Number(note.amount) : -Number(note.amount)
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET balance_payable = GREATEST(0, COALESCE(balance_payable, 0) + ?),
             updated_at      = NOW()
         WHERE id = ?`,
        [delta, note.purchase_order_id],
      )

      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status = 'posted', posted_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [id],
      )
    } else if (action === 'cancel') {
      if (note.status === 'posted')
        throw createError({ statusCode: 400, statusMessage: 'Cannot cancel a posted note' })
      if (note.status === 'cancelled')
        throw createError({ statusCode: 400, statusMessage: 'Note is already cancelled' })

      const cancelReason = body?.cancel_reason ?? 'Cancelled'
      await conn.query(
        `UPDATE purchase_adjustment_notes
         SET status      = 'cancelled',
             description = CONCAT(COALESCE(description, ''), '\n[CANCELLED: ', ?, ']'),
             updated_at  = NOW()
         WHERE id = ?`,
        [cancelReason, id],
      )
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
