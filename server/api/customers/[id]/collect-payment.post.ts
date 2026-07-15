import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  isAccountsRole, getOrderGateState, getGLAccountId,
  postJournalEntry, postCustomerLedger, nextDocNumber,
  checkTransactionLimit, queuePendingRequest,
} from '~/server/utils/creditOrders'
import { bridgeCustomerPayment } from '~/server/utils/bankBridge'

const DISPATCHED = ['goods_on_board', 'shipped', 'dispatched', 'delivered', 'completed']

/**
 * Record ONE payment against a customer and allocate it across orders.
 * Allocations to not-yet-dispatched orders count as advances on those orders
 * (safe: dispatch posts the full total, so the paper trail stays clean).
 *
 * Money flow (uniform double-entry):
 *   one customer_payments row → one ledger credit → one JE
 *   (Dr bank/petty-cash GL · Cr Accounts Receivable), petty-cash movement if cash.
 */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  const body       = await readBody(event)
  const session    = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role) && role !== 'collector')
    throw createError({ statusCode: 403, statusMessage: 'Accounts family, collector or admin only' })

  const amount = Number(body?.amount ?? 0)
  if (!customerId || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: 'customer id and a positive amount are required' })

  const allocations = (Array.isArray(body?.allocations) ? body.allocations : [])
    .map((a: any) => ({ order_id: Number(a.order_id), amount: Number(a.amount) }))
    .filter((a: any) => a.order_id && a.amount > 0)
  const allocatedTotal = allocations.reduce((s: number, a: any) => s + a.amount, 0)
  if (allocatedTotal - amount > 0.005)
    throw createError({ statusCode: 400, statusMessage: `Allocations (৳${allocatedTotal.toLocaleString()}) exceed the payment amount` })

  const validMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking', 'Card']
  const method  = validMethods.includes(body?.payment_method) ? body.payment_method : 'Cash'
  const pmtDate = body?.payment_date ?? new Date().toISOString().slice(0, 10)

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[customer]] = await conn.query<any>(
      `SELECT id, name FROM customers WHERE id = ? FOR UPDATE`, [customerId],
    )
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    // Maker/checker gate (spec §2.4/§3): over the maker's personal limit ->
    // queue for a checker instead of hard-blocking. No writes have happened
    // yet, so committing here just persists the queued request.
    const limitCheck = await checkTransactionLimit(conn, userId, role, amount)
    if (!limitCheck.allowed) {
      const reqId = await queuePendingRequest(conn, {
        requestType: 'collect_payment',
        payload: body,
        customerId,
        amount,
        referenceLabel: `${customer.name} — ৳${amount.toLocaleString()} via ${method}`,
        requestedBy: userId,
        requestedReason: `Exceeds your transaction limit of ৳${limitCheck.cap.toLocaleString()}`,
      })
      await conn.commit()
      sendTelegram(
        `⏳ <b>Payment Queued for Approval</b>\n${customer.name} — ৳${amount.toLocaleString()} via ${method}\n` +
        `Requested by ${userName} (over their ৳${limitCheck.cap.toLocaleString()} limit)`,
      )
      return {
        ok: true, queued: true, pending_request_id: reqId,
        message: `৳${amount.toLocaleString()} exceeds your transaction limit of ৳${limitCheck.cap.toLocaleString()} — queued for a checker's approval.`,
      }
    }

    const payNo = await nextDocNumber(conn, 'PAY', 'customer_payments')

    // 1. One payment row (order_id NULL — allocations carry the split)
    const [payRes] = await conn.query<any>(
      `INSERT INTO customer_payments
         (order_id, payment_number, customer_id, payment_date, amount, payment_method,
          payment_type, reference_number, bank_account_id, cash_account_id,
          cheque_number, cheque_date, bank_transaction_type,
          allocation_status, allocated_amount, notes, created_by_user_id)
       VALUES (NULL, ?, ?, ?, ?, ?, 'invoice_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payNo, customerId, pmtDate, amount, method,
        body?.reference_number || payNo,
        body?.bank_account_id ? Number(body.bank_account_id) : null,
        body?.cash_account_id ? Number(body.cash_account_id) : null,
        body?.cheque_number || null,
        body?.cheque_date || null,
        body?.bank_tx_type || null,
        allocatedTotal >= amount - 0.005 ? 'allocated' : allocatedTotal > 0 ? 'partial' : 'unallocated',
        allocatedTotal,
        body?.notes ?? null,
        userId,
      ],
    )
    const paymentId = payRes.insertId

    // 2. Allocations — dispatched orders take payment, undispatched take advance
    const autoReleasedOrders: string[] = []
    for (const a of allocations) {
      const [[o]] = await conn.query<any>(
        `SELECT id, order_number, customer_id, status, total_amount, amount_paid, advance_paid, balance_due
         FROM credit_orders WHERE id = ? FOR UPDATE`, [a.order_id],
      )
      if (!o || o.customer_id !== customerId)
        throw createError({ statusCode: 400, statusMessage: `Order ${a.order_id} does not belong to this customer` })

      const asAdvance = !DISPATCHED.includes(o.status)
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance)
         VALUES (?, ?, ?, ?)`,
        [paymentId, a.order_id, a.amount, asAdvance ? 1 : 0],
      )

      const newPaid    = Number(o.amount_paid ?? 0)  + (asAdvance ? 0 : a.amount)
      const newAdvance = Number(o.advance_paid ?? 0) + (asAdvance ? a.amount : 0)
      const newBalance = Math.max(0, Number(o.total_amount) - newPaid - newAdvance)
      const nowComplete = newBalance === 0 && o.status === 'delivered'
      await conn.query(
        `UPDATE credit_orders
         SET amount_paid = ?, advance_paid = ?, balance_due = ?,
             status = ?, updated_at = NOW()
         WHERE id = ?`,
        [newPaid, newAdvance, newBalance, nowComplete ? 'completed' : o.status, a.order_id],
      )
      await conn.query(
        `INSERT INTO credit_order_workflow
           (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [a.order_id, o.status, nowComplete ? 'completed' : o.status,
         nowComplete ? 'completed' : 'payment_received', userId,
         `${payNo} — ৳${a.amount.toLocaleString()} allocated${asAdvance ? ' as ADVANCE (not dispatched yet)' : ''} via ${method}`],
      )

      // Gate auto-release per order
      const gate = await getOrderGateState(conn, a.order_id)
      if (gate.dispatchHold && !gate.dispatchCleared && gate.autoRelease && gate.conditionMet) {
        await conn.query(
          `UPDATE order_approval_conditions
           SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
               dispatch_cleared_note = ?
           WHERE order_id = ?`,
          [userId, `Auto-released — ${payNo} satisfied ${gate.conditionType}`, a.order_id],
        )
        autoReleasedOrders.push(o.order_number)
      }
    }

    // 3. One JE — Dr bank/petty-cash GL · Cr AR (the central-account rule)
    let jeId: number | null = null
    let drAccountId: number | null = null
    if (method === 'Cash' && body?.cash_account_id) {
      const [[ca]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [Number(body.cash_account_id)],
      )
      drAccountId = ca?.chart_of_account_id ?? null
    } else if (body?.bank_account_id) {
      const [[ba]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
        [Number(body.bank_account_id)],
      )
      drAccountId = ba?.chart_of_account_id ?? null
    }
    const arId = await getGLAccountId(conn, 'Accounts Receivable')
    if (drAccountId && arId) {
      jeId = await postJournalEntry(conn, {
        date: pmtDate,
        description: `Customer payment ${payNo} — ${customer.name} (${method})`,
        docType: 'CustomerPayment',
        docId: paymentId,
        userId,
        lines: [
          { accountId: drAccountId, debit: amount, credit: 0, memo: payNo },
          { accountId: arId, debit: 0, credit: amount, memo: payNo },
        ],
      })
      await conn.query(`UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`, [jeId, paymentId])

      if (method === 'Cash' && body?.cash_account_id) {
        const cashId = Number(body.cash_account_id)
        const [[pcAcc]] = await conn.query<any>(
          `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId],
        )
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
          [cashId, pcAcc?.branch_id ?? null, amount, Number(pcAcc?.current_balance ?? 0) + amount,
           paymentId, `Customer payment ${payNo} — ${customer.name}`, userId, pmtDate],
        )
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
          [amount, cashId],
        )
      }
    } else {
      console.warn(`[collect-payment] Skipping JE for ${payNo}: dr=${drAccountId}, ar=${arId}`)
    }

    // 4. One ledger credit for the full amount
    await postCustomerLedger(conn, {
      customerId,
      date: pmtDate,
      transactionType: 'payment',
      referenceType: 'customer_payment',
      referenceId: paymentId,
      invoiceNumber: payNo,
      description: `Payment ${payNo} via ${method}` +
        (allocations.length ? ` — allocated to ${allocations.length} order(s)` : ' — on account'),
      debit: 0,
      credit: amount,
      journalEntryId: jeId,
      userId,
    })

    await auditLog(conn, {
      userId, action: 'payment_received', module: 'credit_sales',
      recordType: 'customer_payment', recordId: paymentId, referenceNumber: payNo,
      description: `Customer payment ${payNo} — ${customer.name} ৳${amount.toLocaleString()} via ${method}, ${allocations.length} allocation(s)`,
      severity: 'info',
    })

    await conn.commit()
    sendTelegram(
      `💰 <b>Customer Payment</b>\n${payNo} — ${customer.name}\n` +
      `৳${amount.toLocaleString()} via ${method} · ${allocations.length} order(s) allocated` +
      (allocatedTotal < amount ? `\n৳${(amount - allocatedTotal).toLocaleString()} on account` : '') +
      (autoReleasedOrders.length ? `\n🟢 Auto-released: ${autoReleasedOrders.join(', ')}` : '') +
      `\nby ${userName}`,
    )

    if (method !== 'Cash' && body?.bank_account_id) {
      bridgeCustomerPayment(getDb(), {
        paymentId, bankAccountId: Number(body.bank_account_id), method,
        amount, date: pmtDate, payerName: customer.name,
        referenceNumber: body?.reference_number, chequeNumber: body?.cheque_number, userId,
      })
    }

    return { ok: true, id: paymentId, payment_number: payNo, auto_released: autoReleasedOrders }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
