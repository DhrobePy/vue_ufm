import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/accounts/transfer — internal transfer between two ledger accounts (legacy accounts/internal_transfer.php).
 * Money MOVES from the source to the destination: DEBIT the destination (its balance rises), CREDIT the source (its balance falls).
 * If either side is a petty-cash / cash account, that till's running balance and its cash log move as well.
 * body: { from_account_id, to_account_id, amount, transfer_date?, memo?, responsible_employee_id }
 */
export default defineEventHandler(async (event) => {
  const b = await readBody(event)
  const session = await getUserSession(event)
  const userId = Number((session?.user as any)?.id ?? 1)
  const fromId = Number(b?.from_account_id), toId = Number(b?.to_account_id), amount = Number(b?.amount), empId = Number(b?.responsible_employee_id)
  const memo = String(b?.memo ?? '').trim()
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b?.transfer_date ?? '')) ? String(b.transfer_date) : new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)

  if (!(amount > 0)) throw createError({ statusCode: 400, statusMessage: 'Transfer amount must be positive.' })
  if (!fromId || !toId || !empId) throw createError({ statusCode: 400, statusMessage: 'Please select source account, destination account, and responsible employee.' })
  if (fromId === toId) throw createError({ statusCode: 400, statusMessage: 'Source and Destination accounts cannot be the same.' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[from]] = await conn.query<any>(`SELECT id, name, account_type, branch_id FROM chart_of_accounts WHERE id = ?`, [fromId])
    const [[to]] = await conn.query<any>(`SELECT id, name, account_type, branch_id FROM chart_of_accounts WHERE id = ?`, [toId])
    if (!from || !to) throw createError({ statusCode: 400, statusMessage: 'Invalid source or destination account selected.' })
    const [[emp]] = await conn.query<any>(`SELECT id FROM employees WHERE id = ?`, [empId])
    if (!emp) throw createError({ statusCode: 400, statusMessage: 'Responsible employee not found.' })

    const desc = `Internal Transfer: ${from.name} to ${to.name}${memo ? ' - ' + memo : ''}`.slice(0, 255)
    const [je] = await conn.query<any>(
      `INSERT INTO journal_entries (transaction_date, description, related_document_type, created_by_user_id, responsible_employee_id) VALUES (?, ?, 'InternalTransfer', ?, ?)`,
      [date, desc, userId, empId])
    const jeId = je.insertId
    await conn.query(`INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES (?, ?, ?, 0, ?)`, [jeId, toId, amount, memo || 'Internal transfer received'])
    await conn.query(`INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES (?, ?, 0, ?, ?)`, [jeId, fromId, amount, memo || 'Internal transfer sent'])

    // petty-cash accounts: the till linked to this ledger account (else, like legacy, the branch's active till for a Petty Cash/Cash account)
    const moveTill = async (acct: any, delta: number, kind: 'transfer_in' | 'transfer_out') => {
      let [[pc]] = await conn.query<any>(`SELECT id, branch_id, current_balance FROM branch_petty_cash_accounts WHERE chart_of_account_id = ? AND status = 'active' LIMIT 1`, [acct.id])
      if (!pc && ['Petty Cash', 'Cash'].includes(acct.account_type) && acct.branch_id)
        [[pc]] = await conn.query<any>(`SELECT id, branch_id, current_balance FROM branch_petty_cash_accounts WHERE branch_id = ? AND status = 'active' LIMIT 1`, [acct.branch_id])
      if (!pc) return
      const after = Number(pc.current_balance) + delta
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions (account_id, branch_id, transaction_type, amount, balance_after, reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, ?, ?, ?, 'internal_transfer', ?, ?, ?, ?)`,
        [pc.id, pc.branch_id, kind, amount, after, jeId, `${kind === 'transfer_out' ? 'Transfer out' : 'Transfer in'}: ${desc}`.slice(0, 255), userId, date])
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?`, [after, pc.id])
    }
    await moveTill(from, -amount, 'transfer_out')
    await moveTill(to, amount, 'transfer_in')

    await auditLog(conn, { userId, action: 'internal_transfer', module: 'accounts', recordType: 'journal_entry', recordId: jeId, description: `${desc} · ৳${amount.toLocaleString()}`, severity: 'info' })
    await conn.commit()
    return { ok: true, id: jeId }
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
})
