import { q as defineEventHandler, ao as query } from '../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
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
  var _a, _b, _c, _d;
  const [
    pendingOrders,
    pendingExpenses,
    recentPayments,
    pendingReturns,
    recentCompletions,
    recentReturnApprovals,
    recentDeletions,
    recentReversals,
    recentReturnDeletions,
    recentOrdersCreated,
    // ── Purchase module ────────────────────────────────────────────────────
    purchaseDraftGRNs,
    purchaseNewPOs,
    purchaseRecentPayments,
    purchasePendingAdj,
    purchaseCancellations,
    // ── Expense module ─────────────────────────────────────────────────────
    expenseApproved,
    expenseCancelled,
    // ── Admin module ───────────────────────────────────────────────────────
    adminNewUsers,
    adminUserActions,
    adminLoginFailures
  ] = await Promise.all([
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
      `SELECT e.id, e.voucher_number, e.expense_date, e.total_amount,
              e.remarks, e.status, e.created_at,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.status = 'pending'
       ORDER BY e.created_at DESC
       LIMIT 6`
    ), []),
    // Payments received in last 24 h — exclude advance payments (captured via order notification)
    safeQuery(() => query(
      `SELECT p.id, p.payment_date, p.amount, p.payment_method,
              c.name AS customer_name, p.created_at
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         AND COALESCE(p.payment_type, '') != 'advance'
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
    ), []),
    // Orders created in the last 4 h that are NOT pending/escalated
    // (pending/escalated already have their own co-{id} notification above)
    // This catches auto-approved admin orders — including any advance payment recorded
    safeQuery(() => query(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.amount_paid,
              c.name AS customer_name, o.created_at
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
         AND o.status NOT IN ('pending_approval','escalated','cancelled','rejected')
       ORDER BY o.created_at DESC
       LIMIT 6`
    ), []),
    // ── Purchase: Draft GRNs pending verification ───────────────────────────
    safeQuery(() => query(
      `SELECT g.id, g.grn_number, g.grn_date, g.supplier_name,
              g.quantity_received_kg, g.total_value, g.created_at
       FROM goods_received_adnan g
       WHERE g.grn_status = 'draft'
       ORDER BY g.created_at DESC
       LIMIT 6`
    ), []),
    // ── Purchase: New POs created in last 4 h ─────────────────────────────
    safeQuery(() => query(
      `SELECT id, po_number, supplier_name, quantity_kg, total_order_value, created_at
       FROM purchase_orders_adnan
       WHERE po_status != 'cancelled'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
       ORDER BY created_at DESC
       LIMIT 6`
    ), []),
    // ── Purchase: Payments recorded in last 24 h ───────────────────────────
    safeQuery(() => query(
      `SELECT id, payment_voucher_number, supplier_name, amount_paid,
              payment_method, payment_date, created_at
       FROM purchase_payments_adnan
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY created_at DESC
       LIMIT 6`
    ), []),
    // ── Purchase: Adjustment notes pending approval or posting ─────────────
    safeQuery(() => query(
      `SELECT id, note_number, note_type, status, supplier_name, amount, po_number, created_at
       FROM purchase_adjustment_notes
       WHERE status IN ('draft', 'approved')
       ORDER BY created_at DESC
       LIMIT 6`
    ), []),
    // ── Purchase: Cancellations (PO or GRN) in last 48 h from audit log ───
    safeQuery(() => query(
      `SELECT l.id, l.description, l.reference_number, l.record_type,
              l.record_id, l.severity, l.created_at,
              u.display_name AS user_name
       FROM system_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.module = 'purchase'
         AND l.action = 'cancelled'
         AND l.created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
       ORDER BY l.created_at DESC
       LIMIT 8`
    ), []),
    // ── Expenses: Recently approved in last 24 h ──────────────────────────
    safeQuery(() => query(
      `SELECT e.id, e.voucher_number, e.total_amount, e.approved_at,
              cat.category_name, ap.display_name AS approved_by_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       LEFT JOIN users ap ON ap.id = e.approved_by_user_id
       WHERE e.status = 'approved'
         AND e.approved_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY e.approved_at DESC
       LIMIT 6`
    ), []),
    // ── Expenses: Recently cancelled or rejected in last 24 h ─────────────
    safeQuery(() => query(
      `SELECT e.id, e.voucher_number, e.total_amount, e.status,
              e.rejection_reason, e.updated_at,
              cat.category_name
       FROM expense_vouchers e
       LEFT JOIN expense_categories cat ON cat.id = e.category_id
       WHERE e.status IN ('cancelled', 'rejected')
         AND e.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY e.updated_at DESC
       LIMIT 6`
    ), []),
    // ── Admin: New users created in last 4 h ──────────────────────────────
    safeQuery(() => query(
      `SELECT id, display_name, email, role, status, created_at
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
         AND status != 'deleted'
       ORDER BY created_at DESC
       LIMIT 6`
    ), []),
    // ── Admin: User suspensions / deletions / role changes in last 24 h ───
    safeQuery(() => query(
      `SELECT l.id, l.action, l.description, l.reference_number,
              l.record_id, l.severity, l.created_at,
              u.display_name AS actor_name
       FROM system_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.module = 'admin'
         AND l.record_type = 'user'
         AND l.action IN ('status_changed', 'deleted', 'updated')
         AND l.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY l.created_at DESC
       LIMIT 8`
    ), []),
    // ── Admin: Login failures in last 1 h ─────────────────────────────────
    safeQuery(() => query(
      `SELECT l.id, l.description, l.reference_number, l.created_at
       FROM system_audit_log l
       WHERE l.action = 'login_failed'
         AND l.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY l.created_at DESC
       LIMIT 8`
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
    const label = e.category_name || ((_a = e.remarks) == null ? void 0 : _a.slice(0, 30)) || "Voucher";
    notifications.push({
      id: `exp-${e.id}`,
      text: `\u{1F4B8} ${e.voucher_number} pending approval \u2014 ${label} \xB7 \u09F3${amt}`,
      type: "warning",
      time: timeAgo(new Date(e.created_at)),
      route: `/expenses/${e.id}`,
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
  for (const o of recentOrdersCreated) {
    const total = Number(o.total_amount).toLocaleString();
    const advance = Number((_b = o.amount_paid) != null ? _b : 0);
    const advStr = advance > 0 ? ` \xB7 advance \u09F3${advance.toLocaleString()} paid` : "";
    notifications.push({
      id: `nco-${o.id}`,
      text: `\u{1F195} Order ${o.order_number} created \u2014 ${o.customer_name} \xB7 \u09F3${total}${advStr}`,
      type: "info",
      time: timeAgo(new Date(o.created_at)),
      route: `/credit-sales/${o.id}`,
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
  for (const g of purchaseDraftGRNs) {
    const qty = Number(g.quantity_received_kg).toLocaleString();
    const val = Number(g.total_value).toLocaleString();
    notifications.push({
      id: `pgrn-${g.id}`,
      text: `\u{1F4E6} GRN ${g.grn_number} needs verification \u2014 ${g.supplier_name} \xB7 ${qty} KG \xB7 \u09F3${val}`,
      type: "warning",
      time: timeAgo(new Date(g.created_at)),
      route: `/purchase/grn/${g.id}`,
      read: false
    });
  }
  for (const po of purchaseNewPOs) {
    const qty = (Number(po.quantity_kg) / 1e3).toFixed(2);
    const val = Number(po.total_order_value).toLocaleString();
    notifications.push({
      id: `npo-${po.id}`,
      text: `\u{1F195} PO ${po.po_number} created \u2014 ${po.supplier_name} \xB7 ${qty} MT \xB7 \u09F3${val}`,
      type: "info",
      time: timeAgo(new Date(po.created_at)),
      route: `/purchase/orders/${po.id}`,
      read: false
    });
  }
  for (const p of purchaseRecentPayments) {
    const amt = Number(p.amount_paid).toLocaleString();
    notifications.push({
      id: `ppay-${p.id}`,
      text: `\u{1F4B3} Payment ${p.payment_voucher_number} \u2014 \u09F3${amt} to ${p.supplier_name} \xB7 ${p.payment_method}`,
      type: "success",
      time: timeAgo(new Date(p.created_at)),
      route: "/purchase/payments",
      read: false
    });
  }
  for (const a of purchasePendingAdj) {
    const amt = Number(a.amount).toLocaleString();
    const typeLabel = a.note_type === "debit" ? "DAN" : "CAN";
    const statusLabel = a.status === "draft" ? "needs approval" : "needs posting";
    notifications.push({
      id: `padj-${a.id}`,
      text: `\u2696 ${typeLabel} ${a.note_number} ${statusLabel} \u2014 ${a.supplier_name} \xB7 \u09F3${amt}`,
      type: a.status === "draft" ? "warning" : "info",
      time: timeAgo(new Date(a.created_at)),
      route: `/purchase/adjustments/${a.id}`,
      read: false
    });
  }
  for (const c of purchaseCancellations) {
    const byLine = c.user_name ? ` by ${c.user_name}` : "";
    const isGRN = c.record_type === "grn";
    const icon = isGRN ? "\u{1F4E6}" : "\u{1F4CB}";
    notifications.push({
      id: `pcan-${c.id}`,
      text: `\u{1F5D1}\uFE0F ${icon} ${c.reference_number} cancelled${byLine}`,
      type: "error",
      time: timeAgo(new Date(c.created_at)),
      route: isGRN ? c.record_id ? `/purchase/grn/${c.record_id}` : "/purchase/grn" : c.record_id ? `/purchase/orders/${c.record_id}` : "/purchase/orders",
      read: false
    });
  }
  for (const e of expenseApproved) {
    const amt = Number(e.total_amount).toLocaleString();
    const by = e.approved_by_name ? ` by ${e.approved_by_name}` : "";
    notifications.push({
      id: `expapv-${e.id}`,
      text: `\u2705 ${e.voucher_number} approved${by} \u2014 ${e.category_name || ""} \xB7 \u09F3${amt}`,
      type: "success",
      time: timeAgo(new Date(e.approved_at)),
      route: `/expenses/${e.id}`,
      read: false
    });
  }
  for (const e of expenseCancelled) {
    const amt = Number(e.total_amount).toLocaleString();
    const isRej = e.status === "rejected";
    const icon = isRej ? "\u2717" : "\u21A9\uFE0F";
    const label = isRej ? "rejected" : "cancelled";
    notifications.push({
      id: `expcan-${e.id}`,
      text: `${icon} ${e.voucher_number} ${label} \u2014 ${e.category_name || ""} \xB7 \u09F3${amt}`,
      type: isRej ? "error" : "warning",
      time: timeAgo(new Date(e.updated_at)),
      route: `/expenses/${e.id}`,
      read: false
    });
  }
  for (const u of adminNewUsers) {
    notifications.push({
      id: `nuser-${u.id}`,
      text: `\u{1F464} New user "${u.display_name}" created \u2014 [${u.role}] \xB7 ${u.email}`,
      type: "info",
      time: timeAgo(new Date(u.created_at)),
      route: `/admin/users/${u.id}/edit`,
      read: false
    });
  }
  for (const l of adminUserActions) {
    const isSuspend = l.action === "status_changed" && ((_c = l.description) == null ? void 0 : _c.includes("suspended"));
    const isDelete = l.action === "deleted";
    const isRole = (_d = l.description) == null ? void 0 : _d.includes("role:");
    const icon = isDelete ? "\u{1F5D1}\uFE0F" : isSuspend ? "\u{1F512}" : isRole ? "\u{1F511}" : "\u270F\uFE0F";
    const label = isDelete ? "deleted" : isSuspend ? "suspended" : isRole ? "role changed" : "updated";
    notifications.push({
      id: `uact-${l.id}`,
      text: `${icon} User ${l.reference_number} ${label}`,
      type: isDelete ? "error" : isSuspend ? "warning" : "info",
      time: timeAgo(new Date(l.created_at)),
      route: isDelete || !l.record_id ? "/admin/users" : `/admin/users/${l.record_id}/edit`,
      read: false
    });
  }
  for (const l of adminLoginFailures) {
    notifications.push({
      id: `lfail-${l.id}`,
      text: `\u{1F6A8} Login failure: ${l.description || l.reference_number || "unknown"}`,
      type: "error",
      time: timeAgo(new Date(l.created_at)),
      route: "/admin/audit",
      read: false
    });
  }
  return notifications;
});

export { notifications_get as default };
//# sourceMappingURL=notifications.get.mjs.map
