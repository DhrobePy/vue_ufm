import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { getUserActionLimit, nextDocNumber, isAdminRole } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const role      = ((session.user as any).role ?? '').toLowerCase()
  const canDeliver = ['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra',
    'dispatch-srg', 'dispatch-demra', 'dispatchpos-srg', 'dispatchpos-demra'].includes(role)
  if (!canDeliver)
    throw createError({ statusCode: 403, statusMessage: 'Your role cannot record deliveries' })
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

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

    // Verify order exists and is actually goods-on-board (locked against races)
    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.customer_id, o.status, o.order_number, o.order_date
       FROM credit_orders o WHERE o.id = ? FOR UPDATE`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (!['goods_on_board', 'shipped', 'delivered'].includes(order.status))
      throw createError({
        statusCode: 409,
        statusMessage: `Order is "${order.status}" — mark goods on board first (deliveries only after that)`,
      })

    // Generate delivery number
    const delNo = await nextDocNumber(conn, 'DEL', 'credit_order_deliveries', 'delivery_number')

    const totalQty    = items.reduce((s: number, i: any) => s + Number(i.qty_delivered), 0)
    const totalAmount = items.reduce((s: number, i: any) => s + Number(i.qty_delivered) * Number(i.unit_price), 0)
    const delivDate   = delivery_date ?? new Date().toISOString().slice(0, 10)

    // Per-action partial_delivery ৳ cap (admin exempt). Only enforced when a
    // cap is explicitly configured — this action has no legacy-column fallback.
    if (!['admin', 'superadmin'].includes(role)) {
      const deliveryCap = await getUserActionLimit(conn, userId, 'partial_delivery')
      if (deliveryCap !== null && totalAmount > deliveryCap) {
        throw createError({
          statusCode: 403,
          statusMessage: `Delivery value ৳${totalAmount.toLocaleString()} exceeds your partial-delivery limit of ৳${deliveryCap.toLocaleString()} — ask a user with higher authority to record it`,
        })
      }
    }

    // Insert delivery header
    const [result] = await conn.query<any>(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          truck_number, driver_name, driver_contact,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        delNo, id, order.customer_id,
        delivDate,
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

    // NOTE: NO ledger / JE here. The invoice (full order value) posts to
    // customer_ledger + GL at DISPATCH (workflow ship transition) — the
    // accounting pivot. Deliveries only record physical movement.

    // ── Quantity-shortfall guard ──────────────────────────────────────────
    // A caller can submit is_final=true with items that don't actually cover
    // everything still owed (mismatched form data, a stale draft, a direct
    // API call) — force-closing the order as "delivered" while real units
    // remain outstanding, with no trace of the shortfall. Compute the true
    // remaining quantity across every line (ordered − delivered-to-date,
    // including this submission) and refuse to finalize silently.
    let shortfallItems: { product_id: number; variant_id: number | null; qty_short: number }[] = []
    if (is_final) {
      const [allItems] = await conn.query<any>(
        `SELECT oi.id AS order_item_id, oi.product_id, oi.variant_id, oi.quantity,
                COALESCE((
                  SELECT SUM(di.qty_delivered)
                  FROM credit_order_delivery_items di
                  JOIN credit_order_deliveries d ON d.id = di.delivery_id
                  WHERE di.order_item_id = oi.id AND d.order_id = oi.order_id
                ), 0) AS qty_delivered_prior
         FROM credit_order_items oi WHERE oi.order_id = ?`,
        [id],
      )
      const thisSubmission = new Map<number, number>()
      for (const it of items) thisSubmission.set(Number(it.order_item_id), (thisSubmission.get(Number(it.order_item_id)) ?? 0) + Number(it.qty_delivered))
      shortfallItems = allItems
        .map((oi: any) => ({
          product_id: oi.product_id, variant_id: oi.variant_id,
          qty_short: Number(oi.quantity) - Number(oi.qty_delivered_prior) - (thisSubmission.get(oi.order_item_id) ?? 0),
        }))
        .filter((oi: any) => oi.qty_short > 0.005)

      if (shortfallItems.length) {
        const totalShort = shortfallItems.reduce((s, i) => s + i.qty_short, 0)
        if (!isAdminRole(role)) {
          throw createError({
            statusCode: 409,
            statusMessage: `${totalShort.toLocaleString()} units across ${shortfallItems.length} item(s) are still undelivered — record another partial delivery instead of marking this final, or ask an admin to override.`,
          })
        }
        if (!body?.confirm_shortfall) {
          throw createError({
            statusCode: 409,
            statusMessage: `${totalShort.toLocaleString()} units are still undelivered. Confirm you intend to close this order anyway (confirm_shortfall) — the shortfall will be recorded, not hidden.`,
          })
        }
      }
    }

    // Update order status + write workflow timeline entry
    const wfToStatus = is_final ? 'delivered' : order.status
    const wfAction   = is_final ? 'delivered' : 'partial_delivery'
    const wfComment  = `${is_final ? 'Final' : 'Partial'} delivery ${delNo} — ${totalQty} bags · ৳${totalAmount.toLocaleString()}${truck_number ? ` · Truck ${truck_number}` : ''}` +
      (shortfallItems.length ? ` · ⚠ closed with ${shortfallItems.reduce((s, i) => s + i.qty_short, 0).toLocaleString()} units short (admin override, confirmed)` : '')

    if (is_final) {
      await conn.query(
        `UPDATE credit_orders SET status = 'delivered', updated_at = NOW() WHERE id = ?`, [id],
      )
    }

    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, wfToStatus, wfAction, userId, wfComment],
    )

    // ── System audit log ───────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          wfAction,       // 'delivered' or 'partial_delivery' → maps to 'dispatched'
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: delNo,
      description:     `${is_final ? 'Final' : 'Partial'} delivery ${delNo} for Order ${order.order_number} — ${totalQty} bags · ৳${totalAmount.toLocaleString()}${truck_number ? ` · Truck ${truck_number}` : ''}`,
      severity:        'info',
      ipAddress,
    })

    await conn.commit()
    return { ok: true, delivery_number: delNo, delivery_id: deliveryId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
