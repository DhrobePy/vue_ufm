import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, getGLAccountId, postJournalEntry, postCustomerLedger,
  postGoodsOnBoardInvoice, nextDocNumber,
} from '~/server/utils/creditOrders'

/**
 * POST /api/credit-sales/backdated — admin-only escape hatch for recording a
 * sale that already happened before the system caught up. Skips the whole
 * approval -> production -> dispatch pipeline entirely: the order is created
 * straight into 'delivered' and the goods-on-board invoice (Dr AR / Cr
 * Revenue) posts immediately, dated to the historical transaction_date the
 * admin supplies — not today. An optional amount already collected at the
 * time of sale posts as its own dated payment (Dr cash/bank / Cr AR).
 *
 * Never goes through getOrderGateState's dispatch-hold synthesis or the 80%/
 * delegated-limit approval rules — this is a correction tool for past facts,
 * not a live order, so those live-pipeline guards don't apply.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const userName  = (session.user as any).name ?? `User ${userId}`
  const role      = ((session.user as any).role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Backdated order entry is admin/superadmin only' })
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const body = await readBody(event)
  const {
    customer_id,
    branch_id,
    transaction_date,   // the historical date this sale actually happened
    delivery_address,
    notes,
    items,              // [{ product_id, variant_id, qty_bags|quantity, unit_price, discount_amount }]
    amount_paid,        // amount already collected at/around the time of sale (optional)
    payment_method,
    bank_account_id,
    cash_account_id,
    reference_number,
    cheque_number,
    cheque_date,
    bank_tx_type,
  } = body ?? {}

  if (!customer_id || !items?.length)
    throw createError({ statusCode: 400, statusMessage: 'customer_id and items are required' })
  if (!transaction_date)
    throw createError({ statusCode: 400, statusMessage: 'transaction_date is required' })
  const today = new Date().toISOString().slice(0, 10)
  if (String(transaction_date) > today)
    throw createError({ statusCode: 400, statusMessage: 'transaction_date cannot be in the future — use the normal order flow for that' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [[customer]] = await conn.query<any>(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`, [customer_id],
    )
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    // Resolve missing product_id from variant_id, same as the normal create flow
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query<any>(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`, [it.variant_id],
        )
        it.product_id = pv?.product_id ?? null
      }
    }

    let subtotal = 0
    for (const it of items) {
      const qty = Number(it.qty_bags ?? it.quantity ?? 0)
      if (qty <= 0) throw createError({ statusCode: 400, statusMessage: 'Every line item needs a positive quantity' })
      subtotal += qty * Number(it.unit_price) - Number(it.discount_amount ?? 0)
    }
    const totalAmount = subtotal
    const paidAmount  = Math.max(0, Number(amount_paid ?? 0))
    const balanceDue  = Math.max(0, totalAmount - paidAmount)

    const orderNo = await nextDocNumber(conn, 'CR', 'credit_orders')
    const dispatchPin = Math.floor(100000 + Math.random() * 900000).toString()
    const deliveryPin = Math.floor(100000 + Math.random() * 900000).toString()
    const specialInstructions = `[BACKDATED ENTRY] ${notes ?? ''}`.trim()

    const [orderRes] = await conn.query<any>(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, status,
          shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          delivery_type, mini_truck_surcharge,
          dispatch_pin, delivery_pin,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'delivered',
               ?, ?,
               ?, ?, ?, 0, ?,
               'big_truck', 0,
               ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo, customer_id, branch_id ? Number(branch_id) : null, transaction_date,
        delivery_address || null, specialInstructions,
        subtotal, totalAmount, paidAmount, balanceDue,
        dispatchPin, deliveryPin,
        userId,
      ],
    )
    const orderId = orderRes.insertId

    for (const it of items) {
      const qty       = Number(it.qty_bags ?? it.quantity ?? 0)
      const lineTotal = qty * Number(it.unit_price) - Number(it.discount_amount ?? 0)
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.product_id, it.variant_id ?? null, qty, Number(it.unit_price), Number(it.discount_amount ?? 0), lineTotal],
      )
    }

    // Delivery record — so delivery history / dashboard counts reflect this
    // sale like any other, even though no truck movement was tracked live.
    const delNo = await nextDocNumber(conn, 'DEL', 'credit_order_deliveries')
    const totalQty = items.reduce((s: number, i: any) => s + Number(i.qty_bags ?? i.quantity ?? 0), 0)
    const [delRes] = await conn.query<any>(
      `INSERT INTO credit_order_deliveries
         (delivery_number, order_id, customer_id, delivery_date,
          total_qty_delivered, total_amount_delivered, is_final, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [delNo, orderId, customer_id, transaction_date, totalQty, totalAmount, 'Backdated entry — recorded outside normal pipeline', userId],
    )
    const deliveryId = delRes.insertId
    for (const it of items) {
      const qty = Number(it.qty_bags ?? it.quantity ?? 0)
      await conn.query(
        `INSERT INTO credit_order_delivery_items
           (delivery_id, product_id, variant_id, qty_delivered, unit_price, line_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [deliveryId, it.product_id, it.variant_id ?? null, qty, Number(it.unit_price), qty * Number(it.unit_price)],
      )
    }

    const wfComment = `Backdated entry — ৳${totalAmount.toLocaleString()} dated ${transaction_date}, recorded by ${userName} outside the normal pipeline${notes ? ` · ${notes}` : ''}`
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', 'delivered', 'backdated_entry', ?, ?, NOW())`,
      [orderId, userId, wfComment],
    )

    // ── Goods-on-board invoice, dated to the historical transaction_date ──
    // Order status is already 'delivered' (not a pre-dispatch status), so
    // getOrderGateState's default-hold synthesis never kicks in here.
    const goResult = await postGoodsOnBoardInvoice(conn, {
      orderId, orderNumber: orderNo, customerId: customer_id, customerName: customer.name,
      totalAmount, balanceDue, userId, userName, postDate: transaction_date,
    })

    // ── Optional payment already collected at/around time of sale ──────────
    let paymentNo: string | null = null
    if (paidAmount > 0) {
      const validMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking', 'Card']
      const payMethod = validMethods.includes(payment_method) ? payment_method : 'Cash'
      paymentNo = await nextDocNumber(conn, 'PAY', 'customer_payments')

      const [payRes] = await conn.query<any>(
        `INSERT INTO customer_payments
           (order_id, payment_number, customer_id, payment_date, amount, payment_method,
            payment_type, reference_number, bank_account_id, cash_account_id,
            cheque_number, cheque_date, bank_transaction_type,
            allocation_status, allocated_amount, notes, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, 'invoice_payment', ?, ?, ?, ?, ?, ?, 'allocated', ?, ?, ?)`,
        [
          orderId, paymentNo, customer_id, transaction_date, paidAmount, payMethod,
          reference_number || paymentNo,
          bank_account_id ? Number(bank_account_id) : null,
          cash_account_id ? Number(cash_account_id) : null,
          cheque_number || null, cheque_date || null, bank_tx_type || null,
          paidAmount, `Backdated entry — payment recorded at order entry (${payMethod})`, userId,
        ],
      )
      const paymentId = payRes.insertId

      let drAccountId: number | null = null
      if (payMethod === 'Cash' && cash_account_id) {
        const [[ca]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(cash_account_id)],
        )
        drAccountId = ca?.chart_of_account_id ?? null
      } else if (['Bank Transfer', 'Cheque', 'Card', 'Mobile Banking'].includes(payMethod) && bank_account_id) {
        const [[ba]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(bank_account_id)],
        )
        drAccountId = ba?.chart_of_account_id ?? null
      }
      const arId = await getGLAccountId(conn, 'Accounts Receivable')
      let payJeId: number | null = null

      if (drAccountId && arId) {
        payJeId = await postJournalEntry(conn, {
          date: transaction_date,
          description: `Payment received (backdated) — ${paymentNo} (Order ${orderNo})`,
          docType: 'CustomerPayment', docId: paymentId, userId,
          lines: [
            { accountId: drAccountId, debit: paidAmount, credit: 0, memo: paymentNo },
            { accountId: arId, debit: 0, credit: paidAmount, memo: paymentNo },
          ],
        })
        await conn.query(`UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`, [payJeId, paymentId])

        if (payMethod === 'Cash' && cash_account_id) {
          const [[pcAcc]] = await conn.query<any>(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(cash_account_id)],
          )
          const pcBal = Number(pcAcc?.current_balance ?? 0)
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions
               (account_id, branch_id, transaction_type, amount, balance_after,
                reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
            [Number(cash_account_id), pcAcc?.branch_id ?? null, paidAmount, pcBal + paidAmount,
              paymentId, `Backdated payment from order ${orderNo}`, userId, transaction_date],
          )
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [paidAmount, Number(cash_account_id)],
          )
        }
      } else {
        console.warn(`[backdated] Skipping JE for ${paymentNo}: drAccountId=${drAccountId}, arId=${arId}`)
      }

      await postCustomerLedger(conn, {
        customerId: customer_id, date: transaction_date, transactionType: 'payment',
        referenceType: 'customer_payment', referenceId: paymentId, invoiceNumber: paymentNo,
        description: `Payment received — ${paymentNo} (backdated, Order ${orderNo}) via ${payMethod}`,
        debit: 0, credit: paidAmount, journalEntryId: payJeId, userId,
      })
    }

    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        orderId,
      referenceNumber: orderNo,
      description:     `Backdated order entry ${orderNo} — ৳${totalAmount.toLocaleString()} dated ${transaction_date}, admin bypass of the full pipeline${paidAmount > 0 ? ` · ৳${paidAmount.toLocaleString()} paid` : ''}`,
      severity:        'critical',
      ipAddress,
    })

    await conn.commit()

    sendTelegram(
      `🕰️ <b>Backdated Order Entry</b>\n${orderNo} — ${customer.name}\n` +
      `৳${totalAmount.toLocaleString()} dated ${transaction_date} · by ${userName}` +
      (paidAmount > 0 ? `\n💰 ৳${paidAmount.toLocaleString()} already collected` : '') +
      (goResult.alreadyPosted ? '' : '\n📒 Invoice posted to ledger + journal entry'),
    )

    return {
      ok: true, id: orderId, order_number: orderNo, status: 'delivered',
      total_amount: totalAmount, balance_due: balanceDue,
      ...(paymentNo ? { payment_number: paymentNo } : {}),
    }
  } catch (e: any) {
    await conn.rollback()
    if (e?.statusCode) throw e
    console.error('[backdated] entry failed:', e?.message, '| errno:', e?.errno)
    throw createError({ statusCode: 500, statusMessage: e?.sqlMessage ?? e?.message ?? 'Backdated entry failed' })
  } finally {
    conn.release()
  }
})
