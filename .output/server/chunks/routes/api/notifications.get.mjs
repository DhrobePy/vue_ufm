import { h as defineEventHandler, G as query } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1e3);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
async function safeQuery(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
const notifications_get = defineEventHandler(async () => {
  const [pendingOrders, pendingExpenses, recentPayments, pendingReturns, recentCompletions, recentReturnApprovals, recentDeletions, recentReversals, recentReturnDeletions] = await Promise.all([
    // Pending / escalated credit orders — needs admin/superadmin attention
    safeQuery(() => query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              c.name AS customer_name, o.created_at
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.status IN ('pending_approval','escalated')
       ORDER BY (o.status = 'escalated') DESC, o.created_at DESC
       LIMIT 8`
    ), []),
    // Pending expense vouchers
    safeQuery(() => query(
      `SELECT id, expense_date, total_amount, description, status, created_at
       FROM expense_vouchers
       WHERE status = 'pending'
       ORDER BY created_at DESC
       LIMIT 4`
    ), []),
    // Payments received in last 24 h
    safeQuery(() => query(
      `SELECT p.id, p.payment_date, p.amount, p.payment_method,
              c.name AS customer_name, p.created_at
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY p.created_at DESC
       LIMIT 4`
    ), []),
    // Pending returns — critical: need admin approval before balance is adjusted
    safeQuery(() => query(
      `SELECT r.id, r.return_number, r.order_id, r.total_returned_amount,
              r.return_reason, r.created_at,
              c.name AS customer_name, o.order_number
       FROM credit_order_returns r
       JOIN credit_orders o ON o.id = r.order_id
       JOIN customers c ON c.id = r.customer_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC
       LIMIT 6`
    ), []),
    // Orders fully paid in the last 24 h (balance_due = 0, delivered)
    // 'completed' is not in the ENUM — detect via balance_due = 0 + delivered status
    safeQuery(() => query(
      `SELECT o.id, o.order_number, o.total_amount, o.updated_at,
              c.name AS customer_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.status = 'delivered'
         AND o.balance_due = 0
         AND o.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY o.updated_at DESC
       LIMIT 4`
    ), []),
    // Returns approved in the last 24 h
    safeQuery(() => query(
      `SELECT r.id, r.return_number, r.order_id, r.total_returned_amount,
              r.approved_at, c.name AS customer_name, o.order_number
       FROM credit_order_returns r
       JOIN credit_orders o ON o.id = r.order_id
       JOIN customers c ON c.id = r.customer_id
       WHERE r.status = 'approved'
         AND r.approved_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY r.approved_at DESC
       LIMIT 4`
    ), []),
    // Orders deleted in the last 48 h — queried from the tombstone log
    // safeQuery handles missing table gracefully (returns [] until first delete happens)
    safeQuery(() => query(
      `SELECT id, order_number, customer_name, total_amount, balance_due,
              order_status, deleted_by_name, deleted_at
       FROM order_deletion_log
       WHERE deleted_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
       ORDER BY deleted_at DESC
       LIMIT 6`
    ), []),
    // Payment reversals in the last 24 h — from audit log
    safeQuery(() => query(
      `SELECT l.id, l.description, l.reference_number, l.record_id, l.created_at,
              u.display_name AS user_name
       FROM system_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.module = 'credit_sales'
         AND l.record_type = 'customer_payment'
         AND l.action = 'other'
         AND l.reference_number LIKE 'REV-%'
         AND l.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY l.created_at DESC
       LIMIT 6`
    ), []),
    // Return deletions in the last 48 h — from audit log
    safeQuery(() => query(
      `SELECT l.id, l.description, l.reference_number, l.record_id, l.severity, l.created_at,
              u.display_name AS user_name
       FROM system_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.module = 'credit_sales'
         AND l.record_type = 'credit_order_return'
         AND l.action = 'deleted'
         AND l.created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
       ORDER BY l.created_at DESC
       LIMIT 6`
    ), [])
  ]);
  const notifications = [];
  for (const o of pendingOrders) {
    const escalated = o.status === "escalated";
    const amt = Number(o.total_amount).toLocaleString();
    notifications.push({
      id: `co-${o.id}`,
      text: escalated ? `\u26A0\uFE0F Order ${o.order_number} escalated \u2014 ${o.customer_name} \xB7 \u09F3${amt}` : `\u{1F4CB} Order ${o.order_number} needs approval \u2014 ${o.customer_name} \xB7 \u09F3${amt}`,
      type: escalated ? "warning" : "info",
      time: timeAgo(new Date(o.created_at)),
      route: `/credit-sales/${o.id}`,
      read: false
      // frontend will override to true if this id is in the readSet
    });
  }
  for (const e of pendingExpenses) {
    const amt = Number(e.total_amount).toLocaleString();
    notifications.push({
      id: `exp-${e.id}`,
      text: `\u{1F4B8} Expense pending \u2014 ${e.description || "Voucher"} \xB7 \u09F3${amt}`,
      type: "info",
      time: timeAgo(new Date(e.created_at)),
      route: "/expenses/approve",
      read: false
    });
  }
  for (const p of recentPayments) {
    const amt = Number(p.amount).toLocaleString();
    notifications.push({
      id: `pay-${p.id}`,
      text: `\u2705 Payment \u09F3${amt} received \u2014 ${p.customer_name} (${p.payment_method})`,
      type: "success",
      time: timeAgo(new Date(p.created_at)),
      route: "/credit-sales/payments",
      read: false
      // frontend will mark read via readSet like everything else
    });
  }
  for (const r of pendingReturns) {
    const amt = Number(r.total_returned_amount).toLocaleString();
    notifications.push({
      id: `ret-${r.id}`,
      text: `\u21A9\uFE0F Return ${r.return_number} pending approval \u2014 ${r.customer_name} \xB7 \u09F3${amt} (Order ${r.order_number})`,
      type: "warning",
      time: timeAgo(new Date(r.created_at)),
      route: `/credit-sales/${r.order_id}`,
      read: false
    });
  }
  for (const o of recentCompletions) {
    const amt = Number(o.total_amount).toLocaleString();
    notifications.push({
      id: `cmp-${o.id}`,
      text: `\u2705 Order ${o.order_number} fully paid & completed \u2014 ${o.customer_name} \xB7 \u09F3${amt}`,
      type: "success",
      time: timeAgo(new Date(o.updated_at)),
      route: `/credit-sales/${o.id}`,
      read: false
    });
  }
  for (const r of recentReturnApprovals) {
    const amt = Number(r.total_returned_amount).toLocaleString();
    notifications.push({
      id: `rta-${r.id}`,
      text: `\u21A9\uFE0F Return ${r.return_number} approved \u2014 ${r.customer_name} \xB7 -\u09F3${amt} (Order ${r.order_number})`,
      type: "success",
      time: timeAgo(new Date(r.approved_at)),
      route: `/credit-sales/${r.order_id}`,
      read: false
    });
  }
  for (const d of recentDeletions) {
    const amt = Number(d.total_amount).toLocaleString();
    const byLine = d.deleted_by_name ? ` \xB7 by ${d.deleted_by_name}` : "";
    const wasComplete = d.order_status === "completed";
    notifications.push({
      id: `del-${d.order_number}`,
      text: `\u{1F5D1}\uFE0F Order ${d.order_number} deleted${byLine} \u2014 ${d.customer_name} \xB7 \u09F3${amt}${wasComplete ? " (was completed)" : ""}`,
      type: "error",
      time: timeAgo(new Date(d.deleted_at)),
      route: "/admin/audit",
      read: false
    });
  }
  for (const r of recentReversals) {
    const byLine = r.user_name ? ` by ${r.user_name}` : "";
    notifications.push({
      id: `rev-${r.id}`,
      text: `\u21A9\uFE0F Payment ${r.reference_number} reversed${byLine}`,
      type: "warning",
      time: timeAgo(new Date(r.created_at)),
      route: "/credit-sales/payments",
      read: false
    });
  }
  for (const r of recentReturnDeletions) {
    const byLine = r.user_name ? ` by ${r.user_name}` : "";
    const wasApproved = r.severity === "warning";
    notifications.push({
      id: `rdel-${r.id}`,
      text: wasApproved ? `\u{1F5D1}\uFE0F Return ${r.reference_number} deleted & reversed${byLine}` : `\u{1F5D1}\uFE0F Return ${r.reference_number} deleted${byLine}`,
      type: wasApproved ? "warning" : "info",
      time: timeAgo(new Date(r.created_at)),
      route: r.record_id ? `/credit-sales/${r.record_id}` : "/credit-sales/all",
      read: false
    });
  }
  return notifications;
});

export { notifications_get as default };
//# sourceMappingURL=notifications.get.mjs.map
