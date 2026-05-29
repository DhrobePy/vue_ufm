import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    branch_id    = 1,
    customer_id  = null,
    items        = [],       // [{ variant_id, quantity, unit_price }]
    discount     = 0,
    payment_method = 'Cash',
    payment_reference = null,
  } = body ?? {}

  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No items in cart' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Generate order number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM orders WHERE DATE(order_date) = CURDATE()`,
    )
    const seq         = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const orderNumber = `ORD-${today}-${seq}`

    const subtotal = items.reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.quantity), 0)
    const total    = Math.max(0, subtotal - Number(discount || 0))

    // Create the order
    const [orderResult] = await conn.query<any>(
      `INSERT INTO orders
         (order_number, branch_id, customer_id, order_date, order_type,
          subtotal, discount_amount, total_amount,
          payment_method, payment_reference,
          payment_status, order_status, created_by_user_id)
       VALUES (?, ?, ?, NOW(), 'POS', ?, ?, ?, ?, ?, 'Paid', 'Completed', ?)`,
      [
        orderNumber,
        branch_id,
        customer_id || null,
        subtotal,
        Number(discount || 0),
        total,
        payment_method,
        payment_reference || null,
        userId,
      ],
    )
    const orderId = orderResult.insertId

    // Insert order items + decrement inventory
    for (const item of items) {
      const lineTotal = Number(item.unit_price) * Number(item.quantity)
      await conn.query(
        `INSERT INTO order_items
           (order_id, variant_id, quantity, unit_price, subtotal, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.variant_id, item.quantity, item.unit_price, lineTotal, lineTotal],
      )

      // Decrement inventory (GREATEST prevents negative stock)
      await conn.query(
        `UPDATE inventory
         SET quantity = GREATEST(0, quantity - ?), updated_at = NOW()
         WHERE variant_id = ? AND branch_id = ?`,
        [item.quantity, item.variant_id, branch_id],
      )
    }

    await conn.commit()
    return { ok: true, order_number: orderNumber, order_id: orderId, total }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
