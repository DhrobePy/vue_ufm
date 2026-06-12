/**
 * GET /api/lookup/bank-accounts
 * Account PICKER for payment forms (collect payment, PO payment, advance).
 * Available to ANY authenticated user regardless of module permissions —
 * staff collecting money must choose a deposit account even without access
 * to the Bank module. Deliberately returns NO balances.
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const accounts = await query(
    `SELECT id, bank_name, account_number, account_name, branch_name, account_type, chart_of_account_id
     FROM bank_accounts
     WHERE status = 'active' OR status IS NULL
     ORDER BY bank_name`,
  ) as any[]

  return { accounts }
})
