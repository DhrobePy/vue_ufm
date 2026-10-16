import { releaseOrderPayments } from '~/server/utils/advanceCredit'
import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { transitionOrder } from '~/server/utils/creditOrders'
import { recycleBegin, recycleArchiveDelete, recycleSnapshotBefore, recycleFinalize } from '~/server/utils/recycleBin'

/**
 * POST /api/credit-sales/:id/reverse-dispatch   body: { reason }
 * Admin / superadmin only. Undoes Goods on Board — removes the invoice ledger row + journal
 * (archived to the Recycle Bin as one restorable batch), restores the customer balance and puts
 * the order back at Ready to Ship so it can be re-dispatched (e.g. with a dispatcher discount).
 *
 * Refuses unless the reversal is provably clean: no payment/allocation, gate scan, delivery,
 * return or trip, exactly one invoice row + journal, and the invoice is the customer's LATEST
 * ledger row (nothing built on top of it). Otherwise use an Order Amendment credit note.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number(session.user.id)
  const role = String(session.user.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Only admin / superadmin can reverse a dispatch' })

  const reason = String((await readBody(event))?.reason ?? '').trim()
  if (reason.length < 5) throw createError({ statusCode: 400, statusMessage: 'A reason (at least 5 characters) is required' })

  const refuse = (m: string) => { throw createError({ statusCode: 409, statusMessage: m }) }
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[order]] = await conn.query<any>(`SELECT * FROM credit_orders WHERE id = ? FOR UPDATE`, [id])
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    if (order.status !== 'goods_on_board') refuse(`Only an order that is Goods on Board can be reversed (this one is "${order.status}")`)
    if (order.is_other_sales) refuse('Other-Sales orders post COGS and stock drawdown at dispatch, which this reversal does not undo')
    if (Number(order.amount_paid) > 0.005)
      refuse('A payment was taken against this order after dispatch — reversing the invoice would orphan it')

    const count = async (sql: string) => Number((await conn.query<any>(sql, [id]))[0][0]?.c ?? 0)
    if (await count(`SELECT COUNT(*) c FROM payment_allocations WHERE order_id = ? AND released_at IS NULL AND as_advance = 0`)) refuse('Payments are allocated to this order')
    if (await count(`SELECT COUNT(*) c FROM cr_delivery_confirmations WHERE order_id = ?`)) refuse('A gate scan / delivery confirmation exists — the truck may already have left')
    if (await count(`SELECT COUNT(*) c FROM credit_order_deliveries WHERE order_id = ?`)) refuse('Deliveries are recorded for this order')
    if (await count(`SELECT COUNT(*) c FROM credit_order_returns WHERE order_id = ?`)) refuse('A return exists for this order')
    const [[ship]] = await conn.query<any>(`SELECT trip_id FROM credit_order_shipping WHERE order_id = ? LIMIT 1`, [id])
    if (ship?.trip_id) refuse('This order is assigned to a trip — remove it from the trip first')

    const [ledger] = await conn.query<any>(
      `SELECT * FROM customer_ledger WHERE reference_type IN ('credit_order','credit_orders') AND reference_id = ? AND transaction_type = 'invoice'`, [id])
    if (ledger.length !== 1) refuse(`Expected exactly one invoice ledger row (found ${ledger.length}) — not safe to reverse automatically`)
    const led = ledger[0]
    const [[latest]] = await conn.query<any>(`SELECT MAX(id) m FROM customer_ledger WHERE customer_id = ?`, [order.customer_id])
    if (Number(latest.m) !== Number(led.id))
      refuse('Later ledger entries exist for this customer (payments, invoices or adjustments) — use an Order Amendment credit note instead')
    const jeId = led.journal_entry_id ? Number(led.journal_entry_id) : null

    const batch = await recycleBegin(conn, {
      entityType: 'dispatch_reversal', label: `Dispatch invoice reversal — ${order.order_number}`,
      customerId: order.customer_id, userId, userName: String(session.user.name ?? `User ${userId}`),
    })
    await recycleArchiveDelete(conn, batch, 'customer_ledger', 'id', led.id)
    if (jeId) {
      await recycleArchiveDelete(conn, batch, 'transaction_lines', 'journal_entry_id', jeId)
      await recycleArchiveDelete(conn, batch, 'journal_entries', 'id', jeId)
    }
    await recycleSnapshotBefore(conn, batch, 'customers', 'id', order.customer_id)
    await recycleSnapshotBefore(conn, batch, 'credit_orders', 'id', id)

    const [[agg]] = await conn.query<any>(
      `SELECT COALESCE(SUM(debit_amount),0) d, COALESCE(SUM(credit_amount),0) c FROM customer_ledger WHERE customer_id = ?`, [order.customer_id])
    const newBalance = Number(agg.d) - Number(agg.c)
    await conn.query(`UPDATE customers SET current_balance = ?, updated_at = NOW() WHERE id = ?`, [newBalance, order.customer_id])
    await transitionOrder(conn, { orderId: id, from: 'goods_on_board', to: 'ready_to_ship', action: 'dispatch_reversed', userId,
      comment: `Dispatch reversed — reason: ${reason}. Invoice archived in Recycle Bin batch #${batch}; customer balance now ৳${newBalance.toLocaleString()}.` })
    // An advance only ever sat on the order (it was never part of the invoice) — give it back to the customer's advance credit.
    const releasedAdvance = Number(order.advance_paid) > 0.005 ? await releaseOrderPayments(conn, id, userId, order.order_number) : 0
    await recycleFinalize(conn, batch)
    await auditLog(conn, {
      userId, action: 'status_changed', module: 'credit_sales', recordType: 'credit_order', recordId: id,
      referenceNumber: order.order_number, severity: 'critical',
      description: `Dispatch of ${order.order_number} REVERSED → Ready to Ship (Recycle Bin batch #${batch}) — ${reason}`,
    })
    await conn.commit()
    sendTelegram(`↩️ <b>DISPATCH REVERSED</b>\n${order.order_number}\nReason: ${reason}\nBack at Ready to Ship`, 'orders' as any)
    return { ok: true, batch, newBalance }
  } catch (e: any) {
    await conn.rollback()
    if (e?.statusCode) throw e
    throw createError({ statusCode: 500, statusMessage: e?.sqlMessage ?? e?.message ?? 'Reversal failed' })
  } finally {
    conn.release()
  }
})
