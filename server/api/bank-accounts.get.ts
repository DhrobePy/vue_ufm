import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const accounts = await query(
    `SELECT id, bank_name, account_number, account_name, branch_name, account_type, status, chart_of_account_id
     FROM bank_accounts
     WHERE status = 'active' OR status IS NULL
     ORDER BY bank_name`,
  ) as any[]

  return { accounts }
})
