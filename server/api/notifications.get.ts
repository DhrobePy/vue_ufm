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
  const [pendingOrders, pendingExpenses, recentPayments] = await Promise.all([

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

    // Payments received in last 24 h
    safeQuery(() => query(
      `SELECT p.id, p.payment_date, p.amount, p.payment_method,
              c.name AS customer_name, p.created_at
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY p.created_at DESC
       LIMIT 4`,
    ), []),
  ])

  const notifications: any[] = []
  let nid = 1

  for (const o of pendingOrders as any[]) {
    const escalated = o.status === 'escalated'
    const amt = Number(o.total_amount).toLocaleString('en-BD')
    notifications.push({
      id:    nid++,
      text:  escalated
        ? `⚠️ Order ${o.order_number} escalated — ${o.customer_name} · ৳${amt}`
        : `📋 Order ${o.order_number} needs approval — ${o.customer_name} · ৳${amt}`,
      type:  escalated ? 'warning' : 'info',
      time:  timeAgo(new Date(o.created_at)),
      route: `/credit-sales/${o.id}`,   // go directly to the order, not generic approve list
      read:  false,
    })
  }

  for (const e of pendingExpenses as any[]) {
    const amt = Number(e.total_amount).toLocaleString('en-BD')
    notifications.push({
      id:    nid++,
      text:  `💸 Expense pending — ${e.description || 'Voucher'} · ৳${amt}`,
      type:  'info',
      time:  timeAgo(new Date(e.created_at)),
      route: '/expenses/approve',
      read:  false,
    })
  }

  for (const p of recentPayments as any[]) {
    const amt = Number(p.amount).toLocaleString('en-BD')
    notifications.push({
      id:    nid++,
      text:  `✅ Payment ৳${amt} received — ${p.customer_name} (${p.payment_method})`,
      type:  'success',
      time:  timeAgo(new Date(p.created_at)),
      route: '/credit-sales/payments',
      read:  true,
    })
  }

  return notifications
})
