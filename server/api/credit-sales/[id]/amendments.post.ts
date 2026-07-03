import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  isAdminRole, isAccountsRole, getUserApprovalLimit,
  getGLAccountId, postJournalEntry, postCustomerLedger, nextDocNumber,
} from '~/server/utils/creditOrders'

const PRE_STATUSES  = ['pending_approval', 'escalated', 'approved', 'in_production', 'ready_to_ship']
const POST_STATUSES = ['shipped', 'dispatched', 'delivered', 'completed']

/**
 * Create an order amendment. Two regimes decided by the accounting pivot:
 *  - PRE-dispatch  → edit the order items directly (grid), totals recompute
 *  - POST-dispatch → flat ± amount posted as a ledger debit/credit note + JE
 *
 * Authority mirrors approval delegation: admin applies instantly; a user with
 * a personal approval limit auto-applies increases up to that limit and any
 * decrease; everything else lands as pending for admin decision.
 */
export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role) && !['sales-srg', 'sales-demra', 'sales-other'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Your role cannot request amendments' })

  const amendType   = String(body?.amend_type ?? 'correction')
  const description = body?.description ? String(body.description).slice(0, 500) : null

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[order]] = await conn.query<any>(
      `SELECT o.*, c.name AS customer_name FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const regime = PRE_STATUSES.includes(order.status) ? 'pre'
      : POST_STATUSES.includes(order.status) ? 'post' : null
    if (!regime)
      throw createError({ statusCode: 409, statusMessage: `Order status "${order.status}" cannot be amended` })

    // ── Compute the money delta + snapshots ─────────────────────────────────
    let delta = 0
    let oldValues: any = null
    let newValues: any = null
    let flatAmount: number | null = null

    if (regime === 'pre') {
      const newItems = body?.new_items as any[]
      if (!Array.isArray(newItems) || !newItems.length)
        throw createError({ statusCode: 400, statusMessage: 'new_items required for pre-dispatch amendment' })

      const [oldItems] = await conn.query<any[]>(
        `SELECT id, product_id, variant_id, quantity, unit_price, discount_amount, line_total
         FROM credit_order_items WHERE order_id = ?`, [id],
      )
      const newTotal = newItems.reduce((s, it) =>
        s + Number(it.quantity) * Number(it.unit_price) - Number(it.discount_amount ?? 0), 0)
      delta      = newTotal - Number(order.total_amount)
      oldValues  = { items: oldItems, total_amount: Number(order.total_amount) }
      newValues  = { items: newItems, total_amount: newTotal }
    } else {
      flatAmount = Number(body?.flat_amount ?? 0)
      if (!flatAmount || Math.abs(flatAmount) < 0.01)
        throw createError({ statusCode: 400, statusMessage: 'flat_amount (±) required for post-dispatch amendment' })
      if (amendType === 'rebate' && flatAmount > 0) flatAmount = -flatAmount  // rebates always reduce
      delta     = flatAmount
      oldValues = { total_amount: Number(order.total_amount), balance_due: Number(order.balance_due) }
      newValues = { flat_amount: flatAmount }
    }

    // ── Authority: apply now or queue as pending ────────────────────────────
    const { limit, source } = await getUserApprovalLimit(conn, userId, role)
    const canAutoApply =
      source === 'admin' ||
      (source === 'personal' && (delta <= 0 || delta <= limit))

    const amdNo = await nextDocNumber(conn, 'AMD', 'order_amendments')
    const [res] = await conn.query<any>(
      `INSERT INTO order_amendments
         (amendment_number, order_id, regime, amend_type, description,
          old_values, new_values, flat_amount, status, requested_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        amdNo, id, regime, amendType, description,
        JSON.stringify(oldValues), JSON.stringify(newValues), flatAmount,
        canAutoApply ? 'approved' : 'pending', userId,
      ],
    )
    const amendmentId = res.insertId

    if (canAutoApply) {
      await applyAmendment(conn, { amendmentId, order, regime, flatAmount, newValues, amdNo, userId, userName })
      await conn.query(
        `UPDATE order_amendments SET decided_by = ?, decided_at = NOW(),
           decision_note = ? WHERE id = ?`,
        [userId, source === 'admin' ? 'Auto-applied (admin)' : `Auto-applied (delegated limit ৳${limit.toLocaleString()})`, amendmentId],
      )
    }

    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, order.status, canAutoApply ? 'amendment_applied' : 'amendment_requested', userId,
       `${amdNo} (${regime}-dispatch, ${amendType}) Δ৳${delta.toLocaleString()}${description ? ` — ${description}` : ''}`],
    )
    await auditLog(conn, {
      userId, action: 'updated', module: 'credit_sales',
      recordType: 'order_amendment', recordId: amendmentId, referenceNumber: amdNo,
      description: `Amendment ${amdNo} on ${order.order_number} (${regime}, ${amendType}) Δ৳${delta.toLocaleString()} — ${canAutoApply ? 'applied' : 'pending approval'}`,
      severity: 'warning',
    })

    await conn.commit()
    sendTelegram(
      `📝 <b>Order Amendment ${canAutoApply ? 'Applied' : 'Requested'}</b>\n` +
      `${amdNo} on ${order.order_number} — ${order.customer_name}\n` +
      `${regime}-dispatch · ${amendType} · Δ৳${delta.toLocaleString()}\nby ${userName}` +
      (description ? `\n${description}` : ''),
    )
    return { ok: true, id: amendmentId, amendment_number: amdNo, status: canAutoApply ? 'approved' : 'pending', delta }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

/** Apply an approved amendment. Caller holds the transaction + order lock. */
export async function applyAmendment(conn: any, opts: {
  amendmentId: number
  order: any
  regime: string
  flatAmount: number | null
  newValues: any
  amdNo: string
  userId: number
  userName: string
}) {
  const { order, regime, flatAmount, newValues, amdNo, userId } = opts

  if (regime === 'pre') {
    // Order must STILL be pre-dispatch (may have shipped since the request)
    const [[fresh]] = await conn.query(
      `SELECT status, advance_paid, amount_paid FROM credit_orders WHERE id = ? FOR UPDATE`, [order.id],
    )
    if (!PRE_STATUSES.includes(fresh.status))
      throw createError({ statusCode: 409, statusMessage: 'Order was dispatched after this amendment was requested — use a post-dispatch amendment instead' })

    await conn.query(`DELETE FROM credit_order_items WHERE order_id = ?`, [order.id])
    for (const it of newValues.items) {
      const lineTotal = Number(it.quantity) * Number(it.unit_price) - Number(it.discount_amount ?? 0)
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order.id, it.product_id, it.variant_id ?? null, Number(it.quantity),
         Number(it.unit_price), Number(it.discount_amount ?? 0), lineTotal],
      )
    }
    const newTotal = Number(newValues.total_amount)
    const newBalance = Math.max(0, newTotal - Number(fresh.advance_paid ?? 0) - Number(fresh.amount_paid ?? 0))
    await conn.query(
      `UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newTotal, newTotal, newBalance, order.id],
    )
    return
  }

  // POST regime — debit/credit note into ledger + balanced JE
  const amt  = Number(flatAmount)
  const abs  = Math.abs(amt)
  const date = new Date().toISOString().slice(0, 10)
  const arId  = await getGLAccountId(conn, 'Accounts Receivable')
  const revId = await getGLAccountId(conn, 'Revenue')

  let jeId: number | null = null
  if (arId && revId) {
    jeId = await postJournalEntry(conn, {
      date,
      description: `${amt > 0 ? 'Debit' : 'Credit'} note ${amdNo} — Order ${order.order_number}`,
      docType: 'OrderAmendment',
      docId: opts.amendmentId,
      userId,
      lines: amt > 0
        ? [ { accountId: arId,  debit: abs, credit: 0, memo: amdNo },
            { accountId: revId, debit: 0, credit: abs, memo: amdNo } ]
        : [ { accountId: revId, debit: abs, credit: 0, memo: amdNo },
            { accountId: arId,  debit: 0, credit: abs, memo: amdNo } ],
    })
  }
  await postCustomerLedger(conn, {
    customerId: order.customer_id,
    date,
    transactionType: amt > 0 ? 'debit_note' : 'credit_note',
    referenceType: 'order_amendment',
    referenceId: opts.amendmentId,
    invoiceNumber: amdNo,
    description: `${amt > 0 ? 'Debit' : 'Credit'} note ${amdNo} — Order ${order.order_number}`,
    debit: amt > 0 ? abs : 0,
    credit: amt < 0 ? abs : 0,
    journalEntryId: jeId,
    userId,
  })
  await conn.query(
    `UPDATE order_amendments SET journal_entry_id = ? WHERE id = ?`,
    [jeId, opts.amendmentId],
  )
  await conn.query(
    `UPDATE credit_orders
     SET total_amount = GREATEST(0, total_amount + ?),
         balance_due  = GREATEST(0, balance_due + ?),
         updated_at   = NOW()
     WHERE id = ?`,
    [amt, amt, order.id],
  )
}
