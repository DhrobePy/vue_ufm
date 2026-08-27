import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/pos/eod/:id/deposit — next-day bank deposit confirmation for an
 * approved EOD cash count.
 *
 * Previously this only stamped deposited_at/deposit_reference — it never
 * posted a journal entry or decremented the branch's petty-cash balance, so
 * "confirming a deposit" never actually removed the cash from the till's
 * books; the balance every future EOD count is checked against kept growing
 * by every deposited amount instead of shrinking. Mirrors legacy's
 * confirm_deposit.php: DR the chosen bank GL account / CR the branch's petty
 * cash GL account, plus a real branch_petty_cash_transactions row.
 *
 * Body: { deposit_reference, bank_account_id }
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })
  const userId = Number((session!.user as any).id)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event).catch(() => ({}))
  const reference = String(body?.deposit_reference ?? '').trim()
  const bankAccountId = Number(body?.bank_account_id)
  if (!reference) throw createError({ statusCode: 400, statusMessage: 'A deposit reference is required' })
  if (!bankAccountId) throw createError({ statusCode: 400, statusMessage: 'A destination bank account is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[row]] = await conn.query<any>(`SELECT * FROM cash_verification_log WHERE id = ? FOR UPDATE`, [id])
    if (!row) throw createError({ statusCode: 404, statusMessage: 'EOD entry not found' })
    if (row.status !== 'approved') throw createError({ statusCode: 409, statusMessage: 'Only approved EOD counts can be marked deposited' })
    if (row.deposited_at) throw createError({ statusCode: 409, statusMessage: 'Already marked deposited' })

    const amount = Number(row.actual_cash)

    const [[pcAcc]] = await conn.query<any>(
      `SELECT id, chart_of_account_id, current_balance FROM branch_petty_cash_accounts
       WHERE branch_id = ? FOR UPDATE`,
      [row.branch_id],
    )
    if (!pcAcc?.chart_of_account_id)
      throw createError({ statusCode: 400, statusMessage: 'No active petty cash GL account configured for this branch' })

    const [[bankAcc]] = await conn.query<any>(
      `SELECT chart_of_account_id, bank_name FROM bank_accounts WHERE id = ?`, [bankAccountId],
    )
    if (!bankAcc?.chart_of_account_id)
      throw createError({ statusCode: 400, statusMessage: 'Invalid bank account' })

    // 1. Journal entry — DR Bank / CR Petty Cash
    const [jeRes] = await conn.query<any>(
      `INSERT INTO journal_entries (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
       VALUES (CURDATE(), ?, 'PosDeposit', ?, ?)`,
      [`POS Cash Deposit — EOD #${id} · ${bankAcc.bank_name ?? 'Bank'} · ref ${reference}`, id, userId],
    )
    const jeId = jeRes.insertId
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, 0, ?)`,
      [jeId, bankAcc.chart_of_account_id, amount, `Bank deposit — EOD #${id}`],
    )
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, 0, ?, ?)`,
      [jeId, pcAcc.chart_of_account_id, amount, `Cash out for deposit — EOD #${id}`],
    )

    // 2. Actually remove the cash from the branch's petty-cash books
    const newBalance = Number(pcAcc.current_balance) - amount
    await conn.query(
      `INSERT INTO branch_petty_cash_transactions
         (account_id, branch_id, transaction_type, amount, balance_after,
          reference_type, reference_id, description, created_by_user_id, transaction_date)
       VALUES (?, ?, 'transfer_out', ?, ?, 'pos_eod_deposit', ?, ?, ?, CURDATE())`,
      [pcAcc.id, row.branch_id, amount, newBalance, id, `Deposited to bank — EOD #${id} · ref ${reference}`, userId],
    )
    await conn.query(
      `UPDATE branch_petty_cash_accounts SET current_balance = ? WHERE id = ?`,
      [newBalance, pcAcc.id],
    )

    // 3. Stamp the EOD row
    await conn.query(
      `UPDATE cash_verification_log
       SET deposited_at = NOW(), deposited_by_user_id = ?, deposit_reference = ?,
           deposit_bank_account_id = ?, deposit_journal_entry_id = ?
       WHERE id = ?`,
      [userId, reference, bankAccountId, jeId, id],
    )
    await auditLog(conn, {
      userId, action: 'updated', module: 'other', recordType: 'cash_verification', recordId: id,
      description: `EOD cash deposit confirmed — ৳${amount.toLocaleString()} to ${bankAcc.bank_name ?? 'bank'} · ref ${reference} · JE #${jeId}`,
      severity: 'info',
    })
    await conn.commit()
    return { ok: true, journal_entry_id: jeId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
