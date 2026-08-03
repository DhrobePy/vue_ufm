import { nextDocNumber, getGLAccountId, postJournalEntry, getUserActionLimit, isAdminRole } from '~/server/utils/creditOrders'

export const POS_VALID_METHODS = ['Cash', 'Card', 'Bank Transfer', 'bKash', 'Nagad']
// DB ENUM has no bKash/Nagad — normalize to 'Mobile Banking', same fix the
// legacy app made when its own split-payment rewrite hit an ENUM-truncation
// crash on these two values.
const DB_METHOD: Record<string, string> = {
  Cash: 'Cash', Card: 'Card', 'Bank Transfer': 'Bank Transfer',
  bKash: 'Mobile Banking', Nagad: 'Mobile Banking',
}

/** Live POS credit balance for a customer — ledger truth, not a cached column. */
export async function getPosCustomerOutstanding(conn: any, customerId: number): Promise<number> {
  const [[row]] = await conn.query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM pos_customer_ledger WHERE customer_id = ?`, [customerId],
  )
  return Number(row?.bal ?? 0)
}

export interface PosSaleInput {
  branchId: number
  customerId: number | null
  items: Array<{ variant_id: number; quantity: number; unit_price: number }>
  discount: number
  paymentMethod: string
  cashAmount: number | null
  creditAmount: number
  cashAccountId: number | null
  bankAccountId: number | null
  paymentReference: string | null
  userId: number
  isAdmin: boolean
}

/**
 * Posts one POS sale: order + items + stock decrement + GL (petty-cash/bank
 * for the paid portion, AR for the credit portion, Revenue for the total)
 * + POS customer ledger row for any credit portion. Caller owns the
 * transaction (begin/commit/rollback) — this never commits.
 *
 * Does NOT check the customer credit-limit gate — callers that accept
 * arbitrary user input (the main sale-completion endpoint) must check that
 * BEFORE calling this; a checker approving an already-queued pos_credit_sale
 * request calls this directly since the limit check already happened.
 */
export async function postPosSale(conn: any, input: PosSaleInput) {
  const { items, discount, paymentMethod, cashAccountId, bankAccountId, branchId, customerId, userId } = input
  if (!items?.length) throw createError({ statusCode: 400, statusMessage: 'No items in cart' })
  if (!POS_VALID_METHODS.includes(paymentMethod))
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment method' })

  const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0)
  const total    = Math.max(0, subtotal - Number(discount || 0))
  const creditAmt = Math.max(0, Math.min(Number(input.creditAmount) || 0, total))
  const cashAmt   = input.cashAmount !== null ? Math.max(0, Number(input.cashAmount)) : total - creditAmt

  if (Math.abs(cashAmt + creditAmt - total) > 0.01)
    throw createError({ statusCode: 400, statusMessage: `Cash (৳${cashAmt}) + Credit (৳${creditAmt}) must equal the total (৳${total})` })
  if (creditAmt > 0 && !customerId)
    throw createError({ statusCode: 400, statusMessage: 'A customer is required for any credit portion of a sale' })

  let customer: any = null
  if (customerId) {
    const [[c]] = await conn.query<any>(`SELECT id, name FROM customers WHERE id = ?`, [customerId])
    customer = c
  }

  const dbMethod = creditAmt >= total - 0.005 ? 'Credit' : DB_METHOD[paymentMethod]

  // Exit-release gate: only relevant when part of the sale is unpaid.
  let exitStatus = 'cleared'
  if (creditAmt > 0.005 && !input.isAdmin) {
    const cap = await getUserActionLimit(conn, userId, 'pos_exit_release')
    exitStatus = cap !== null && creditAmt <= cap ? 'cleared' : 'pending_approval'
  }

  const orderNumber = await nextDocNumber(conn, 'ORD', 'orders', 'order_number')
  const paymentStatus = creditAmt <= 0.005 ? 'Paid' : cashAmt <= 0.005 ? 'Unpaid' : 'Partial'

  const [orderResult] = await conn.query<any>(
    `INSERT INTO orders
       (order_number, branch_id, customer_id, order_date, order_type,
        subtotal, discount_amount, total_amount,
        cash_amount, credit_amount, payment_method, payment_reference,
        cash_account_id, bank_account_id,
        payment_status, order_status, exit_status,
        exit_cleared_by_user_id, exit_cleared_at,
        exit_requested_by_user_id, exit_requested_at,
        created_by_user_id)
     VALUES (?, ?, ?, NOW(), 'POS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber, branchId, customerId || null,
      subtotal, Number(discount || 0), total,
      cashAmt, creditAmt, dbMethod, input.paymentReference || null,
      cashAccountId || null, bankAccountId || null,
      paymentStatus, exitStatus,
      exitStatus === 'cleared' ? userId : null, exitStatus === 'cleared' ? new Date() : null,
      exitStatus === 'pending_approval' ? userId : null, exitStatus === 'pending_approval' ? new Date() : null,
      userId,
    ],
  )
  const orderId = orderResult.insertId

  for (const item of items) {
    const lineTotal = Number(item.unit_price) * Number(item.quantity)
    await conn.query(
      `INSERT INTO order_items (order_id, variant_id, quantity, unit_price, subtotal, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, item.variant_id, item.quantity, item.unit_price, lineTotal, lineTotal],
    )
    await conn.query(
      `UPDATE product_variants SET stock_qty = GREATEST(0, stock_qty - ?) WHERE id = ?`,
      [item.quantity, item.variant_id],
    )
  }

  // GL posting.
  const jeLines: { accountId: number; debit: number; credit: number; memo?: string }[] = []
  let paidAccountId: number | null = null
  if (cashAmt > 0.005) {
    if (paymentMethod === 'Cash' && cashAccountId) {
      const [[ca]] = await conn.query<any>(`SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashAccountId])
      paidAccountId = ca?.chart_of_account_id ?? null
    } else if (bankAccountId) {
      const [[ba]] = await conn.query<any>(`SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [bankAccountId])
      paidAccountId = ba?.chart_of_account_id ?? null
    }
    if (paidAccountId) jeLines.push({ accountId: paidAccountId, debit: cashAmt, credit: 0, memo: orderNumber })
  }
  let arId: number | null = null
  if (creditAmt > 0.005) {
    arId = await getGLAccountId(conn, 'Accounts Receivable')
    if (arId) jeLines.push({ accountId: arId, debit: creditAmt, credit: 0, memo: orderNumber })
  }
  const revId = await getGLAccountId(conn, 'Revenue')
  let jeId: number | null = null
  if (revId && jeLines.length && Math.abs(jeLines.reduce((s, l) => s + l.debit, 0) - total) < 0.01) {
    jeLines.push({ accountId: revId, debit: 0, credit: total, memo: orderNumber })
    jeId = await postJournalEntry(conn, {
      date: new Date().toISOString().slice(0, 10),
      description: `POS sale ${orderNumber}${customer ? ` — ${customer.name}` : ' — walk-in'}`,
      docType: 'PosOrder', docId: orderId, userId, lines: jeLines,
    })
    await conn.query(`UPDATE orders SET journal_entry_id = ? WHERE id = ?`, [jeId, orderId])

    if (paymentMethod === 'Cash' && cashAccountId && cashAmt > 0.005) {
      const [[pcAcc]] = await conn.query<any>(`SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashAccountId])
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_in', ?, ?, 'pos_order', ?, ?, ?, CURDATE())`,
        [cashAccountId, pcAcc?.branch_id ?? branchId, cashAmt, Number(pcAcc?.current_balance ?? 0) + cashAmt,
         orderId, `POS sale ${orderNumber}`, userId],
      )
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [cashAmt, cashAccountId])
    }
  } else {
    console.warn(`[pos-sale] Skipping JE for ${orderNumber}: lines=${jeLines.length}, rev=${revId}`)
  }

  if (creditAmt > 0.005 && customerId) {
    await conn.query(
      `INSERT INTO pos_customer_ledger
         (customer_id, order_id, transaction_date, transaction_type, description, debit_amount, credit_amount, reference_number, created_by_user_id)
       VALUES (?, ?, CURDATE(), 'sale', ?, ?, 0, ?, ?)`,
      [customerId, orderId, `POS sale ${orderNumber}`, creditAmt, orderNumber, userId],
    )
  }

  return { orderNumber, orderId, total, cashAmount: cashAmt, creditAmount: creditAmt, exitStatus, customerName: customer?.name ?? null }
}
