import { query } from '~/server/utils/db'

/**
 * GET /api/expenses/subcategories?category_id=X
 * Returns active subcategories for a given category, including unit_of_measurement.
 */
export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const categoryId = Number(q.category_id)

  if (!categoryId)
    throw createError({ statusCode: 400, statusMessage: 'category_id is required' })

  const subcategories = await query(
    `SELECT id, subcategory_name AS name,
            COALESCE(unit_of_measurement, '') AS unit_of_measurement,
            description
     FROM expense_subcategories
     WHERE category_id = ? AND is_active = 1
     ORDER BY subcategory_name`,
    [categoryId],
  ) as any[]

  return { subcategories }
})
