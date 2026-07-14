import {
  getGLAccountId, postJournalEntry, postCustomerLedger,
} from '~/server/utils/creditOrders'

export const AMD_PRE_STATUSES  = ['pending_approval', 'escalated', 'approved', 'in_production', 'ready_to_ship']
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
}) {
  const { order, regime, flatAmount, newValues, amdNo, userId } = opts

  if (regime === 'pre') {
    // Order must STILL be pre-dispatch (may have shipped since the request)
    const [[fresh]] = await conn.query(
      `SELECT status, advance_paid, amount_paid FROM credit_orders WHERE id = ? FOR UPDATE`, [order.id],
    )
    if (!AMD_PRE_STATUSES.includes(fresh.status))
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
    const newTotal   = Number(newValues.total_amount)
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
