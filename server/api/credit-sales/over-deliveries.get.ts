import { query } from '~/server/utils/db'
import { isAccountsRole } from '~/server/utils/creditOrders'

/** All over-deliveries across orders — for the review/approve list page. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = ((session.user as any).role ?? '').toLowerCase()
  if (!isAccountsRole(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts family or admin only' })

  const q      = getQuery(event)
  const status = (q.status as string) || 'pending'

  const rows = await query<any>(
    `SELECT od.*, o.order_number, c.name AS customer_name,
            cr.display_name AS created_by_name, ap.display_name AS approved_by_name
     FROM credit_order_over_deliveries od
     JOIN credit_orders o ON o.id = od.order_id
     JOIN customers c ON c.id = od.customer_id
     LEFT JOIN users cr ON cr.id = od.created_by_user_id
     LEFT JOIN users ap ON ap.id = od.approved_by_user_id
     WHERE od.status = ?
     ORDER BY od.created_at DESC
     LIMIT 200`,
    [status],
  )
  return { over_deliveries: rows }
})
