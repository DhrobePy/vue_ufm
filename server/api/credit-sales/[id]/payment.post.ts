import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    amount,
    payment_method,
    reference_number,
    bank_account_id,
    payment_date,
    notes,
  } = body ?? {}

  if (!amount || Number(amount) <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Payment amount must be greater than zero' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Load the order to get customer_id and balance
    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, balance_due, amount_paid FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const pmtAmount  = Number(amount)
    const newPaid    = Number(order.amount_paid ?? 0) + pmtAmount
    const newBalance = Math.max(0, Number(order.balance_due ?? 0) - pmtAmount)

    // Generate receipt number
    const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`,
    )
    const seq       = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const autoRef   = reference_number || `PMT-${today}-${seq}`

    // Insert into customer_payments
    const [result] = await conn.query<any>(
      `INSERT INTO customer_payments
         (customer_id, credit_order_id, payment_date, amount, payment_method,
          reference_number, bank_account_id,
          collected_by_user_id, allocation_status, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?,
               ?, ?,
               ?, 'unallocated', ?, ?)`,
      [
        order.customer_id,
        id,
        payment_date ?? new Date().toISOString().slice(0, 10),
        pmtAmount,
        payment_method ?? 'cash',
        autoRef,
        bank_account_id ? Number(bank_account_id) : null,
        userId,
        notes ?? null,
        userId,
      ],
    )

    // Update order's paid / balance
    await conn.query(
      `UPDATE credit_orders SET amount_paid = ?, balance_due = ?, updated_at = NOW() WHERE id = ?`,
      [newPaid, newBalance, id],
    )

    // Update customer current_balance (reduce by payment amount)
    await conn.query(
      `UPDATE customers SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW() WHERE id = ?`,
      [pmtAmount, order.customer_id],
    )

    // ── Write customer ledger entry (payment credit) ──────────
    const [[lastLedger]] = await conn.query<any>(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [order.customer_id],
    )
    const prevBal  = Number(lastLedger?.bal ?? 0)
    const newBal   = Math.max(0, prevBal - pmtAmount)

    await conn.query(
      `INSERT INTO customer_ledger
         (customer_id, transaction_date, transaction_type, reference_type, reference_id,
          invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
       VALUES (?, ?, 'payment', 'customer_payment', ?,
               ?, ?, 0, ?, ?, ?)`,
      [
        order.customer_id,
        payment_date ?? new Date().toISOString().slice(0, 10),
        result.insertId,
        autoRef,
        `Payment received — ${autoRef} (${payment_method ?? 'Cash'})`,
        pmtAmount,
        newBal,
        userId,
      ],
    )

    await conn.commit()
    return { ok: true, id: result.insertId, reference_number: autoRef, new_balance: newBalance }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
