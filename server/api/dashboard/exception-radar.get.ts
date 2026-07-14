import { query } from '~/server/utils/db'

/**
 * GET /api/dashboard/exception-radar
 * Owner visibility (spec §2.13): counts of everything that needs a human
 * to look at it. Defensive per-metric — a missing/unmigrated table yields 0
 * for that tile instead of failing the whole dashboard.
 */
async function safeCount(sql: string, params: unknown[] = []): Promise<number> {
  try {
    const rows = await query<{ n: number }>(sql, params)
    return Number(rows[0]?.n ?? 0)
  } catch {
    return 0
  }
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const [
    pendingApprovals, escalatedOrders, uncleardHolds, inTransit,
    pendingVouchers, qrReuses, pendingReturns, pendingOverDeliveries,
    pendingAmendments,
  ] = await Promise.all([
    safeCount(`SELECT COUNT(*) AS n FROM credit_pending_requests WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM credit_orders WHERE status = 'escalated'`),
    safeCount(
      `SELECT COUNT(*) AS n FROM order_approval_conditions oac
       JOIN credit_orders o ON o.id = oac.order_id
       WHERE oac.dispatch_hold = 1 AND oac.dispatch_cleared = 0
         AND o.status NOT IN ('delivered','completed','cancelled','rejected')`,
    ),
    safeCount(`SELECT COUNT(*) AS n FROM credit_orders WHERE status IN ('goods_on_board','shipped','dispatched')`),
    safeCount(`SELECT COUNT(*) AS n FROM expense_vouchers WHERE status = 'pending'`),
    safeCount(
      `SELECT COUNT(*) AS n FROM order_delivery_scans
       WHERE notes LIKE '%Re-scan%' AND scanned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    ),
    safeCount(`SELECT COUNT(*) AS n FROM credit_order_returns WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM credit_order_over_deliveries WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM order_amendments WHERE status = 'pending'`),
  ])

  const tiles = [
    { key: 'pending_approvals',      label: 'Payments Awaiting Approval', count: pendingApprovals,      icon: '⏳', route: '/credit-sales/approval-requests' },
    { key: 'escalated_orders',       label: 'Escalated Orders',           count: escalatedOrders,       icon: '⚠️', route: '/credit-sales/approve' },
    { key: 'uncleared_holds',        label: 'Uncleared Dispatch Holds',   count: uncleardHolds,         icon: '🚫', route: '/credit-sales/payment-watch' },
    { key: 'in_transit',             label: 'In Transit',                 count: inTransit,              icon: '🚚', route: '/credit-sales/dispatch' },
    { key: 'pending_vouchers',       label: 'Pending Expense Vouchers',   count: pendingVouchers,        icon: '🧾', route: '/expenses/approve' },
    { key: 'qr_reuses',              label: 'QR Re-scans (7d)',           count: qrReuses,               icon: '📷', route: '/credit-sales/all' },
    { key: 'pending_returns',        label: 'Pending Returns',            count: pendingReturns,          icon: '↩️', route: '/credit-sales/all' },
    { key: 'pending_over_deliveries',label: 'Pending Over-Deliveries',    count: pendingOverDeliveries,  icon: '📦', route: '/credit-sales/over-deliveries' },
    { key: 'pending_amendments',     label: 'Pending Amendments',         count: pendingAmendments,      icon: '📝', route: '/credit-sales/all' },
  ]

  return { tiles, total: tiles.reduce((s, t) => s + t.count, 0) }
})
