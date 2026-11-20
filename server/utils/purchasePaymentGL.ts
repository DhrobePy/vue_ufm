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
/** The supplier-payable account for wheat purchases: "GRN Pending" (2110) — what legacy credits on every GRN and debits on every payment. Falls back to the first Accounts-Payable-type account. */
export async function getGrnPendingAccountId(conn: PoolConnection): Promise<number | null> {
  const [[acc]] = await conn.query<any>(
    `SELECT id FROM chart_of_accounts WHERE account_number = '2110' OR name LIKE 'GRN Pending%' ORDER BY (account_number = '2110') DESC, id ASC LIMIT 1`)
  if (acc?.id) return Number(acc.id)
  const [[ap]] = await conn.query<any>(`SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Payable' ORDER BY id ASC LIMIT 1`)
  return ap?.id ?? null
}

/**
 * Where a supplier payment's money comes from, by method — same rules as legacy:
 *   bank / cheque / mobile_banking → a company bank account (and its ledger account)
 *   cash → a branch petty-cash account (and its ledger account); the till balance goes down
 */
export async function resolvePaymentSource(conn: PoolConnection, opts: { method: string; bankAccountId?: number | null; cashAccountId?: number | null }): Promise<{ bankName: string | null; glAccountId: number | null; cashAccountId: number | null }> {
  if (opts.method === 'cash') {
    const [[pc]] = await conn.query<any>(
      `SELECT p.id, p.account_name, p.chart_of_account_id, b.name AS branch FROM branch_petty_cash_accounts p LEFT JOIN branches b ON b.id = p.branch_id WHERE p.id = ? AND p.status = 'active'`, [Number(opts.cashAccountId) || 0])
    if (!pc) throw createError({ statusCode: 400, statusMessage: 'Select the cash (petty-cash) account this payment was made from' })
    if (!pc.chart_of_account_id) throw createError({ statusCode: 400, statusMessage: 'That cash account is not linked to the chart of accounts — ask an admin to link it' })
    return { bankName: `${pc.account_name}${pc.branch ? ' - ' + pc.branch : ''}`, glAccountId: Number(pc.chart_of_account_id), cashAccountId: Number(pc.id) }
  }
  if (opts.method === 'contra') return { bankName: null, glAccountId: null, cashAccountId: null }
  const [[ba]] = await conn.query<any>(`SELECT bank_name, branch_name, account_name, chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(opts.bankAccountId) || 0])
  if (!ba) throw createError({ statusCode: 400, statusMessage: 'Select the company bank account this payment was made from' })
  return { bankName: opts.method === 'cheque' ? `Cheque - ${ba.bank_name}` : `${ba.bank_name} - ${ba.branch_name || ba.account_name}`, glAccountId: ba.chart_of_account_id ?? null, cashAccountId: null }
}

/**
 * Resolves the DR/CR chart-of-accounts pair for a supplier payment. Create, edit (reverse+repost) and delete (reverse) all route through
 * here so a reversal always hits the accounts the original posting did.
 * Legacy debits "GRN Pending" for EVERY payment type (advance or not), so that is what happens here; only a contra offset credits receivables.
 */
export async function resolvePurchasePaymentGLAccounts(
  conn: PoolConnection, paymentType: string, bankGlAccountId: number | null,
): Promise<GLAccounts> {
  const payable = await getGrnPendingAccountId(conn)
  if (paymentType === 'contra') {
    const [[arAcc]] = await conn.query<any>(
      `SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Receivable' ORDER BY id ASC LIMIT 1`,
    )
    return { drAccountId: payable, crAccountId: arAcc?.id ?? null }
  }
  return { drAccountId: payable, crAccountId: bankGlAccountId }
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
