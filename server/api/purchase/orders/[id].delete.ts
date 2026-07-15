import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()
  const isAdmin = ['admin', 'superadmin'].includes(role)

  const body  = await readBody(event).catch(() => ({}))
  const force = isAdmin && (body?.force === true || body?.force === 'true')

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, po_status, supplier_name, total_order_value
       FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })
    // Only block re-cancellation for non-admin; admin can force-cancel to hard-delete
    if (po.po_status === 'cancelled' && !force) {
      throw createError({ statusCode: 400, statusMessage: 'PO is already cancelled' })
    }

    if (force) {
      // Admin hard-delete: remove payments, GRNs, then the PO — archived first
      const batchId = await recycleBegin(conn, {
        entityType: 'purchase_order', label: po.po_number, userId, userName: (session?.user as any)?.name ?? `User ${userId}`,
      })
      await recycleArchiveDelete(conn, batchId, 'purchase_payments_adnan', 'purchase_order_id', id)
      await recycleArchiveDelete(conn, batchId, 'goods_received_adnan', 'purchase_order_id', id)
      await recycleArchiveDelete(conn, batchId, 'purchase_orders_adnan', 'id', id)
      await recycleFinalize(conn, batchId)
    } else {
      // Soft delete — set po_status = 'cancelled'
      await conn.query(
        `UPDATE purchase_orders_adnan SET po_status = 'cancelled', updated_at = NOW() WHERE id = ?`,
        [id],
      )
    }

    await auditLog(conn, {
      userId,
      action:          force ? 'po_hard_deleted' : 'po_cancelled',
      module:          'purchase',
      recordType:      'purchase_order',
      recordId:        id,
      referenceNumber: po.po_number,
      description:     force
        ? `Purchase Order ${po.po_number} HARD DELETED by admin (${role}) — all GRNs & payments removed · Supplier: ${po.supplier_name} · Value: ৳${Number(po.total_order_value).toLocaleString()}`
        : `Purchase Order ${po.po_number} cancelled · Supplier: ${po.supplier_name} · Value: ৳${Number(po.total_order_value).toLocaleString()}`,
      severity:        'warning',
    })

    await conn.commit()
    return { ok: true, message: force ? `PO ${po.po_number} permanently deleted` : `PO ${po.po_number} cancelled successfully` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
