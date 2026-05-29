import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const products = await query(
    `SELECT p.id, p.base_name, p.category, p.description, p.status,
            COUNT(pv.id) AS variant_count
     FROM products p
     LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
     WHERE p.status != 'deleted'
     GROUP BY p.id
     ORDER BY p.category, p.base_name`,
  ) as any[]

  return { products }
})
