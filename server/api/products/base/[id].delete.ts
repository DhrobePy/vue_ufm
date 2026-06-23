import { query } from '~/server/utils/db'

const ADMIN_ROLES = ['admin', 'superadmin']

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const result = await query(
    `UPDATE products SET status = 'deleted' WHERE id = ? AND status != 'deleted'`,
    [id],
  ) as any

  if (result.affectedRows === 0)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  return { ok: true, message: 'Product deleted' }
})
