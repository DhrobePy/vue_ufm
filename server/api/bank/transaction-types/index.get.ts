import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const types = await query(
    `SELECT t.id, t.name, t.nature, t.description, t.is_active, t.created_at,
            t.chart_of_account_id, c.name AS gl_account_name, c.account_number AS gl_account_number
     FROM bank_tx_transaction_types t
     LEFT JOIN chart_of_accounts c ON c.id = t.chart_of_account_id
     ORDER BY t.name ASC`,
  )
  return { types }
})
