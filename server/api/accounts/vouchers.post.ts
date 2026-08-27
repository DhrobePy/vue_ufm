import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const {
    voucher_date,
    expense_account_id,
    payment_account_id,
    amount,
    paid_to,
    description,
    reference_number,
    branch_id,
  } = body ?? {}

  if (!voucher_date || !expense_account_id || !payment_account_id || !amount || !paid_to || !description)
    throw createError({ statusCode: 400, statusMessage: 'voucher_date, expense_account_id, payment_account_id, amount, paid_to, and description are required' })

  if (Number(amount) <= 0)
    throw createError({ statusCode: 400, statusMessage: 'Amount must be greater than 0' })

  const db   = getDb()
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    // Voucher number — sequence-based (MAX-existing+1), matching legacy.
    // voucher_number is UNIQUE; a random 4-digit value with no collision
    // retry can (and did) clash on any busy day.
    const dvDatePrefix = new Date(voucher_date).toISOString().slice(0, 10).replace(/-/g, '')
    const [[lastDv]] = await conn.query<any>(
      `SELECT voucher_number FROM debit_vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1`,
      [`DV-${dvDatePrefix}-%`],
    )
    const dvSeq     = lastDv ? (parseInt(String(lastDv.voucher_number).slice(-4), 10) + 1) : 1
    const voucherNo = `DV-${dvDatePrefix}-${String(dvSeq).padStart(4, '0')}`

    // Auto-approved on creation, matching legacy — a debit voucher is a
    // record of a payment that already happened, not a request awaiting sign-off.
    const [result] = await conn.query<any>(
      `INSERT INTO debit_vouchers
         (voucher_number, voucher_date, expense_account_id, payment_account_id,
          amount, paid_to, description, reference_number, branch_id,
          created_by_user_id, approved_by_user_id, approved_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'approved')`,
      [
        voucherNo,
        voucher_date,
        Number(expense_account_id),
        Number(payment_account_id),
        Number(amount),
        paid_to,
        description,
        reference_number || null,
        branch_id ? Number(branch_id) : null,
        userId,
        userId,
      ],
    )
    const voucherId = result.insertId

    // Journal entry — DR expense account / CR the cash/bank account paid from.
    const [jeRes] = await conn.query<any>(
      `INSERT INTO journal_entries
         (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
       VALUES (?, ?, 'debit_vouchers', ?, ?)`,
      [voucher_date, `Debit Voucher #${voucherNo} — ${description}`.slice(0, 255), voucherId, userId],
    )
    const jeId = jeRes.insertId

    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, 0, ?)`,
      [jeId, Number(expense_account_id), Number(amount), `Payment to ${paid_to} — ${description}`],
    )
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, 0, ?, ?)`,
      [jeId, Number(payment_account_id), Number(amount), `Payment via debit voucher ${voucherNo}`],
    )
    await conn.query(`UPDATE debit_vouchers SET journal_entry_id = ? WHERE id = ?`, [jeId, voucherId])

    await auditLog(conn, {
      userId,
      action:          'created',
      module:          'accounts',
      recordType:      'debit_voucher',
      recordId:        voucherId,
      referenceNumber: voucherNo,
      description:     `Debit voucher ${voucherNo} — ৳${Number(amount).toLocaleString()} to ${paid_to} · ${description}`,
      severity:        'info',
    })

    await conn.commit()
    return { ok: true, id: voucherId, voucher_number: voucherNo, journal_entry_id: jeId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
