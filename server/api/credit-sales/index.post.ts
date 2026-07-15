import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { getCustomerOutstanding, ACCOUNTS_ROLES, SALES_ROLES } from '~/server/utils/creditOrders'
import { userCanAction } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const body      = await readBody(event)
  const session   = await getUserSession(event)
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId    = Number(session.user.id)
  const role      = (session.user.role ?? '').toLowerCase()
  const isAdmin   = ['admin', 'superadmin'].includes(role)
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const canCreate = await userCanAction({
    userId, role, module: 'credit_sales', page: 'all', action: 'create',
    roleFallback: [...ACCOUNTS_ROLES, ...SALES_ROLES],
  })
  if (!canCreate)
    throw createError({ statusCode: 403, statusMessage: 'Your account is not allowed to create orders' })

  const {
    customer_id,
    branch_id,        // maps to assigned_branch_id in DB
    order_date,
    required_date,
    priority,
    delivery_address, // maps to shipping_address in DB
    special_notes,    // maps to special_instructions in DB
    amount_paid,      // advance payment amount
    // ── advance payment details ───────────────────────────────────────────
    advance_payment_method,      // 'Cash'|'Bank Transfer'|'Cheque'|'Mobile Banking'|'Card'
    advance_bank_account_id,     // when method = Bank Transfer | Cheque
    advance_cash_account_id,     // when method = Cash
    advance_reference,           // transaction/mobile ref
    advance_cheque_number,       // when method = Cheque
    advance_cheque_date,         // when method = Cheque
    advance_bank_tx_type,        // RTGS|BEFTN|NPSB|Online|Deposit
    advance_collected_by_employee_id,
    delivery_type,    // 'big_truck' (default) | 'mini_truck'
    items,            // [{ product_id, variant_id, qty_bags→quantity, unit_price, discount_amount }]
  } = body ?? {}

  if (!customer_id || !items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'customer_id and items are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Generate order number: CR-YYYYMMDD-NNNN
    const today    = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]]  = await conn.query<any>(
      `SELECT COUNT(*) AS n FROM credit_orders WHERE DATE(created_at) = CURDATE()`,
    )
    const seq     = String((cnt.n ?? 0) + 1).padStart(4, '0')
    const orderNo = `CR-${today}-${seq}`

    // Compute totals from items — frontend sends qty_bags, DB col is quantity
    let subtotal = 0
    for (const it of items) {
      const qty  = Number(it.qty_bags ?? it.quantity ?? 0)
      const line = qty * Number(it.unit_price) - Number(it.discount_amount ?? 0)
      subtotal  += line
    }

    // ── Mini-truck surcharge (per bag, from the branch's charge components) ─
    // Enforced server-side — the client shows a preview but never sets the amount.
    const deliveryType = delivery_type === 'mini_truck' ? 'mini_truck' : 'big_truck'
    let miniTruckSurcharge = 0
    if (deliveryType === 'mini_truck' && branch_id) {
      const [mtComponents] = await conn.query<any[]>(
        `SELECT weight_class, SUM(amount) AS amt
         FROM branch_price_components
         WHERE branch_id = ? AND charge_type = 'mini_truck' AND is_active = 1
         GROUP BY weight_class`,
        [Number(branch_id)],
      )
      const perWc: Record<string, number> = {}
      for (const c of mtComponents as any[]) perWc[c.weight_class] = Number(c.amt)

      for (const it of items) {
        const qty = Number(it.qty_bags ?? it.quantity ?? 0)
        let wc = 'all'
        if (it.variant_id) {
          const [[pv]] = await conn.query<any>(
            `SELECT weight_variant FROM product_variants WHERE id = ?`, [it.variant_id],
          )
          const wv = String(pv?.weight_variant ?? '')
          wc = wv.includes('50') ? '50' : wv.includes('74') ? '74' : 'all'
        }
        const perBag = (perWc[wc] ?? 0) + (wc !== 'all' ? (perWc['all'] ?? 0) : 0)
        miniTruckSurcharge += qty * perBag
      }
      miniTruckSurcharge = Math.round(miniTruckSurcharge * 100) / 100
    }

    const totalAmount = subtotal + miniTruckSurcharge
    const advancePaid = Number(amount_paid ?? 0)
    const balanceDue  = Math.max(0, totalAmount - advancePaid)

    // ── Credit limit check — LEDGER truth, never customers.current_balance ──
    const [[customer]] = await conn.query<any>(
      `SELECT credit_limit, name AS customer_name FROM customers WHERE id = ?`,
      [customer_id],
    )
    const creditLimit = Number(customer?.credit_limit ?? 0)
    const exposure    = await getCustomerOutstanding(conn, Number(customer_id))
    // Total exposure = ledger dues + not-yet-dispatched commitments + this new order
    const totalExposure = exposure.totalExposure + balanceDue
    const overLimit     = creditLimit > 0 && totalExposure > creditLimit
    const excessAmount  = overLimit ? Math.round(totalExposure - creditLimit) : 0

    // ── Determine order status ──────────────────────────────────────────────
    // Over limit (any role)       → 'escalated'  (requires senior/CFO explicit approval)
    // Admin/superadmin, OK limit  → 'approved'   (auto-approved, no queue needed)
    // Regular user, OK limit      → 'pending_approval'
    let orderStatus: string
    let wfAction:    string
    let wfComment:   string

    if (overLimit) {
      orderStatus = 'escalated'
      wfAction    = 'escalated'
      wfComment   = `Order created — ESCALATED · ৳${totalAmount.toLocaleString()} · credit limit ৳${creditLimit.toLocaleString()} exceeded by ৳${excessAmount.toLocaleString()}`
    } else if (isAdmin) {
      orderStatus = 'approved'
      wfAction    = 'approved'
      wfComment   = `Order created and auto-approved — ৳${totalAmount.toLocaleString()} (${role})`
    } else {
      orderStatus = 'pending_approval'
      wfAction    = 'submit'
      wfComment   = `Order created and submitted for approval — ৳${totalAmount.toLocaleString()}`
    }

    // If product_id is missing for a variant, look it up
    for (const it of items) {
      if (!it.product_id && it.variant_id) {
        const [[pv]] = await conn.query<any>(
          `SELECT product_id FROM product_variants WHERE id = ? LIMIT 1`,
          [it.variant_id],
        )
        it.product_id = pv?.product_id ?? null
      }
    }

    // Generate 6-digit PINs for delivery verification (QR scan)
    const dispatchPin = Math.floor(100000 + Math.random() * 900000).toString()
    const deliveryPin = Math.floor(100000 + Math.random() * 900000).toString()

    const [result] = await conn.query<any>(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          delivery_type, mini_truck_surcharge,
          dispatch_pin, delivery_pin,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?,
               ?, ?,
               ?, NOW(), NOW())`,
      [
        orderNo,
        customer_id,
        branch_id ?? null,
        order_date,
        required_date || null,
        priority ?? 'normal',
        orderStatus,
        delivery_address || null,
        special_notes    || null,
        subtotal,
        totalAmount,
        advancePaid,
        advancePaid,
        balanceDue,
        deliveryType,
        miniTruckSurcharge,
        dispatchPin,
        deliveryPin,
        userId,
      ],
    )

    const orderId = result.insertId

    // Insert line items — DB column is `quantity`, not `qty_bags`
    for (const it of items) {
      const qty       = Number(it.qty_bags ?? it.quantity ?? 0)
      const lineTotal = qty * Number(it.unit_price) - Number(it.discount_amount ?? 0)

      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,            // NOT NULL in DB — looked up above if missing
          it.variant_id ?? null,
          qty,
          Number(it.unit_price),
          Number(it.discount_amount ?? 0),
          lineTotal,
        ],
      )
    }

    // Workflow timeline entry
    await conn.query(
      `INSERT INTO credit_order_workflow
         (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       VALUES (?, 'draft', ?, ?, ?, ?, NOW())`,
      [orderId, orderStatus, wfAction, userId, wfComment],
    )

    // ── Advance payment → customer_payments + ledger + GL journal ──────────
    if (advancePaid > 0) {
      // Normalise payment method to DB ENUM values
      const validMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Banking', 'Card']
      const payMethod = validMethods.includes(advance_payment_method)
        ? advance_payment_method
        : 'Cash'

      const advDay = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const [[acnt]] = await conn.query<any>(
        `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`,
      )
      const advSeq = String((acnt.n ?? 0) + 1).padStart(4, '0')
      const advNo  = `PAY-${advDay}-${advSeq}`

      // 1. Insert payment record with full details
      const [advResult] = await conn.query<any>(
        `INSERT INTO customer_payments
           (order_id, payment_number, customer_id, payment_date, amount,
            payment_method, payment_type,
            bank_account_id, cash_account_id,
            cheque_number, cheque_date, bank_transaction_type,
            reference_number, allocation_status, allocated_amount,
            notes, collected_by_employee_id, branch_id, created_by_user_id)
         VALUES (?, ?, ?, ?, ?,
                 ?, 'advance',
                 ?, ?,
                 ?, ?, ?,
                 ?, 'allocated', ?,
                 ?, ?, ?, ?)`,
        [
          orderId, advNo, customer_id, order_date, advancePaid,
          payMethod,
          advance_bank_account_id  ? Number(advance_bank_account_id)  : null,
          advance_cash_account_id  ? Number(advance_cash_account_id)  : null,
          advance_cheque_number    || null,
          advance_cheque_date      || null,
          advance_bank_tx_type     || null,
          advance_reference        || advNo,
          advancePaid,
          `Advance payment at order creation (${payMethod})`,
          advance_collected_by_employee_id ? Number(advance_collected_by_employee_id) : null,
          branch_id ? Number(branch_id) : null,
          userId,
        ],
      )
      const advPaymentId = advResult.insertId

      // 2. Get current running ledger balance
      const [[lastLedger]] = await conn.query<any>(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [customer_id],
      )
      const prevBal = Number(lastLedger?.bal ?? 0)
      const newBal  = Math.max(0, prevBal - advancePaid)

      // 3. GL journal entry for the advance
      let advJeId: number | null = null
      try {
        // DR: cash or bank GL account
        let drAccountId: number | null = null
        if (payMethod === 'Cash' && advance_cash_account_id) {
          const [[ca]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
            [Number(advance_cash_account_id)],
          )
          drAccountId = ca?.chart_of_account_id ?? null
        } else if (['Bank Transfer', 'Cheque', 'Card'].includes(payMethod) && advance_bank_account_id) {
          const [[ba]] = await conn.query<any>(
            `SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`,
            [Number(advance_bank_account_id)],
          )
          drAccountId = ba?.chart_of_account_id ?? null
        }

        // CR: Accounts Receivable / Trade Debtors
        let crAccountId: number | null = null
        const [[ar]] = await conn.query<any>(
          `SELECT id FROM chart_of_accounts
           WHERE account_type = 'Accounts Receivable'
           ORDER BY id ASC LIMIT 1`,
        )
        crAccountId = ar?.id ?? null

        if (drAccountId && crAccountId) {
          const jeDesc = `Advance received — ${advNo} (Order ${orderNo}, ${customer_id})`
          const [jeRes] = await conn.query<any>(
            `INSERT INTO journal_entries
               (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
             VALUES (?, ?, 'CustomerPayment', ?, ?)`,
            [order_date, jeDesc.slice(0, 255), advPaymentId, userId],
          )
          advJeId = jeRes.insertId

          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, ?, 0.00, ?)`,
            [advJeId, drAccountId, advancePaid, advNo],
          )
          await conn.query(
            `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
             VALUES (?, ?, 0.00, ?, ?)`,
            [advJeId, crAccountId, advancePaid, advNo],
          )

          // Link JE back to payment record
          await conn.query(
            `UPDATE customer_payments SET journal_entry_id = ? WHERE id = ?`,
            [advJeId, advPaymentId],
          )

          // If cash, update petty cash ledger
          if (payMethod === 'Cash' && advance_cash_account_id) {
            const [[pcAcc]] = await conn.query<any>(
              `SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`,
              [Number(advance_cash_account_id)],
            )
            const pcBal = Number(pcAcc?.current_balance ?? 0)
            await conn.query(
              `INSERT INTO branch_petty_cash_transactions
                 (account_id, branch_id, transaction_type, amount, balance_after,
                  reference_type, reference_id, description, created_by_user_id, transaction_date)
               VALUES (?, ?, 'cash_in', ?, ?, 'customer_payment', ?, ?, ?, ?)`,
              [
                Number(advance_cash_account_id), pcAcc?.branch_id ?? null,
                advancePaid, pcBal + advancePaid,
                advPaymentId, `Advance from order ${orderNo}`, userId, order_date,
              ],
            )
            await conn.query(
              `UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`,
              [advancePaid, Number(advance_cash_account_id)],
            )
          }
        } else {
          console.warn(`[advance-payment] Skipping JE for ${advNo}: drAccountId=${drAccountId}, crAccountId=${crAccountId}`)
        }
      } catch (jeErr) {
        console.warn(`[advance-payment] JE creation failed for ${advNo}:`, jeErr)
      }

      // 4. Credit the customer ledger (with JE link)
      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after,
            journal_entry_id, created_by_user_id)
         VALUES (?, ?, 'advance_payment', 'customer_payment', ?,
                 ?, ?, 0, ?, ?,
                 ?, ?)`,
        [
          customer_id, order_date, advPaymentId,
          advNo, `Advance payment — ${advNo} (Order ${orderNo}) via ${payMethod}`,
          advancePaid, newBal,
          advJeId, userId,
        ],
      )

      // 5. Reduce customer running balance
      await conn.query(
        `UPDATE customers
         SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW()
         WHERE id = ?`,
        [advancePaid, customer_id],
      )
    }

    // ── Audit log ───────────────────────────────────────────────────────────
    await auditLog(conn, {
      userId,
      action:          overLimit ? 'other' : isAdmin ? 'approved' : 'other',
      module:          'credit_sales',
      recordType:      'credit_order',
      recordId:        orderId,
      referenceNumber: orderNo,
      description:     overLimit
        ? `Order ${orderNo} created — ESCALATED, credit limit exceeded by ৳${excessAmount.toLocaleString()} (total exposure ৳${totalExposure.toLocaleString()} vs limit ৳${creditLimit.toLocaleString()})`
        : isAdmin
          ? `Order ${orderNo} created and auto-approved — ৳${totalAmount.toLocaleString()} (${role})`
          : `Order ${orderNo} created, pending approval — ৳${totalAmount.toLocaleString()}`,
      severity:        overLimit ? 'warning' : 'info',
      ipAddress,
    })

    await conn.commit()

    sendTelegram(
      `${overLimit ? '⚠️' : '🧾'} <b>New Credit Order${overLimit ? ' — ESCALATED' : ''}</b>\n` +
      `${orderNo} — ${customer?.customer_name ?? `Customer ${customer_id}`}\n` +
      `৳${totalAmount.toLocaleString()} · ${items.length} item(s)` +
      (deliveryType === 'mini_truck' ? ` · Mini truck (+৳${miniTruckSurcharge.toLocaleString()})` : '') +
      (advancePaid > 0 ? `\nAdvance ৳${advancePaid.toLocaleString()} received` : '') +
      (overLimit ? `\nCredit limit exceeded by ৳${excessAmount.toLocaleString()} — needs senior approval` : ''),
    )

    return {
      ok:         true,
      id:         orderId,
      order_number: orderNo,
      status:     orderStatus,
      over_limit: overLimit,
      mini_truck_surcharge: miniTruckSurcharge,
      ...(overLimit ? { excess_amount: excessAmount } : {}),
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
