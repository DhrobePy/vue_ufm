import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/purchase/payments
 * Records a supplier payment against a purchase order.
 *
 * payment_type values:
 *   advance          — paid before delivery (DR Advance-to-Suppliers / CR Bank)
 *   credit           — paid after delivery on credit terms (DR AP / CR Bank)
 *   against_delivery — on-site delivery expenses: unloading, incentives, etc. (DR AP / CR Cash)
 *   contra           — offset against a credit-sales invoice (DR AP / CR AR)
 *
 * For contra: reference_number must be a valid credit order `order_number`
 *             (the same number shown on the sales invoice, e.g. SO-20260605-0001).
 *             The matching credit order will be settled automatically.
 */
export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    purchase_order_id,
    payment_date,
    amount_paid,
    payment_method = 'bank',
    bank_account_id,
    reference_number,
    payment_type = 'credit',   // advance | credit | against_delivery | contra
    remarks,
  } = body ?? {}

  if (!purchase_order_id || !amount_paid || Number(amount_paid) <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'purchase_order_id and amount_paid are required' })
  }

  const isContra = payment_type === 'contra'
  if (isContra && !reference_number) {
    throw createError({ statusCode: 400, statusMessage: 'Contra payment requires a sales invoice reference (order_number)' })
  }

  const db      = getDb()
  const conn    = await db.getConnection()
  const pmtDate = payment_date ?? new Date().toISOString().slice(0, 10)
  const pmtAmt  = Number(amount_paid)

  try {
    await conn.beginTransaction()

    // ── Auto-add columns if missing (safe repeated runs) ──────────────────────
    await conn.query(`ALTER TABLE purchase_payments_adnan ADD COLUMN IF NOT EXISTS payment_type VARCHAR(30) DEFAULT 'credit'`).catch(() => {})
    await conn.query(`ALTER TABLE purchase_payments_adnan ADD COLUMN IF NOT EXISTS is_posted TINYINT(1) NOT NULL DEFAULT 1`).catch(() => {})
    await conn.query(`ALTER TABLE purchase_payments_adnan ADD COLUMN IF NOT EXISTS journal_entry_id INT DEFAULT NULL`).catch(() => {})

    // ── Load the PO ──────────────────────────────────────────────────────────
    const [[po]] = await conn.query<any>(
      `SELECT id, po_number, supplier_id, supplier_name, balance_payable
       FROM purchase_orders_adnan WHERE id = ?`,
      [purchase_order_id],
    )
    if (!po) throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' })

    // ── Bank info ─────────────────────────────────────────────────────────────
    let bankName: string | null = null
    let bankGlAccountId: number | null = null
    if (bank_account_id) {
      const [[ba]] = await conn.query<any>(
        `SELECT bank_name, chart_of_account_id FROM bank_accounts WHERE id = ?`,
        [bank_account_id],
      )
      bankName        = ba?.bank_name ?? null
      bankGlAccountId = ba?.chart_of_account_id ?? null
    }

    // ── Voucher number (CURDATE() for Bangladesh timezone safety) ─────────────
    const [[seqRow]] = await conn.query<any>(
      `SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d,
              COUNT(*) AS n
       FROM purchase_payments_adnan
       WHERE DATE(created_at) = CURDATE()`,
    )
    const voucherNo = `PV-${seqRow.d}-${String((seqRow.n ?? 0) + 1).padStart(4, '0')}`

    // ── 1. Insert payment record (is_posted = 1 immediately) ──────────────────
    const [result] = await conn.query<any>(
      `INSERT INTO purchase_payments_adnan
         (payment_voucher_number, payment_date, purchase_order_id, po_number,
          supplier_id, supplier_name, amount_paid, payment_method,
          bank_account_id, bank_name, reference_number,
          payment_type, is_posted, remarks, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        voucherNo,
        pmtDate,
        purchase_order_id,
        po.po_number,
        po.supplier_id,
        po.supplier_name,
        pmtAmt,
        payment_method,
        bank_account_id ? Number(bank_account_id) : null,
        bankName,
        reference_number ?? null,
        payment_type,
        remarks ?? null,
        userId,
      ],
    )
    const paymentId = result.insertId

    // ── 2. Update PO totals ───────────────────────────────────────────────────
    await conn.query(
      `UPDATE purchase_orders_adnan
       SET total_paid      = COALESCE(total_paid, 0) + ?,
           balance_payable = GREATEST(0, COALESCE(balance_payable, 0) - ?),
           payment_status  = CASE
             WHEN GREATEST(0, COALESCE(balance_payable, 0) - ?) <= 0 THEN 'paid'
             ELSE 'partial'
           END,
           updated_at = NOW()
       WHERE id = ?`,
      [pmtAmt, pmtAmt, pmtAmt, purchase_order_id],
    )

    // ── 3. Contra — auto-settle the credit-sales invoice ─────────────────────
    if (isContra && reference_number) {
      const [[creditOrder]] = await conn.query<any>(
        `SELECT id, customer_id, balance_due, amount_paid
         FROM credit_orders
         WHERE order_number = ? OR id = ?
         LIMIT 1`,
        [String(reference_number), Number(reference_number) || 0],
      )

      if (creditOrder) {
        const newCrPaid    = Number(creditOrder.amount_paid ?? 0) + pmtAmt
        const newCrBalance = Math.max(0, Number(creditOrder.balance_due ?? 0) - pmtAmt)

        // Generate customer payment number
        const [[crSeq]] = await conn.query<any>(
          `SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d, COUNT(*) AS n
           FROM customer_payments WHERE DATE(created_at) = CURDATE()`,
        )
        const crPayNo = `PAY-${crSeq.d}-${String((crSeq.n ?? 0) + 1).padStart(4, '0')}`

        // Insert customer_payments record
        const [crRes] = await conn.query<any>(
          `INSERT INTO customer_payments
             (order_id, payment_number, customer_id, payment_date, amount,
              payment_method, payment_type, reference_number,
              allocation_status, allocated_amount, notes, created_by_user_id)
           VALUES (?, ?, ?, ?, ?,
                   'Contra / Purchase Offset', 'contra_offset', ?,
                   'allocated', ?, ?, ?)`,
          [
            creditOrder.id,
            crPayNo,
            creditOrder.customer_id,
            pmtDate,
            pmtAmt,
            voucherNo,   // reference = the PV voucher number
            pmtAmt,
            `Contra offset — purchase payment ${voucherNo} set-off against sales order`,
            userId,
          ],
        )
        const crPaymentId = crRes.insertId

        // Update credit_orders balance
        await conn.query(
          `UPDATE credit_orders
           SET amount_paid = ?, balance_due = ?, updated_at = NOW()
           WHERE id = ?`,
          [newCrPaid, newCrBalance, creditOrder.id],
        )

        // Update customer current_balance
        await conn.query(
          `UPDATE customers
           SET current_balance = GREATEST(0, current_balance - ?), updated_at = NOW()
           WHERE id = ?`,
          [pmtAmt, creditOrder.customer_id],
        )

        // Insert customer_ledger entry
        const [[lastLedger]] = await conn.query<any>(
          `SELECT COALESCE(balance_after, 0) AS bal
           FROM customer_ledger WHERE customer_id = ?
           ORDER BY created_at DESC, id DESC LIMIT 1`,
          [creditOrder.customer_id],
        )
        const newLedgerBal = Math.max(0, Number(lastLedger?.bal ?? 0) - pmtAmt)

        await conn.query(
          `INSERT INTO customer_ledger
             (customer_id, transaction_date, transaction_type, reference_type, reference_id,
              invoice_number, description, debit_amount, credit_amount, balance_after, created_by_user_id)
           VALUES (?, ?, 'payment', 'customer_payment', ?,
                   ?, ?, 0, ?, ?, ?)`,
          [
            creditOrder.customer_id,
            pmtDate,
            crPaymentId,
            crPayNo.slice(0, 50),
            `Contra offset — ${voucherNo} purchase payment set-off against ${reference_number}`,
            pmtAmt,
            newLedgerBal,
            userId,
          ],
        )
      } else {
        // Invoice not found — still commit the purchase-side payment, just warn
        console.warn(
          `[purchase/payments] Contra ref '${reference_number}' not found in credit_orders ` +
          `— purchase-side settled, credit-sales side NOT updated`,
        )
      }
    }

    // ── 4. GL Journal Entry ───────────────────────────────────────────────────
    // Failures here must never block the payment — wrapped in try-catch.
    try {
      // Accounts Payable
      const [[apAcc]] = await conn.query<any>(
        `SELECT id FROM chart_of_accounts
         WHERE account_type = 'Accounts Payable'
         ORDER BY id ASC LIMIT 1`,
      )
      const apId: number | null = apAcc?.id ?? null

      let drAccountId: number | null = null
      let crAccountId: number | null = null
      let jeDesc = ''

      if (payment_type === 'contra') {
        // DR: Accounts Payable ↓   (we owe supplier less)
        // CR: Accounts Receivable ↓ (supplier owes us less — their sales debt cleared)
        const [[arAcc]] = await conn.query<any>(
          `SELECT id FROM chart_of_accounts
           WHERE account_type = 'Accounts Receivable'
           ORDER BY id ASC LIMIT 1`,
        )
        drAccountId = apId
        crAccountId = arAcc?.id ?? null
        jeDesc = `Contra offset ${voucherNo} — AP ↓ / AR ↓ · ৳${pmtAmt.toLocaleString()} · ref ${reference_number}`

      } else if (payment_type === 'advance') {
        // DR: Advance to Suppliers (prepaid asset — money paid before delivery)
        // CR: Bank/Cash
        const [[advAcc]] = await conn.query<any>(
          `SELECT id FROM chart_of_accounts
           WHERE (name LIKE '%advance%' OR name LIKE '%prepay%')
             AND account_type_group = 'Asset'
           ORDER BY id ASC LIMIT 1`,
        )
        drAccountId = advAcc?.id ?? apId   // fall back to AP if no advance account
        crAccountId = bankGlAccountId
        jeDesc = `Advance payment ${voucherNo} — ৳${pmtAmt.toLocaleString()} to ${po.supplier_name} via ${bankName ?? payment_method}`

      } else {
        // credit | against_delivery — paying off an existing AP liability
        // DR: Accounts Payable ↓
        // CR: Bank/Cash ↓
        drAccountId = apId
        crAccountId = bankGlAccountId
        const typeLabel = payment_type === 'against_delivery' ? 'Delivery expense' : 'Credit payment'
        jeDesc = `${typeLabel} ${voucherNo} — ৳${pmtAmt.toLocaleString()} to ${po.supplier_name} via ${bankName ?? payment_method}`
      }

      if (drAccountId && crAccountId) {
        const [jeRes] = await conn.query<any>(
          `INSERT INTO journal_entries
             (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
           VALUES (?, ?, 'PurchasePayment', ?, ?)`,
          [pmtDate, jeDesc.slice(0, 255), paymentId, userId],
        )
        const jeId = jeRes.insertId

        // DR line
        await conn.query(
          `INSERT INTO transaction_lines
             (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, 0.00, ?)`,
          [jeId, drAccountId, pmtAmt, voucherNo],
        )
        // CR line
        await conn.query(
          `INSERT INTO transaction_lines
             (journal_entry_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, 0.00, ?, ?)`,
          [jeId, crAccountId, pmtAmt, voucherNo],
        )

        // Link JE back to the payment record
        await conn.query(
          `UPDATE purchase_payments_adnan SET journal_entry_id = ? WHERE id = ?`,
          [jeId, paymentId],
        ).catch(() => {/* ignore if column doesn't exist yet */})

      } else {
        console.warn(
          `[purchase/payments] Skipping JE for ${voucherNo}: ` +
          `drId=${drAccountId}, crId=${crAccountId} ` +
          `(likely missing chart_of_accounts entries for AP/AR/Bank)`,
        )
      }
    } catch (jeErr: any) {
      console.warn(`[purchase/payments] JE creation failed for ${voucherNo}:`, jeErr?.message)
    }

    // ── 5. Audit log ──────────────────────────────────────────────────────────
    const bankNote  = bankName      ? ` via ${bankName}`           : ''
    const refNote   = reference_number ? ` · ref: ${reference_number}` : ''
    const typeLabel = { advance: ' [Advance]', against_delivery: ' [Delivery Exp]', contra: ' [Contra]', credit: '' }[payment_type] ?? ''
    await auditLog(conn, {
      userId,
      action:          'payment_made',
      module:          'purchase',
      recordType:      'purchase_payment',
      recordId:        paymentId,
      referenceNumber: voucherNo,
      description:     `Payment ${voucherNo}${typeLabel}: ৳${pmtAmt.toLocaleString()} to ${po.supplier_name} · PO ${po.po_number}${bankNote}${refNote}`,
      severity:        'info',
    })

    await conn.commit()
    return { ok: true, id: paymentId, voucher_number: voucherNo }

  } catch (e: any) {
    await conn.rollback()
    console.error('[purchase/payments] Transaction failed:', e?.message)
    throw createError({
      statusCode: 500,
      statusMessage: e?.sqlMessage ?? e?.message ?? 'Payment recording failed',
    })
  } finally {
    conn.release()
  }
})
