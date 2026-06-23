import { query } from '~/server/utils/db'

const PROD_ROLES = ['admin', 'superadmin', 'production manager-srg', 'production manager-demra']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid variant ID' })

  const body = await readBody(event)
  const { weight_variant, grade, sku, unit_of_measure, weight_kg, status } = body

  if (!weight_variant?.trim())
    throw createError({ statusCode: 400, statusMessage: 'weight_variant is required' })

  const validUom    = ['pcs', 'litre', 'kg', 'gm', 'bag']
  const uom         = unit_of_measure && validUom.includes(unit_of_measure) ? unit_of_measure : 'bag'
  const validStatus = ['active', 'inactive']
  const st          = status && validStatus.includes(status) ? status : 'active'

  const result = await query(
    `UPDATE product_variants
     SET weight_variant = ?, grade = ?, sku = ?, unit_of_measure = ?, weight_kg = ?, status = ?
     WHERE id = ? AND status != 'deleted'`,
    [weight_variant.trim(), grade || null, sku || null, uom, weight_kg ? Number(weight_kg) : null, st, id],
  ) as any

  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: 'Variant not found' })

  return { ok: true, message: 'Variant updated' }
})
