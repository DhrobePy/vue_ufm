import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { nextDocNumber, ACCOUNTS_ROLES, DISPATCH_ROLES } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

const ELIGIBLE = ['goods_on_board', 'shipped', 'dispatched', 'delivered']

/**
 * POST /api/credit-sales/:id/over-delivery
 * Record goods delivered beyond what was ordered (spec §2.9).
 * Maker/checker: always lands 'pending' — a DIFFERENT authorised user must
 * approve via the decide endpoint.
 */
export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role   = ((session.user as any).role ?? '').toLowerCase()

  const canRecord = await userCanAction({
    userId, role, module: 'credit_sales', page: 'all', action: 'record_over_delivery',
    roleFallback: [...ACCOUNTS_ROLES, ...DISPATCH_ROLES],
  })
  if (!canRecord)
    throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to record over-deliveries' })

  const {
    od_date,
    resolution = 'bill',
    notes,
    items,   // [{ order_item_id, product_id, variant_id, extra_qty, unit_price }]
  } = body ?? {}

  if (!['bill', 'retrieve', 'writeoff'].includes(resolution))
    throw createError({ statusCode: 400, statusMessage: 'resolution must be bill | retrieve | writeoff' })
  if (!items?.length)
    throw createError({ statusCode: 400, statusMessage: 'No over-delivery items provided' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, order_number, status FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (!ELIGIBLE.includes(order.status))
      throw createError({ statusCode: 409, statusMessage: `Order must be goods-on-board or later (current: ${order.status})` })

    const odNo   = await nextDocNumber(conn, 'OD', 'credit_order_over_deliveries')
    const odDate = od_date || new Date().toISOString().slice(0, 10)

    const totalQty    = items.reduce((s: number, i: any) => s + Number(i.extra_qty), 0)
    const totalAmount = items.reduce((s: number, i: any) => s + Number(i.extra_qty) * Number(i.unit_price), 0)
    if (totalQty <= 0) throw createError({ statusCode: 400, statusMessage: 'Enter at least one extra quantity' })

    const [res] = await conn.query<any>(
      `INSERT INTO credit_order_over_deliveries
         (od_number, order_id, customer_id, od_date, total_extra_qty, total_extra_amount,
          resolution, notes, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [odNo, id, order.customer_id, odDate, totalQty, totalAmount, resolution, notes ?? null, userId],
    )
    const odId = res.insertId

    for (const it of items) {
      await conn.query(
        `INSERT INTO credit_order_over_delivery_items
           (od_id, order_item_id, product_id, variant_id, extra_qty, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          odId, it.order_item_id ?? null, it.product_id ?? null, it.variant_id ?? null,
          Number(it.extra_qty), Number(it.unit_price), Number(it.extra_qty) * Number(it.unit_price),
        ],
      )
    }

    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, 'over_delivery_submitted', ?, ?, NOW())`,
      [id, order.status, order.status, userId,
       `${odNo} — ${totalQty} bags extra · ৳${totalAmount.toLocaleString()} · resolution: ${resolution} · pending approval`],
    )
    await auditLog(conn, {
      userId, action: 'other', module: 'credit_sales',
      recordType: 'credit_order_over_delivery', recordId: id, referenceNumber: odNo,
      description: `Over-delivery ${odNo} for Order ${order.order_number} — ${totalQty} bags · ৳${totalAmount.toLocaleString()} (${resolution}) · pending approval`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(
      `📦 <b>Over-Delivery Recorded</b>\n${odNo} — Order ${order.order_number}\n` +
      `${totalQty} bags extra · ৳${totalAmount.toLocaleString()} · resolution: ${resolution}\nPending approval`,
    )
    return { ok: true, od_number: odNo, od_id: odId, status: 'pending', amount: totalAmount }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
