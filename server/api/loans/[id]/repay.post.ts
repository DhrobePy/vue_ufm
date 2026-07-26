import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ACCOUNTS_ROLES, checkTransactionLimit, queuePendingRequest,
  postJournalEntry, nextDocNumber,
} from '~/server/utils/creditOrders'
import { getLoansReceivableAccountId } from '~/server/utils/commodityTrading'
import { userCanAction } from '~/server/utils/permissions'

/**
 * POST /api/loans/:id/repay — collect a loan repayment.
 * Money-IN action: deliberately reuses the SAME collect_payment limit +
 * payment-approval policy as every other collection page (a separate loan
 * policy would be a loophole). JE reverses the disbursement: DR cash/bank /
 * CR Loans & Advances Receivable. Auto-closes the loan when fully repaid.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid loan ID' })
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const canCollect = await userCanAction({
    userId, role, module: 'credit_sales', page: 'all', action: 'collect_payment',
    roleFallback: [...ACCOUNTS_ROLES, 'collector'],
  })
  if (!canCollect) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to collect payments' })

  const amount = Number(body?.amount ?? 0)
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: 'Amount must be positive' })
  const validMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking']
  const method  = validMethods.includes(body?.payment_method) ? body.payment_method : 'Cash'
  const payDate = String(body?.repayment_date ?? new Date().toISOString().slice(0, 10))

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[loan]] = await conn.query<any>(
      `SELECT l.*, c.name AS customer_name, s.company_name AS supplier_name
       FROM loans l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN suppliers s ON s.id = l.supplier_id
       WHERE l.id = ? FOR UPDATE`, [id],
    )
    if (!loan) throw createError({ statusCode: 404, statusMessage: 'Loan not found' })
    if (loan.status !== 'active') throw createError({ statusCode: 409, statusMessage: `Loan is ${loan.status}` })
    if (amount > Number(loan.balance_due) + 0.005)
      throw createError({ statusCode: 400, statusMessage: `৳${amount.toLocaleString()} exceeds the balance due of ৳${Number(loan.balance_due).toLocaleString()}` })

    const borrowerName = loan.customer_name ?? loan.supplier_name ?? '—'

    const limitCheck = await checkTransactionLimit(conn, userId, role, amount, Boolean(body?.is_checker_review))
    if (!limitCheck.allowed) {
      const reqId = await queuePendingRequest(conn, {
        requestType: 'loan_repayment',
        payload: { ...body, loan_id: id },
        customerId: loan.customer_id ?? null,
        amount,
        referenceLabel: `${loan.loan_number} — ${borrowerName} — ৳${amount.toLocaleString()}`,
        requestedBy: userId,
        requestedReason: limitCheck.reason === 'policy' ? 'Payment approval policy (all payments)'
          : limitCheck.cap > 0 ? `Exceeds transaction limit of ৳${limitCheck.cap.toLocaleString()}` : 'No transaction limit configured',
      })
      await conn.commit()
      sendTelegram(
        `⏳ <b>Loan Repayment Queued</b>\n${loan.loan_number} — ${borrowerName}\n৳${amount.toLocaleString()} · Requested by ${userName}`,
        'payment_received')
      return { ok: true, queued: true, pending_request_id: reqId, message: `৳${amount.toLocaleString()} queued for a checker's approval.` }
    }

    const repayNo = await nextDocNumber(conn, 'LRP', 'loan_repayments')

    // JE: DR cash/bank / CR Loans & Advances Receivable
    let drAccountId: number | null = null
    if (method === 'Cash' && body?.cash_account_id) {
      const [[ca]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(body.cash_account_id)])
      drAccountId = ca?.chart_of_account_id ?? null
    } else if (body?.bank_account_id) {
      const [[ba]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(body.bank_account_id)])
      drAccountId = ba?.chart_of_account_id ?? null
    }
    const loansAcct = await getLoansReceivableAccountId(conn)
    let jeId: number | null = null
    if (drAccountId) {
      jeId = await postJournalEntry(conn, {
        date: payDate, description: `Loan repayment — ${repayNo} (${loan.loan_number}, ${borrowerName})`,
        docType: 'LoanRepayment', docId: 0, userId,
        lines: [
          { accountId: drAccountId, debit: amount, credit: 0, memo: repayNo },
          { accountId: loansAcct, debit: 0, credit: amount, memo: repayNo },
        ],
      })
    }

    const [res] = await conn.query<any>(
      `INSERT INTO loan_repayments
         (repayment_number, loan_id, customer_id, supplier_id, amount, repayment_date,
          payment_method, bank_account_id, cash_account_id, reference_number,
          journal_entry_id, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repayNo, id, loan.customer_id, loan.supplier_id, amount, payDate, method,
        body?.bank_account_id ? Number(body.bank_account_id) : null,
        body?.cash_account_id ? Number(body.cash_account_id) : null,
        body?.reference_number || repayNo, jeId, body?.notes ?? null, userId,
      ],
    )
    const repayId = res.insertId
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [repayId, jeId])

    // Cash in the box
    if (method === 'Cash' && body?.cash_account_id) {
      const cashId = Number(body.cash_account_id)
      const [[pcAcc]] = await conn.query<any>(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId])
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_in', ?, ?, 'loan_repayment', ?, ?, ?, ?)`,
        [cashId, pcAcc?.branch_id ?? null, amount, Number(pcAcc?.current_balance ?? 0) + amount,
         repayId, `Loan repayment ${repayNo} (${loan.loan_number})`, userId, payDate],
      )
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [amount, cashId])
    }

    // Self-healing balance + auto-close
    const newRepaid = Number(loan.amount_repaid) + amount
    const newBalance = Math.max(0, Number(loan.principal_amount) - newRepaid)
    await conn.query(
      `UPDATE loans SET amount_repaid = ?, balance_due = ?, status = ? WHERE id = ?`,
      [newRepaid, newBalance, newBalance <= 0.005 ? 'closed' : 'active', id],
    )

    await auditLog(conn, {
      userId, action: 'payment_received', module: 'loans', recordType: 'loan_repayment',
      recordId: repayId, referenceNumber: repayNo,
      description: `Loan repayment ${repayNo} — ৳${amount.toLocaleString()} against ${loan.loan_number} · balance ৳${newBalance.toLocaleString()}${newBalance <= 0.005 ? ' · LOAN CLOSED' : ''}`,
      severity: 'info',
    })
    await conn.commit()
    sendTelegram(
      `💵 <b>Loan Repayment</b>\n${repayNo} — ${borrowerName} (${loan.loan_number})\n৳${amount.toLocaleString()} via ${method} · balance ৳${newBalance.toLocaleString()}` +
      (newBalance <= 0.005 ? '\n✅ Loan fully repaid & closed' : ''),
      'payment_received')
    return { ok: true, id: repayId, repayment_number: repayNo, new_balance: newBalance, closed: newBalance <= 0.005 }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
