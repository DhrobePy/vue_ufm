import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id   = Number(event.context.params?.id)
  if (!id)   throw createError({ statusCode: 400, statusMessage: 'Invalid category ID' })

  const body = await readBody(event)
  const { name, description, code, is_active } = body ?? {}

  const sets:   string[] = []
  const params: any[]    = []

  if (name        !== undefined) { sets.push('category_name = ?');  params.push(name.trim()) }
  if (description !== undefined) { sets.push('description = ?');     params.push(description?.trim() || null) }
  if (code        !== undefined) { sets.push('category_code = ?');   params.push(code?.trim() || null) }
  if (is_active   !== undefined) { sets.push('is_active = ?');       params.push(is_active ? 1 : 0) }

  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  params.push(id)
  await query(
    `UPDATE expense_categories SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`,
    params,
  )

  return { ok: true }
})
