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
    unload_point_name,  // e.g. সিরাজগঞ্জ, ডেমরা, রামপুরা, Head Office, Other
    items,              // [{ product, qty_mt, unit_price_per_mt, condition }]
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

    // weight_variance is a GENERATED ALWAYS column in production — do NOT insert it
    // quality_grade, transporter_name, notes, created_by_user_id don't exist in production
    // receiver_user_id is the correct column for who recorded the GRN
    // grn_status default in production is 'verified' (not 'draft')
    const [result] = await conn.query<any>(
      `INSERT INTO goods_received_adnan
         (grn_number, grn_date, purchase_order_id, po_number,
          supplier_id, supplier_name,
          quantity_received_kg, unit_price_per_kg, total_value,
          variance_percentage,
          truck_number, unload_point_name, remarks,
          grn_status, receiver_user_id,
          created_at, updated_at)
       VALUES (?, ?, ?, ?,
               ?, ?,
               ?, ?, ?,
               ?,
               ?, ?, ?,
               'verified', ?,
               NOW(), NOW())`,
      [
        grnNo, grn_date, Number(po_id), po.po_number,
        po.supplier_id ?? null, po.supplier_name,
        totalQtyKg, unit_price_per_kg, totalValue,
        variancePct,
        vehicle ?? null, unload_point_name ?? null, notes ?? null,
        userId,
      ],
    )

    const grnId = result.insertId

    // Update PO received qty, value, balance and delivery status.
    // NOTE: qty_yet_to_receive is GENERATED ALWAYS AS (quantity_kg - total_received_qty) STORED
    //       — do NOT include it in SET (MariaDB will reject it).
    // All expressions in SET use the ORIGINAL column values (MariaDB evaluates before mutation).
    await conn.query(
      `UPDATE purchase_orders_adnan
       SET total_received_qty   = COALESCE(total_received_qty, 0) + ?,
           total_received_value = COALESCE(total_received_value, 0) + ?,
           balance_payable      = GREATEST(0,
             COALESCE(total_received_value, 0) + ? - COALESCE(total_paid, 0)
           ),
           delivery_status      = CASE
             WHEN (COALESCE(total_received_qty, 0) + ?) <= 0              THEN 'pending'
             WHEN (COALESCE(total_received_qty, 0) + ?) < quantity_kg     THEN 'partial'
             WHEN (COALESCE(total_received_qty, 0) + ?) <= quantity_kg * 1.05 THEN 'completed'
             ELSE 'over_received'
           END,
           updated_at = NOW()
       WHERE id = ?`,
      [totalQtyKg, totalValue, totalValue, totalQtyKg, totalQtyKg, totalQtyKg, po_id],
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
