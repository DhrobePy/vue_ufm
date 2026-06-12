/**
 * GET /api/verify/:order_number
 * Public endpoint — no authentication required.
 * Returns order status + scan history for the QR delivery verification page.
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const orderNumber = (event.context.params?.order ?? '').trim().toUpperCase()

  if (!orderNumber) {
    throw createError({ statusCode: 400, statusMessage: 'Order number is required' })
  }

  const orders = await query(
    `SELECT o.id, o.order_number, o.status, o.order_date, o.required_date,
            o.total_amount, o.amount_paid, o.balance_due,
            o.shipping_address, o.special_instructions,
            o.dispatch_pin IS NOT NULL AS has_dispatch_pin,
            o.created_at,
            c.name AS customer_name,
            b.name AS branch_name
     FROM credit_orders o
     LEFT JOIN customers  c ON c.id = o.customer_id
     LEFT JOIN branches   b ON b.id = o.assigned_branch_id
     WHERE o.order_number = ?
     LIMIT 1`,
    [orderNumber],
  ) as any[]

  if (!orders.length) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const order = orders[0]

  // Line items — what the dispatcher / delivery staff verifies against the goods
  const items = await query(
    `SELECT oi.quantity, oi.unit_price, oi.line_total,
            p.base_name AS product_name,
            pv.weight_variant, pv.grade, pv.sku
     FROM credit_order_items oi
     LEFT JOIN products         p  ON p.id  = oi.product_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE oi.order_id = ?
     ORDER BY oi.id`,
    [order.id],
  ) as any[]

  // Fetch scan history (most recent first, max 30)
  const scans = await query(
    `SELECT scan_type, pin_correct, scanned_at, notes
     FROM order_delivery_scans
     WHERE order_number = ?
     ORDER BY scanned_at DESC
     LIMIT 30`,
    [orderNumber],
  ) as any[]

  // Log this view scan (non-fatal)
  const ip = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? null
  const ua = getRequestHeader(event, 'user-agent') ?? null
  query(
    `INSERT INTO order_delivery_scans (order_id, order_number, scan_type, pin_correct, ip_address, user_agent)
     VALUES (?, ?, 'view', 0, ?, ?)`,
    [order.id, orderNumber, ip, ua ? ua.slice(0, 500) : null],
  ).catch(() => {})

  return {
    order: {
      id:             order.id,
      order_number:   order.order_number,
      status:         order.status,
      order_date:     String(order.order_date ?? '').slice(0, 10),
      required_date:  order.required_date ? String(order.required_date).slice(0, 10) : null,
      total_amount:   Number(order.total_amount ?? 0),
      amount_paid:    Number(order.amount_paid  ?? 0),
      balance_due:    Number(order.balance_due  ?? 0),
      customer_name:  order.customer_name ?? '—',
      branch_name:    order.branch_name   ?? '—',
      has_dispatch_pin: !!order.has_dispatch_pin,
      created_at:     order.created_at,
    },
    items: items.map(i => ({
      product_name:   i.product_name ?? 'Product',
      weight_variant: i.weight_variant ?? null,
      grade:          i.grade ?? null,
      sku:            i.sku ?? null,
      quantity:       Number(i.quantity ?? 0),
      unit_price:     Number(i.unit_price ?? 0),
      line_total:     Number(i.line_total ?? 0),
    })),
    scans: scans.map(s => ({
      scan_type:   s.scan_type,
      pin_correct: !!s.pin_correct,
      scanned_at:  s.scanned_at,
      notes:       s.notes ?? null,
    })),
  }
})
