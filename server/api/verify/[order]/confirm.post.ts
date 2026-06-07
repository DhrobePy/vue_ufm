/**
 * POST /api/verify/:order_number/confirm
 * Public endpoint — no authentication required.
 * Validates a dispatch (or delivery) PIN and updates order status.
 *
 * Body: { pin: string, scan_type?: 'dispatch' | 'delivery' }
 *
 * Status transitions:
 *   dispatch + PIN correct + status = ready_to_ship  →  dispatched
 *   delivery + PIN correct + status = dispatched      →  delivered   (provisioned, off by default)
 */
import { query, getDb } from '~/server/utils/db'

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

  // Load order
  const orders = await query(
    `SELECT id, status, dispatch_pin, delivery_pin FROM credit_orders WHERE order_number = ? LIMIT 1`,
    [orderNumber],
  ) as any[]

  if (!orders.length) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const order = orders[0]
  const pinField    = scan_type === 'delivery' ? 'delivery_pin' : 'dispatch_pin'
  const storedPin   = order[pinField]
  const pinCorrect  = storedPin && String(pin).trim() === String(storedPin).trim()

  // Determine status transition
  let newStatus: string | null = null
  let transitionNote = ''

  if (pinCorrect) {
    if (scan_type === 'dispatch' && order.status === 'ready_to_ship') {
      newStatus      = 'dispatched'
      transitionNote = 'Dispatch confirmed via QR PIN scan'
    } else if (scan_type === 'dispatch' && order.status === 'dispatched') {
      // Already dispatched — rescan is allowed, just acknowledge
      transitionNote = 'Re-scan: order already dispatched'
    } else if (scan_type === 'delivery' && order.status === 'dispatched') {
      newStatus      = 'delivered'
      transitionNote = 'Delivery confirmed via QR PIN scan'
    }
  }

  // Persist scan record + optional status update
  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // ── Status update (primary operation) ──────────────────────────────────
    // Note: we intentionally skip credit_order_workflow here because
    // performed_by_user_id is NOT NULL in production and this is a public
    // endpoint with no authenticated user. The full audit trail lives in
    // order_delivery_scans (pin_correct, ip_address, user_agent, etc.).
    if (newStatus) {
      await conn.query(
        `UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
        [newStatus, order.id],
      )
    }

    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
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
      [order.id, orderNumber, scan_type, String(pin).slice(0, 10), pinCorrect ? 1 : 0,
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

  return {
    ok:             true,
    pin_correct:    true,
    status_updated: !!newStatus,
    new_status:     newStatus ?? order.status,
    message:        newStatus
      ? scan_type === 'dispatch'
        ? '✅ Dispatch confirmed — goods have left the warehouse.'
        : '✅ Delivery confirmed — order marked as delivered.'
      : scan_type === 'dispatch'
        ? `✅ PIN verified. Order is already marked as "${order.status}".`
        : `✅ PIN verified. Current status: "${order.status}".`,
  }
})
