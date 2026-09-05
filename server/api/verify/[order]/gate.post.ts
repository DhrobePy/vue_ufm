/**
 * POST /api/verify/:order_number/gate
 * Two-stage QR delivery, stage 1 (spec §2.8) — goods physically leaving the
 * gate. Requires login + a gate-eligible role, and re-validates the HMAC
 * signature (never trust the GET having already checked it). Captures
 * driver + vehicle at the point the truck actually leaves; blocked while a
 * dispatch hold is uncleared — nothing uncleared leaves the gate.
 *
 * credit_orders.status must already be 'goods_on_board' — the invoice
 * posts separately, at the authenticated "Goods on Board" dispatch action,
 * not here. This scan only marks the truck as having departed (-> shipped).
 *
 * Optional `delivery_id` scopes this gate-out to one specific truck's
 * manifest (a credit_order_deliveries row) for a multi-truck shipment —
 * each truck gets its own cr_delivery_confirmations row and can gate-out
 * independently once the order has already reached 'shipped' from an
 * earlier truck. Omitting it is the original whole-order flow, unchanged.
 */
import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { getOrderGateState, ADMIN_ROLES, ACCOUNTS_ROLES, DISPATCH_ROLES, PRODUCTION_ROLES } from '~/server/utils/creditOrders'
import { verifyDeliveryQrSignature, recordQrScan } from '~/server/utils/qrDelivery'

const GATE_ROLES = [...ADMIN_ROLES, ...ACCOUNTS_ROLES, ...DISPATCH_ROLES, ...PRODUCTION_ROLES]

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Please sign in to continue' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!GATE_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Your role is not authorised to release goods at the gate' })

  const orderNumber = (event.context.params?.order ?? '').trim().toUpperCase()
  const body = await readBody(event)
  const sig          = String(body?.sig ?? '').trim()
  const driverName   = String(body?.driver_name ?? '').trim()
  const vehicleNumber = String(body?.vehicle_number ?? '').trim()
  const gateNote     = body?.gate_note ? String(body.gate_note).trim().slice(0, 500) : null
  const deliveryId   = Number(body?.delivery_id) || null
  const ip = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!sig) throw createError({ statusCode: 400, statusMessage: 'Missing verification parameters' })
  if (!driverName || !vehicleNumber)
    throw createError({ statusCode: 400, statusMessage: 'Enter the driver name and vehicle number to release the goods' })

  const conn = await getDb().getConnection()
  let committedOrder: { id: number; order_number: string } | null = null
  try {
    const sigValid = await verifyDeliveryQrSignature(conn, orderNumber, sig, deliveryId)
    if (!sigValid)
      throw createError({ statusCode: 403, statusMessage: 'Invalid or altered QR code' })

    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT id, order_number, status FROM credit_orders WHERE order_number = ? LIMIT 1 FOR UPDATE`,
      [orderNumber],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const allowedStatuses = deliveryId ? ['goods_on_board', 'shipped'] : ['goods_on_board']
    if (!allowedStatuses.includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `This order is not ready to leave the gate (status: ${order.status.replace(/_/g, ' ')})`,
      })

    const gate = await getOrderGateState(conn, order.id)
    if (gate.dispatchHold && !gate.dispatchCleared)
      throw createError({ statusCode: 423, statusMessage: 'DO NOT RELEASE — this order is HELD and not cleared for dispatch. Clear it in Payment Watch first.' })

    if (deliveryId) {
      const [[delivery]] = await conn.query<any>(
        `SELECT id FROM credit_order_deliveries WHERE id = ? AND order_id = ?`, [deliveryId, order.id],
      )
      if (!delivery) throw createError({ statusCode: 404, statusMessage: 'Delivery record not found for this order' })
    }

    const [[existing]] = await conn.query<any>(
      deliveryId
        ? `SELECT gate_out_at FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id <=> ?`
        : `SELECT gate_out_at FROM cr_delivery_confirmations WHERE order_id = ? AND delivery_id IS NULL`,
      deliveryId ? [order.id, deliveryId] : [order.id],
    )
    if (existing?.gate_out_at)
      throw createError({ statusCode: 409, statusMessage: deliveryId ? 'Gate pass already recorded for this delivery' : 'Gate pass already recorded for this order' })

    if (existing) {
      await conn.query(
        deliveryId
          ? `UPDATE cr_delivery_confirmations
             SET gate_out_at = NOW(), gate_out_by_user_id = ?, gate_out_by_name = ?,
                 driver_name = ?, vehicle_number = ?, gate_note = ?
             WHERE order_id = ? AND delivery_id <=> ?`
          : `UPDATE cr_delivery_confirmations
             SET gate_out_at = NOW(), gate_out_by_user_id = ?, gate_out_by_name = ?,
                 driver_name = ?, vehicle_number = ?, gate_note = ?
             WHERE order_id = ? AND delivery_id IS NULL`,
        deliveryId
          ? [userId, userName, driverName, vehicleNumber, gateNote, order.id, deliveryId]
          : [userId, userName, driverName, vehicleNumber, gateNote, order.id],
      )
    } else {
      await conn.query(
        `INSERT INTO cr_delivery_confirmations
           (order_id, order_number, delivery_id, gate_out_at, gate_out_by_user_id, gate_out_by_name, driver_name, vehicle_number, gate_note)
         VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [order.id, order.order_number, deliveryId, userId, userName, driverName, vehicleNumber, gateNote],
      )
    }

    if (order.status !== 'shipped')
      await conn.query(`UPDATE credit_orders SET status = 'shipped', updated_at = NOW() WHERE id = ?`, [order.id])

    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, 'shipped', 'gate_out', ?, ?, NOW())`,
      [order.id, order.status, userId, `Gate pass — goods released by ${userName} (driver ${driverName}, vehicle ${vehicleNumber})${deliveryId ? ` · delivery #${deliveryId}` : ''}`],
    )

    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        order.id,
      referenceNumber: order.order_number,
      description:     `Gate pass — goods released by ${userName} (driver ${driverName}, vehicle ${vehicleNumber})${deliveryId ? ` · delivery #${deliveryId}` : ''}`,
      severity:        'info',
      ipAddress:       ip,
    })

    await conn.commit()
    committedOrder = { id: order.id, order_number: order.order_number }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }

  // Scan log + notification happen on a fresh pool query, after the gate-pass
  // transaction has already committed — a failure here must never turn an
  // actually-successful gate release into an error response for the client.
  try {
    await recordQrScan(getDb(), {
      orderId: committedOrder.id, orderNumber: committedOrder.order_number, stage: 'gate',
      scannerId: userId, scannerName: userName, ip: ip ?? null,
    })
  } catch (scanErr) {
    console.warn('[verify/gate] scan log failed:', (scanErr as any)?.message)
  }
  sendTelegram(
    `🚪 <b>Gate Pass — Goods Released</b>\n${committedOrder.order_number}\n` +
    `Driver: ${driverName} · Vehicle: ${vehicleNumber}\nBy ${userName}`,
  'dispatch')

  return { ok: true, message: 'Gate pass recorded — goods released. Scan again at the customer to confirm delivery.' }
})
