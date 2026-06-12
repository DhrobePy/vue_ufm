/**
 * GET /api/lookup/cash-accounts
 * Petty-cash account PICKER for payment forms. Available to ANY
 * authenticated user regardless of module permissions.
 * Deliberately returns NO balances — full details live in the Expenses module.
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const accounts = await query(
    `SELECT p.id, p.account_name, p.branch_id, b.name AS branch_name
     FROM branch_petty_cash_accounts p
     LEFT JOIN branches b ON b.id = p.branch_id
     WHERE p.status = 'active'
     ORDER BY p.account_name`,
  ) as any[]

  return { accounts }
})
