import { getOrderGateState } from '~/server/utils/creditOrders'

/**
 * Advance credit = money a customer has already paid that is not yet attached to an order.
 *
 * The customer LEDGER already carries every payment as a credit the moment it is taken, so allotting
 * an advance never touches the ledger or the GL — it only decides which order (or the opening due)
 * the money is counted against, so each order's own balance_due / dispatch hold tell the truth.
 *
 * Which payments count as advance credit:
 *   - payments made in this app (id >= 1,000,000) that are on account or only partly allotted
 *   - payments imported from the legacy app of type 'advance' (legacy never auto-consumed them)
 * Imported legacy "invoice payments" are NOT offered — they settled old invoices.
 * Reversed payments, and payments tied directly to a single order, are never offered.
 */
export const DISPATCHED_STATUSES = ['goods_on_board', 'shipped', 'dispatched', 'delivered', 'completed']
const OPEN_STATUSES = ['pending_approval', 'escalated', 'approved', 'in_production', 'produced', 'ready_to_ship', ...DISPATCHED_STATUSES.filter(s => s !== 'completed')]
const NATIVE_FROM = 1_000_000

export interface AdvancePayment {
  id: number; payment_number: string; payment_date: string; amount: number; method: string
  remaining: number; legacy: boolean
}
export interface OpenOrder {
  id: number; order_number: string; order_date: string; status: string; total_amount: number; balance_due: number
}
export interface Allotment { payment_id: number; target: 'order' | 'opening'; order_id?: number; amount: number }

const r2 = (n: number) => Math.round(n * 100) / 100

export async function getAdvanceCredit(conn: any, customerId: number, lock = false) {
  const [pays] = await conn.query(
    `SELECT p.id, p.payment_number, p.payment_date, p.amount, p.payment_method,
            COALESCE((SELECT SUM(a.allocated_amount) FROM payment_allocations a
                      WHERE a.payment_id = p.id AND a.released_at IS NULL), 0) AS alloc
     FROM customer_payments p
     WHERE p.customer_id = ? AND p.reversed_at IS NULL AND p.order_id IS NULL
       AND (p.payment_type = 'advance' OR p.id >= ?)
       AND COALESCE(p.payment_type, '') <> 'refund'
     ORDER BY p.payment_date ASC, p.id ASC ${lock ? 'FOR UPDATE' : ''}`,
    [customerId, NATIVE_FROM],
  )
  const payments: AdvancePayment[] = pays
    .map((p: any) => ({
      id: Number(p.id), payment_number: p.payment_number, payment_date: String(p.payment_date).slice(0, 10),
      amount: Number(p.amount), method: p.payment_method, remaining: r2(Number(p.amount) - Number(p.alloc)),
      legacy: Number(p.id) < NATIVE_FROM,
    }))
    .filter((p: AdvancePayment) => p.remaining > 0.005)

  const [orders] = await conn.query(
    `SELECT id, order_number, order_date, status, total_amount, balance_due FROM credit_orders
     WHERE customer_id = ? AND status IN (${OPEN_STATUSES.map(() => '?').join(',')}) AND balance_due > 0.005
     ORDER BY order_date ASC, id ASC`,
    [customerId, ...OPEN_STATUSES],
  )
  const openOrders: OpenOrder[] = orders.map((o: any) => ({
    id: Number(o.id), order_number: o.order_number, order_date: String(o.order_date).slice(0, 10), status: o.status,
    total_amount: Number(o.total_amount), balance_due: Number(o.balance_due),
  }))

  const [[cust]] = await conn.query(`SELECT initial_due FROM customers WHERE id = ?`, [customerId])
  const [[set]] = await conn.query(
    `SELECT COALESCE(SUM(a.allocated_amount), 0) s FROM payment_allocations a
     JOIN customer_payments p ON p.id = a.payment_id
     WHERE p.customer_id = ? AND a.target = 'opening' AND a.released_at IS NULL`, [customerId])
  const openingDue = Math.max(0, r2(Number(cust?.initial_due ?? 0) - Number(set?.s ?? 0)))

  return {
    payments, openOrders, openingDue,
    total: r2(payments.reduce((s, p) => s + p.remaining, 0)),
  }
}

/** FIFO plan: oldest advance → oldest open order (nearest placed first), then the opening due (or the reverse). */
export function suggestAllotment(
  credit: { payments: AdvancePayment[]; openOrders: OpenOrder[]; openingDue: number },
  strategy: 'orders_first' | 'opening_first' = 'orders_first',
  opts: { onlyNative?: boolean; onlyOrderId?: number } = {},
): Allotment[] {
  const pays = credit.payments.filter(p => !(opts.onlyNative && p.legacy)).map(p => ({ ...p }))
  const orders = credit.openOrders.filter(o => !opts.onlyOrderId || o.id === opts.onlyOrderId).map(o => ({ ...o }))
  let opening = opts.onlyOrderId ? 0 : credit.openingDue
  const out: Allotment[] = []
  const targets: Array<{ kind: 'order'; o: OpenOrder } | { kind: 'opening' }> = []
  const orderT = orders.map(o => ({ kind: 'order' as const, o }))
  if (strategy === 'opening_first') { if (opening > 0) targets.push({ kind: 'opening' }); targets.push(...orderT) }
  else { targets.push(...orderT); if (opening > 0) targets.push({ kind: 'opening' }) }

  for (const t of targets) {
    for (const p of pays) {
      if (p.remaining <= 0.005) continue
      const need = t.kind === 'order' ? t.o.balance_due : opening
      if (need <= 0.005) break
      const amt = r2(Math.min(p.remaining, need))
      if (t.kind === 'order') { t.o.balance_due = r2(t.o.balance_due - amt); out.push({ payment_id: p.id, target: 'order', order_id: t.o.id, amount: amt }) }
      else { opening = r2(opening - amt); out.push({ payment_id: p.id, target: 'opening', amount: amt }) }
      p.remaining = r2(p.remaining - amt)
    }
  }
  return out
}

/** Apply allotments. Caller owns the transaction. Throws on any violated rule. */
export async function applyAllotment(conn: any, customerId: number, userId: number, allots: Allotment[], note = '') {
  if (!allots.length) return { applied: 0, total: 0, autoReleased: [] as string[] }
  await conn.query(`SELECT id FROM customers WHERE id = ? FOR UPDATE`, [customerId])
  const credit = await getAdvanceCredit(conn, customerId, true)
  const remain = new Map(credit.payments.map(p => [p.id, p.remaining]))
  const payNo = new Map(credit.payments.map(p => [p.id, p.payment_number]))
  let opening = credit.openingDue
  const autoReleased: string[] = []
  let total = 0

  for (const a of allots) {
    const amt = r2(Number(a.amount))
    if (!(amt > 0)) continue
    const left = remain.get(a.payment_id)
    if (left === undefined) throw createError({ statusCode: 400, statusMessage: `Payment ${a.payment_id} has no advance credit available` })
    if (amt > left + 0.005) throw createError({ statusCode: 400, statusMessage: `${payNo.get(a.payment_id)} has only ৳${left.toLocaleString()} left to allot` })
    remain.set(a.payment_id, r2(left - amt))

    if (a.target === 'opening') {
      if (amt > opening + 0.005) throw createError({ statusCode: 400, statusMessage: `Only ৳${opening.toLocaleString()} of opening due is left to settle` })
      opening = r2(opening - amt)
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance, target, allocated_by_user_id)
         VALUES (?, 0, ?, 0, 'opening', ?)`, [a.payment_id, amt, userId])
    } else {
      const [[o]] = await conn.query(
        `SELECT id, order_number, customer_id, status, total_amount, amount_paid, advance_paid, balance_due
         FROM credit_orders WHERE id = ? FOR UPDATE`, [a.order_id])
      if (!o || Number(o.customer_id) !== customerId)
        throw createError({ statusCode: 400, statusMessage: `Order ${a.order_id} does not belong to this customer` })
      if (['cancelled', 'rejected', 'draft'].includes(o.status))
        throw createError({ statusCode: 400, statusMessage: `${o.order_number} is ${o.status} — it cannot take payment` })
      if (amt > Number(o.balance_due) + 0.005)
        throw createError({ statusCode: 400, statusMessage: `${o.order_number} only owes ৳${Number(o.balance_due).toLocaleString()}` })

      const asAdvance = !DISPATCHED_STATUSES.includes(o.status)
      const newPaid = Number(o.amount_paid ?? 0) + (asAdvance ? 0 : amt)
      const newAdv  = Number(o.advance_paid ?? 0) + (asAdvance ? amt : 0)
      const newBal  = Math.max(0, r2(Number(o.total_amount) - newPaid - newAdv))
      const nowComplete = newBal === 0 && o.status === 'delivered'
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance, target, allocated_by_user_id)
         VALUES (?, ?, ?, ?, 'order', ?)`, [a.payment_id, o.id, amt, asAdvance ? 1 : 0, userId])
      await conn.query(
        `UPDATE credit_orders SET amount_paid = ?, advance_paid = ?, balance_due = ?, status = ?, updated_at = NOW() WHERE id = ?`,
        [newPaid, newAdv, newBal, nowComplete ? 'completed' : o.status, o.id])
      await conn.query(
        `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [o.id, o.status, nowComplete ? 'completed' : o.status, nowComplete ? 'completed' : 'advance_allotted', userId,
         `${payNo.get(a.payment_id)} — ৳${amt.toLocaleString()} of earlier advance allotted${asAdvance ? ' as ADVANCE' : ''}${note ? ` (${note})` : ''}`])
      const gate = await getOrderGateState(conn, o.id)
      if (gate.dispatchHold && !gate.dispatchCleared && gate.autoRelease && gate.conditionMet) {
        await conn.query(
          `UPDATE order_approval_conditions SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
             dispatch_cleared_note = ? WHERE order_id = ?`,
          [userId, `Auto-released — advance ${payNo.get(a.payment_id)} satisfied ${gate.conditionType}`, o.id])
        autoReleased.push(o.order_number)
      }
    }
    total += amt
    await syncPaymentAllocation(conn, a.payment_id)
  }
  return { applied: allots.length, total: r2(total), autoReleased }
}

/** Keep customer_payments.allocated_amount / allocation_status equal to the live allocation rows. */
export async function syncPaymentAllocation(conn: any, paymentId: number) {
  const [[p]] = await conn.query(
    `SELECT amount, COALESCE((SELECT SUM(allocated_amount) FROM payment_allocations WHERE payment_id = ? AND released_at IS NULL), 0) alloc
     FROM customer_payments WHERE id = ?`, [paymentId, paymentId])
  if (!p) return
  const alloc = Number(p.alloc), amt = Number(p.amount)
  await conn.query(
    `UPDATE customer_payments SET allocated_amount = ?, allocation_status = ? WHERE id = ?`,
    [alloc, alloc >= amt - 0.005 ? 'allocated' : alloc > 0 ? 'partial' : 'unallocated', paymentId])
}

/**
 * A cancelled (never-invoiced) order gives its money back to the customer: direct payments become account
 * credit again, allocations are marked released. Returns the amount released. Ledger is untouched
 * (the payment credit is already there and stays).
 */
export async function releaseOrderPayments(conn: any, orderId: number, userId: number, orderNumber: string): Promise<number> {
  let released = 0
  const [direct] = await conn.query(
    `SELECT id, payment_number, amount FROM customer_payments WHERE order_id = ? AND reversed_at IS NULL`, [orderId])
  for (const p of direct) {
    await conn.query(
      `UPDATE customer_payments SET order_id = NULL, allocated_amount = 0, allocation_status = 'unallocated',
         notes = CONCAT(COALESCE(notes, ''), ?) WHERE id = ?`,
      [` | released from cancelled ${orderNumber}`, p.id])
    released += Number(p.amount)
  }
  const [allocs] = await conn.query(
    `SELECT id, payment_id, allocated_amount FROM payment_allocations WHERE order_id = ? AND target = 'order' AND released_at IS NULL`, [orderId])
  for (const a of allocs) {
    await conn.query(`UPDATE payment_allocations SET released_at = NOW() WHERE id = ?`, [a.id])
    await syncPaymentAllocation(conn, a.payment_id)
    released += Number(a.allocated_amount)
  }
  if (released > 0) {
    await conn.query(`UPDATE credit_orders SET advance_paid = 0, amount_paid = 0, balance_due = total_amount, updated_at = NOW() WHERE id = ?`, [orderId])
    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       SELECT id, status, status, 'advance_released', ?, ?, NOW() FROM credit_orders WHERE id = ?`,
      [userId, `৳${released.toLocaleString()} received on this order was released back to the customer's advance credit`, orderId])
  }
  return Math.round(released * 100) / 100
}
