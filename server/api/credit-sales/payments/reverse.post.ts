import { getDb } from '~/server/utils/db'

// POST /api/credit-sales/payments/reverse
// Body: { payment_id, reason }
// Reverses a customer payment: restores balance, posts debit_note to ledger

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1
  const role    = (session?.user?.role ?? '').toLowerCase()

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
       WHERE p.id = ?`, [payment_id],
    )
    if (!pmt) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
    if ((pmt.notes ?? '').startsWith('REVERSED')) {
      throw createError({ statusCode: 409, statusMessage: 'Payment already reversed' })
    }

    const pmtAmount = Number(pmt.amount)
    const today     = new Date().toISOString().slice(0, 10)

    // Mark original payment as reversed in notes
    await conn.query(
      `UPDATE customer_payments
       SET notes = CONCAT('REVERSED on ', ?, ' — ', COALESCE(?, 'No reason given'), IF(notes IS NOT NULL, CONCAT(' | Orig: ', notes), '')),
           allocation_status = 'unallocated', updated_at = NOW()
       WHERE id = ?`,
      [today, reason ?? null, payment_id],
    )

    // Ledger: debit_note to reverse the credit that the payment created
    const [[lastLedger]] = await conn.query<any>(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [pmt.customer_id],
    )
    const prevBal = Number(lastLedger?.bal ?? 0)
    const newBal  = prevBal + pmtAmount   // reversal increases the balance back

    const refNo = `REV-${pmt.reference_number ?? pmt.id}`
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

    // Restore customer balance
    await conn.query(
      `UPDATE customers SET current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?`,
      [pmtAmount, pmt.customer_id],
    )

    // If payment was applied to an order, restore that order's balance_due
    // Find the order via the ledger or customer_payments allocation
    if (pmt.allocated_to_invoices) {
      try {
        const invoices = JSON.parse(pmt.allocated_to_invoices)
        for (const inv of (invoices as any[])) {
          if (inv.order_id) {
            await conn.query(
              `UPDATE credit_orders
               SET balance_due  = balance_due  + ?,
                   amount_paid  = GREATEST(0, amount_paid - ?),
                   updated_at   = NOW()
               WHERE id = ?`,
              [pmtAmount, pmtAmount, inv.order_id],
            )
          }
        }
      } catch {}
    }

    await conn.commit()
    return { ok: true, reversed_amount: pmtAmount, reference: refNo }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
