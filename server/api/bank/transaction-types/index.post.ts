import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { name: string; nature?: string; description?: string; chart_of_account_id?: number }
  if (!body.name?.trim()) throw createError({ statusCode: 422, statusMessage: 'Type name is required' })

  const session = await getUserSession(event)
  const userId  = (session?.user as any)?.id ?? 1
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const db = getDb()
  const [result] = await db.query<any>(
    `INSERT INTO bank_tx_transaction_types (name, nature, description, chart_of_account_id, is_active, created_by_user_id)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [body.name.trim(), body.nature || 'other', body.description || null, body.chart_of_account_id || null, userId],
  )
  return { id: (result as any).insertId, message: 'Transaction type created' }
})
