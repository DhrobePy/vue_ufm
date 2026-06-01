import { getDb } from '~/server/utils/db'
import { recalcPO } from '~/server/utils/recalcPO'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid GRN ID' })

  const body = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    grn_date,
    truck_number,
    quantity_received_kg,
    expected_quantity,
    unload_point_name,
    unload_point_branch_id,
    variance_remarks,
    remarks,
  } = body ?? {}

  if (!grn_date) throw createError({ statusCode: 400, statusMessage: 'grn_date is required' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[grn]] = await conn.query<any>(
      `SELECT id, grn_number, grn_status, purchase_order_id, unit_price_per_kg,
              quantity_received_kg AS old_qty
       FROM goods_received_adnan WHERE id = ?`,
      [id],
    )
    if (!grn) throw createError({ statusCode: 404, statusMessage: 'GRN not found' })
    if (grn.grn_status === 'cancelled') {
      throw createError({ statusCode: 400, statusMessage: 'Cannot edit a cancelled GRN' })
    }

    const newQtyKg    = Number(quantity_received_kg ?? grn.old_qty)
    const expectedKg  = Number(expected_quantity) || 0
    const unitPrice   = Number(grn.unit_price_per_kg)
    const totalValue  = newQtyKg * unitPrice

    // Variance vs expected_quantity (if provided)
    const varPct = expectedKg > 0
      ? (((newQtyKg - expectedKg) / expectedKg) * 100).toFixed(4)
      : '0'

    await conn.query(
      `UPDATE goods_received_adnan
       SET grn_date               = ?,
           truck_number           = ?,
           quantity_received_kg   = ?,
           expected_quantity      = ?,
           total_value            = ?,
           variance_percentage    = ?,
           unload_point_name      = ?,
           unload_point_branch_id = ?,
           variance_remarks       = ?,
           remarks                = ?,
           updated_at             = NOW()
       WHERE id = ?`,
      [
        grn_date,
        truck_number ?? null,
        newQtyKg,
        expectedKg > 0 ? expectedKg : null,
        totalValue,
        varPct,
        unload_point_name ?? null,
        unload_point_branch_id ?? null,
        variance_remarks ?? null,
        remarks ?? null,
        id,
      ],
    )

    await recalcPO(conn, grn.purchase_order_id)

    const changeNote = newQtyKg !== Number(grn.old_qty)
      ? ` · Qty changed: ${Number(grn.old_qty).toLocaleString()} → ${newQtyKg.toLocaleString()} KG`
      : ''
    await auditLog(conn, {
      userId,
      action:          'grn_updated',
      module:          'purchase',
      recordType:      'grn',
      recordId:        id,
      referenceNumber: grn.grn_number,
      description:     `GRN ${grn.grn_number} updated${changeNote} · Total Value: ৳${totalValue.toLocaleString()}`,
      severity:        newQtyKg !== Number(grn.old_qty) ? 'warning' : 'info',
    })

    await conn.commit()
    return { ok: true, message: `GRN ${grn.grn_number} updated` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
