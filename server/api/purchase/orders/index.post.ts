import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    supplier_id,
    po_date,
    wheat_origin,
    expected_delivery_date,
    quantity_mt,    // metric tonnes
    unit_price_per_mt,
    remarks,
    branch_id,
  } = body ?? {}

  if (!supplier_id || !po_date || !quantity_mt || !unit_price_per_mt) {
    throw createError({ statusCode: 400, statusMessage: 'supplier_id, po_date, quantity_mt and unit_price_per_mt are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Fetch supplier name for denormalization
    const [[sup]] = await conn.query<any>(
      `SELECT company_name FROM suppliers WHERE id = ?`, [supplier_id],
    )
    const supplierName = sup?.company_name ?? ''

    // Generate PO number: PO-YYYYMMDD-NNNN
    const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM purchase_orders_adnan WHERE DATE(created_at) = CURDATE()`,
    )
    const seq    = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const poNo   = `PO-${today}-${seq}`

    // Convert MT → kg  (1 MT = 1000 kg)
    const quantity_kg     = Number(quantity_mt) * 1000
    const unit_price_per_kg = Number(unit_price_per_mt) / 1000
    const total_order_value = quantity_kg * unit_price_per_kg

    const [result] = await conn.query<any>(
      `INSERT INTO purchase_orders_adnan
         (po_number, po_date, supplier_id, supplier_name, wheat_origin,
          expected_delivery_date, quantity_kg, unit_price_per_kg,
          total_order_value, balance_payable,
          po_status, delivery_status, payment_status,
          branch_id, created_by_user_id, remarks,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?,
               ?, ?, ?,
               ?, ?,
               'draft', 'pending', 'unpaid',
               ?, ?, ?,
               NOW(), NOW())`,
      [
        poNo, po_date, Number(supplier_id), supplierName,
        wheat_origin || 'Other',                // NOT NULL in production — fall back to 'Other'
        expected_delivery_date ?? null, quantity_kg, unit_price_per_kg,
        total_order_value, total_order_value,
        // qty_yet_to_receive is GENERATED ALWAYS — do NOT include in INSERT
        branch_id ? Number(branch_id) : null, userId, remarks ?? null,
      ],
    )

    await conn.commit()
    return { ok: true, id: result.insertId, po_number: poNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
