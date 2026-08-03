import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ACCOUNTS_ROLES, checkTransactionLimit, queuePendingRequest,
  getGLAccountId, postJournalEntry, postCustomerLedger, nextDocNumber,
} from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'
import { bridgeCustomerPayment } from '~/server/utils/bankBridge'

/**
 * POST /api/trading/sales/:id/payment — collect against a commodity sale.
 *
 * Deliberately writes commodity_sale_payments (NOT customer_payments — its
 * reversal paths parse allocations as credit-order maps). The customer's
 * true balance still updates through a normal customer_ledger CREDIT, so
 * this behaves identically to any other payment in their statement.
 * Reuses the SAME collect_payment limit + payment-approval policy as every
 * other collection page — a separate policy here would be a loophole.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid sale ID' })
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const canCollect = await userCanAction({
    userId, role, module: 'credit_sales', page: 'all', action: 'collect_payment',
    roleFallback: [...ACCOUNTS_ROLES, 'collector'],
  })
  if (!canCollect) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to collect payments' })

  const amount = Number(body?.amount ?? 0)
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: 'Payment amount must be positive' })
  const validMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking', 'Card']
  const method  = validMethods.includes(body?.payment_method) ? body.payment_method : 'Cash'
  const pmtDate = body?.payment_date ?? new Date().toISOString().slice(0, 10)

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[sale]] = await conn.query<any>(
      `SELECT s.*, c.name AS customer_name FROM commodity_sales s
       JOIN customers c ON c.id = s.customer_id WHERE s.id = ? FOR UPDATE`, [id],
    )
    if (!sale) throw createError({ statusCode: 404, statusMessage: 'Sale not found' })
    if (sale.status !== 'posted') throw createError({ statusCode: 409, statusMessage: `Sale is ${sale.status} — cannot collect against it` })
    if (amount > Number(sale.balance_due) + 0.005)
      throw createError({ statusCode: 400, statusMessage: `৳${amount.toLocaleString()} exceeds the sale's balance due of ৳${Number(sale.balance_due).toLocaleString()}` })

    const limitCheck = await checkTransactionLimit(conn, userId, role, amount, Boolean(body?.is_checker_review))
    if (!limitCheck.allowed) {
      const reqId = await queuePendingRequest(conn, {
        requestType: 'commodity_payment',
        payload: { ...body, sale_id: id },
        customerId: sale.customer_id,
        amount,
        referenceLabel: `${sale.sale_number} — ${sale.customer_name} — ৳${amount.toLocaleString()}`,
        requestedBy: userId,
        requestedReason: limitCheck.reason === 'policy' ? 'Payment approval policy (all payments)'
          : limitCheck.cap > 0 ? `Exceeds transaction limit of ৳${limitCheck.cap.toLocaleString()}` : 'No transaction limit configured',
      })
      await conn.commit()
      sendTelegram(
        `⏳ <b>Commodity Payment Queued</b>\n${sale.sale_number} — ${sale.customer_name}\n৳${amount.toLocaleString()} · Requested by ${userName}`,
        'payment_received')
      return { ok: true, queued: true, pending_request_id: reqId, message: `৳${amount.toLocaleString()} queued for a checker's approval.` }
    }

    const payNo = await nextDocNumber(conn, 'CTP', 'commodity_sale_payments', 'payment_number')

    // JE: DR cash/bank, CR Accounts Receivable
    let drAccountId: number | null = null
    if (method === 'Cash' && body?.cash_account_id) {
      const [[ca]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(body.cash_account_id)],
      )
      drAccountId = ca?.chart_of_account_id ?? null
    } else if (body?.bank_account_id) {
      const [[ba]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(body.bank_account_id)],
      )
      drAccountId = ba?.chart_of_account_id ?? null
    }
    const arId = await getGLAccountId(conn, 'Accounts Receivable')
    let jeId: number | null = null
    if (drAccountId && arId) {
      jeId = await postJournalEntry(conn, {
        date: pmtDate, description: `Commodity payment — ${payNo} (${sale.sale_number})`,
        docType: 'CommoditySalePayment', docId: 0, userId,
        lines: [
          { accountId: drAccountId, debit: amount, credit: 0, memo: payNo },
          { accountId: arId, debit: 0, credit: amount, memo: payNo },
        ],
      })
    }

    // Ledger CREDIT — pinned back to this payment row afterwards
    const ledgerId = await postCustomerLedger(conn, {
      customerId: sale.customer_id, date: pmtDate, transactionType: 'payment',
      referenceType: 'commodity_sale_payment', referenceId: id, invoiceNumber: payNo,
      description: `Payment — ${payNo} against ${sale.sale_number} via ${method}`,
      debit: 0, credit: amount, journalEntryId: jeId, userId,
    })

    const [payRes] = await conn.query<any>(
      `INSERT INTO commodity_sale_payments
         (payment_number, sale_id, customer_id, payment_date, amount, payment_method,
          bank_account_id, cash_account_id, reference_number, journal_entry_id,
          customer_ledger_id, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payNo, id, sale.customer_id, pmtDate, amount, method,
        body?.bank_account_id ? Number(body.bank_account_id) : null,
        body?.cash_account_id ? Number(body.cash_account_id) : null,
        body?.reference_number || payNo, jeId, ledgerId, body?.notes ?? null, userId,
      ],
    )
    const paymentId = payRes.insertId
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [paymentId, jeId])

    // Petty-cash movement when cash — after the payment row exists so the
    // movement's reference_id points at the real payment.
    if (method === 'Cash' && body?.cash_account_id) {
      const cashId = Number(body.cash_account_id)
      const [[pcAcc]] = await conn.query<any>(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId],
      )
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_in', ?, ?, 'commodity_sale_payment', ?, ?, ?, ?)`,
        [cashId, pcAcc?.branch_id ?? null, amount, Number(pcAcc?.current_balance ?? 0) + amount,
         paymentId, `Commodity payment ${payNo} (${sale.sale_number})`, userId, pmtDate],
      )
      await conn.query(
        `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
        [amount, cashId],
      )
    }

    // Sale balances — advance-aware formula
    const newPaid = Number(sale.amount_paid) + amount
    const newBalance = Math.max(0, Number(sale.total_amount) - Number(sale.advance_paid) - newPaid)
    await conn.query(
      `UPDATE commodity_sales SET amount_paid = ?, balance_due = ? WHERE id = ?`,
      [newPaid, newBalance, id],
    )

    await auditLog(conn, {
      userId, action: 'payment_received', module: 'trading', recordType: 'commodity_sale_payment',
      recordId: paymentId, referenceNumber: payNo,
      description: `Commodity payment ${payNo} — ৳${amount.toLocaleString()} against ${sale.sale_number} · balance ৳${newBalance.toLocaleString()}`,
      severity: 'info', ipAddress,
    })

    await conn.commit()
    sendTelegram(
      `💰 <b>Commodity Payment</b>\n${payNo} — ${sale.customer_name} (${sale.sale_number})\n৳${amount.toLocaleString()} via ${method} · balance ৳${newBalance.toLocaleString()}`,
      'payment_received')

    if (method !== 'Cash' && body?.bank_account_id) {
      bridgeCustomerPayment(getDb(), {
        paymentId, bankAccountId: Number(body.bank_account_id), method,
        amount, date: pmtDate, payerName: sale.customer_name,
        referenceNumber: body?.reference_number, userId,
      })
    }

    return { ok: true, id: paymentId, payment_number: payNo, new_balance: newBalance }
  } catch (e: any) {
    await conn.rollback()
    if (e?.statusCode) throw e
    console.error('[trading/payment] failed:', e?.message)
    throw createError({ statusCode: 500, statusMessage: e?.sqlMessage ?? e?.message ?? 'Payment failed' })
  } finally {
    conn.release()
  }
})
