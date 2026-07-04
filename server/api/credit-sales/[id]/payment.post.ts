import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { getOrderGateState, enforceTransactionLimit } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const id      = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number((session.user as any).id)
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const {
    amount,
    payment_method,
    reference_number,
    bank_account_id,
    cash_account_id,   // petty cash account when method = cash
    payment_date,
    notes,
  } = body ?? {}

  if (!amount || Number(amount) <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Payment amount must be greater than zero' })
  }

  // Map frontend method values → stored payment_method values
  const methodMap: Record<string, string> = {
    cash:  'Cash',
    bkash: 'Mobile Banking',
    nagad: 'Mobile Banking',
    bank:  'Bank Transfer',
  }
  const mappedMethod = methodMap[payment_method ?? ''] ?? payment_method ?? 'Cash'

  const db   = getDb()
  const conn = await db.getConnection()
  const pmtDate = payment_date ?? new Date().toISOString().slice(0, 10)

  try {
    await conn.beginTransaction()

    // Load the order (locked — concurrent payments must serialize)
    const [[order]] = await conn.query<any>(
      `SELECT o.id, o.customer_id, o.order_number, o.balance_due, o.amount_paid, o.status,
              c.name AS customer_name
       FROM credit_orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? FOR UPDATE`, [id],
    )
    if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

    const role = ((session.user as any).role ?? '').toLowerCase()
    await enforceTransactionLimit(conn, userId, role, Number(amount))

    const pmtAmount  = Number(amount)
    const newPaid    = Number(order.amount_paid ?? 0) + pmtAmount
    const newBalance = Math.max(0, Number(order.balance_due ?? 0) - pmtAmount)

    // Generate payment number (PAY-YYYYMMDD-XXXX)
    // IMPORTANT: derive today from CURDATE() — NOT from new Date().toISOString() (UTC).
    // The server is Bangladesh (UTC+6); after 18:00 UTC the JS date is still "yesterday"
    // while CURDATE() is already "today".  Using them inconsistently makes the COUNT
    // return 0 (no payments "today") while the generated number duplicates yesterday's
    // already-committed payment → UNIQUE KEY violation → 500 error.
    const [[seq_row]] = await conn.query<any>(
      `SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d,
              COUNT(*) AS n
       FROM   customer_payments
       WHERE  DATE(created_at) = CURDATE()`,
    )
    const today = seq_row.d as string
    const seq   = String((seq_row.n ?? 0) + 1).padStart(4, '0')
    const payNo = `PAY-${today}-${seq}`
    const autoRef  = reference_number || payNo

    // Insert into customer_payments — order_id links this payment back to the order
    const [result] = await conn.query<any>(
      `INSERT INTO customer_payments
         (order_id, payment_number, customer_id, payment_date, amount, payment_method,
          payment_type, reference_number, bank_account_id, cash_account_id,
          allocation_status, allocated_amount, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?,
               'invoice_payment', ?, ?, ?,
               'allocated', ?, ?, ?)`,
      [
        id,
        payNo,
        order.customer_id,
        pmtDate,
        pmtAmount,
        mappedMethod,
        autoRef,
        bank_account_id  ? Number(bank_account_id)  : null,
        cash_account_id  ? Number(cash_account_id)  : null,
        pmtAmount,
        notes ?? null,
        userId,
      ],
    )
    const paymentId = result.insertId

    // Update order paid / balance
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
        pmtDate,
        paymentId,
        autoRef.slice(0, 50),   // invoice_number VARCHAR(50) — truncate long refs
        `Payment received — ${payNo} (${mappedMethod})`,
        pmtAmount,
        newBal,
        userId,
      ],
    )

    // ── GL Journal Entry ───────────────────────────────────
    // DR: cash or bank GL account (asset increases — money received)
    // CR: Accounts Receivable    (asset decreases — customer owes less)
    try {
      let drAccountId: number | null = null

      if (mappedMethod === 'Cash' && cash_account_id) {
        const [[ca]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
          [Number(cash_account_id)],
        )
        drAccountId = ca?.chart_of_account_id ?? null
      } else if (['Bank Transfer', 'Cheque', 'Card'].includes(mappedMethod) && bank_account_id) {
        const [[ba]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)],
        )
        drAccountId = ba?.chart_of_account_id ?? null
      } else if (mappedMethod === 'Mobile Banking' && bank_account_id) {
        // Mobile payments often deposited to a bank account
        const [[ba]] = await conn.query<any>(
          `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
          [Number(bank_account_id)],
        )
        drAccountId = ba?.chart_of_account_id ?? null
      }

      // Accounts Receivable / Trade Debtors
      const [[ar]] = await conn.query<any>(
        `SELECT id FROM chart_of_accounts
         WHERE account_type = 'Accounts Receivable'
         ORDER BY id ASC LIMIT 1`,
      )
      const crAccountId: number | null = ar?.id ?? null

      if (drAccountId && crAccountId) {
        const jeDesc = `Payment received — ${payNo} (Order ${id}, ${mappedMethod})`
        const [jeRes] = await conn.query<any>(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
           VALUES (?, ?, 'CustomerPayment', ?, ?)`,
          [pmtDate, jeDesc.slice(0, 255), paymentId, userId],
        )
        const jeId = jeRes.insertId

        // DR cash/bank (money in)
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, drAccountId, pmtAmount, payNo],
        )
        // CR accounts receivable (reduces balance owed)
        await conn.query(
          `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, crAccountId, pmtAmount, payNo],
        )

        // Link JE back to payment
        await conn.query(
          `UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`,
          [jeId, paymentId],
        )

        // If cash: update petty cash ledger + running balance
        if (mappedMethod === 'Cash' && cash_account_id) {
          const [[pcAcc]] = await conn.query<any>(
            `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [Number(cash_account_id)],
          )
          const pcBal = Number(pcAcc?.current_balance ?? 0)
          await conn.query(
            `INSERT INTO branch_petty_cash_transactions
               (account_id, branch_id, transaction_type, amount, balance_after,
                reference_type, reference_id, description, created_by_user_id, transaction_date)
             VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
            [
              Number(cash_account_id), pcAcc?.branch_id ?? null,
              pmtAmount, pcBal + pmtAmount,
              paymentId, `Payment ${payNo} from order ${id}`,
              userId, pmtDate,
            ],
          )
          await conn.query(
            `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
            [pmtAmount, Number(cash_account_id)],
          )
        }
      } else {
        console.warn(`[payment] Skipping JE for ${payNo}: drAccountId=${drAccountId}, crAccountId=${crAccountId}`)
      }
    } catch (jeErr) {
      // JE failure must never block the payment from being saved
      console.warn(`[payment] JE creation failed for ${payNo}:`, jeErr)
    }

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

    // ── Gate auto-release: payment may satisfy the dispatch condition ──
    // One evaluator (getOrderGateState) sees the post-payment numbers because
    // we're inside the same transaction that updated them.
    let autoReleased = false
    const gate = await getOrderGateState(conn, id)
    if (gate.dispatchHold && !gate.dispatchCleared && gate.autoRelease && gate.conditionMet) {
      await conn.query(
        `UPDATE order_approval_conditions
         SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
             dispatch_cleared_note = ?
         WHERE order_id = ?`,
        [userId, `Auto-released — payment ${payNo} satisfied ${gate.conditionType}`, id],
      )
      await conn.query(
        `INSERT INTO credit_order_workflow
           (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, 'gate_auto_release', ?, ?, NOW())`,
        [id, order.status, order.status, userId, `Dispatch clearance auto-released by payment ${payNo}`],
      )
      autoReleased = true
    }

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

    sendTelegram(
      `💰 <b>Payment Received</b>\n` +
      `${payNo} — ${order.customer_name} (Order ${order.order_number})\n` +
      `৳${pmtAmount.toLocaleString()} via ${mappedMethod} · balance ৳${newBalance.toLocaleString()}` +
      (isNowComplete ? '\n✅ Order fully paid & completed' : '') +
      (autoReleased ? '\n🟢 Dispatch clearance auto-released' : ''),
    )

    return {
      ok: true,
      id: paymentId,
      reference_number: payNo,
      new_balance: newBalance,
      completed: isNowComplete,
      gate_auto_released: autoReleased,
    }
  } catch (e: any) {
    await conn.rollback()
    console.error('[payment] Transaction failed:', e?.message, '| errno:', e?.errno, '| code:', e?.code)
    // Surface the actual DB error so the client toast shows a useful message
    throw createError({
      statusCode: 500,
      statusMessage: e?.sqlMessage ?? e?.message ?? 'Payment transaction failed',
    })
  } finally {
    conn.release()
  }
})
