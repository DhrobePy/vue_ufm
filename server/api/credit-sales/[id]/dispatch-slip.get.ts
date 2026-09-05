import { getDb } from '~/server/utils/db'
import { getDeliveryQrSecret, deliveryQrSignature } from '~/server/utils/qrDelivery'

/**
 * GET /api/credit-sales/:id/dispatch-slip?delivery_id=N
 * Data for the standalone driver-facing dispatch slip / gate pass print
 * (spec §4.1 dispatch_slip) — order, items, driver/vehicle, one QR. No
 * money fields at all, and unlike /api/verify/:order this is a plain
 * authenticated read: it must NOT log a QR scan or trigger reuse detection,
 * since printing the slip isn't a gate/delivery event.
 *
 * Optional ?delivery_id= scopes the slip to one specific truck's manifest
 * (a credit_order_deliveries row already recorded via the delivery-recording
 * flow) rather than the whole order — for a genuinely multi-truck shipment,
 * each truck gets its own slip + QR, independently gate-scanned and
 * delivery-confirmed. Omitting it prints the original whole-order slip,
 * unchanged.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })
  const deliveryId = Number(getQuery(event).delivery_id) || null

  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const conn = await getDb().getConnection()
  try {
    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.order_number, o.status, o.order_date, o.required_date, o.priority,
              o.shipping_address, o.delivery_type, o.total_weight_kg,
              c.name AS customer_name, c.phone_number AS customer_phone,
              b.name AS branch_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.id = ?`,
      [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    let delivery: any = null
    let items: any[]
    if (deliveryId) {
      const [[d]] = await conn.query<any>(
        `SELECT id, delivery_number, delivery_date, truck_number, driver_name, driver_contact, is_final
         FROM credit_order_deliveries WHERE id = ? AND order_id = ?`,
        [deliveryId, id],
      )
      if (!d) throw createError({ statusCode: 404, statusMessage: 'Delivery record not found for this order' })
      delivery = d
      const [deliveryItems] = await conn.query<any>(
        `SELECT di.qty_delivered AS quantity, p.base_name AS product_name, pv.weight_variant, pv.grade
         FROM credit_order_delivery_items di
         JOIN credit_order_items coi ON coi.id = di.order_item_id
         JOIN products p ON p.id = coi.product_id
         LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE di.delivery_id = ?`,
        [deliveryId],
      )
      items = deliveryItems
    } else {
      const [orderItems] = await conn.query<any>(
        `SELECT coi.quantity, p.base_name AS product_name, pv.weight_variant, pv.grade
         FROM credit_order_items coi
         JOIN products p ON p.id = coi.product_id
         LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE coi.order_id = ?`,
        [id],
      )
      items = orderItems
    }

    const confParams = deliveryId ? [id, deliveryId] : [id]
    const confSql = deliveryId
      ? `SELECT gate_out_at, gate_out_by_name, driver_name, vehicle_number, gate_note,
                confirmed_at, confirmed_by_name, received_by
         FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id <=> ?`
      : `SELECT gate_out_at, gate_out_by_name, driver_name, vehicle_number, gate_note,
                confirmed_at, confirmed_by_name, received_by
         FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id IS NULL`
    const [[conf]] = await conn.query<any>(confSql, confParams)

    let qrSig = ''
    try {
      const secret = await getDeliveryQrSecret(conn)
      qrSig = deliveryQrSignature(order.order_number, secret, deliveryId)
    } catch (e) {
      console.warn('[dispatch-slip] qr_sig generation failed:', e)
    }

    return {
      order: {
        ...order,
        order_date:    String(order.order_date ?? '').slice(0, 10),
        required_date: order.required_date ? String(order.required_date).slice(0, 10) : null,
      },
      delivery: delivery ? {
        id: delivery.id,
        delivery_number: delivery.delivery_number,
        delivery_date: String(delivery.delivery_date ?? '').slice(0, 10),
        truck_number: delivery.truck_number,
        driver_name: delivery.driver_name,
        driver_contact: delivery.driver_contact,
        is_final: !!delivery.is_final,
      } : null,
      items: items.map((i: any) => ({
        product_name:   i.product_name ?? 'Product',
        weight_variant: i.weight_variant ?? null,
        grade:          i.grade ?? null,
        quantity:       Number(i.quantity ?? 0),
      })),
      confirmation: conf ?? null,
      qr_sig: qrSig,
      delivery_id: deliveryId,
    }
  } finally {
    conn.release()
  }
})
