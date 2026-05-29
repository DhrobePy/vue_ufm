import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { variantId } = getQuery(event)

  if (!variantId)
    throw createError({ statusCode: 400, statusMessage: 'variantId is required' })

  const history = await query(
    `SELECT pp.id, pp.branch_id, b.name AS branch_name, b.code AS branch_code,
            pp.unit_price, pp.effective_date, pp.status, pp.is_active,
            pp.created_at
     FROM product_prices pp
     JOIN branches b ON b.id = pp.branch_id
     WHERE pp.variant_id = ?
     ORDER BY pp.branch_id ASC, pp.is_active DESC, pp.effective_date DESC`,
    [Number(variantId)],
  ) as any[]

  return { history }
})
