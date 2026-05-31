import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid GRN ID' })

  const body = await readBody(event)
  const {
    grn_date,
    truck_number,
    quantity_received_kg,
    unload_point_name,
    remarks,
  } = body ?? {}

  if (!grn_date) throw createError({ statusCode: 400, statusMessage: 'grn_date is required' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[grn]] = await conn.query<any>(
      `SELECT id, grn_number, grn_status, purchase_order_id, unit_price_per_kg
       FROM goods_received_adnan WHERE id = ?`,
      [id],
    )
    if (!grn) throw createError({ statusCode: 404, statusMessage: 'GRN not found' })
    if (grn.grn_status === 'cancelled') {
      throw createError({ statusCode: 400, statusMessage: 'Cannot edit a cancelled GRN' })
    }

    const newQtyKg    = Number(quantity_received_kg ?? grn.quantity_received_kg)
    const unitPrice   = Number(grn.unit_price_per_kg)
    const totalValue  = newQtyKg * unitPrice

    // Variance % vs ordered qty on PO
    const [[po]] = await conn.query<any>(
      `SELECT quantity_kg FROM purchase_orders_adnan WHERE id = ?`,
      [grn.purchase_order_id],
    )
    const orderedKg      = Number(po?.quantity_kg ?? 0)
    const weightVariance = newQtyKg - orderedKg
    const variancePct    = orderedKg > 0 ? ((weightVariance / orderedKg) * 100).toFixed(4) : '0'

    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_date           = ?,
           truck_number       = ?,
           quantity_received_kg = ?,
           total_value        = ?,
           variance_percentage = ?,
           unload_point_name  = ?,
           remarks            = ?,
           updated_at         = NOW()
       WHERE id = ?`,
      [
        grn_date,
        truck_number ?? null,
        newQtyKg,
        totalValue,
        variancePct,
        unload_point_name ?? null,
        remarks ?? null,
        id,
      ],
    )

    await recalcPO(conn, grn.purchase_order_id)

    await conn.commit()
    return { ok: true, message: `GRN ${grn.grn_number} updated` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
