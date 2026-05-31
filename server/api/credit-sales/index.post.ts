import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const body      = await readBody(event)
  const session   = await getUserSession(event)
  const userId    = session?.user?.id ?? 1
  const role      = (session?.user?.role ?? '').toLowerCase()
  const isAdmin   = ['admin', 'superadmin'].includes(role)
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  const {
    customer_id,
    branch_id,        // maps to assigned_branch_id in DB
    order_date,
    required_date,
    priority,
    delivery_address, // maps to shipping_address in DB
    special_notes,    // maps to special_instructions in DB
    amount_paid,      // advance payment
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
    const totalAmount = subtotal
    const advancePaid = Number(amount_paid ?? 0)
    const balanceDue  = Math.max(0, totalAmount - advancePaid)

    // ── Credit limit check ──────────────────────────────────────────────────
    const [[customer]] = await conn.query<any>(
      `SELECT credit_limit, current_balance FROM customers WHERE id = ?`,
      [customer_id],
    )
    const creditLimit    = Number(customer?.credit_limit    ?? 0)
    const currentBalance = Number(customer?.current_balance ?? 0)

    // Pending exposure: balance_due on orders that haven't hit the ledger yet
    const [[expRow]] = await conn.query<any>(
      `SELECT COALESCE(SUM(balance_due), 0) AS pending
       FROM credit_orders
       WHERE customer_id = ?
         AND status IN ('pending_approval','escalated','approved',
                        'in_production','produced','ready_to_ship','shipped')`,
      [customer_id],
    )
    const pendingExposure = Number(expRow?.pending ?? 0)
    // Total exposure = what is already owed (ledger) + uncommitted commitments + this new order
    const totalExposure   = currentBalance + pendingExposure + balanceDue
    const overLimit       = creditLimit > 0 && totalExposure > creditLimit
    const excessAmount    = overLimit ? Math.round(totalExposure - creditLimit) : 0

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

    const [result] = await conn.query<any>(
      `INSERT INTO credit_orders
         (order_number, customer_id, assigned_branch_id, order_date, required_date, priority,
          status, shipping_address, special_instructions,
          subtotal, total_amount, amount_paid, advance_paid, balance_due,
          created_by_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
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
        totalAmount,
        totalAmount,
        advancePaid,
        advancePaid,
        balanceDue,
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

    // ── Advance payment → customer_payments + ledger ────────────────────────
    // If the customer paid an advance at order creation, record it properly so
    // it appears in the payment history and reduces the customer's ledger balance.
    if (advancePaid > 0) {
      const advDay = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const [[acnt]] = await conn.query<any>(
        `SELECT COUNT(*) AS n FROM customer_payments WHERE DATE(created_at) = CURDATE()`,
      )
      const advSeq = String((acnt.n ?? 0) + 1).padStart(4, '0')
      const advNo  = `PAY-${advDay}-${advSeq}`

      // 1. Insert payment record (order_id links it to this order)
      const [advResult] = await conn.query<any>(
        `INSERT INTO customer_payments
           (order_id, payment_number, customer_id, payment_date, amount, payment_method,
            payment_type, reference_number,
            allocation_status, allocated_amount, notes, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, 'Cash',
                 'invoice_payment', ?,
                 'allocated', ?, 'Advance payment at order creation', ?)`,
        [orderId, advNo, customer_id, order_date, advancePaid, advNo, advancePaid, userId],
      )
      const advPaymentId = advResult.insertId

      // 2. Get current running ledger balance for this customer
      const [[lastLedger]] = await conn.query<any>(
        `SELECT COALESCE(balance_after, 0) AS bal
         FROM customer_ledger WHERE customer_id = ?
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [customer_id],
      )
      const prevBal = Number(lastLedger?.bal ?? 0)
      const newBal  = Math.max(0, prevBal - advancePaid)

      // 3. Credit the ledger — reduces what the customer owes
      await conn.query(
        `INSERT INTO customer_ledger
           (customer_id, transaction_date, transaction_type, reference_type, reference_id,
            invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
         VALUES (?, ?, 'payment', 'customer_payment', ?,
                 ?, ?, 0, ?, ?, ?)`,
        [
          customer_id, order_date, advPaymentId,
          advNo, `Advance payment — ${advNo} (Order ${orderNo})`,
          advancePaid, newBal, userId,
        ],
      )

      // 4. Reduce customer running balance
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
    return {
      ok:         true,
      id:         orderId,
      order_number: orderNo,
      status:     orderStatus,
      over_limit: overLimit,
      ...(overLimit ? { excess_amount: excessAmount } : {}),
    }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
