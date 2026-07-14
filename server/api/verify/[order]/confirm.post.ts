/**
 * POST /api/verify/:order_number/confirm
 * Public endpoint — no authentication required.
 * Validates a dispatch (or delivery) PIN and updates order status.
 *
 * Status transitions:
 *   dispatch + PIN correct + status = ready_to_ship   →  goods_on_board
 *     (posts the invoice to the ledger — same accounting pivot as the
 *      authenticated dispatch workflow; gate-held orders are refused here
 *      too, never silently skipped)
 *   delivery + PIN correct + status = dispatched        →  delivered   (provisioned, off by default)
 */
import { getDb } from '~/server/utils/db'
import { postGoodsOnBoardInvoice, SYSTEM_USER_ID } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const orderNumber = (event.context.params?.order ?? '').trim().toUpperCase()
  const body = await readBody(event)
  const { pin, scan_type = 'dispatch' } = body ?? {}

  if (!pin) {
    throw createError({ statusCode: 400, statusMessage: 'PIN is required' })
  }
  if (!['dispatch', 'delivery'].includes(scan_type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid scan_type' })
  }

  const ip = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? null
  const ua = getRequestHeader(event, 'user-agent') ?? null

  const db   = getDb()
  const conn = await db.getConnection()
  let newStatus: string | null = null
  let transitionNote = ''
  let pinCorrect = false
  let gateBlockedMessage: string | null = null
  let orderForLog: any = null

  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.status, o.dispatch_pin, o.delivery_pin, o.order_number,
              o.customer_id, o.total_amount, o.balance_due, c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number = ? LIMIT 1 FOR UPDATE`,
      [orderNumber],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    orderForLog = order

    const pinField  = scan_type === 'delivery' ? 'delivery_pin' : 'dispatch_pin'
    const storedPin = order[pinField]
    pinCorrect = !!storedPin && String(pin).trim() === String(storedPin).trim()

    if (pinCorrect) {
      if (scan_type === 'dispatch' && order.status === 'ready_to_ship') {
        // Same accounting pivot as the authenticated workflow — posts the
        // invoice and enforces dispatch-hold gates. A held order must NOT
        // be wave-able through just because someone has the gate PIN.
        try {
          const result = await postGoodsOnBoardInvoice(conn, {
            orderId: order.id,
            orderNumber: order.order_number,
            customerId: order.customer_id,
            customerName: order.customer_name,
            totalAmount: Number(order.total_amount),
            balanceDue: Number(order.balance_due),
            userId: SYSTEM_USER_ID,
            userName: 'QR Gate Scan',
          })
          newStatus = 'goods_on_board'
          transitionNote = 'Goods on board confirmed via QR PIN scan'
          if (!result.alreadyPosted) transitionNote += ' — invoice posted to ledger'
        } catch (gateErr: any) {
          // Gate held: record the refused attempt, but don't change status
          gateBlockedMessage = gateErr?.statusMessage ?? 'Dispatch is on hold — see accounts'
          transitionNote = `Scan refused: ${gateBlockedMessage}`
        }
      } else if (scan_type === 'dispatch' && order.status === 'goods_on_board') {
        transitionNote = 'Re-scan: order already goods on board'
      }
      // NOTE: scan_type 'delivery' never changes status here. Final delivery is
      // confirmed by authorized staff via POST /api/verify/:order/deliver, which
      // performs the full delivery flow (ledger, journal entry, balances).

      if (newStatus) {
        await conn.query(
          `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
          [newStatus, order.id],
        )
        await conn.query(
          `INSERT INTO credit_order_workflow
             (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
           VALUES (?, ?, ?, 'goods_on_board', ?, ?, NOW())`,
          [order.id, order.status, newStatus, SYSTEM_USER_ID, transitionNote],
        )
      }
    }

    await conn.commit()
  } catch (e: any) {
    await conn.rollback()
    if (e?.statusCode) throw e
    throw createError({ statusCode: 500, statusMessage: e?.sqlMessage ?? e?.message ?? 'Scan failed' })
  } finally {
    conn.release()
  }

  // ── Scan audit log (non-fatal — table may not exist yet on older deploys) ─
  try {
    const pool = getDb()
    await pool.query(
      `INSERT INTO order_delivery_scans
         (order_id, order_number, scan_type, pin_used, pin_correct, ip_address, user_agent, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderForLog?.id ?? null, orderNumber, scan_type, String(pin).slice(0, 10), pinCorrect ? 1 : 0,
       ip, ua ? ua.slice(0, 500) : null, transitionNote || null],
    )
  } catch (scanErr) {
    console.warn('[verify/confirm] scan audit log skipped (table may not exist yet):', (scanErr as any)?.message)
  }

  if (!pinCorrect) {
    return {
      ok:          false,
      pin_correct: false,
      message:     'Incorrect PIN. Please check the invoice and try again.',
    }
  }

  if (gateBlockedMessage) {
    return {
      ok:             false,
      pin_correct:    true,
      status_updated: false,
      new_status:     orderForLog?.status ?? null,
      message:        `⛔ ${gateBlockedMessage}`,
    }
  }

  return {
    ok:             true,
    pin_correct:    true,
    status_updated: !!newStatus,
    new_status:     newStatus ?? orderForLog?.status,
    message:        newStatus
      ? scan_type === 'dispatch'
        ? '✅ Goods on board confirmed — invoice posted, goods have left the warehouse.'
        : '✅ Delivery confirmed — order marked as delivered.'
      : scan_type === 'dispatch'
        ? `✅ PIN verified. Order is already marked as "${orderForLog?.status}".`
        : `✅ PIN verified. Current status: "${orderForLog?.status}".`,
  }
})
