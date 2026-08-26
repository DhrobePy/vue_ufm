import type { PoolConnection } from 'mysql2/promise'

export type PurchasePaymentType = 'advance' | 'credit' | 'against_delivery' | 'contra' | 'regular' | 'final'

interface GLAccounts {
  drAccountId: number | null
  crAccountId: number | null
}

/**
 * Resolves the DR/CR chart-of-accounts pair for a supplier payment, by type.
 * Extracted from the original inline logic in payments.post.ts so create,
 * edit (reverse+repost), and delete (reverse) all route through the exact
 * same account-resolution rules — a payment's reversal must debit/credit
 * the same accounts its original posting did.
 */
export async function resolvePurchasePaymentGLAccounts(
  conn: PoolConnection, paymentType: string, bankGlAccountId: number | null,
): Promise<GLAccounts> {
  const [[apAcc]] = await conn.query<any>(
    `SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Payable' ORDER BY id ASC LIMIT 1`,
  )
  const apId: number | null = apAcc?.id ?? null

  if (paymentType === 'contra') {
    const [[arAcc]] = await conn.query<any>(
      `SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Receivable' ORDER BY id ASC LIMIT 1`,
    )
    return { drAccountId: apId, crAccountId: arAcc?.id ?? null }
  }

  if (paymentType === 'advance') {
    const [[advAcc]] = await conn.query<any>(
      `SELECT id FROM chart_of_accounts
       WHERE (name LIKE '%advance%' OR name LIKE '%prepay%') AND account_type_group = 'Asset'
       ORDER BY id ASC LIMIT 1`,
    )
    return { drAccountId: advAcc?.id ?? apId, crAccountId: bankGlAccountId }
  }

  // credit | against_delivery | regular | final — paying off an existing AP liability
  return { drAccountId: apId, crAccountId: bankGlAccountId }
}

function jeDescription(paymentType: string, voucherNo: string, amt: number, supplierName: string, bankLabel: string, referenceNumber?: string | null): string {
  if (paymentType === 'contra')
    return `Contra offset ${voucherNo} — AP ↓ / AR ↓ · ৳${amt.toLocaleString()} · ref ${referenceNumber ?? ''}`
  if (paymentType === 'advance')
    return `Advance payment ${voucherNo} — ৳${amt.toLocaleString()} to ${supplierName} via ${bankLabel}`
  const typeLabel = paymentType === 'against_delivery' ? 'Delivery expense' : 'Credit payment'
  return `${typeLabel} ${voucherNo} — ৳${amt.toLocaleString()} to ${supplierName} via ${bankLabel}`
}

/**
 * Posts a balanced JE for a supplier payment and links it back onto the
 * payment row. Returns the new journal_entry_id, or null if it couldn't
 * resolve both accounts (mirrors the original silent-skip behavior).
 */
export async function postPurchasePaymentJE(conn: PoolConnection, opts: {
  paymentId: number, pmtDate: string, voucherNo: string, paymentType: string, pmtAmt: number,
  supplierName: string, bankName: string | null, paymentMethod: string, referenceNumber?: string | null,
  bankGlAccountId: number | null, userId: number,
}): Promise<number | null> {
  const { drAccountId, crAccountId } = await resolvePurchasePaymentGLAccounts(conn, opts.paymentType, opts.bankGlAccountId)
  if (!drAccountId || !crAccountId) {
    console.warn(`[purchasePaymentGL] Skipping JE for ${opts.voucherNo}: dr=${drAccountId}, cr=${crAccountId}`)
    return null
  }

  const bankLabel = opts.bankName ?? opts.paymentMethod
  const jeDesc = jeDescription(opts.paymentType, opts.voucherNo, opts.pmtAmt, opts.supplierName, bankLabel, opts.referenceNumber)

  const [jeRes] = await conn.query<any>(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, 'PurchasePayment', ?, ?)`,
    [opts.pmtDate, jeDesc.slice(0, 255), opts.paymentId, opts.userId],
  )
  const jeId = jeRes.insertId

  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, ?, 0.00, ?)`,
    [jeId, drAccountId, opts.pmtAmt, opts.voucherNo],
  )
  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, 0.00, ?, ?)`,
    [jeId, crAccountId, opts.pmtAmt, opts.voucherNo],
  )
  await conn.query(`UPDATE purchase_payments_adnan SET journal_entry_id = ? WHERE id = ?`, [jeId, opts.paymentId])

  return jeId
}

/**
 * Reverses a previously-posted purchase-payment JE by posting a mirror-image
 * entry (swap debit/credit on the same accounts) — never mutates or deletes
 * the original, matching the reversing-entry discipline used elsewhere in
 * this app (credit-sales payment reversal, commodity-sale edits).
 */
export async function reversePurchasePaymentJE(conn: PoolConnection, opts: {
  journalEntryId: number, pmtDate: string, voucherNo: string, reason: string, userId: number, paymentId: number,
}): Promise<number | null> {
  const [origLines] = await conn.query<any>(
    `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
    [opts.journalEntryId],
  )
  if (!origLines.length) return null

  const [jeRes] = await conn.query<any>(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, 'PurchasePaymentReversal', ?, ?)`,
    [opts.pmtDate, `Reversal of ${opts.voucherNo}${opts.reason ? ` (${opts.reason})` : ''}`.slice(0, 255), opts.paymentId, opts.userId],
  )
  const reversalJeId = jeRes.insertId

  for (const l of origLines) {
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [reversalJeId, l.account_id, Number(l.credit_amount), Number(l.debit_amount), `REV-${opts.voucherNo}`],
    )
  }
  return reversalJeId
}
