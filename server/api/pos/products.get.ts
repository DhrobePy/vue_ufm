import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q        = getQuery(event)
  const branchId = q.branch_id ? Number(q.branch_id) : 1

  // Fetch active product variants with current price and stock for the branch
  const products = await query(
    `SELECT pv.id, pv.sku, pv.weight_variant, pv.grade, pv.status,
            p.id AS product_id, p.base_name, p.category,
            COALESCE(pp.unit_price, 0) AS price,
            COALESCE(inv.quantity, 0)  AS stock
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id AND p.status = 'active'
     LEFT JOIN product_prices pp ON pp.variant_id = pv.id
                                AND pp.is_active = 1
                                AND (pp.branch_id = ? OR pp.branch_id IS NULL)
     LEFT JOIN inventory inv ON inv.variant_id = pv.id AND inv.branch_id = ?
     WHERE pv.status = 'active'
     GROUP BY pv.id, pp.id
     ORDER BY p.category, p.base_name, pv.weight_variant`,
    [branchId, branchId],
  ) as any[]

  // Distinct categories for filter tabs
  const categories = ['All', ...new Set(products.map((p: any) => p.category).filter(Boolean))]

  return { products, categories }
})
