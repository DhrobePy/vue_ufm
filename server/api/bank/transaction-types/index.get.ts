import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const types = await query(
    `SELECT id, name, nature, description, is_active, created_at FROM bank_tx_transaction_types ORDER BY name ASC`,
  )
  return { types }
})
