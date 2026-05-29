import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    delivery_date,
    truck_number,
    driver_name,
    driver_contact,
    is_final,
    notes,
    items,   // [{ order_item_id, product_id, variant_id, qty_delivered, unit_price }]
  } = body ?? {}

  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No delivery items provided' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Verify order exists
    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, status FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    // Generate delivery number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_order_deliveries WHERE DATE(created_at) = CURDATE()`,
    )
    const seq     = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const delNo   = `DEL-${today}-${seq}`

    const totalQty    = items.reduce((s: number, i: any) => s + Number(i.qty_delivered), 0)
    const totalAmount = items.reduce((s: number, i: any) => s + Number(i.qty_delivered) * Number(i.unit_price), 0)

    // Insert delivery header
    const [result] = await conn.query<any>(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        delNo, id, order.customer_id,
        delivery_date ?? new Date().toISOString().slice(0, 10),
        truck_number ?? null, driver_name ?? null, driver_contact ?? null,
        totalQty, totalAmount, is_final ? 1 : 0, notes ?? null, userId,
      ],
    )
    const deliveryId = result.insertId

    // Insert delivery items
    for (const item of items) {
      await conn.query(
        `INSERT INTO credit_order_delivery_items
           (delivery_id, order_item_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          deliveryId,
          item.order_item_id,
          item.product_id,
          item.variant_id ?? null,
          Number(item.qty_delivered),
          Number(item.unit_price),
          Number(item.qty_delivered) * Number(item.unit_price),
        ],
      )
    }

    // Update order status if final delivery
    if (is_final) {
      await conn.query(
        `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`, [id],
      )
    } else {
      // Partial — mark as in-delivery if not already
      await conn.query(
        `UPDATE credit_orders SET status = CASE WHEN status = 'in_production' THEN 'produced' ELSE status END,
                                  updated_at = NOW() WHERE id = ?`,
        [id],
      )
    }

    await conn.commit()
    return { ok: true, delivery_number: delNo, delivery_id: deliveryId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
