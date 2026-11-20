import { getDb } from '~/server/utils/db'
import { getUserBranchIds } from '~/server/utils/creditOrders'

/**
 * Credit-order sales / dispatch / product-sales reports — same rules as the legacy cr/sales_report.php, cr/dispatch_report.php and
 * cr/product_sales_report.php (so the numbers agree after cutover):
 *   sales    a sale is recognised when goods SHIP (shipped_date, else order_date): status shipped / goods_on_board / delivered
 *   dispatch dated by the real shipping record; status filter (default all three) and shipped_date must exist; carries truck + driver
 *   product  "sold" = delivered orders only, dated by delivered_date, grouped by product + variant + unit price (a mid-period price
 *            change shows as separate rows)
 * One query fetches the item rows; every summary is folded from them so the tabs can never disagree with each other.
 */
export type OrderReportMode = 'sales' | 'dispatch' | 'product'
const STATUSES = ['shipped', 'goods_on_board', 'delivered']
const ROW_CAP = 20000

const iso = (s: unknown, fallback: string) => /^\d{4}-\d{2}-\d{2}$/.test(String(s ?? '')) ? String(s) : fallback
const num = (v: unknown) => Number(v ?? 0)

export async function buildOrderReport(event: any, mode: OrderReportMode) {
  const q = getQuery(event)
  const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)         // Dhaka date
  let from = iso(q.date_from, today.slice(0, 8) + '01'), to = iso(q.date_to, today)
  if (from > to) [from, to] = [to, from]
  const branchId = Number(q.branch_id) || 0
  const product = String(q.product ?? '').trim()
  const statuses = String(q.status ?? '').split(',').filter(s => STATUSES.includes(s))

  const session = await getUserSession(event)
  const conn = await getDb().getConnection()
  try {
    const where: string[] = []; const params: unknown[] = []
    let dateExpr: string, join: string
    if (mode === 'sales') {
      dateExpr = 'COALESCE(DATE(cos.shipped_date), DATE(co.order_date))'; join = 'LEFT JOIN credit_order_shipping cos ON cos.order_id = co.id'
      where.push(`co.status IN (${STATUSES.map(() => '?').join(',')})`); params.push(...STATUSES)
    } else if (mode === 'dispatch') {
      dateExpr = 'DATE(cos.shipped_date)'; join = 'JOIN credit_order_shipping cos ON cos.order_id = co.id'
      const st = statuses.length ? statuses : STATUSES
      where.push(`co.status IN (${st.map(() => '?').join(',')})`, 'cos.shipped_date IS NOT NULL'); params.push(...st)
    } else {
      dateExpr = 'DATE(cos.delivered_date)'; join = 'JOIN credit_order_shipping cos ON cos.order_id = co.id'
      where.push(`co.status = 'delivered'`, 'cos.delivered_date IS NOT NULL')
    }
    where.push(`${dateExpr} BETWEEN ? AND ?`); params.push(from, to)

    if (session?.user) {                                  // branch-coded roles only ever see their own branch(es)
      const scope = await getUserBranchIds(conn, Number((session.user as any).id), ((session.user as any).role ?? '').toLowerCase())
      if (scope !== null) { where.push('co.assigned_branch_id IN (?)'); params.push(scope.length ? scope : [0]) }
    }
    if (branchId) { where.push('co.assigned_branch_id = ?'); params.push(branchId) }
    if (product) { where.push('p.base_name LIKE ?'); params.push(`%${product}%`) }

    const [rows] = await conn.query<any[]>(`
      SELECT ${dateExpr} AS d, co.id AS order_id, co.order_number, c.id AS customer_id, c.name AS customer, COALESCE(b.name, '—') AS branch,
             p.id AS product_id, p.base_name AS product, COALESCE(pv.id, 0) AS variant_id, COALESCE(pv.weight_variant, '—') AS variant, COALESCE(pv.grade, '') AS grade,
             coi.quantity AS qty, coi.unit_price AS price, COALESCE(coi.discount_amount, 0) AS discount, coi.line_total AS total,
             cos.truck_number AS truck, cos.driver_name AS driver
      FROM credit_orders co
      JOIN customers c ON c.id = co.customer_id
      LEFT JOIN branches b ON b.id = co.assigned_branch_id
      JOIN credit_order_items coi ON coi.order_id = co.id
      JOIN products p ON p.id = coi.product_id
      LEFT JOIN product_variants pv ON pv.id = coi.variant_id
      ${join}
      WHERE ${where.join(' AND ')}
      ORDER BY d DESC, co.id, coi.id`, params)

    const all = rows.map(r => ({ ...r, d: String(r.d).slice(0, 10), qty: num(r.qty), price: num(r.price), discount: num(r.discount), total: num(r.total), gross: num(r.qty) * num(r.price) }))
    const fold = (keyOf: (r: any) => string, init: (r: any) => any) => {
      const m = new Map<string, any>()
      for (const r of all) {
        const k = keyOf(r); const g = m.get(k) ?? { ...init(r), qty: 0, gross: 0, discount: 0, net: 0, orders: new Set<number>() }
        g.qty += r.qty; g.gross += r.gross; g.discount += r.discount; g.net += r.total; g.orders.add(r.order_id); m.set(k, g)
      }
      return [...m.values()].map(g => ({ ...g, orders: g.orders.size }))
    }
    const products = fold(r => mode === 'product' ? `${r.product_id}|${r.variant_id}|${r.price}` : `${r.product_id}|${r.variant_id}`,
      r => ({ product: r.product, variant: r.variant, grade: r.grade, ...(mode === 'product' ? { price: r.price } : {}) })).sort((a, b) => b.qty - a.qty)
    const customers = fold(r => String(r.customer_id), r => ({ customer_id: r.customer_id, customer: r.customer })).sort((a, b) => b.net - a.net)
    const branches = fold(r => r.branch, r => ({ branch: r.branch })).sort((a, b) => b.net - a.net)
    const daily = fold(r => r.d, r => ({ date: r.d })).sort((a, b) => b.date.localeCompare(a.date))
    const orderIds = new Set(all.map(r => r.order_id))
    const sum = (k: string) => all.reduce((a, r) => a + r[k], 0)
    const summary = { orders: orderIds.size, customers: new Set(all.map(r => r.customer_id)).size, units: sum('qty'), gross: sum('gross'), discount: sum('discount'), net: sum('total') }

    return {
      mode, from, to, branch_id: branchId || null, summary, products, customers, branches, daily,
      rows: all.slice(0, ROW_CAP), truncated: all.length > ROW_CAP,
      branch_options: (await conn.query<any[]>(`SELECT id, name FROM branches WHERE status = 'active' ORDER BY name`))[0],
    }
  } finally { conn.release() }
}
