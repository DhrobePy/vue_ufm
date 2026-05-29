import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    customer_id,
    branch_id,
    order_date,
    required_date,
    priority,
    delivery_address,
    special_notes,
    amount_paid,    // advance
    items,          // [{ variant_id, qty_bags, unit_price, discount_amount }]
  } = body ?? {}

  if (!customer_id || !items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'customer_id and items are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Generate order number: CR-YYYYMMDD-NNNN
    const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_orders WHERE DATE(created_at) = CURDATE()`,
    )
    const seq      = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const orderNo  = `CR-${today}-${seq}`

    // Compute totals from items
    let totalAmount = 0
    for (const it of items) {
      const line = (Number(it.qty_bags) * Number(it.unit_price)) - Number(it.discount_amount ?? 0)
      totalAmount += line
    }
    const balanceDue = totalAmount - Number(amount_paid ?? 0)

    const [result] = await conn.query<any>(
      `INSERT INTO credit_orders
         (order_number, customer_id, branch_id, order_date, required_date, priority,
          status, delivery_address, special_notes,
          total_amount, amount_paid, balance_due,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_approval', ?, ?,
               ?, ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo, customer_id, branch_id ?? null,
        order_date, required_date ?? null, priority ?? 'normal',
        delivery_address ?? null, special_notes ?? null,
        totalAmount, Number(amount_paid ?? 0), balanceDue,
        userId,
      ],
    )

    const orderId = result.insertId

    // Insert line items
    for (const it of items) {
      const lineTotal = (Number(it.qty_bags) * Number(it.unit_price)) - Number(it.discount_amount ?? 0)
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, qty_bags, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, it.product_id ?? null, it.variant_id ?? null,
          it.qty_bags, it.unit_price, it.discount_amount ?? 0, lineTotal,
        ],
      )
    }

    // Initial workflow entry
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, NULL, 'pending_approval', 'created', ?, 'Order created', NOW())`,
      [orderId, userId],
    )

    await conn.commit()
    return { ok: true, id: orderId, order_number: orderNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
