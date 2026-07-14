import { query } from '~/server/utils/db'

/**
 * GET /api/products/stock-adjustments?status=pending
 * List stock adjustments for the review page.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const status = q.status ? String(q.status) : null

  const rows = await query<any>(
    `SELECT sa.*, pv.sku, pv.stock_qty AS current_stock, p.base_name AS product_name,
            u1.display_name AS created_by_name, u2.display_name AS approved_by_name
     FROM stock_adjustments sa
     JOIN product_variants pv ON pv.id = sa.variant_id
     JOIN products p ON p.id = pv.product_id
     LEFT JOIN users u1 ON u1.id = sa.created_by_user_id
     LEFT JOIN users u2 ON u2.id = sa.approved_by_user_id
     WHERE (? IS NULL OR sa.status = ?)
     ORDER BY sa.id DESC
     LIMIT 300`,
    [status, status],
  )
  return { adjustments: rows }
})
