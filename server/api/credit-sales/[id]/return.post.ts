import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    return_date,
    return_type = 'partial',
    return_reason,
    notes,
    items,   // [{ order_item_id, product_id, variant_id, original_qty, returned_qty, unit_price }]
  } = body ?? {}

  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No return items provided' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, balance_due, amount_paid FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // Generate return number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_order_returns WHERE DATE(created_at) = CURDATE()`,
    )
    const seq     = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const retNo   = `RET-${today}-${seq}`

    const totalQty    = items.reduce((s: number, i: any) => s + Number(i.returned_qty), 0)
    const totalAmount = items.reduce((s: number, i: any) => s + Number(i.returned_qty) * Number(i.unit_price), 0)

    // Insert return header (pending approval)
    const [result] = await conn.query<any>(
      `INSERT INTO credit_order_returns
         (return_number, order_id, customer_id, return_date, return_type,
          return_reason, total_returned_amount, total_returned_qty,
          status, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        retNo, id, order.customer_id,
        return_date ?? new Date().toISOString().slice(0, 10),
        return_type, return_reason ?? null,
        totalAmount, totalQty,
        notes ?? null, userId,
      ],
    )
    const returnId = result.insertId

    // Insert return items
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_order_return_items
           (return_id, order_item_id, product_id, variant_id,
            original_qty, returned_qty, unit_price, returned_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          returnId,
          item.order_item_id,
          item.product_id,
          item.variant_id ?? null,
          Number(item.original_qty ?? 0),
          Number(item.returned_qty),
          Number(item.unit_price),
          Number(item.returned_qty) * Number(item.unit_price),
        ],
      )
    }

    await conn.commit()
    return { ok: true, return_number: retNo, return_id: returnId, status: 'pending' }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
