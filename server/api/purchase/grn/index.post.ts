import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    po_id,
    grn_date,
    vehicle,
    driver,
    quality_grade,
    notes,
    items,           // [{ product, qty_mt, unit_price_per_mt, condition }]
  } = body ?? {}

  if (!po_id || !grn_date || !items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'po_id, grn_date and items are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Fetch linked PO for denormalized fields
    const [[po]] = await conn.query<any>(
      `SELECT po_number, supplier_name, supplier_id FROM purchase_orders_adnan WHERE id = ?`, [po_id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

    // Generate GRN number: GRN-YYYYMMDD-NNNN
    const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM goods_received_adnan WHERE DATE(created_at) = CURDATE()`,
    )
    const seq    = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const grnNo  = `GRN-${today}-${seq}`

    // Aggregate totals across items
    let totalQtyKg  = 0
    let totalValue  = 0
    for (const it of items) {
      const qty_kg = Number(it.qty_mt ?? 0) * 1000
      const price_per_kg = Number(it.unit_price_per_mt ?? 0) / 1000
      totalQtyKg += qty_kg
      totalValue += qty_kg * price_per_kg
    }
    const unit_price_per_kg = totalQtyKg > 0 ? totalValue / totalQtyKg : 0

    // Look up ordered qty for variance
    const [[poQty]] = await conn.query<any>(
      `SELECT quantity_kg FROM purchase_orders_adnan WHERE id = ?`, [po_id],
    )
    const orderedKg      = Number(poQty?.quantity_kg ?? 0)
    const weightVariance = totalQtyKg - orderedKg
    const variancePct    = orderedKg > 0 ? ((weightVariance / orderedKg) * 100).toFixed(4) : '0'

    const [result] = await conn.query<any>(
      `INSERT INTO goods_received_adnan
         (grn_number, grn_date, purchase_order_id, po_number,
          supplier_id, supplier_name,
          quantity_received_kg, unit_price_per_kg, total_value,
          weight_variance, variance_percentage,
          quality_grade, truck_number, transporter_name,
          grn_status, notes,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?,
               ?, ?, ?,
               ?, ?,
               ?, ?, ?,
               'draft', ?,
               ?, NOW(), NOW())`,
      [
        grnNo, grn_date, Number(po_id), po.po_number,
        po.supplier_id ?? null, po.supplier_name,
        totalQtyKg, unit_price_per_kg, totalValue,
        weightVariance, variancePct,
        quality_grade ?? 'A', vehicle ?? null, driver ?? null,
        notes ?? null,
        userId,
      ],
    )

    const grnId = result.insertId

    // Update PO received qty
    await conn.query(
      `UPDATE purchase_orders_adnan
       SET total_received_qty = COALESCE(total_received_qty,0) + ?,
           qty_yet_to_receive = GREATEST(0, COALESCE(qty_yet_to_receive, quantity_kg) - ?),
           updated_at = NOW()
       WHERE id = ?`,
      [totalQtyKg, totalQtyKg, po_id],
    )

    await conn.commit()
    return { ok: true, id: grnId, grn_number: grnNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
