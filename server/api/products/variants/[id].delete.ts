import { query } from '~/server/utils/db'

const PROD_ROLES = ['admin', 'superadmin', 'production manager-srg', 'production manager-demra']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!PROD_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid variant ID' })

  const result = await query(
    `UPDATE product_variants SET status = 'inactive' WHERE id = ? AND status = 'active'`,
    [id],
  ) as any

  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: 'Variant not found or already inactive' })

  return { ok: true, message: 'Variant deactivated' }
})
