/**
 * POST /api/verify/:order_number/deliver
 * Two-stage QR delivery, stage 2 (spec §2.8) — confirms FINAL delivery at
 * the customer. Requires a logged-in ERP session, a valid HMAC signature,
 * AND the gate stage already recorded for this order (goods must have
 * actually left before they can be "delivered"). The user must be
 * admin/superadmin or listed in delivery_confirm_user_ids (Settings →
 * Delivery) — drivers never confirm delivery themselves.
 *
 * Performs the REAL delivery: delivery record for all remaining
 * undelivered items, status → delivered. NO ledger/JE here — the invoice
 * posted at Goods on Board, the accounting pivot; this only confirms
 * physical handover. Mirrors /api/credit-sales/:id/deliver (is_final = true).
 */
import { query, getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { verifyDeliveryQrSignature, recordQrScan } from '~/server/utils/qrDelivery'

export default defineEventHandler(async (event) => {
  const orderNumber = (event.context.params?.order ?? '').trim().toUpperCase()
  const body = await readBody(event)
  const sig        = String(body?.sig ?? '').trim()
  const receivedBy = body?.received_by ? String(body.received_by).trim().slice(0, 150) : null
  const note        = body?.note ? String(body.note).trim().slice(0, 500) : null

  // ── Authorization ─────────────────────────────────────────────────────────
  const session = await getUserSession(event)
  const user    = session?.user as any
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Login required to confirm delivery' })
  }
  const role = (user.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`,
    ) as any[]
    let ids: number[] = []
    try {
      ids = rows[0]?.setting_value
        ? (JSON.parse(rows[0].setting_value).delivery_confirm_user_ids ?? [])
        : []
    } catch { /* ignore */ }
    if (!ids.map(Number).includes(Number(user.id))) {
      throw createError({ statusCode: 403, statusMessage: 'You are not authorized to confirm deliveries' })
    }
  }
  const userId   = Number(user.id)
  const userName = user.display_name ?? user.name ?? `user #${userId}`
  const ip = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!sig) throw createError({ statusCode: 400, statusMessage: 'Missing verification parameters' })
  const sigValid = await verifyDeliveryQrSignature(getDb(), orderNumber, sig)
  if (!sigValid) throw createError({ statusCode: 403, statusMessage: 'Invalid or altered QR code' })

  // ── Load order ────────────────────────────────────────────────────────────
  const orders = await query(
    `SELECT o.id, o.customer_id, o.status, o.order_number, o.order_date, c.name AS customer_name
     FROM credit_orders o JOIN customers c ON c.id = o.customer_id
     WHERE o.order_number = ? LIMIT 1`,
    [orderNumber],
  ) as any[]
  if (!orders.length) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  const order = orders[0]

  if (!['goods_on_board', 'shipped'].includes(order.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: order.status === 'delivered' || order.status === 'completed'
        ? 'Order is already delivered'
        : `Order must be goods-on-board or shipped first (current status: ${order.status})`,
    })
  }

  const [confRows] = await getDb().query<any>(
    `SELECT gate_out_at, confirmed_at FROM cr_delivery_confirmations WHERE order_id = ?`, [order.id],
  )
  const conf = confRows?.[0]
  if (!conf?.gate_out_at)
    throw createError({ statusCode: 409, statusMessage: 'Gate pass has not been recorded for this order yet — scan at the gate first.' })
  if (conf.confirmed_at)
    throw createError({ statusCode: 409, statusMessage: 'Delivery already confirmed for this order' })

  // ── Remaining undelivered items ───────────────────────────────────────────
  const items = await query(
    `SELECT oi.id AS order_item_id, oi.product_id, oi.variant_id,
            oi.quantity, oi.unit_price,
            COALESCE((
              SELECT SUM(di.qty_delivered)
              FROM credit_order_delivery_items di
              JOIN credit_order_deliveries d ON d.id = di.delivery_id
              WHERE di.order_item_id = oi.id AND d.order_id = oi.order_id
            ), 0) AS qty_already_delivered
     FROM credit_order_items oi
     WHERE oi.order_id = ?`,
    [order.id],
  ) as any[]

  const remaining = items
    .map(i => ({ ...i, qty_remaining: Number(i.quantity) - Number(i.qty_already_delivered) }))
    .filter(i => i.qty_remaining > 0)

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    let delNo: string | null = null

    if (remaining.length) {
      // Delivery number (same scheme as the manual flow)
      const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const [[cnt]] = await conn.query<any>(
        `SELECT COUNT(*) AS n FROM credit_order_deliveries WHERE DATE(created_at) = CURDATE()`,
      )
      delNo = `DEL-${today}-${String((cnt.n ?? 0) + 1).padStart(4, '0')}`

      const totalQty    = remaining.reduce((s, i) => s + i.qty_remaining, 0)
      const totalAmount = remaining.reduce((s, i) => s + i.qty_remaining * Number(i.unit_price), 0)
      const delivDate   = new Date().toISOString().slice(0, 10)

      const [result] = await conn.query<any>(
        `INSERT INTO credit_order_deliveries
           (delivery_number, order_id, customer_id, delivery_date,
            truck_number, driver_name, driver_contact,
            total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
         VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, ?, 1, ?, ?)`,
        [delNo, order.id, order.customer_id, delivDate,
         totalQty, totalAmount, `Final delivery confirmed via QR scan by ${userName}`, userId],
      )
      const deliveryId = result.insertId

      for (const item of remaining) {
        await conn.query(
          `INSERT INTO credit_order_delivery_items
             (delivery_id, order_item_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [deliveryId, item.order_item_id, item.product_id, item.variant_id ?? null,
           item.qty_remaining, Number(item.unit_price), item.qty_remaining * Number(item.unit_price)],
        )
      }

      // NOTE: NO ledger / JE here — the invoice posted at DISPATCH (the
      // accounting pivot). QR delivery only confirms physical handover.
    }

    // Status + workflow (authenticated user → NOT NULL constraint satisfied)
    await conn.query(
      `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`,
      [order.id],
    )
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, 'delivered', 'delivered', ?, ?, NOW())`,
      [order.id, order.status, userId,
       delNo ? `Final delivery ${delNo} confirmed via QR scan` : 'Delivery confirmed via QR scan (all items already delivered)'],
    )

    await conn.query(
      `UPDATE cr_delivery_confirmations
       SET confirmed_at = NOW(), confirmed_by_user_id = ?, confirmed_by_name = ?, received_by = ?, note = ?
       WHERE order_id = ? AND confirmed_at IS NULL`,
      [userId, userName, receivedBy, note, order.id],
    )

    await auditLog(conn, {
      userId,
      action:          'delivered',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        order.id,
      referenceNumber: delNo ?? order.order_number,
      description:     `Final delivery for Order ${order.order_number} confirmed via QR scan by ${userName}` + (receivedBy ? ` — received by ${receivedBy}` : ''),
      severity:        'info',
      ipAddress:       ip,
    })

    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }

  sendTelegram(
    `✅ <b>Delivery Confirmed</b>\n${order.order_number} — ${order.customer_name ?? ''}\n` +
    `By ${userName}${receivedBy ? ` · Received by ${receivedBy}` : ''}`,
  'dispatch')

  // Scan audit trail (non-fatal)
  try {
    await recordQrScan(getDb(), {
      orderId: order.id, orderNumber, stage: 'delivery',
      scannerId: userId, scannerName: userName, ip: ip ?? null,
    })
  } catch (scanErr) {
    console.warn('[verify/deliver] scan audit log skipped:', (scanErr as any)?.message)
  }

  return {
    ok:         true,
    new_status: 'delivered',
    message:    '✅ Delivery confirmed — order marked as delivered.',
  }
})
