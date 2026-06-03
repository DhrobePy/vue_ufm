import { query } from '~/server/utils/db'

/**
 * GET /api/expenses/subcategories?category_id=X
 * Returns active subcategories for a given category.
 * Gracefully handles missing unit_of_measurement column.
 */
export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const categoryId = Number(q.category_id)

  if (!categoryId)
    throw createError({ statusCode: 400, statusMessage: 'category_id is required' })

  // Try with unit_of_measurement first; fall back to without it
  let subcategories: any[] = []
  try {
    subcategories = await query(
      `SELECT id, subcategory_name AS name,
              COALESCE(unit_of_measurement, '') AS unit_of_measurement
       FROM expense_subcategories
       WHERE category_id = ? AND is_active = 1
       ORDER BY subcategory_name`,
      [categoryId],
    ) as any[]
  } catch {
    // unit_of_measurement column may not exist yet
    subcategories = await query(
      `SELECT id, subcategory_name AS name, '' AS unit_of_measurement
       FROM expense_subcategories
       WHERE category_id = ? AND is_active = 1
       ORDER BY subcategory_name`,
      [categoryId],
    ) as any[]
  }

  return { subcategories }
})
