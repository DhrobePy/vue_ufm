import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  getGLAccountId, postJournalEntry, checkTransactionLimit, queuePendingRequest,
} from '~/server/utils/creditOrders'

/**
 * POST /api/pos/customers/:id/collect-payment — pay down a customer's POS
 * credit balance. Deliberately reuses the SAME collect_payment ৳ limit +
 * global payment-approval policy as every other money-in action (Credit
 * Sales, Trading, Loan repayments) rather than a POS-specific policy —
 * avoids a loophole where collecting via POS bypasses the org's stance.
 */
export default defineEventHandler(async (event) => {
  const customerId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const amount = Number(body?.amount ?? 0)
  if (!customerId || amount <= 0)
    throw createError({ statusCode: 400, statusMessage: 'customer id and a positive amount are required' })

  const validMethods = ['Cash', 'Bank Transfer', 'Card', 'Mobile Banking']
  const method  = validMethods.includes(body?.payment_method) ? body.payment_method : 'Cash'
  const pmtDate = body?.payment_date ?? new Date().toISOString().slice(0, 10)

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [[customer]] = await conn.query<any>(`SELECT id, name FROM customers WHERE id = ? FOR UPDATE`, [customerId])
    if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

    const limitCheck = await checkTransactionLimit(conn, userId, role, amount, Boolean(body?.is_checker_review))
    if (!limitCheck.allowed) {
      const limitDesc = limitCheck.reason === 'policy'
        ? 'payment approval policy — every payment needs a checker'
        : limitCheck.cap > 0 ? `exceeds your transaction limit of ৳${limitCheck.cap.toLocaleString()}`
        : 'no transaction limit has been delegated to your account yet'
      const reqId = await queuePendingRequest(conn, {
        requestType: 'collect_payment', payload: { ...body, pos: true }, customerId, amount,
        referenceLabel: `POS: ${customer.name} — ৳${amount.toLocaleString()} via ${method}`,
        requestedBy: userId,
        requestedReason: limitCheck.reason === 'policy' ? 'Payment approval policy (all payments)' : `Exceeds/no transaction limit`,
      })
      await conn.commit()
      sendTelegram(`⏳ <b>POS Payment Queued</b>\n${customer.name} — ৳${amount.toLocaleString()} via ${method}\nRequested by ${userName} (${limitDesc})`, 'payment_received')
      return { ok: true, queued: true, pending_request_id: reqId, message: `৳${amount.toLocaleString()} ${limitDesc} — queued for a checker's approval.` }
    }

    const [[ledgerRes]] = await conn.query<any>(
      `INSERT INTO pos_customer_ledger (customer_id, transaction_date, transaction_type, description, debit_amount, credit_amount, reference_number, created_by_user_id)
       VALUES (?, ?, 'payment', ?, 0, ?, ?, ?)`,
      [customerId, pmtDate, `POS credit payment via ${method}`, amount, body?.reference_number || null, userId],
    ) as any
    const ledgerId = ledgerRes.insertId

    let jeId: number | null = null
    let drAccountId: number | null = null
    if (method === 'Cash' && body?.cash_account_id) {
      const [[ca]] = await conn.query<any>(`SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(body.cash_account_id)])
      drAccountId = ca?.chart_of_account_id ?? null
    } else if (body?.bank_account_id) {
      const [[ba]] = await conn.query<any>(`SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(body.bank_account_id)])
      drAccountId = ba?.chart_of_account_id ?? null
    }
    const arId = await getGLAccountId(conn, 'Accounts Receivable')
    if (drAccountId && arId) {
      jeId = await postJournalEntry(conn, {
        date: pmtDate, description: `POS credit payment — ${customer.name} (${method})`,
        docType: 'PosPayment', docId: ledgerId, userId,
        lines: [{ accountId: drAccountId, debit: amount, credit: 0 }, { accountId: arId, debit: 0, credit: amount }],
      })
      if (method === 'Cash' && body?.cash_account_id) {
        const cashId = Number(body.cash_account_id)
        const [[pcAcc]] = await conn.query<any>(`SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId])
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_in', ?, ?, 'pos_payment', ?, ?, ?, ?)`,
          [cashId, pcAcc?.branch_id ?? null, amount, Number(pcAcc?.current_balance ?? 0) + amount, ledgerId, `POS credit payment — ${customer.name}`, userId, pmtDate],
        )
        await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [amount, cashId])
      }
    } else {
      console.warn(`[pos/collect-payment] Skipping JE: dr=${drAccountId}, ar=${arId}`)
    }

    await auditLog(conn, {
      userId, action: 'payment_received', module: 'other', recordType: 'pos_customer_ledger', recordId: ledgerId,
      description: `POS credit payment — ${customer.name} ৳${amount.toLocaleString()} via ${method}`,
      severity: 'info',
    })
    await conn.commit()
    sendTelegram(`💰 <b>POS Credit Payment</b>\n${customer.name}\n৳${amount.toLocaleString()} via ${method}\nby ${userName}`, 'payment_received')
    return { ok: true, id: ledgerId, journal_entry_id: jeId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
