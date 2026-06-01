import { query } from '~/server/utils/db'

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// Each sub-query runs independently so one bad table never kills all notifications
async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() } catch { return fallback }
}

export default defineEventHandler(async () => {
  const [
    pendingOrders, pendingExpenses, recentPayments, pendingReturns,
    recentCompletions, recentReturnApprovals, recentDeletions, recentReversals,
    recentReturnDeletions, recentOrdersCreated,
    // ── Purchase module ────────────────────────────────────────────────────
    purchaseDraftGRNs, purchaseNewPOs, purchaseRecentPayments,
    purchasePendingAdj, purchaseCancellations,
  ] = await Promise.all([

    // Pending / escalated credit orders — needs admin/superadmin attention
    safeQuery(() => query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              c.name AS customer_name, o.created_at
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.status IN ('pending_approval','escalated')
       ORDER BY (o.status = 'escalated') DESC, o.created_at DESC
       LIMIT 8`,
    ), []),

    // Pending expense vouchers
    safeQuery(() => query(
      `SELECT id, expense_date, total_amount, description, status, created_at
       FROM expense_vouchers
       WHERE status = 'pending'
       ORDER BY created_at DESC
       LIMIT 4`,
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
       LIMIT 4`,
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
       LIMIT 6`,
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
       LIMIT 4`,
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
       LIMIT 4`,
    ), []),

    // Orders deleted in the last 48 h — queried from the tombstone log
    // safeQuery handles missing table gracefully (returns [] until first delete happens)
    safeQuery(() => query(
      `SELECT id, order_number, customer_name, total_amount, balance_due,
              order_status, deleted_by_name, deleted_at
       FROM order_deletion_log
       WHERE deleted_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
       ORDER BY deleted_at DESC
       LIMIT 6`,
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
       LIMIT 6`,
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
       LIMIT 6`,
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
       LIMIT 6`,
    ), []),

    // ── Purchase: Draft GRNs pending verification ───────────────────────────
    safeQuery(() => query(
      `SELECT g.id, g.grn_number, g.grn_date, g.supplier_name,
              g.quantity_received_kg, g.total_value, g.created_at
       FROM goods_received_adnan g
       WHERE g.grn_status = 'draft'
       ORDER BY g.created_at DESC
       LIMIT 6`,
    ), []),

    // ── Purchase: New POs created in last 4 h ─────────────────────────────
    safeQuery(() => query(
      `SELECT id, po_number, supplier_name, quantity_kg, total_order_value, created_at
       FROM purchase_orders_adnan
       WHERE po_status != 'cancelled'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
       ORDER BY created_at DESC
       LIMIT 6`,
    ), []),

    // ── Purchase: Payments recorded in last 24 h ───────────────────────────
    safeQuery(() => query(
      `SELECT id, payment_voucher_number, supplier_name, amount_paid,
              payment_method, payment_date, created_at
       FROM purchase_payments_adnan
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY created_at DESC
       LIMIT 6`,
    ), []),

    // ── Purchase: Adjustment notes pending approval or posting ─────────────
    safeQuery(() => query(
      `SELECT id, note_number, note_type, status, supplier_name, amount, po_number, created_at
       FROM purchase_adjustment_notes
       WHERE status IN ('draft', 'approved')
       ORDER BY created_at DESC
       LIMIT 6`,
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
       LIMIT 8`,
    ), []),
  ])

  // Use stable, content-based string IDs so the frontend can persist read state
  // across page loads and polling cycles via localStorage.
  // Format: <prefix>-<record-id>  e.g. "co-42", "exp-7", "del-CR-20250101-0001"
  const notifications: any[] = []

  for (const o of pendingOrders as any[]) {
    const escalated = o.status === 'escalated'
    const amt = Number(o.total_amount).toLocaleString()
    notifications.push({
      id:    `co-${o.id}`,
      text:  escalated
        ? `⚠️ Order ${o.order_number} escalated — ${o.customer_name} · ৳${amt}`
        : `📋 Order ${o.order_number} needs approval — ${o.customer_name} · ৳${amt}`,
      type:  escalated ? 'warning' : 'info',
      time:  timeAgo(new Date(o.created_at)),
      route: `/credit-sales/${o.id}`,
      read:  false,   // frontend will override to true if this id is in the readSet
    })
  }

  for (const e of pendingExpenses as any[]) {
    const amt = Number(e.total_amount).toLocaleString()
    notifications.push({
      id:    `exp-${e.id}`,
      text:  `💸 Expense pending — ${e.description || 'Voucher'} · ৳${amt}`,
      type:  'info',
      time:  timeAgo(new Date(e.created_at)),
      route: '/expenses/approve',
      read:  false,
    })
  }

  for (const p of recentPayments as any[]) {
    const amt = Number(p.amount).toLocaleString()
    notifications.push({
      id:    `pay-${p.id}`,
      text:  `✅ Payment ৳${amt} received — ${p.customer_name} (${p.payment_method})`,
      type:  'success',
      time:  timeAgo(new Date(p.created_at)),
      route: '/credit-sales/payments',
      read:  false,   // frontend will mark read via readSet like everything else
    })
  }

  for (const r of pendingReturns as any[]) {
    const amt = Number(r.total_returned_amount).toLocaleString()
    notifications.push({
      id:    `ret-${r.id}`,
      text:  `↩️ Return ${r.return_number} pending approval — ${r.customer_name} · ৳${amt} (Order ${r.order_number})`,
      type:  'warning',
      time:  timeAgo(new Date(r.created_at)),
      route: `/credit-sales/${r.order_id}`,
      read:  false,
    })
  }

  for (const o of recentCompletions as any[]) {
    const amt = Number(o.total_amount).toLocaleString()
    notifications.push({
      id:    `cmp-${o.id}`,
      text:  `✅ Order ${o.order_number} fully paid & completed — ${o.customer_name} · ৳${amt}`,
      type:  'success',
      time:  timeAgo(new Date(o.updated_at)),
      route: `/credit-sales/${o.id}`,
      read:  false,
    })
  }

  for (const r of recentReturnApprovals as any[]) {
    const amt = Number(r.total_returned_amount).toLocaleString()
    notifications.push({
      id:    `rta-${r.id}`,
      text:  `↩️ Return ${r.return_number} approved — ${r.customer_name} · -৳${amt} (Order ${r.order_number})`,
      type:  'success',
      time:  timeAgo(new Date(r.approved_at)),
      route: `/credit-sales/${r.order_id}`,
      read:  false,
    })
  }

  for (const d of recentDeletions as any[]) {
    const amt    = Number(d.total_amount).toLocaleString()
    const byLine = d.deleted_by_name ? ` · by ${d.deleted_by_name}` : ''
    const wasComplete = d.order_status === 'completed'
    notifications.push({
      id:    `del-${d.order_number}`,
      text:  `🗑️ Order ${d.order_number} deleted${byLine} — ${d.customer_name} · ৳${amt}${wasComplete ? ' (was completed)' : ''}`,
      type:  'error',
      time:  timeAgo(new Date(d.deleted_at)),
      route: '/admin/audit',
      read:  false,
    })
  }

  for (const r of recentReversals as any[]) {
    const byLine = r.user_name ? ` by ${r.user_name}` : ''
    notifications.push({
      id:    `rev-${r.id}`,
      text:  `↩️ Payment ${r.reference_number} reversed${byLine}`,
      type:  'warning',
      time:  timeAgo(new Date(r.created_at)),
      route: '/credit-sales/payments',
      read:  false,
    })
  }

  for (const o of recentOrdersCreated as any[]) {
    const total   = Number(o.total_amount).toLocaleString()
    const advance = Number(o.amount_paid ?? 0)
    const advStr  = advance > 0 ? ` · advance ৳${advance.toLocaleString()} paid` : ''
    notifications.push({
      id:    `nco-${o.id}`,
      text:  `🆕 Order ${o.order_number} created — ${o.customer_name} · ৳${total}${advStr}`,
      type:  'info',
      time:  timeAgo(new Date(o.created_at)),
      route: `/credit-sales/${o.id}`,
      read:  false,
    })
  }

  for (const r of recentReturnDeletions as any[]) {
    const byLine  = r.user_name ? ` by ${r.user_name}` : ''
    const wasApproved = r.severity === 'warning'   // approved returns log as 'warning'
    notifications.push({
      id:    `rdel-${r.id}`,
      text:  wasApproved
        ? `🗑️ Return ${r.reference_number} deleted & reversed${byLine}`
        : `🗑️ Return ${r.reference_number} deleted${byLine}`,
      type:  wasApproved ? 'warning' : 'info',
      time:  timeAgo(new Date(r.created_at)),
      route: r.record_id ? `/credit-sales/${r.record_id}` : '/credit-sales/all',
      read:  false,
    })
  }

  // ── Purchase notifications ────────────────────────────────────────────────

  for (const g of purchaseDraftGRNs as any[]) {
    const qty = Number(g.quantity_received_kg).toLocaleString()
    const val = Number(g.total_value).toLocaleString()
    notifications.push({
      id:    `pgrn-${g.id}`,
      text:  `📦 GRN ${g.grn_number} needs verification — ${g.supplier_name} · ${qty} KG · ৳${val}`,
      type:  'warning',
      time:  timeAgo(new Date(g.created_at)),
      route: `/purchase/grn/${g.id}`,
      read:  false,
    })
  }

  for (const po of purchaseNewPOs as any[]) {
    const qty = (Number(po.quantity_kg) / 1000).toFixed(2)
    const val = Number(po.total_order_value).toLocaleString()
    notifications.push({
      id:    `npo-${po.id}`,
      text:  `🆕 PO ${po.po_number} created — ${po.supplier_name} · ${qty} MT · ৳${val}`,
      type:  'info',
      time:  timeAgo(new Date(po.created_at)),
      route: `/purchase/orders/${po.id}`,
      read:  false,
    })
  }

  for (const p of purchaseRecentPayments as any[]) {
    const amt = Number(p.amount_paid).toLocaleString()
    notifications.push({
      id:    `ppay-${p.id}`,
      text:  `💳 Payment ${p.payment_voucher_number} — ৳${amt} to ${p.supplier_name} · ${p.payment_method}`,
      type:  'success',
      time:  timeAgo(new Date(p.created_at)),
      route: '/purchase/payments',
      read:  false,
    })
  }

  for (const a of purchasePendingAdj as any[]) {
    const amt      = Number(a.amount).toLocaleString()
    const typeLabel = a.note_type === 'debit' ? 'DAN' : 'CAN'
    const statusLabel = a.status === 'draft' ? 'needs approval' : 'needs posting'
    notifications.push({
      id:    `padj-${a.id}`,
      text:  `⚖ ${typeLabel} ${a.note_number} ${statusLabel} — ${a.supplier_name} · ৳${amt}`,
      type:  a.status === 'draft' ? 'warning' : 'info',
      time:  timeAgo(new Date(a.created_at)),
      route: `/purchase/adjustments/${a.id}`,
      read:  false,
    })
  }

  for (const c of purchaseCancellations as any[]) {
    const byLine  = c.user_name ? ` by ${c.user_name}` : ''
    const isGRN   = c.record_type === 'grn'
    const icon    = isGRN ? '📦' : '📋'
    notifications.push({
      id:    `pcan-${c.id}`,
      text:  `🗑️ ${icon} ${c.reference_number} cancelled${byLine}`,
      type:  'error',
      time:  timeAgo(new Date(c.created_at)),
      route: isGRN
        ? `/purchase/grn/${c.record_id}`
        : `/purchase/orders/${c.record_id}`,
      read:  false,
    })
  }

  return notifications
})
