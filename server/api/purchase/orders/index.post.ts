import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { nextDocNumber } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    commodity_id,
    supplier_id,
    po_date,
    origin,
    wheat_origin,   // back-compat alias — older client build / direct API callers
    expected_delivery_date,
    payment_terms = 'Credit 30',
    quantity, quantity_mt,           // quantity_mt = back-compat alias (implies MT)
    unit_price, unit_price_per_mt,   // unit_price_per_mt = back-compat alias
    remarks,
    branch_id,
  } = body ?? {}

  const qty       = quantity ?? quantity_mt
  const price     = unit_price ?? unit_price_per_mt
  const originVal = origin ?? wheat_origin

  if (!supplier_id || !po_date || !qty || !price) {
    throw createError({ statusCode: 400, statusMessage: 'supplier_id, po_date, quantity and unit_price are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // po_payment_terms column guaranteed by db-migrate startup plugin.

    // Fetch supplier name for denormalization
    const [[sup]] = await conn.query<any>(
      `SELECT company_name FROM suppliers WHERE id = ?`, [supplier_id],
    )
    const supplierName = sup?.company_name ?? ''

    // Resolve the commodity — default to Wheat (seeded by db-migrate) when
    // omitted, so pre-catalog callers keep working unchanged.
    let commodityId = commodity_id ? Number(commodity_id) : null
    let commodityUnit = 'MT'
    if (commodityId) {
      const [[comm]] = await conn.query<any>(`SELECT unit FROM purchase_commodities WHERE id = ?`, [commodityId])
      commodityUnit = comm?.unit ?? 'MT'
    } else {
      const [[wheat]] = await conn.query<any>(`SELECT id, unit FROM purchase_commodities WHERE name = 'Wheat'`)
      commodityId = wheat?.id ?? null
      commodityUnit = wheat?.unit ?? 'MT'
    }

    // Generate PO number: PO-YYYYMMDD-NNNN
    const poNo = await nextDocNumber(conn, 'PO', 'purchase_orders_adnan', 'po_number')

    // 'MT' keeps the historical MT-entry → kg-storage conversion (1 MT = 1000 kg);
    // every other commodity unit stores exactly what was entered, 1:1.
    const isMt               = commodityUnit === 'MT'
    const quantity_kg        = isMt ? Number(qty) * 1000 : Number(qty)
    const unit_price_per_kg  = isMt ? Number(price) / 1000 : Number(price)
    const total_order_value  = quantity_kg * unit_price_per_kg

    const [result] = await conn.query<any>(
      `INSERT INTO purchase_orders_adnan
         (po_number, po_date, supplier_id, supplier_name, wheat_origin, commodity_id,
          expected_delivery_date, po_payment_terms, quantity_kg, unit_price_per_kg,
          total_order_value, balance_payable,
          po_status, delivery_status, payment_status,
          branch_id, created_by_user_id, remarks,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?,
               ?, ?,
               'approved', 'pending', 'unpaid',
               ?, ?, ?,
               NOW(), NOW())`,
      [
        poNo, po_date, Number(supplier_id), supplierName,
        originVal || 'Other', commodityId,
        expected_delivery_date ?? null, payment_terms || 'Credit 30', quantity_kg, unit_price_per_kg,
        total_order_value, total_order_value,
        branch_id ? Number(branch_id) : null, userId, remarks ?? null,
      ],
    )

    const poId = result.insertId

    await auditLog(conn, {
      userId,
      action:          'po_created',
      module:          'purchase',
      recordType:      'purchase_order',
      recordId:        poId,
      referenceNumber: poNo,
      description:     `Purchase Order ${poNo} created for ${supplierName} · ${quantity_kg.toLocaleString()} KG @ ৳${unit_price_per_kg.toLocaleString()}/kg · Total ৳${total_order_value.toLocaleString()}`,
      severity:        'info',
    })

    await conn.commit()
    return { ok: true, id: poId, po_number: poNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
