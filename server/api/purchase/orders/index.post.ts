import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    supplier_id,
    po_date,
    wheat_origin,
    expected_delivery_date,
    payment_terms = 'Credit 30',
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

    // Auto-add po_payment_terms column if missing (safe on first run)
    await conn.query(`
      ALTER TABLE purchase_orders_adnan
        ADD COLUMN IF NOT EXISTS po_payment_terms VARCHAR(50) DEFAULT 'Credit 30'
    `).catch(() => {/* ignore if DB doesn't support IF NOT EXISTS — silently skip */})

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
    const quantity_kg        = Number(quantity_mt) * 1000
    const unit_price_per_kg  = Number(unit_price_per_mt) / 1000
    const total_order_value  = quantity_kg * unit_price_per_kg

    const [result] = await conn.query<any>(
      `INSERT INTO purchase_orders_adnan
         (po_number, po_date, supplier_id, supplier_name, wheat_origin,
          expected_delivery_date, po_payment_terms, quantity_kg, unit_price_per_kg,
          total_order_value, balance_payable,
          po_status, delivery_status, payment_status,
          branch_id, created_by_user_id, remarks,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?,
               ?, ?, ?, ?,
               ?, ?,
               'approved', 'pending', 'unpaid',
               ?, ?, ?,
               NOW(), NOW())`,
      [
        poNo, po_date, Number(supplier_id), supplierName,
        wheat_origin || 'Other',
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
