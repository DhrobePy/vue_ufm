import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  const userId    = session?.user?.id ?? 1
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

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

  // Map frontend method values → actual customer_payments ENUM
  const methodMap: Record<string, string> = {
    cash:  'Cash',
    bkash: 'Mobile Banking',
    nagad: 'Mobile Banking',
    bank:  'Bank Transfer',
  }
  const mappedMethod = methodMap[payment_method ?? ''] ?? 'Cash'

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Load the order
    const [[order]] = await conn.query<any>(
      `SELECT id, customer_id, balance_due, amount_paid, status FROM credit_orders WHERE id = ?`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const pmtAmount  = Number(amount)
    const newPaid    = Number(order.amount_paid ?? 0) + pmtAmount
    const newBalance = Math.max(0, Number(order.balance_due ?? 0) - pmtAmount)

    // Generate payment number (PAY-YYYYMMDD-XXXX)
    const today   = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`,
    )
    const seq      = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const payNo    = `PAY-${today}-${seq}`
    const autoRef  = reference_number || payNo

    // Insert into customer_payments (matches actual table schema)
    const [result] = await conn.query<any>(
      `INSERT INTO customer_payments
         (payment_number, customer_id, payment_date, amount, payment_method,
          payment_type, reference_number, bank_account_id,
          allocation_status, allocated_amount, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?,
               'invoice_payment', ?, ?,
               'unallocated', 0, ?, ?)`,
      [
        payNo,
        order.customer_id,
        payment_date ?? new Date().toISOString().slice(0, 10),
        pmtAmount,
        mappedMethod,
        autoRef,
        bank_account_id ? Number(bank_account_id) : null,
        notes ?? null,
        userId,
      ],
    )

    // Update order paid / balance
    // NOTE: 'completed' is not in the credit_orders.status ENUM — we derive it in
    // the API response (balance_due = 0 → show as completed). Status stays 'delivered'.
    const isNowComplete = newBalance === 0 && order.status === 'delivered'
    await conn.query(
      `UPDATE credit_orders
       SET amount_paid = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newPaid, newBalance, id],
    )

    // Reduce customer current_balance
    await conn.query(
      `UPDATE customers SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW() WHERE id = ?`,
      [pmtAmount, order.customer_id],
    )

    // ── Customer ledger entry (payment credit) ─────────────
    const [[lastLedger]] = await conn.query<any>(
      `SELECT COALESCE(balance_after, 0) AS bal
       FROM customer_ledger WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 1`,
      [order.customer_id],
    )
    const prevBal = Number(lastLedger?.bal ?? 0)
    const newBal  = Math.max(0, prevBal - pmtAmount)

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
        `Payment received — ${payNo} (${mappedMethod})`,
        pmtAmount,
        newBal,
        userId,
      ],
    )

    // ── Workflow timeline entry ────────────────────────────
    const wfToStatus  = isNowComplete ? 'completed' : order.status
    const wfAction    = isNowComplete ? 'completed'  : 'payment_received'
    const wfComments  = `Payment ${payNo} received — ৳${pmtAmount.toLocaleString()} via ${mappedMethod}${isNowComplete ? ' · Order fully paid' : ''}`
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, order.status, wfToStatus, wfAction, userId, wfComments],
    )

    // ── System audit log ───────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          isNowComplete ? 'order_completed' : 'payment_received',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        id,
      referenceNumber: payNo,
      description:     isNowComplete
        ? `Order fully paid & completed — ${payNo} · ৳${pmtAmount.toLocaleString()} via ${mappedMethod}`
        : `Payment received — ${payNo} · ৳${pmtAmount.toLocaleString()} via ${mappedMethod} · balance ৳${newBalance.toLocaleString()} remaining`,
      severity:        'info',
      ipAddress,
    })

    await conn.commit()
    return {
      ok: true,
      id: result.insertId,
      reference_number: payNo,
      new_balance: newBalance,
      completed: isNowComplete,
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
