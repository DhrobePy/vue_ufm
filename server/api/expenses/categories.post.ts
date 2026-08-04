import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body    = await readBody(event)
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 1

  const { name, description, code, chart_of_account_id } = body ?? {}
  if (!name?.trim())
    throw createError({ statusCode: 400, statusMessage: 'name is required' })

  const result = await query(
    `INSERT INTO expense_categories
       (category_code, category_name, description, chart_of_account_id, is_active, created_by_user_id)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [code?.trim() || null, name.trim(), description?.trim() || null, chart_of_account_id || null, userId],
  ) as any

  return { ok: true, id: result.insertId }
})
