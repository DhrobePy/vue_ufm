import { query } from '~/server/utils/db'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'

/** List users + their delegated approval limits (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const users = await query(
    `SELECT u.id, u.display_name, u.username, u.role,
            ual.max_order_amount, ual.updated_at AS limit_updated_at
     FROM users u
     LEFT JOIN user_approval_limits ual ON ual.user_id = u.id
     WHERE u.status = 'active' AND u.role NOT IN ('admin','superadmin')
     ORDER BY ual.max_order_amount DESC, u.display_name`,
  )
  return { users }
})
