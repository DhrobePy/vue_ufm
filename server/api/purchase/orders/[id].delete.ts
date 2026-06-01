import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, po_status, supplier_name, total_order_value
       FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })
    if (po.po_status === 'cancelled') throw createError({ statusCode: 400, statusMessage: 'PO is already cancelled' })

    // Soft delete — set po_status = 'cancelled'
    await conn.query(
      `UPDATE purchase_orders_adnan SET po_status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id],
    )

    await auditLog(conn, {
      userId,
      action:          'po_cancelled',
      module:          'purchase',
      recordType:      'purchase_order',
      recordId:        id,
      referenceNumber: po.po_number,
      description:     `Purchase Order ${po.po_number} cancelled · Supplier: ${po.supplier_name} · Value: ৳${Number(po.total_order_value).toLocaleString()}`,
      severity:        'warning',
    })

    await conn.commit()
    return { ok: true, message: `PO ${po.po_number} cancelled successfully` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
