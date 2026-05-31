import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid GRN ID' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[grn]] = await conn.query<any>(
      `SELECT id, grn_number, grn_status, purchase_order_id
       FROM goods_received_adnan WHERE id = ?`,
      [id],
    )
    if (!grn) throw createError({ statusCode: 404, statusMessage: 'GRN not found' })
    if (grn.grn_status === 'cancelled') {
      throw createError({ statusCode: 400, statusMessage: 'GRN is already cancelled' })
    }

    // Soft delete — mark cancelled
    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_status = 'cancelled',
           remarks    = CONCAT(COALESCE(remarks, ''), ' [CANCELLED]'),
           updated_at = NOW()
       WHERE id = ?`,
      [id],
    )

    await recalcPO(conn, grn.purchase_order_id)

    await conn.commit()
    return { ok: true, message: `GRN ${grn.grn_number} cancelled` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
