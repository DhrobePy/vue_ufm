import { getDb, queryOne } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    po_number,
    po_date,
    supplier_id,
    wheat_origin,
    quantity_kg,
    unit_price_per_kg,
    expected_delivery_date,
    remarks,
    lock_action,   // 'lock' | 'unlock' | ''
    lock_reason,
  } = body ?? {}

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Fetch current PO for description & reference number
    const [[current]] = await conn.query<any>(
      `SELECT po_number, supplier_name FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

    // Resolve supplier name if supplier changed
    let supplierName: string | null = null
    if (supplier_id) {
      const [[sup]] = await conn.query<any>(
        `SELECT company_name FROM suppliers WHERE id = ?`, [supplier_id],
      )
      supplierName = sup?.company_name ?? null
    }

    const total = Number(quantity_kg ?? 0) * Number(unit_price_per_kg ?? 0)

    const setParts: string[] = []
    const setParams: unknown[] = []

    if (po_number !== undefined)             { setParts.push('po_number = ?');               setParams.push(po_number) }
    if (po_date !== undefined)               { setParts.push('po_date = ?');                 setParams.push(po_date) }
    if (supplier_id !== undefined)           { setParts.push('supplier_id = ?');             setParams.push(Number(supplier_id)) }
    if (supplierName !== null)               { setParts.push('supplier_name = ?');           setParams.push(supplierName) }
    if (wheat_origin !== undefined)          { setParts.push('wheat_origin = ?');            setParams.push(wheat_origin) }
    if (quantity_kg !== undefined)           { setParts.push('quantity_kg = ?');             setParams.push(Number(quantity_kg)) }
    if (unit_price_per_kg !== undefined)     { setParts.push('unit_price_per_kg = ?');       setParams.push(Number(unit_price_per_kg)) }
    if (quantity_kg !== undefined || unit_price_per_kg !== undefined) {
                                               setParts.push('total_order_value = ?');       setParams.push(total) }
    if (expected_delivery_date !== undefined) { setParts.push('expected_delivery_date = ?'); setParams.push(expected_delivery_date ?? null) }
    if (remarks !== undefined)               { setParts.push('remarks = ?');                setParams.push(remarks ?? null) }

    // Delivery lock control
    let auditAction = 'po_updated'
    let auditDesc   = `Purchase Order ${current.po_number} updated`

    if (lock_action === 'lock') {
      setParts.push('is_delivery_locked = 1', 'delivery_lock_reason = ?', 'delivery_locked_by_user_id = ?', 'delivery_locked_at = NOW()')
      setParams.push(lock_reason ?? '', userId)
      auditAction = 'po_locked'
      auditDesc   = `PO ${current.po_number} delivery locked: ${lock_reason}`
    } else if (lock_action === 'unlock') {
      setParts.push('is_delivery_locked = 0', 'delivery_lock_reason = ?', 'delivery_locked_by_user_id = ?', 'delivery_locked_at = NULL')
      setParams.push(`Unlocked: ${lock_reason}`, userId)
      auditAction = 'po_unlocked'
      auditDesc   = `PO ${current.po_number} delivery unlocked: ${lock_reason}`
    }

    setParts.push('updated_at = NOW()')

    if (setParts.length > 1) {
      await conn.query(
        `UPDATE purchase_orders_adnan SET ${setParts.join(', ')} WHERE id = ?`,
        [...setParams, id],
      )
    }

    await auditLog(conn, {
      userId,
      action:          auditAction,
      module:          'purchase',
      recordType:      'purchase_order',
      recordId:        id,
      referenceNumber: current.po_number,
      description:     auditDesc,
      severity:        lock_action ? 'warning' : 'info',
    })

    await conn.commit()

    const updated = await queryOne(
      `SELECT * FROM purchase_orders_adnan WHERE id = ?`, [id],
    )
    return { ok: true, po: updated }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
