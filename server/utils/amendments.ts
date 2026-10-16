import {
  getGLAccountId, getCreditRevenueAccountId, postJournalEntry, postCustomerLedger,
} from '~/server/utils/creditOrders'

export const AMD_PRE_STATUSES  = ['pending_approval', 'escalated', 'approved', 'in_production', 'produced', 'ready_to_ship']
export const AMD_POST_STATUSES = ['goods_on_board', 'shipped', 'dispatched', 'delivered', 'completed']

/**
 * Apply an approved amendment. Caller holds the transaction + order lock.
 *  - pre  regime: replace items, recompute totals (order must still be pre-dispatch)
 *  - post regime: debit/credit note into customer_ledger + balanced JE
 */
export async function applyAmendment(conn: any, opts: {
  amendmentId: number
  order: any               // credit_orders row (id, order_number, customer_id)
  regime: string
  flatAmount: number | null
  newValues: any
  amdNo: string
  userId: number
  reason?: string | null
}) {
  const { order, regime, newValues, amdNo, userId } = opts
  let flatAmount = opts.flatAmount

  if (regime === 'pre') {
    // Order must STILL be pre-dispatch (may have shipped since the request)
    const [[fresh]] = await conn.query(
      `SELECT status, advance_paid, amount_paid FROM credit_orders WHERE id = ? FOR UPDATE`, [order.id],
    )
    if (!AMD_PRE_STATUSES.includes(fresh.status))
      throw createError({ statusCode: 409, statusMessage: 'Order was dispatched after this amendment was requested — use a post-dispatch amendment instead' })

    const { newSub, delta } = await applyItemGrid(conn, order.id, newValues.items, amdNo, opts.reason, userId, 'pre')
    const [[cur]] = await conn.query(`SELECT total_amount FROM credit_orders WHERE id = ?`, [order.id])
    // Only the item delta moves the total — delivery surcharge, order discount and tax stay as they were.
    const newTotal   = Math.round((Number(cur.total_amount) + delta) * 100) / 100
    const newBalance = Math.max(0, newTotal - Number(fresh.advance_paid ?? 0) - Number(fresh.amount_paid ?? 0))
    await conn.query(
      `UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newSub, newTotal, newBalance, order.id],
    )
    return
  }

  // POST regime — debit/credit note into ledger + balanced JE.
  // A line-item grid (price / qty change) rewrites the lines too, so the invoice view and the ledger agree.
  let itemSub: number | null = null
  if (Array.isArray(newValues?.items) && newValues.items.length) {
    const g = await applyItemGrid(conn, order.id, newValues.items, amdNo, opts.reason, userId, 'post')
    itemSub = g.newSub
    flatAmount = g.delta
  }
  const amt  = Number(flatAmount)
  const abs  = Math.abs(amt)
  const date = new Date().toISOString().slice(0, 10)
  const arId  = await getGLAccountId(conn, 'Accounts Receivable')
  const revId = await getCreditRevenueAccountId(conn, order.id)

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
     SET subtotal     = COALESCE(?, subtotal),
         total_amount = GREATEST(0, total_amount + ?),
         balance_due  = GREATEST(0, balance_due + ?),
         updated_at   = NOW()
     WHERE id = ?`,
    [itemSub, amt, amt, order.id],
  )
}

/**
 * Apply a qty / price / discount grid to existing lines BY ID (legacy order_amendment.php parity):
 * ids survive, so deliveries, returns and over-deliveries that point at a line stay linked.
 * Every unit-price change is logged in credit_order_price_revisions (the order's price history).
 * Returns the new subtotal (sum of line totals) and the change versus the old sum of line totals.
 */
async function applyItemGrid(conn: any, orderId: number, grid: any[], amdNo: string, reason: string | null | undefined, userId: number, regime: 'pre' | 'post') {
  const [oldItems] = await conn.query(
    `SELECT id, product_id, variant_id, quantity, unit_price, discount_amount, line_total FROM credit_order_items WHERE order_id = ?`, [orderId])
  const byId = new Map<number, any>(oldItems.map((i: any) => [Number(i.id), i]))
  const oldSub = oldItems.reduce((s: number, i: any) => s + Number(i.line_total), 0)
  const note = `Amendment ${amdNo}${reason ? `: ${reason}` : ''}`.slice(0, 500)
  const keep = new Set<number>()
  let newSub = 0

  for (const it of grid) {
    const qty = Number(it.quantity), price = Number(it.unit_price), disc = Number(it.discount_amount ?? 0)
    const lineTotal = Math.round((qty * price - disc) * 100) / 100
    newSub += lineTotal
    const old = it.item_id ? byId.get(Number(it.item_id)) : null
    if (it.item_id && !old)
      throw createError({ statusCode: 409, statusMessage: 'An order line changed since this amendment was requested — please redo it' })
    if (!old) {
      if (regime === 'post') throw createError({ statusCode: 400, statusMessage: 'Lines cannot be added after dispatch' })
      await conn.query(
        `INSERT INTO credit_order_items (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [orderId, it.product_id, it.variant_id ?? null, qty, price, disc, lineTotal])
      continue
    }
    keep.add(Number(old.id))
    if (regime === 'post') {
      const [[d]] = await conn.query(
        `SELECT COALESCE(SUM(qty_delivered),0) q FROM credit_order_delivery_items WHERE order_item_id = ?`, [old.id])
      if (qty < Number(d.q))
        throw createError({ statusCode: 400, statusMessage: `Quantity cannot go below what is already delivered (${Number(d.q)})` })
    }
    // Wrong product on the line (legacy "product correction"): allowed only while no delivery / return / over-delivery
    // points at the line — otherwise those records would describe goods the line no longer is.
    const newProduct = it.product_id != null ? Number(it.product_id) : Number(old.product_id)
    const newVariant = it.variant_id != null ? Number(it.variant_id) : (old.variant_id != null ? Number(old.variant_id) : null)
    const productChanged = newProduct !== Number(old.product_id) || (newVariant ?? 0) !== Number(old.variant_id ?? 0)
    if (productChanged) {
      for (const t of ['credit_order_delivery_items', 'credit_order_return_items', 'credit_order_over_delivery_items']) {
        const [[ref]] = await conn.query(`SELECT COUNT(*) c FROM ${t} WHERE order_item_id = ?`, [old.id])
        if (Number(ref.c) > 0)
          throw createError({ statusCode: 409, statusMessage: 'This line already has a delivery / return / over-delivery recorded — its product cannot be changed. Record a return for it and raise a new order for the correct product.' })
      }
      if (newVariant != null) {
        const [[v]] = await conn.query(`SELECT id FROM product_variants WHERE id = ? AND product_id = ?`, [newVariant, newProduct])
        if (!v) throw createError({ statusCode: 400, statusMessage: 'The chosen variant does not belong to the chosen product' })
      }
      await conn.query(`UPDATE credit_order_items SET product_id = ?, variant_id = ? WHERE id = ?`, [newProduct, newVariant, old.id])
    }
    await conn.query(
      `UPDATE credit_order_items SET quantity = ?, unit_price = ?, discount_amount = ?, line_total = ? WHERE id = ?`,
      [qty, price, disc, lineTotal, old.id])
    if (Math.abs(Number(old.unit_price) - price) > 0.004) {
      await conn.query(
        `INSERT INTO credit_order_price_revisions
           (order_id, order_item_id, product_id, variant_id, quantity, old_unit_price, new_unit_price, reason, changed_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, old.id, old.product_id, old.variant_id ?? null, qty, Number(old.unit_price), price, note, userId])
    }
  }
  if (regime === 'post' && keep.size !== byId.size)
    throw createError({ statusCode: 400, statusMessage: 'Lines cannot be removed after dispatch' })
  for (const [oid] of byId) if (!keep.has(oid)) await conn.query(`DELETE FROM credit_order_items WHERE id = ?`, [oid])

  newSub = Math.round(newSub * 100) / 100
  return { newSub, delta: Math.round((newSub - oldSub) * 100) / 100 }
}
