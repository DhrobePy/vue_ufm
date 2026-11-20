import { query, getDb } from '~/server/utils/db'
import { getUserBranchIds } from '~/server/utils/creditOrders'

/**
 * GET /api/credit-sales/returns?status=&from=&to=&search=  — every goods return across orders (legacy "Goods Returns" board).
 * Approving / rejecting / deleting still go through the existing endpoints (a different authorised user must decide, ledger entries on approval).
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const where: string[] = ['1=1'], params: unknown[] = []
  const status = String(q.status ?? '')
  if (['pending', 'approved', 'rejected'].includes(status)) { where.push('r.status = ?'); params.push(status) }
  const ok = (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ''))
  if (ok(q.from)) { where.push('r.return_date >= ?'); params.push(q.from) }
  if (ok(q.to)) { where.push('r.return_date <= ?'); params.push(q.to) }
  const search = String(q.search ?? '').trim()
  if (search) { where.push('(r.return_number LIKE ? OR co.order_number LIKE ? OR c.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`) }

  const session = await getUserSession(event)
  if (session?.user) {                       // branch-coded roles see only their branch's orders
    const conn = await getDb().getConnection()
    try {
      const scope = await getUserBranchIds(conn, Number((session.user as any).id), ((session.user as any).role ?? '').toLowerCase())
      if (scope !== null) { where.push('co.assigned_branch_id IN (?)'); params.push(scope.length ? scope : [0]) }
    } finally { conn.release() }
  }

  const rows = await query<any>(
    `SELECT r.id, r.return_number, r.return_date, r.return_type, r.return_reason, r.return_category, r.status, r.notes,
            r.total_returned_qty AS qty, r.total_returned_amount AS amount, r.created_at, r.approved_at,
            co.id AS order_id, co.order_number, c.name AS customer, u.display_name AS created_by, a.display_name AS approved_by
     FROM credit_order_returns r
     JOIN credit_orders co ON co.id = r.order_id JOIN customers c ON c.id = r.customer_id
     LEFT JOIN users u ON u.id = r.created_by_user_id LEFT JOIN users a ON a.id = r.approved_by_user_id
     WHERE ${where.join(' AND ')} ORDER BY r.created_at DESC LIMIT 300`, params)
  const ids = rows.map(r => r.id)
  const items = ids.length ? await query<any>(
    `SELECT ri.return_id, p.base_name AS product, COALESCE(pv.weight_variant,'') AS variant, ri.returned_qty AS qty, ri.unit_price AS price, ri.returned_amount AS amount
     FROM credit_order_return_items ri LEFT JOIN products p ON p.id = ri.product_id LEFT JOIN product_variants pv ON pv.id = ri.variant_id WHERE ri.return_id IN (?)`, [ids]) : []
  const by = new Map<number, any[]>(); for (const i of items) (by.get(i.return_id) ?? by.set(i.return_id, []).get(i.return_id)!).push(i)
  const num = (v: any) => Number(v ?? 0)
  const list = rows.map(r => ({ ...r, qty: num(r.qty), amount: num(r.amount), items: (by.get(r.id) ?? []).map(i => ({ ...i, qty: num(i.qty), price: num(i.price), amount: num(i.amount) })) }))
  const sum = (st: string) => list.filter(r => r.status === st).reduce((t, r) => t + r.amount, 0)
  return { returns: list, summary: { pending: { n: list.filter(r => r.status === 'pending').length, v: sum('pending') }, approved: { n: list.filter(r => r.status === 'approved').length, v: sum('approved') }, rejected: { n: list.filter(r => r.status === 'rejected').length, v: sum('rejected') } } }
})
