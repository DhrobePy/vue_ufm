import { query, queryOne, getDb } from '~/server/utils/db'
import { RUNNING_BALANCE_SQL } from '~/server/utils/ledgerSql'
import { userCanAction } from '~/server/utils/permissions'
import { ACCOUNTS_ROLES, SALES_ROLES, getCustomerOutstanding, getUserBranchIds } from '~/server/utils/creditOrders'

/**
 * GET /api/customers/:id/profile — everything the customer profile page needs in one call:
 * credit position, sales stats, ageing, orders, ledger, payments, returns/amendments, products,
 * notes, a merged activity feed, and which actions the caller may take (buttons follow `can`).
 * Order-derived sections respect the caller's branch scope; the ledger is customer-level truth.
 */
const NOT_SALE = `('draft','cancelled','rejected')`
const DISPATCHED = `('goods_on_board','shipped','dispatched','delivered','completed')`

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })
  const session = await getUserSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number(session.user.id)
  const role = String(session.user.role ?? '').toLowerCase()
  const isAdmin = ['admin', 'superadmin'].includes(role)

  const customer = await queryOne<any>(`SELECT * FROM customers WHERE id = ?`, [id])
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })

  const conn = await getDb().getConnection()
  let exposure: any, branchIds: number[] | null
  try {
    exposure = await getCustomerOutstanding(conn, id)
    branchIds = await getUserBranchIds(conn, userId, role)
  } finally { conn.release() }
  const scopeSql = branchIds ? ' AND o.assigned_branch_id IN (?)' : ''
  const scopeP = branchIds ? [branchIds] : []

  const [reviewAgg, ledgerTot, stats, paidAgg, lastPay, ageing, monthly, orders, ledger, payments, returns, amendments, products, notes, wf] = await Promise.all([
    queryOne<any>(`SELECT COUNT(*) n, COALESCE(SUM(debit_amount - credit_amount), 0) net FROM customer_ledger WHERE customer_id = ? AND review_status = 'review'`, [id]),
    queryOne<any>(`SELECT COALESCE(SUM(debit_amount),0) d, COALESCE(SUM(credit_amount),0) c FROM customer_ledger WHERE customer_id = ?`, [id]),
    queryOne<any>(
      `SELECT COUNT(*) orders, COALESCE(SUM(o.total_amount),0) sales, COALESCE(AVG(o.total_amount),0) avg_order,
              MIN(o.order_date) first_order, MAX(o.order_date) last_order,
              SUM(o.status NOT IN ('delivered','completed','cancelled','rejected','draft')) open_orders
       FROM credit_orders o WHERE o.customer_id = ? AND o.status NOT IN ${NOT_SALE}${scopeSql}`, [id, ...scopeP]),
    queryOne<any>(`SELECT COALESCE(SUM(amount),0) paid, COUNT(*) n FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL`, [id]),
    queryOne<any>(`SELECT payment_date, amount, payment_method FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL ORDER BY payment_date DESC, id DESC LIMIT 1`, [id]),
    queryOne<any>(
      `SELECT COALESCE(SUM(CASE WHEN d <= 30 THEN b END),0) d0, COALESCE(SUM(CASE WHEN d BETWEEN 31 AND 60 THEN b END),0) d31,
              COALESCE(SUM(CASE WHEN d BETWEEN 61 AND 90 THEN b END),0) d61, COALESCE(SUM(CASE WHEN d > 90 THEN b END),0) d90
       FROM (SELECT o.balance_due b, DATEDIFF(CURDATE(), o.order_date) d FROM credit_orders o
             WHERE o.customer_id = ? AND o.balance_due > 0 AND o.status IN ${DISPATCHED}${scopeSql}) x`, [id, ...scopeP]),
    query<any>(
      `SELECT DATE_FORMAT(o.order_date,'%Y-%m') m, COALESCE(SUM(o.total_amount),0) total, COUNT(*) n
       FROM credit_orders o WHERE o.customer_id = ? AND o.status NOT IN ${NOT_SALE}${scopeSql}
         AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH) - INTERVAL (DAY(CURDATE()) - 1) DAY
       GROUP BY m ORDER BY m`, [id, ...scopeP]),
    query<any>(
      `SELECT o.id, o.order_number, o.order_date, o.required_date, o.status, o.total_amount, o.amount_paid, o.balance_due,
              o.delivery_type, b.name branch_name
       FROM credit_orders o LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.customer_id = ?${scopeSql} ORDER BY o.order_date DESC, o.id DESC LIMIT 300`, [id, ...scopeP]),
    query<any>(
      `SELECT * FROM (
         SELECT l.id, DATE_FORMAT(l.transaction_date, '%Y-%m-%d') date, l.transaction_type type, COALESCE(l.invoice_number, l.reference_id) ref, l.description,
                l.debit_amount debit, l.credit_amount credit, ${RUNNING_BALANCE_SQL} balance, l.reference_type, l.reference_id, l.review_status, l.review_reason, l.review_note,
                COALESCE(CASE WHEN l.reference_type IN ('credit_order','credit_orders') THEN l.reference_id END, ret.order_id, amd.order_id) linked_order_id
         FROM customer_ledger l
         LEFT JOIN credit_order_returns ret ON l.reference_type = 'credit_order_return' AND ret.id = l.reference_id
         LEFT JOIN order_amendments amd ON l.reference_type = 'order_amendment' AND amd.id = l.reference_id
         WHERE l.customer_id = ?
       ) t ORDER BY t.date DESC, t.id DESC LIMIT 300`, [id]),
    query<any>(
      `SELECT p.id, p.payment_number, p.receipt_number, p.payment_date, p.amount, p.payment_method, p.reference_number, p.notes,
              p.allocation_status, p.reversed_at, p.order_id, u.display_name collected_by
       FROM customer_payments p LEFT JOIN users u ON u.id = p.created_by_user_id
       WHERE p.customer_id = ? ORDER BY p.payment_date DESC, p.id DESC LIMIT 300`, [id]),
    query<any>(
      `SELECT r.id, r.return_number, r.order_id, o.order_number, r.return_date, r.total_returned_amount, r.status, r.return_reason
       FROM credit_order_returns r JOIN credit_orders o ON o.id = r.order_id
       WHERE r.customer_id = ?${scopeSql} ORDER BY r.id DESC LIMIT 100`, [id, ...scopeP]),
    query<any>(
      `SELECT a.id, a.amendment_number, a.order_id, o.order_number, a.regime, a.amend_type, a.flat_amount, a.status, a.description, a.created_at
       FROM order_amendments a JOIN credit_orders o ON o.id = a.order_id
       WHERE o.customer_id = ?${scopeSql} ORDER BY a.id DESC LIMIT 100`, [id, ...scopeP]),
    query<any>(
      `SELECT COALESCE(p.base_name, 'Item') product, pv.weight_variant, pv.grade, SUM(i.quantity) qty, SUM(i.line_total) amount,
              COUNT(DISTINCT o.id) orders, MAX(o.order_date) last_order
       FROM credit_order_items i JOIN credit_orders o ON o.id = i.order_id
       LEFT JOIN products p ON p.id = i.product_id LEFT JOIN product_variants pv ON pv.id = i.variant_id
       WHERE o.customer_id = ? AND o.status NOT IN ${NOT_SALE}${scopeSql}
       GROUP BY i.product_id, i.variant_id, p.base_name, pv.weight_variant, pv.grade
       ORDER BY amount DESC LIMIT 25`, [id, ...scopeP]),
    query<any>(
      `SELECT n.id, n.note, n.kind, n.created_at, n.created_by_user_id, u.display_name author
       FROM customer_notes n LEFT JOIN users u ON u.id = n.created_by_user_id
       WHERE n.customer_id = ? ORDER BY n.id DESC LIMIT 100`, [id]).catch(() => []),
    query<any>(
      `SELECT w.id, o.id order_id, o.order_number, w.to_status, w.action, w.comments, w.performed_at, u.display_name author
       FROM credit_order_workflow w JOIN credit_orders o ON o.id = w.order_id
       LEFT JOIN users u ON u.id = w.performed_by_user_id
       WHERE o.customer_id = ?${scopeSql} ORDER BY w.performed_at DESC, w.id DESC LIMIT 40`, [id, ...scopeP]),
  ])

  const limit = Number(customer.credit_limit ?? 0)
  const totalExposure = exposure.totalExposure
  const credit = {
    limit, outstanding: exposure.ledgerOutstanding, pending: exposure.pendingExposure, exposure: totalExposure,
    available: Math.max(0, limit - totalExposure),
    usagePct: limit > 0 ? Math.round((totalExposure / limit) * 100) : (totalExposure > 0 ? 999 : 0),
    storedBalance: Number(customer.current_balance ?? 0),
  }

  const activity = [
    ...wf.map((w: any) => ({ at: w.performed_at, kind: 'order', icon: '📋', title: `${w.order_number} → ${String(w.to_status).replace(/_/g, ' ')}`,
      detail: w.comments, by: w.author, order_id: w.order_id })),
    ...payments.slice(0, 15).map((p: any) => ({ at: p.created_at ?? p.payment_date, kind: 'payment', icon: p.reversed_at ? '↩️' : '💰',
      title: `${p.reversed_at ? 'Reversed ' : ''}payment ৳${Number(p.amount).toLocaleString()} (${p.payment_method ?? '—'})`, detail: p.notes, by: p.collected_by })),
    ...notes.map((n: any) => ({ at: n.created_at, kind: n.kind, icon: n.kind === 'status' ? '🚦' : '📝', title: n.kind === 'status' ? 'Status change' : 'Note', detail: n.note, by: n.author })),
  ].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 50)

  const can = {
    createOrder: await userCanAction({ userId, role, module: 'credit_sales', page: 'all', action: 'create', roleFallback: [...ACCOUNTS_ROLES, ...SALES_ROLES] }),
    collect: await userCanAction({ userId, role, module: 'credit_sales', page: 'all', action: 'collect_payment', roleFallback: [...ACCOUNTS_ROLES, 'collector'] }),
    edit: await userCanAction({ userId, role, module: 'customers', page: 'list', action: 'edit', roleFallback: ACCOUNTS_ROLES }),
    status: await userCanAction({ userId, role, module: 'customers', page: 'list', action: 'blacklist', roleFallback: ACCOUNTS_ROLES }),
    creditLimit: await userCanAction({ userId, role, module: 'credit_sales', page: 'credit-limits', action: 'update', roleFallback: ACCOUNTS_ROLES }),
    delete: isAdmin,
    notes: true,
    reviewLedger: await userCanAction({ userId, role, module: 'customers', page: 'list', action: 'review_ledger', roleFallback: [], explicit: true }),
  }

  return {
    customer, credit, can,
    stats: { ...stats, paid: Number(paidAgg?.paid ?? 0), payments: Number(paidAgg?.n ?? 0), lastPayment: lastPay ?? null },
    ledgerTotals: { debit: Number(ledgerTot?.d ?? 0), credit: Number(ledgerTot?.c ?? 0) },
    review: { flagged: Number(reviewAgg?.n ?? 0), net: Number(reviewAgg?.net ?? 0), balanceWithoutFlagged: credit.outstanding - Number(reviewAgg?.net ?? 0) },
    ageing, monthly, orders, ledger, payments, returns, amendments, products, notes, activity,
    branchLimited: !!branchIds,
  }
})
