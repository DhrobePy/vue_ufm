import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid PO ID' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, po_status FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })
    if (po.po_status === 'cancelled') throw createError({ statusCode: 400, statusMessage: 'PO is already cancelled' })

    // Soft delete — set po_status = 'cancelled'
    await conn.query(
      `UPDATE purchase_orders_adnan SET po_status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id],
    )

    await conn.commit()
    return { ok: true, message: `PO ${po.po_number} cancelled successfully` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
