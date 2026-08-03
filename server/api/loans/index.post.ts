import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import {
  ADMIN_ROLES, ACCOUNTS_ROLES, isAdminRole,
  getUserActionLimit, getCreditWorkflowSettings, queuePendingRequest,
  postJournalEntry, nextDocNumber,
} from '~/server/utils/creditOrders'
import { getLoansReceivableAccountId } from '~/server/utils/commodityTrading'
import { userCanAction } from '~/server/utils/permissions'

/**
 * POST /api/loans — disburse a related-party cash advance.
 *
 * Loans are a THIRD balance kind: never posted into customer_ledger or
 * supplier_ledger (no honest transaction_type exists there). Accounting:
 * DR Loans & Advances Receivable (1450) / CR cash-or-bank. Borrower must be
 * an existing customer XOR supplier. Maker/checker uses the dedicated
 * loan_disbursement ৳ limit — lending cash is its own risk profile.
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId   = Number((session.user as any).id)
  const userName = (session.user as any).name ?? `User ${userId}`
  const role     = ((session.user as any).role ?? '').toLowerCase()

  const canDisburse = await userCanAction({
    userId, role, module: 'loans', page: 'loans', action: 'disburse',
    roleFallback: [...ADMIN_ROLES, ...ACCOUNTS_ROLES],
  })
  if (!canDisburse) throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to disburse loans' })

  const customerId = body?.customer_id ? Number(body.customer_id) : null
  const supplierId = body?.supplier_id ? Number(body.supplier_id) : null
  const amount     = Number(body?.amount ?? 0)
  if ((!customerId && !supplierId) || (customerId && supplierId))
    throw createError({ statusCode: 400, statusMessage: 'Pick exactly ONE borrower — a customer or a supplier' })
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: 'Amount must be positive' })

  const validMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking']
  const method   = validMethods.includes(body?.payment_method) ? body.payment_method : 'Cash'
  const loanDate = String(body?.loan_date ?? new Date().toISOString().slice(0, 10))

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    let borrowerName = ''
    if (customerId) {
      const [[c]] = await conn.query<any>(`SELECT name FROM customers WHERE id = ?`, [customerId])
      if (!c) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
      borrowerName = c.name
    } else {
      const [[s]] = await conn.query<any>(`SELECT company_name FROM suppliers WHERE id = ?`, [supplierId])
      if (!s) throw createError({ statusCode: 404, statusMessage: 'Supplier not found' })
      borrowerName = s.company_name
    }

    // ── Maker/checker: dedicated loan_disbursement limit ────────────────────
    if (!isAdminRole(role) && !body?.is_checker_review) {
      const { paymentRequireApproval } = await getCreditWorkflowSettings(conn)
      const cap = await getUserActionLimit(conn, userId, 'loan_disbursement')
      const withinCap = cap !== null && amount <= cap
      if (paymentRequireApproval || !withinCap) {
        const reqId = await queuePendingRequest(conn, {
          requestType: 'loan_disbursement',
          payload: body,
          customerId: customerId ?? null,
          amount,
          referenceLabel: `LOAN — ${borrowerName} — ৳${amount.toLocaleString()}`,
          requestedBy: userId,
          requestedReason: cap === null ? 'No loan-disbursement limit configured' : `Exceeds loan limit of ৳${cap.toLocaleString()}`,
        })
        await conn.commit()
        sendTelegram(
          `⏳ <b>Loan Disbursement Queued</b>\n${borrowerName} — ৳${amount.toLocaleString()}\nRequested by ${userName}`,
          'payment')
        return { ok: true, queued: true, pending_request_id: reqId, message: `Loan of ৳${amount.toLocaleString()} queued for a checker's approval.` }
      }
    }

    const loanNo = await nextDocNumber(conn, 'LN', 'loans', 'loan_number')

    // JE: DR Loans & Advances Receivable / CR cash-or-bank (money OUT)
    let crAccountId: number | null = null
    if (method === 'Cash' && body?.cash_account_id) {
      const [[ca]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [Number(body.cash_account_id)])
      crAccountId = ca?.chart_of_account_id ?? null
    } else if (body?.bank_account_id) {
      const [[ba]] = await conn.query<any>(
        `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(body.bank_account_id)])
      crAccountId = ba?.chart_of_account_id ?? null
    }
    const loansAcct = await getLoansReceivableAccountId(conn)
    let jeId: number | null = null
    if (crAccountId) {
      jeId = await postJournalEntry(conn, {
        date: loanDate, description: `Loan disbursed — ${loanNo} to ${borrowerName}`,
        docType: 'Loan', docId: 0, userId,
        lines: [
          { accountId: loansAcct, debit: amount, credit: 0, memo: loanNo },
          { accountId: crAccountId, debit: 0, credit: amount, memo: loanNo },
        ],
      })
    }

    // Cash: money leaves the petty cash box
    if (method === 'Cash' && body?.cash_account_id) {
      const cashId = Number(body.cash_account_id)
      const [[pcAcc]] = await conn.query<any>(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashId])
      const bal = Number(pcAcc?.current_balance ?? 0)
      if (bal < amount) throw createError({ statusCode: 400, statusMessage: `Petty cash only has ৳${bal.toLocaleString()}` })
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_out', ?, ?, 'loan', 0, ?, ?, ?)`,
        [cashId, pcAcc?.branch_id ?? null, amount, bal - amount, `Loan ${loanNo} to ${borrowerName}`, userId, loanDate],
      )
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`, [amount, cashId])
    }

    const [res] = await conn.query<any>(
      `INSERT INTO loans
         (loan_number, customer_id, supplier_id, principal_amount, balance_due,
          loan_date, expected_return_date, purpose, payment_method,
          bank_account_id, cash_account_id, reference_number, status,
          journal_entry_id, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        loanNo, customerId, supplierId, amount, amount,
        loanDate, body?.expected_return_date || null, body?.purpose ?? null, method,
        body?.bank_account_id ? Number(body.bank_account_id) : null,
        body?.cash_account_id ? Number(body.cash_account_id) : null,
        body?.reference_number || loanNo, jeId, userId,
      ],
    )
    const loanId = res.insertId
    if (jeId) await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [loanId, jeId])
    // Fix petty-cash reference now that the loan id exists
    if (method === 'Cash' && body?.cash_account_id) {
      await conn.query(
        `UPDATE branch_petty_cash_transactions SET reference_id = ?
         WHERE reference_type = 'loan' AND reference_id = 0 AND description LIKE ?`,
        [loanId, `Loan ${loanNo}%`],
      )
    }

    await auditLog(conn, {
      userId, action: 'created', module: 'loans', recordType: 'loan',
      recordId: loanId, referenceNumber: loanNo,
      description: `Loan ${loanNo} — ৳${amount.toLocaleString()} to ${borrowerName} (${customerId ? 'customer' : 'supplier'}) via ${method}`,
      severity: 'warning',
    })
    await conn.commit()
    sendTelegram(
      `🤝 <b>Loan Disbursed</b>\n${loanNo} — ${borrowerName}\n৳${amount.toLocaleString()} via ${method} · by ${userName}` +
      (body?.expected_return_date ? `\nExpected return: ${body.expected_return_date}` : ''),
      'payment')
    return { ok: true, id: loanId, loan_number: loanNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
