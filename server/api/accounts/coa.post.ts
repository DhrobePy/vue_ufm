import { query } from '~/server/utils/db'
import { ADMIN_ROLES, ACCOUNTS_ROLES } from '~/server/utils/creditOrders'

const DEBIT_NORMAL_TYPES = new Set([
  'Bank', 'Petty Cash', 'Cash', 'Accounts Receivable', 'Other Current Asset',
  'Fixed Asset', 'Expense', 'Cost of Goods Sold', 'Other Expense',
])

/**
 * POST /api/accounts/coa — create a new Chart of Accounts entry.
 * Previously the Chart of Accounts was read-only in Vue (coa.get.ts only) —
 * any new GL account required a direct DB edit.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (![...ADMIN_ROLES, ...ACCOUNTS_ROLES].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readBody(event)
  const { name, account_number, account_type, account_type_group, description, branch_id } = body ?? {}

  if (!name?.trim()) throw createError({ statusCode: 400, statusMessage: 'name is required' })
  if (!account_type) throw createError({ statusCode: 400, statusMessage: 'account_type is required' })

  const normalBalance = DEBIT_NORMAL_TYPES.has(account_type) ? 'Debit' : 'Credit'

  const result = await query(
    `INSERT INTO chart_of_accounts
       (name, account_number, account_type, account_type_group, normal_balance,
        description, branch_id, status, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1)`,
    [
      name.trim(), account_number?.trim() || null, account_type,
      account_type_group?.trim() || account_type, normalBalance,
      description?.trim() || null, branch_id || null,
    ],
  ) as any

  return { ok: true, id: result.insertId, normal_balance: normalBalance }
})
