import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid transaction ID' })

  const [txn, auditLog] = await Promise.all([
    queryOne(
      `SELECT t.*, a.bank_name, a.account_name, a.account_number,
              u.display_name AS created_by_name
       FROM bank_transactions t
       JOIN bank_tx_accounts a ON a.id = t.bank_tx_account_id
       LEFT JOIN users u ON u.id = t.created_by_user_id
       WHERE t.id = ?`,
      [id],
    ) as any,
    query(
      `SELECT l.*, u.display_name AS user_name
       FROM bank_tx_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.tx_id = ?
       ORDER BY l.created_at ASC`,
      [id],
    ) as any[],
  ])

  if (!txn) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })

  return { transaction: txn, auditLog }
})
