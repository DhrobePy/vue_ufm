import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { ADMIN_ROLES, postJournalEntry, postCustomerLedger } from '~/server/utils/creditOrders'

/**
 * POST /api/credit-sales/payments/reverse
 * Body: { payment_id, reason }
 * Admin / superadmin only.
 *
 * Fully reverses a customer payment — mirrors every side effect the original
 * posting made (customer_payments/payment.post.ts and collect-payment.post.ts):
 *   - every order it was applied to (direct order_id, or split across many
 *     via payment_allocations — including advance allocations) has its
 *     amount_paid/advance_paid/balance_due restored, and is reopened from
 *     'completed' back to 'delivered' if this payment had closed it out
 *   - a reversing JE posts (mirror image of the original: swap debit/credit
 *     on the same accounts) rather than deleting the original entry
 *   - petty cash is reversed if the original went through one
 *   - a debit note posts to the customer ledger (ledger-truth aggregate via
 *     postCustomerLedger, which also keeps customers.current_balance in sync)
 */
export default defineEventHandler(async (event) => {
  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const userName  = (session.user as any).name ?? `User ${userId}`
  const role      = ((session.user as any).role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can reverse payments' })

  const { payment_id, reason } = body ?? {}
  if (!payment_id) throw createError({ statusCode: 400, statusMessage: 'payment_id is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()

    const [[pmt]] = await conn.query<any>(
      `SELECT p.*, c.name AS customer_name
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = ? FOR UPDATE`,
      [payment_id],
    )
    if (!pmt) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    if (pmt.reversed_at) throw createError({ statusCode: 409, statusMessage: 'Payment is already reversed' })

    const pmtAmount = Number(pmt.amount)
    const today     = new Date().toISOString().slice(0, 10)
    const refNo     = `REV-${pmt.payment_number ?? pmt.id}`

    // 1. Which orders did this payment touch, and how much of each?
    const affected: { orderId: number; amount: number; asAdvance: boolean }[] = []
    if (pmt.order_id) {
      affected.push({ orderId: pmt.order_id, amount: pmtAmount, asAdvance: false })
    } else {
      const [allocs] = await conn.query<any>(
        `SELECT order_id, allocated_amount, as_advance
         FROM payment_allocations WHERE payment_id = ? AND reversed = 0`,
        [payment_id],
      )
      for (const a of allocs)
        affected.push({ orderId: a.order_id, amount: Number(a.allocated_amount), asAdvance: !!Number(a.as_advance) })
    }

    // 2. Restore each affected order's balance
    const orderSummaries: string[] = []
    for (const a of affected) {
      const [[o]] = await conn.query<any>(
        `SELECT id, order_number, status, total_amount, amount_paid, advance_paid
         FROM credit_orders WHERE id = ? FOR UPDATE`,
        [a.orderId],
      )
      if (!o) continue // order no longer exists — skip, don't block the reversal

      const newPaid    = a.asAdvance ? Number(o.amount_paid)   : Math.max(0, Number(o.amount_paid)   - a.amount)
      const newAdvance = a.asAdvance ? Math.max(0, Number(o.advance_paid) - a.amount) : Number(o.advance_paid)
      const newBalance = Math.max(0, Number(o.total_amount) - newPaid - newAdvance)
      // Reopen an order this payment had auto-completed — its balance is due again.
      const newStatus  = (o.status === 'completed' && newBalance > 0) ? 'delivered' : o.status

      await conn.query(
        `UPDATE credit_orders
         SET amount_paid = ?, advance_paid = ?, balance_due = ?, status = ?, updated_at = NOW()
         WHERE id = ?`,
        [newPaid, newAdvance, newBalance, newStatus, a.orderId],
      )
      await conn.query(
        `INSERT INTO credit_order_workflow
           (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, 'payment_reversed', ?, ?, NOW())`,
        [a.orderId, o.status, newStatus, userId,
         `${refNo} — ৳${a.amount.toLocaleString()} reversed${reason ? ` (${reason})` : ''}`],
      )
      orderSummaries.push(`${o.order_number} -৳${a.amount.toLocaleString()}`)
    }

    if (!pmt.order_id)
      await conn.query(`UPDATE payment_allocations SET reversed = 1 WHERE payment_id = ?`, [payment_id])

    // 3. Reversing JE — mirror image of the original posting (swap Dr/Cr on
    //    the same accounts), not a delete — the original entry stays intact.
    let reversalJeId: number | null = null
    if (pmt.journal_entry_id) {
      const [origLines] = await conn.query<any>(
        `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
        [pmt.journal_entry_id],
      )
      if (origLines.length) {
        reversalJeId = await postJournalEntry(conn, {
          date: today,
          description: `Reversal of ${pmt.payment_number} — ${pmt.customer_name}${reason ? ` (${reason})` : ''}`,
          docType: 'CustomerPaymentReversal',
          docId: Number(payment_id),
          userId,
          lines: origLines.map((l: any) => ({
            accountId: l.account_id,
            debit:  Number(l.credit_amount),
            credit: Number(l.debit_amount),
          })),
        })
      }
    }

    // 4. Reverse the petty cash movement, if the original payment went through one
    if (pmt.cash_account_id) {
      const [[pcAcc]] = await conn.query<any>(
        `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
        [pmt.cash_account_id],
      )
      if (pcAcc) {
        await conn.query(
          `INSERT INTO branch_petty_cash_transactions
             (account_id, branch_id, transaction_type, amount, balance_after,
              reference_type, reference_id, description, created_by_user_id, transaction_date)
           VALUES (?, ?, 'cash_out', ?, ?, 'customer_payment_reversal', ?, ?, ?, ?)`,
          [pmt.cash_account_id, pcAcc.branch_id, pmtAmount, Number(pcAcc.current_balance) - pmtAmount,
           payment_id, `Reversal of ${pmt.payment_number} — ${pmt.customer_name}`, userId, today],
        )
        await conn.query(
          `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
          [pmtAmount, pmt.cash_account_id],
        )
      }
    }

    // 5. Ledger debit note — ledger-truth aggregate, also syncs customers.current_balance
    await postCustomerLedger(conn, {
      customerId:      pmt.customer_id,
      date:            today,
      transactionType: 'debit_note',
      referenceType:   'payment_reversal',
      referenceId:     Number(payment_id),
      invoiceNumber:   refNo,
      description:     `Payment Reversal — ${refNo}${reason ? ` (${reason})` : ''}`,
      debit:           pmtAmount,
      credit:          0,
      journalEntryId:  reversalJeId,
      userId,
    })

    // 6. Mark the payment reversed
    await conn.query(
      `UPDATE customer_payments
       SET reversed_at = NOW(), reversed_by_user_id = ?, reversal_reason = ?,
           reversal_journal_entry_id = ?, allocation_status = 'unallocated', updated_at = NOW()
       WHERE id = ?`,
      [userId, reason ?? null, reversalJeId, payment_id],
    )

    // 7. Audit log
    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'credit_sales',
      recordType:      'customer_payment',
      recordId:        Number(payment_id),
      referenceNumber: refNo,
      description:     `Payment reversed — ${refNo} · ৳${pmtAmount.toLocaleString()} for ${pmt.customer_name}` +
                        (orderSummaries.length ? ` · ${orderSummaries.join(', ')}` : '') +
                        (reason ? ` · Reason: ${reason}` : ''),
      severity:        'warning',
      ipAddress,
    })

    await conn.commit()
    sendTelegram(
      `↩️ <b>Payment Reversed</b>\n${pmt.payment_number} — ৳${pmtAmount.toLocaleString()} for ${pmt.customer_name}\n` +
      (orderSummaries.length ? `${orderSummaries.join(', ')}\n` : '') +
      `by ${userName}${reason ? `\nReason: ${reason}` : ''}`,
    )
    return { ok: true, reversed_amount: pmtAmount, reference: refNo, reversal_journal_entry_id: reversalJeId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
