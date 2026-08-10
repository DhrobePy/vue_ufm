import { q as defineEventHandler, aq as queryOne, ap as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const stats_get = defineEventHandler(async () => {
  var _a;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";
  const [
    orderStats,
    revenueStats,
    pendingApprovals,
    purchaseStats,
    expenseStats,
    recentOrders,
    pendingOrdersList
  ] = await Promise.all([
    // Order status counts this month
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'pending_approval') AS pending_approval,
         SUM(status = 'escalated')        AS escalated,
         SUM(status = 'approved')         AS approved,
         SUM(status = 'in_production')    AS in_production,
         SUM(status = 'ready_to_ship')    AS ready_to_ship,
         SUM(status IN ('goods_on_board','shipped','dispatched')) AS dispatched,
         SUM(status = 'delivered')        AS delivered,
         SUM(status = 'cancelled')        AS cancelled
       FROM credit_orders
       WHERE order_date >= ?`,
      [monthStart]
    ),
    // Revenue this month: based on DELIVERY date (not order_date)
    // so orders placed in a prior month but delivered today appear correctly.
    // Collected:    payments received this month (payment_date)
    // Outstanding:  ALL active balance_due regardless of when ordered
    queryOne(
      `SELECT
         COALESCE((SELECT SUM(d.total_amount_delivered)
                   FROM credit_order_deliveries d
                   WHERE d.delivery_date >= ?), 0)            AS total_revenue,
         COALESCE((SELECT SUM(p.amount)
                   FROM customer_payments p
                   WHERE p.payment_date >= ?), 0)             AS total_collected,
         COALESCE((SELECT SUM(o.balance_due)
                   FROM credit_orders o
                   WHERE o.balance_due > 0
                     AND o.status NOT IN ('cancelled','rejected')), 0) AS total_outstanding`,
      [monthStart, monthStart]
    ),
    // Pending approvals count
    queryOne(
      `SELECT COUNT(*) AS count FROM credit_orders
       WHERE status IN ('pending_approval','escalated')`
    ),
    // Purchase stats this month
    queryOne(
      `SELECT
         COUNT(*) AS total_pos,
         COALESCE(SUM(total_order_value),0) AS total_value,
         COALESCE(SUM(total_paid),0)        AS total_paid
       FROM purchase_orders_adnan
       WHERE po_date >= ?`,
      [monthStart]
    ),
    // Expenses this month
    queryOne(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(total_amount),0) AS total_amount,
         SUM(status = 'pending') AS pending_count
       FROM expense_vouchers
       WHERE expense_date >= ?`,
      [monthStart]
    ),
    // Recent 5 orders
    query(
      `SELECT o.id, o.order_number, o.order_date, o.status, o.total_amount,
              c.name AS customer_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC
       LIMIT 5`
    ),
    // Pending approval orders list (up to 6)
    query(
      `SELECT o.id, o.order_number, o.order_date, o.status, o.total_amount,
              c.name AS customer_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.status IN ('pending_approval','escalated')
       ORDER BY o.created_at DESC
       LIMIT 6`
    )
  ]);
  return {
    orderStats,
    revenueStats,
    pendingApprovals: (_a = pendingApprovals == null ? void 0 : pendingApprovals.count) != null ? _a : 0,
    purchaseStats,
    expenseStats,
    recentOrders,
    pendingOrdersList
  };
});

export { stats_get as default };
//# sourceMappingURL=stats.get.mjs.map
