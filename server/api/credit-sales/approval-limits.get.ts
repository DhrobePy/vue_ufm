import { query } from '~/server/utils/db'
import { ADMIN_ROLES } from '~/server/utils/creditOrders'

/** List users + their delegated approval limits (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const users = await query<any>(
    `SELECT u.id, u.display_name, u.role,
            ual.max_order_amount, ual.max_transaction_amount,
            ual.updated_at AS limit_updated_at
     FROM users u
     LEFT JOIN user_approval_limits ual ON ual.user_id = u.id
     WHERE u.status = 'active' AND u.role NOT IN ('admin','superadmin')
     ORDER BY ual.max_order_amount DESC, u.display_name`,
  )

  // Per-action overrides — attach to each user row (table may predate a
  // fresh deploy's first restart, hence the defensive catch).
  try {
    const actionRows = await query<any>(
      `SELECT user_id, action_key, max_amount FROM user_action_limits WHERE max_amount > 0`,
    )
    const byUser: Record<number, any[]> = {}
    for (const r of actionRows) (byUser[r.user_id] ??= []).push({ action_key: r.action_key, max_amount: Number(r.max_amount) })
    for (const u of users as any[]) u.action_limits = byUser[u.id] ?? []
  } catch { for (const u of users as any[]) u.action_limits = [] }

  return { users }
})
