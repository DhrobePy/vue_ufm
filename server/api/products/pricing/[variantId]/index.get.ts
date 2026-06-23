import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!(session?.user as any)?.id)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const variantId = Number(getRouterParam(event, 'variantId'))
  if (!variantId) throw createError({ statusCode: 400, statusMessage: 'Invalid variant ID' })

  const [variantRows, prices, changeLogs, branches] = await Promise.all([
    query(
      `SELECT pv.id, pv.sku, pv.weight_variant, pv.grade, pv.unit_of_measure, pv.status,
              p.id AS product_id, p.base_name AS product_name, p.base_sku
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ?`,
      [variantId],
    ) as Promise<any[]>,

    query(
      `SELECT pp.id AS price_id, pp.branch_id, b.name AS branch_name, b.code AS branch_code,
              pp.unit_price, pp.effective_date, pp.status, pp.is_active, pp.created_at
       FROM product_prices pp
       JOIN branches b ON b.id = pp.branch_id
       WHERE pp.variant_id = ?
       ORDER BY pp.branch_id ASC, pp.is_active DESC, pp.effective_date DESC, pp.id DESC`,
      [variantId],
    ) as Promise<any[]>,

    query(
      `SELECT pcl.id, pcl.branch_id, b.name AS branch_name,
              pcl.old_price, pcl.new_price, pcl.change_type,
              pcl.changed_by, pcl.changed_at, pcl.note
       FROM price_change_log pcl
       JOIN branches b ON b.id = pcl.branch_id
       WHERE pcl.variant_id = ?
       ORDER BY pcl.changed_at DESC
       LIMIT 100`,
      [variantId],
    ) as Promise<any[]>,

    query(
      `SELECT id, name, code FROM branches WHERE status = 'active' ORDER BY id`,
    ) as Promise<any[]>,
  ])

  if (!variantRows.length)
    throw createError({ statusCode: 404, statusMessage: 'Variant not found' })

  const variant = variantRows[0]

  // Active prices per branch (one per branch)
  const activePrices: Record<number, any> = {}
  for (const p of prices) {
    if (p.is_active && !activePrices[p.branch_id]) {
      activePrices[p.branch_id] = p
    }
  }

  return { variant, prices, activePrices, changeLogs, branches }
})
