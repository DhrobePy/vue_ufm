/**
 * Bank auto-bridge (spec §2.4 step 9 / §4.6) — best-effort only, never
 * blocks or fails the payment it's attached to.
 *
 * A non-cash customer payment is collected against a `bank_accounts` row
 * (the GL-linked account picker on the payment form). The standalone bank
 * transaction module tracks money through a DIFFERENT table,
 * `bank_tx_accounts` — same real-world accounts, separate id space. This
 * bridges the two: when a payment lands on a bank account, drop a PENDING
 * credit row into `bank_transactions` for whoever reconciles the statement,
 * matched to the real account by `account_number`. No match, no bridge —
 * that's fine, it's a convenience, not a requirement.
 */
export async function bridgeCustomerPayment(conn: any, opts: {
  paymentId: number
  bankAccountId: number
  method: string        // 'Bank Transfer' | 'Cheque' | 'Mobile Banking' | 'Card'
  amount: number
  date: string
  payerName: string
  referenceNumber?: string | null
  chequeNumber?: string | null
  userId: number
}): Promise<void> {
  try {
    const [[bankAcct]] = await conn.query(
      `SELECT account_number FROM bank_accounts WHERE id = ?`, [opts.bankAccountId],
    )
    if (!bankAcct?.account_number) return

    const [[txAcct]] = await conn.query(
      `SELECT id FROM bank_tx_accounts WHERE account_number = ? AND status = 'active' LIMIT 1`,
      [bankAcct.account_number],
    )
    if (!txAcct?.id) return // no matching standalone-module account — nothing to bridge to

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS n FROM bank_transactions WHERE DATE(created_at) = CURDATE()`,
    )
    const txnNo = `BTX-${today}-${String((cnt.n ?? 0) + 1).padStart(4, '0')}`

    await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, transaction_date, entry_type, bank_tx_account_id,
          amount, reference_number, cheque_number, payee_payer_name, description,
          status, created_by_user_id, source_payment_id, created_at, updated_at)
       VALUES (?, ?, 'credit', ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())`,
      [
        txnNo, opts.date, txAcct.id, opts.amount,
        opts.referenceNumber ?? null, opts.chequeNumber ?? null, opts.payerName,
        `Auto-bridged from customer payment — ${opts.method}`,
        opts.userId, opts.paymentId,
      ],
    )
  } catch (e) {
    console.warn('[bank-bridge] best-effort bridge failed (payment still posted fine):', e)
  }
}

/** Payment reversal voids the still-pending bridge row (spec §4.6) — an
 *  already-approved/reconciled one is a real bank record now, left alone. */
export async function voidBridgedTransaction(conn: any, paymentId: number): Promise<void> {
  try {
    await conn.query(
      `UPDATE bank_transactions SET status = 'cancelled', updated_at = NOW()
       WHERE source_payment_id = ? AND status = 'pending'`,
      [paymentId],
    )
  } catch (e) {
    console.warn('[bank-bridge] void-on-reversal failed (reversal still succeeded):', e)
  }
}
