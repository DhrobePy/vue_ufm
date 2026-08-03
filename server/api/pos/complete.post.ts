import { getDb } from '~/server/utils/db'
import { nextDocNumber } from '~/server/utils/creditOrders'

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
    const orderNumber = await nextDocNumber(conn, 'ORD', 'orders', 'order_number')

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

      // Decrement authoritative stock on product_variants (GREATEST prevents negative)
      await conn.query(
        `UPDATE product_variants
         SET stock_qty = GREATEST(0, stock_qty - ?)
         WHERE id = ?`,
        [item.quantity, item.variant_id],
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
