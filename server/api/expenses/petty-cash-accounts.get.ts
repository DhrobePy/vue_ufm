import { query } from '~/server/utils/db'

/**
 * GET /api/expenses/petty-cash-accounts
 * Returns active branch petty cash accounts for use in the expense create form.
 */
export default defineEventHandler(async () => {
  const accounts = await query(
    `SELECT p.id, p.account_name, p.current_balance, p.branch_id, b.name AS branch_name
     FROM branch_petty_cash_accounts p
     LEFT JOIN branches b ON b.id = p.branch_id
     WHERE p.status = 'active'
     ORDER BY p.account_name`,
  ) as any[]

  return { accounts }
})
