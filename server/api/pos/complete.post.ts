import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import {
  nextDocNumber, getGLAccountId, postJournalEntry,
  getUserActionLimit, isAdminRole,
} from '~/server/utils/creditOrders'

const VALID_METHODS = ['Cash', 'Card', 'Bank Transfer', 'bKash', 'Nagad']
// DB ENUM has no bKash/Nagad — normalize to 'Mobile Banking', same fix the
// legacy app made when its own split-payment rewrite hit an ENUM-truncation
// crash on these two values.
const DB_METHOD: Record<string, string> = {
  Cash: 'Cash', Card: 'Card', 'Bank Transfer': 'Bank Transfer',
  bKash: 'Mobile Banking', Nagad: 'Mobile Banking',
}

/**
 * POST /api/pos/complete — records a POS sale with an optional cash+credit
 * split on the SAME sale (legacy parity). The "paid now" portion posts to
 * whichever account (petty cash or bank) the till selected; the "on credit"
 * portion posts to Accounts Receivable and a pos_customer_ledger debit row
 * (POS keeps its own ledger, deliberately separate from Credit Sales').
 *
 * Money-critical: only the CASH portion ever touches branch_petty_cash — a
 * card/bank/mobile-banking "paid now" tender goes to that account's own GL
 * row, never petty cash (this exact bug — non-cash tenders inflating the
 * physical cash drawer balance — was found and fixed live in the legacy
 * app's own POS rebuild).
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number(session.user.id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const {
    branch_id    = 1,
    customer_id  = null,
    items        = [],       // [{ variant_id, quantity, unit_price }]
    discount     = 0,
    payment_method = 'Cash', // tender type for the "paid now" portion
    cash_amount    = null,   // defaults to full total when omitted (back-compat)
    credit_amount  = 0,
    cash_account_id = null,
    bank_account_id = null,
    payment_reference = null,
  } = body ?? {}

  if (!items?.length) throw createError({ statusCode: 400, statusMessage: 'No items in cart' })
  if (!VALID_METHODS.includes(payment_method))
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment method' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const subtotal = items.reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.quantity), 0)
    const total    = Math.max(0, subtotal - Number(discount || 0))
    const creditAmt = Math.max(0, Math.min(Number(credit_amount) || 0, total))
    const cashAmt   = cash_amount !== null ? Math.max(0, Number(cash_amount)) : total - creditAmt

    if (Math.abs(cashAmt + creditAmt - total) > 0.01)
      throw createError({ statusCode: 400, statusMessage: `Cash (৳${cashAmt}) + Credit (৳${creditAmt}) must equal the total (৳${total})` })
    if (creditAmt > 0 && !customer_id)
      throw createError({ statusCode: 400, statusMessage: 'A customer is required for any credit portion of a sale' })

    let customer: any = null
    if (customer_id) {
      const [[c]] = await conn.query<any>(`SELECT id, name FROM customers WHERE id = ?`, [customer_id])
      customer = c
    }

    const dbMethod = creditAmt >= total - 0.005 ? 'Credit' : DB_METHOD[payment_method]

    // Exit-release gate: only relevant when part of the sale is unpaid.
    // Pure-cash sales are already fully Paid, so goods clear instantly —
    // no gate needed (matches the legacy owner's explicit decision).
    let exitStatus = 'cleared'
    if (creditAmt > 0.005 && !isAdminRole(role)) {
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
        orderNumber, branch_id, customer_id || null,
        subtotal, Number(discount || 0), total,
        cashAmt, creditAmt, dbMethod, payment_reference || null,
        cash_account_id || null, bank_account_id || null,
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

    // ── GL posting: DR petty-cash/bank for the paid portion, DR AR for the
    //    credit portion, CR Sales Revenue for the full total. ─────────────
    const jeLines: { accountId: number; debit: number; credit: number; memo?: string }[] = []
    let paidAccountId: number | null = null
    if (cashAmt > 0.005) {
      if (payment_method === 'Cash' && cash_account_id) {
        const [[ca]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [cash_account_id])
        paidAccountId = ca?.chart_of_account_id ?? null
      } else if (bank_account_id) {
        const [[ba]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [bank_account_id])
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

      // Petty cash movement — ONLY for the actual Cash tender, never for
      // Card/Mobile Banking/Bank Transfer paid-now amounts.
      if (payment_method === 'Cash' && cash_account_id && cashAmt > 0.005) {
        const [[pcAcc]] = await conn.query<any>(
          `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cash_account_id])
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_in', ?, ?, 'pos_order', ?, ?, ?, CURDATE())`,
          [cash_account_id, pcAcc?.branch_id ?? branch_id, cashAmt, Number(pcAcc?.current_balance ?? 0) + cashAmt,
           orderId, `POS sale ${orderNumber}`, userId],
        )
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
          [cashAmt, cash_account_id],
        )
      }
    } else {
      console.warn(`[pos/complete] Skipping JE for ${orderNumber}: lines=${jeLines.length}, rev=${revId}`)
    }

    // ── POS customer ledger — only the credit portion carries a real
    //    balance; cash sales are visible in the timeline via `orders` alone. ──
    if (creditAmt > 0.005 && customer_id) {
      await conn.query(
        `INSERT INTO pos_customer_ledger
           (customer_id, order_id, transaction_date, transaction_type, description,
            debit_amount, credit_amount, reference_number, created_by_user_id)
         VALUES (?, ?, CURDATE(), 'sale', ?, ?, 0, ?, ?)`,
        [customer_id, orderId, `POS sale ${orderNumber}`, creditAmt, orderNumber, userId],
      )
    }

    await auditLog(conn, {
      userId, action: 'created', module: 'other', recordType: 'pos_order',
      recordId: orderId, referenceNumber: orderNumber,
      description: `POS sale ${orderNumber} — ৳${total.toLocaleString()} (cash ৳${cashAmt.toLocaleString()} / credit ৳${creditAmt.toLocaleString()})`,
      severity: 'info',
    })

    await conn.commit()
    return {
      ok: true, order_number: orderNumber, order_id: orderId, total,
      cash_amount: cashAmt, credit_amount: creditAmt,
      exit_status: exitStatus,
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
