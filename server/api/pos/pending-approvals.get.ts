import { query } from '~/server/utils/db'

/**
 * GET /api/pos/pending-approvals — POS checker queue: exit-release requests
 * (accounts+admin) AND credit-sale-over-limit requests (admin-only, by
 * design — legacy's exact rule for pos_credit_sale). Both types share this
 * one queue view; the frontend/approve endpoint enforce the admin-only
 * distinction per-row.
 */
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
     WHERE r.request_type IN ('pos_exit_release', 'pos_credit_sale') AND r.status = 'pending'
     ORDER BY r.created_at DESC`,
  )
  return { requests }
})
