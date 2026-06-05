import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const body    = await readBody(event)
  const action  = (body?.action ?? 'close') as 'close' | 'reopen' | 'reverse'
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()
  const isAdmin = ['admin', 'superadmin'].includes(role)

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, delivery_status, po_status FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

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
      await conn.query(
        `UPDATE purchase_orders_adnan
         SET delivery_status = 'partial', po_status = 'active', updated_at = NOW()
         WHERE id = ?`,
        [id],
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
