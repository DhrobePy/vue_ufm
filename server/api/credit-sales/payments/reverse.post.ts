import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/credit-sales/payments/reverse
 * Body: { payment_id, reason }
 * Admin / superadmin only.
 * Reverses a customer payment: voids the ledger credit, restores order balance_due,
 * and increments the customer's running balance.
 */
export default defineEventHandler(async (event) => {
  const body      = await readBody(event)
  const session   = await getUserSession(event)
  const userId    = session?.user?.id ?? 1
  const role      = (session?.user?.role ?? '').toLowerCase()
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can reverse payments' })
  }

  const { payment_id, reason } = body ?? {}
  if (!payment_id) throw createError({ statusCode: 400, statusMessage: 'payment_id is required' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Load the payment
    const [[pmt]] = await conn.query<any>(
      `SELECT p.*, c.name AS customer_name
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = ?`,
      [payment_id],
    )
    if (!pmt) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    if ((pmt.notes ?? '').startsWith('REVERSED')) {
      throw createError({ statusCode: 409, statusMessage: 'Payment is already reversed' })
    }

    const pmtAmount = Number(pmt.amount)
    const today     = new Date().toISOString().slice(0, 10)

    // 1. Mark the original payment record as reversed
    await conn.query(
      `UPDATE customer_payments
       SET notes             = CONCAT('REVERSED on ', ?, ' — ', COALESCE(?, 'No reason given'),
                               IF(notes IS NOT NULL AND notes != '', CONCAT(' | Orig: ', notes), '')),
           allocation_status = 'unallocated',
           updated_at        = NOW()
       WHERE id = ?`,
      [today, reason ?? null, payment_id],
    )

    // 2. Post a debit_note to the customer ledger to reverse the credit
    const [[lastLedger]] = await conn.query<any>(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [pmt.customer_id],
    )
    const prevBal = Number(lastLedger?.bal ?? 0)
    const newBal  = prevBal + pmtAmount   // reversal increases balance back

    const refNo = `REV-${pmt.payment_number ?? pmt.id}`
    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, transaction_date, transaction_type, reference_type, reference_id,
          invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
       VALUES (?, ?, 'debit_note', 'payment_reversal', ?, ?, ?, ?, 0, ?, ?)`,
      [
        pmt.customer_id, today, payment_id, refNo,
        `Payment Reversal — ${refNo}${reason ? ` (${reason})` : ''}`,
        pmtAmount, newBal, userId,
      ],
    )

    // 3. Restore the customer's running balance
    await conn.query(
      `UPDATE customers
       SET current_balance = current_balance + ?, updated_at = NOW()
       WHERE id = ?`,
      [pmtAmount, pmt.customer_id],
    )

    // 4. Restore the order's balance_due and amount_paid using order_id column
    //    (order_id was added by the db-migrate plugin)
    if (pmt.order_id) {
      await conn.query(
        `UPDATE credit_orders
         SET balance_due = balance_due + ?,
             amount_paid = GREATEST(0, amount_paid - ?),
             updated_at  = NOW()
         WHERE id = ?`,
        [pmtAmount, pmtAmount, pmt.order_id],
      )
    }

    // 5. Audit log
    await auditLog(conn, {
      userId,
      action:          'other',
      module:          'credit_sales',
      recordType:      'customer_payment',
      recordId:        pmt.order_id ?? payment_id,
      referenceNumber: refNo,
      description:     `Payment reversed — ${refNo} · ৳${pmtAmount.toLocaleString()} for ${pmt.customer_name}${reason ? ` · Reason: ${reason}` : ''}`,
      severity:        'warning',
      ipAddress,
    })

    await conn.commit()
    return { ok: true, reversed_amount: pmtAmount, reference: refNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
