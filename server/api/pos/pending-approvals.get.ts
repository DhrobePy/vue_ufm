import { query } from '~/server/utils/db'

/** GET /api/pos/pending-approvals — POS exit-release checker queue (admin/accounts only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })

  const requests = await query<any>(
    `SELECT r.*, u.display_name AS requested_by_name, o.order_number, o.total_amount, o.cash_amount
     FROM credit_pending_requests r
     LEFT JOIN users u ON u.id = r.requested_by_user_id
     LEFT JOIN orders o ON o.id = r.order_id AND o.order_type = 'POS'
     WHERE r.request_type = 'pos_exit_release' AND r.status = 'pending'
     ORDER BY r.created_at DESC`,
  )
  return { requests }
})
