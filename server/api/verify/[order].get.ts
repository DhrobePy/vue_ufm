/**
 * GET /api/verify/:order_number?sig=...&delivery_id=N
 * Two-stage QR delivery (spec §2.8). Requires a logged-in ERP session (every
 * scan records who did it) AND a valid HMAC signature binding the order
 * number — the URL only works if it was actually printed on that order's
 * gate pass, not guessed. Never returns invoice amounts: whoever is at the
 * gate or the customer's door doesn't need to see the order value.
 *
 * Optional `delivery_id` scopes everything (signature, items, confirmation
 * state) to one specific truck's manifest for a multi-truck shipment —
 * omitting it is the original whole-order QR, unchanged.
 */
import { getDb } from '~/server/utils/db'
import { getOrderGateState, ADMIN_ROLES, ACCOUNTS_ROLES, DISPATCH_ROLES, PRODUCTION_ROLES } from '~/server/utils/creditOrders'
import { verifyDeliveryQrSignature, recordQrScan } from '~/server/utils/qrDelivery'

const GATE_ROLES = [...ADMIN_ROLES, ...ACCOUNTS_ROLES, ...DISPATCH_ROLES, ...PRODUCTION_ROLES]

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Please sign in to continue' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const orderNumber = (event.context.params?.order ?? '').trim().toUpperCase()
  const q   = getQuery(event)
  const sig = String(q.sig ?? '').trim()
  const deliveryId = Number(q.delivery_id) || null
  if (!orderNumber || !sig)
    throw createError({ statusCode: 400, statusMessage: 'Missing verification parameters' })

  const conn = await getDb().getConnection()
  try {
    const sigValid = await verifyDeliveryQrSignature(conn, orderNumber, sig, deliveryId)
    if (!sigValid)
      throw createError({ statusCode: 403, statusMessage: 'Invalid or altered QR code — this is not a genuine dispatch slip' })

    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.order_number, o.status, o.order_date, o.required_date, o.created_at,
              c.name AS customer_name, b.name AS branch_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.order_number = ? LIMIT 1`,
      [orderNumber],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'No order found for this code' })

    let deliveryNumber: string | null = null
    let items: any[]
    if (deliveryId) {
      const [[delivery]] = await conn.query<any>(
        `SELECT delivery_number FROM credit_order_deliveries WHERE id = ? AND order_id = ?`,
        [deliveryId, order.id],
      )
      if (!delivery) throw createError({ statusCode: 404, statusMessage: 'Delivery record not found for this order' })
      deliveryNumber = delivery.delivery_number
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
        [order.id],
      )
      items = orderItems
    }

    const [[conf]] = await conn.query<any>(
      deliveryId
        ? `SELECT * FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id <=> ?`
        : `SELECT * FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id IS NULL`,
      deliveryId ? [order.id, deliveryId] : [order.id],
    )
    const gateOut    = !!conf?.gate_out_at
    const delivered  = !!conf?.confirmed_at
    const stage      = delivered ? 'done' : gateOut ? 'delivery' : 'gate'

    const gate = await getOrderGateState(conn, order.id)
    const dispatchOk = !gate.dispatchHold || gate.dispatchCleared

    const [scans] = await conn.query<any>(
      `SELECT stage, reused, scanned_by_name, scanned_at FROM cr_qr_scan_log
       WHERE order_id = ? ORDER BY scanned_at DESC LIMIT 20`,
      [order.id],
    )

    // GET = an actual scan. Log it and detect reuse.
    const ip = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? null
    const scanTotal = await recordQrScan(conn, {
      orderId: order.id, orderNumber: order.order_number, stage,
      scannerId: userId, scannerName: userName, ip,
    })

    const isGateRole = ADMIN_ROLES.includes(role) || GATE_ROLES.includes(role)

    // Delivery-confirm authority — same setting-driven list the manual flow already uses.
    let canDeliver = ADMIN_ROLES.includes(role)
    if (!canDeliver) {
      try {
        const [[settingsRow]] = await conn.query<any>(
          `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`,
        )
        const ids: number[] = settingsRow?.setting_value
          ? (JSON.parse(settingsRow.setting_value).delivery_confirm_user_ids ?? [])
          : []
        canDeliver = ids.map(Number).includes(userId)
      } catch { /* setting not configured — canDeliver stays false */ }
    }

    return {
      stage,
      delivery_id: deliveryId,
      delivery_number: deliveryNumber,
      order: {
        order_number:  order.order_number,
        status:        order.status,
        order_date:    String(order.order_date ?? '').slice(0, 10),
        required_date: order.required_date ? String(order.required_date).slice(0, 10) : null,
        customer_name: order.customer_name ?? '—',
        branch_name:   order.branch_name ?? '—',
      },
      items: items.map((i: any) => ({
        product_name:   i.product_name ?? 'Product',
        weight_variant: i.weight_variant ?? null,
        grade:          i.grade ?? null,
        quantity:       Number(i.quantity ?? 0),
      })),
      confirmation: conf ? {
        gate_out_at:       conf.gate_out_at,
        gate_out_by_name:  conf.gate_out_by_name,
        driver_name:       conf.driver_name,
        vehicle_number:    conf.vehicle_number,
        gate_note:         conf.gate_note,
        confirmed_at:      conf.confirmed_at,
        confirmed_by_name: conf.confirmed_by_name,
        received_by:       conf.received_by,
        note:              conf.note,
      } : null,
      dispatch_ok: dispatchOk,
      can_gate:    isGateRole,
      can_deliver: canDeliver,
      scan_total:  scanTotal,
      is_reuse:    stage === 'done',
      scans: scans.map((s: any) => ({
        stage: s.stage, reused: !!s.reused, scanned_by_name: s.scanned_by_name, scanned_at: s.scanned_at,
      })),
    }
  } finally {
    conn.release()
  }
})
