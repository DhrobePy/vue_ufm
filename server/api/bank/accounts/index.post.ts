import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * POST /api/bank/accounts
 * The ONE way to add a bank account now. Creates a chart_of_accounts entry
 * (so it's GL-ready from day one), the bank_accounts row, and a mirrored
 * bank_tx_accounts row (so the existing transaction/reconciliation/dashboard
 * code — all keyed to bank_tx_account_id — keeps working unchanged).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId  = Number((session?.user as any)?.id ?? 1)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role) && !role.includes('account')) {
    throw createError({ statusCode: 403, statusMessage: 'Only accounts/admin can add bank accounts' })
  }

  const body = await readBody(event)
  const {
    bank_name, account_name, account_number, branch_name,
    account_type = 'Checking', opening_balance = 0,
  } = body ?? {}

  if (!bank_name || !account_number) {
    throw createError({ statusCode: 400, statusMessage: 'bank_name and account_number are required' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[dupe]] = await conn.query<any>(`SELECT id FROM bank_accounts WHERE account_number = ?`, [account_number])
    if (dupe) throw createError({ statusCode: 409, statusMessage: 'An account with this account number already exists' })

    const [coaRes] = await conn.query<any>(
      `INSERT INTO chart_of_accounts
         (account_number, account_type, account_type_group, normal_balance, status, is_active, description, name)
       VALUES (?, 'Bank', 'Asset', 'Debit', 'active', 1, ?, ?)`,
      [account_number, `Bank account: ${bank_name} — ${account_name || bank_name}`, `${bank_name} — ${account_name || bank_name}`.slice(0, 255)],
    )
    const coaId = coaRes.insertId

    const [txRes] = await conn.query<any>(
      `INSERT INTO bank_tx_accounts
         (bank_name, account_name, account_number, branch_name, account_type, opening_balance, status, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [bank_name, account_name || bank_name, account_number, branch_name || null, account_type, Number(opening_balance || 0), userId],
    )

    const [baRes] = await conn.query<any>(
      `INSERT INTO bank_accounts
         (chart_of_account_id, bank_name, branch_name, account_name, account_number,
          account_type, initial_balance, current_balance, status, legacy_tx_account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [coaId, bank_name, branch_name || null, account_name || bank_name, account_number,
        account_type, Number(opening_balance || 0), Number(opening_balance || 0), txRes.insertId],
    )

    await auditLog(conn, {
      userId, action: 'created', module: 'bank', recordType: 'bank_account',
      recordId: baRes.insertId, referenceNumber: account_number,
      description: `Bank account "${bank_name} — ${account_name || bank_name}" added, GL-linked from creation`,
      severity: 'info',
    })

    await conn.commit()
    return { ok: true, id: baRes.insertId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
