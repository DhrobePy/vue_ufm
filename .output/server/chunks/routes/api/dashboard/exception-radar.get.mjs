import { n as defineEventHandler, K as getUserSession, j as createError, a4 as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

async function safeCount(sql, params = []) {
  var _a, _b;
  try {
    const rows = await query(sql, params);
    return Number((_b = (_a = rows[0]) == null ? void 0 : _a.n) != null ? _b : 0);
  } catch {
    return 0;
  }
}
const exceptionRadar_get = defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!(session == null ? void 0 : session.user)) throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  const [
    pendingApprovals,
    escalatedOrders,
    uncleardHolds,
    inTransit,
    pendingVouchers,
    qrReuses,
    pendingReturns,
    pendingOverDeliveries,
    pendingAmendments
  ] = await Promise.all([
    safeCount(`SELECT COUNT(*) AS n FROM credit_pending_requests WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM credit_orders WHERE status = 'escalated'`),
    safeCount(
      `SELECT COUNT(*) AS n FROM order_approval_conditions oac
       JOIN credit_orders o ON o.id = oac.order_id
       WHERE oac.dispatch_hold = 1 AND oac.dispatch_cleared = 0
         AND o.status NOT IN ('delivered','completed','cancelled','rejected')`
    ),
    safeCount(`SELECT COUNT(*) AS n FROM credit_orders WHERE status IN ('goods_on_board','shipped','dispatched')`),
    safeCount(`SELECT COUNT(*) AS n FROM expense_vouchers WHERE status = 'pending'`),
    safeCount(
      `SELECT COUNT(*) AS n FROM order_delivery_scans
       WHERE notes LIKE '%Re-scan%' AND scanned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    ),
    safeCount(`SELECT COUNT(*) AS n FROM credit_order_returns WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM credit_order_over_deliveries WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM order_amendments WHERE status = 'pending'`)
  ]);
  const tiles = [
    { key: "pending_approvals", label: "Payments Awaiting Approval", count: pendingApprovals, icon: "\u23F3", route: "/credit-sales/approval-requests" },
    { key: "escalated_orders", label: "Escalated Orders", count: escalatedOrders, icon: "\u26A0\uFE0F", route: "/credit-sales/approve" },
    { key: "uncleared_holds", label: "Uncleared Dispatch Holds", count: uncleardHolds, icon: "\u{1F6AB}", route: "/credit-sales/payment-watch" },
    { key: "in_transit", label: "In Transit", count: inTransit, icon: "\u{1F69A}", route: "/credit-sales/dispatch" },
    { key: "pending_vouchers", label: "Pending Expense Vouchers", count: pendingVouchers, icon: "\u{1F9FE}", route: "/expenses/approve" },
    { key: "qr_reuses", label: "QR Re-scans (7d)", count: qrReuses, icon: "\u{1F4F7}", route: "/credit-sales/all" },
    { key: "pending_returns", label: "Pending Returns", count: pendingReturns, icon: "\u21A9\uFE0F", route: "/credit-sales/all" },
    { key: "pending_over_deliveries", label: "Pending Over-Deliveries", count: pendingOverDeliveries, icon: "\u{1F4E6}", route: "/credit-sales/over-deliveries" },
    { key: "pending_amendments", label: "Pending Amendments", count: pendingAmendments, icon: "\u{1F4DD}", route: "/credit-sales/all" }
  ];
  return { tiles, total: tiles.reduce((s, t) => s + t.count, 0) };
});

export { exceptionRadar_get as default };
//# sourceMappingURL=exception-radar.get.mjs.map
