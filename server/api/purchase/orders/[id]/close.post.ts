import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'
import { nextNoteNumber } from '~/server/utils/purchaseNotes'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const body    = await readBody(event)
  const action  = (body?.action ?? 'close') as 'close' | 'reopen' | 'reverse' | 'final_delivery'
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()
  const isAdmin = ['admin', 'superadmin'].includes(role)

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, delivery_status, po_status, supplier_id, supplier_name, quantity_kg, total_received_qty, unit_price_per_kg, is_delivery_locked FROM purchase_orders_adnan WHERE id = ? FOR UPDATE`, [id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

    // ── FINAL DELIVERY (admin only) ──────────────────────────────────────
    if (action === 'final_delivery') {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Only admin can mark final delivery' })
      if (po.delivery_status === 'closed') throw createError({ statusCode: 400, statusMessage: 'PO is already closed' })

      // Legacy rule: final delivery LOCKS the PO against further GRNs and flags it; the status itself is untouched.
      if (Number(po.is_delivery_locked) === 1) throw createError({ statusCode: 400, statusMessage: 'Delivery is already locked.' })
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET is_delivery_locked         = 1,
             delivery_lock_reason       = 'Final delivery marked by admin — PO closed for further GRNs',
             delivery_locked_by_user_id = ?,
             delivery_locked_at         = NOW(),
             final_delivery_marked      = 1,
             updated_at                 = NOW()
         WHERE id = ?`,
        [userId, id],
      )
      // Optionally draft a credit note (CAN) for what the supplier did not deliver (only when the shortfall is more than 1 KG)
      const shortfall = Number(po.quantity_kg) - Number(po.total_received_qty ?? 0)
      let canNo: string | null = null
      if (body?.create_can_for_shortfall && shortfall > 1) {
        canNo = await nextNoteNumber(conn, 'credit')
        const amt = shortfall * Number(po.unit_price_per_kg)
        await conn.query(
          `INSERT INTO purchase_adjustment_notes
             (note_number, note_type, reason_type, purchase_order_id, po_number, supplier_id, supplier_name, quantity_kg, unit_price_per_kg, amount, description, status, created_by_user_id, created_at, updated_at)
           VALUES (?, 'credit', 'under_delivery_closure', ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW(), NOW())`,
          [canNo, id, po.po_number, po.supplier_id, po.supplier_name, shortfall, po.unit_price_per_kg, amt,
            `Auto-generated CAN: PO closed with shortfall of ${shortfall.toLocaleString()} KG (৳${amt.toLocaleString()}) — marked as final delivery.`, userId])
      }
      await auditLog(conn, {
        userId,
        action:          'po_locked',
        module:          'purchase',
        recordType:      'purchase_order',
        recordId:        id,
        referenceNumber: po.po_number,
        description:     `PO ${po.po_number} marked as Final Delivery — delivery locked permanently`,
        severity:        'info',
      })
      await conn.commit()
      return { ok: true, message: `PO ${po.po_number} marked as final delivery and locked.${canNo ? ` Draft CAN ${canNo} created for the shortfall.` : ''}` }
    }

    // ── REVERSE (admin/superadmin only) ─────────────────────────────────
    if (action === 'reverse') {
      if (!isAdmin) throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can reverse a PO' })

      // Cancel all active GRNs
      await conn.query(
        `UPDATE goods_received_adnan
         SET grn_status = 'cancelled',
             remarks    = CONCAT(COALESCE(remarks, ''), ' [REVERSED by admin]'),
             updated_at = NOW()
         WHERE purchase_order_id = ? AND grn_status != 'cancelled'`,
        [id],
      )
      // Void all payments (soft-delete)
      await conn.query(
        `UPDATE purchase_payments_adnan
         SET is_posted  = 0,
             remarks    = CONCAT(COALESCE(remarks, ''), '\n[REVERSED by admin ${role}]'),
             updated_at = NOW()
         WHERE purchase_order_id = ?`,
        [id],
      )
      // Recalculate PO totals (will zero out received/paid/balance)
      await recalcPO(conn, id)
      // Set PO to cancelled state
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET po_status = 'cancelled', delivery_status = 'pending', updated_at = NOW()
         WHERE id = ?`,
        [id],
      )
      await auditLog(conn, {
        userId,
        action:          'po_reversed',
        module:          'purchase',
        recordType:      'purchase_order',
        recordId:        id,
        referenceNumber: po.po_number,
        description:     `PO ${po.po_number} fully REVERSED by ${role} — all GRNs cancelled and payments voided`,
        severity:        'warning',
      })
      await conn.commit()
      return { ok: true, message: `PO ${po.po_number} reversed — all GRNs cancelled and payments voided` }
    }

    // ── REOPEN ───────────────────────────────────────────────────────────
    if (action === 'reopen') {
      // Admin can reopen from any status; regular users only from 'closed'
      if (!isAdmin && po.delivery_status !== 'closed') {
        throw createError({ statusCode: 400, statusMessage: 'PO is not closed — cannot reopen' })
      }
      // Legacy rule: back to partial if anything was received, else pending; the delivery lock is released too
      const [[got]] = await conn.query<any>(`SELECT COALESCE(SUM(quantity_received_kg), 0) AS q FROM goods_received_adnan WHERE purchase_order_id = ? AND grn_status != 'cancelled'`, [id])
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET delivery_status = ?, is_delivery_locked = 0, delivery_lock_reason = NULL, updated_at = NOW()
         WHERE id = ?`,
        [Number(got.q) > 0 ? 'partial' : 'pending', id],
      )
      await auditLog(conn, {
        userId,
        action:          'po_reopened',
        module:          'purchase',
        recordType:      'purchase_order',
        recordId:        id,
        referenceNumber: po.po_number,
        description:     `PO ${po.po_number} reopened by ${role} — goods receipt is allowed again`,
        severity:        'warning',
      })
      await conn.commit()
      return { ok: true, message: `PO ${po.po_number} reopened — goods receipt is allowed again` }
    }

    // ── CLOSE (default) ──────────────────────────────────────────────────
    // Admin can close from any status; regular users cannot re-close
    if (!isAdmin && po.delivery_status === 'closed') {
      throw createError({ statusCode: 400, statusMessage: 'PO is already closed' })
    }
    await conn.query(
      `UPDATE purchase_orders_adnan SET delivery_status = 'closed', updated_at = NOW() WHERE id = ?`,
      [id],
    )
    await auditLog(conn, {
      userId,
      action:          'po_closed',
      module:          'purchase',
      recordType:      'purchase_order',
      recordId:        id,
      referenceNumber: po.po_number,
      description:     `PO ${po.po_number} closed by ${role} — no further goods can be received`,
      severity:        'info',
    })
    await conn.commit()
    return { ok: true, message: `PO ${po.po_number} closed — no further goods can be received` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
