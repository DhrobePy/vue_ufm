import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { item_code, item_name, unit, category_id, reorder_level, unit_cost, description } = body ?? {}

  if (!item_name) throw createError({ statusCode: 400, statusMessage: 'item_name is required' })

  const result = await query(
    `INSERT INTO fleet_items (item_code, item_name, unit, category_id, reorder_level, unit_cost, description)
     VALUES (?,?,?,?,?,?,?)`,
    [
      item_code        || null,
      item_name.trim(),
      unit             || 'pcs',
      category_id      ? Number(category_id) : null,
      reorder_level    ? Number(reorder_level) : 0,
      unit_cost        ? Number(unit_cost) : null,
      description      || null,
    ],
  ) as any

  return { ok: true, id: result.insertId }
})
