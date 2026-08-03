import { query } from '~/server/utils/db'

/**
 * GET /api/pos/eod — cash accounts (with live system balance = "expected")
 * for a branch, plus recent verification history. Reuses cash_verification_log,
 * the legacy EOD table already present in this schema.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const branchId = q.branch_id ? Number(q.branch_id) : null

  const [cashAccounts, history] = await Promise.all([
    query<any>(
      `SELECT ca.id, ca.account_name, ca.branch_id, ca.current_balance, b.name AS branch_name
       FROM branch_petty_cash_accounts ca
       LEFT JOIN branches b ON b.id = ca.branch_id
       WHERE ca.status = 'active' ${branchId ? 'AND ca.branch_id = ?' : ''}
       ORDER BY b.name`,
      branchId ? [branchId] : []),
    query<any>(
      `SELECT v.*, b.name AS branch_name, u.display_name AS verified_by_name, w.display_name AS witness_name
       FROM cash_verification_log v
       LEFT JOIN branches b ON b.id = v.branch_id
       LEFT JOIN users u ON u.id = v.verified_by_user_id
       LEFT JOIN users w ON w.id = v.witness_user_id
       ${branchId ? 'WHERE v.branch_id = ?' : ''}
       ORDER BY v.verification_date DESC, v.id DESC LIMIT 60`,
      branchId ? [branchId] : []),
  ])

  return { cash_accounts: cashAccounts, history }
})
