import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const branchId = Number(q.branch_id) || null

  const where: string[] = ['p.status = "active"']
  const params: unknown[] = []

  if (search) {
    where.push('(p.base_name LIKE ? OR pv.sku LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  const products = await query(
    `SELECT p.id AS product_id, p.base_name, p.category, p.base_sku,
            pv.id AS variant_id, pv.sku, pv.grade, pv.weight_variant,
            pv.weight_kg, pv.unit_of_measure, pv.status AS variant_status,
            pp.unit_price, pp.branch_id
     FROM products p
     JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
     LEFT JOIN product_prices pp ON pp.variant_id = pv.id
       AND pp.is_active = 1
       ${branchId ? 'AND pp.branch_id = ?' : ''}
     WHERE ${where.join(' AND ')}
     ORDER BY p.base_name, pv.weight_variant`,
    branchId ? [...params, branchId] : params,
  )

  // Group by product
  const grouped: Record<number, any> = {}
  for (const row of products as any[]) {
    if (!grouped[row.product_id]) {
      grouped[row.product_id] = {
        id: row.product_id, base_name: row.base_name,
        category: row.category, base_sku: row.base_sku, variants: [],
      }
    }
    grouped[row.product_id].variants.push({
      id: row.variant_id, sku: row.sku, grade: row.grade,
      weight_variant: row.weight_variant, weight_kg: row.weight_kg,
      unit_of_measure: row.unit_of_measure,
      unit_price: row.unit_price ?? null,
    })
  }

  return { products: Object.values(grouped) }
})
