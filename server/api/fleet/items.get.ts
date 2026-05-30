import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const items = await query(
    `SELECT fi.*, fic.name AS category_name
     FROM fleet_items fi
     LEFT JOIN fleet_item_categories fic ON fic.id = fi.category_id
     ORDER BY fi.item_name`,
  ) as any[]

  return { items }
})
