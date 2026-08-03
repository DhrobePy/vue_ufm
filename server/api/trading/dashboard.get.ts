import { query, queryOne } from '~/server/utils/db'

/**
 * GET /api/trading/dashboard — period KPIs (revenue/COGS/margin/collected),
 * inventory snapshot + negative-stock flags, outstanding dues, settlements.
 * Defaults to the current month when no date range given.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const now = new Date()
  const from = String(q.date_from || `${now.toISOString().slice(0, 7)}-01`)
  const to   = String(q.date_to   || now.toISOString().slice(0, 10))

  // Optional cascading filters (customer / commodity / origin) — same
  // scoping as /api/trading/sales's Sale History list, applied here too so
  // the KPI tiles above it reflect the same filtered period. Built twice
  // with different column prefixes since the two queries alias the table
  // differently (unprefixed vs `s.`).
  const buildExtra = (prefix: string) => {
    const where: string[] = []
    const params: any[] = []
    if (q.customer_id)  { where.push(`${prefix}customer_id = ?`);  params.push(Number(q.customer_id)) }
    if (q.commodity_id) { where.push(`${prefix}commodity_id = ?`); params.push(Number(q.commodity_id)) }
    if (q.origin)       { where.push(`${prefix}origin = ?`);       params.push(String(q.origin)) }
    return { sql: where.length ? ` AND ${where.join(' AND ')}` : '', params }
  }
  const kpiExtra = buildExtra('')
  const collectedExtra = buildExtra('s.')

  const [kpis, collected, inventory, outstanding, settlements] = await Promise.all([
    queryOne<any>(
      `SELECT COUNT(*) AS sales_count,
              COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(cogs_amount), 0)  AS cogs
       FROM commodity_sales
       WHERE status = 'posted' AND sale_date BETWEEN ? AND ?${kpiExtra.sql}`,
      [from, to, ...kpiExtra.params]),
    queryOne<any>(
      `SELECT COALESCE(SUM(csp.amount), 0) AS collected
       FROM commodity_sale_payments csp
       JOIN commodity_sales s ON s.id = csp.sale_id
       WHERE csp.payment_date BETWEEN ? AND ?${collectedExtra.sql}`,
      [from, to, ...collectedExtra.params]),
    query<any>(
      `SELECT ci.*, pc.name AS commodity_name, pc.unit, b.name AS branch_name
       FROM commodity_inventory ci
       JOIN purchase_commodities pc ON pc.id = ci.commodity_id
       LEFT JOIN branches b ON b.id = ci.branch_id
       WHERE ci.qty_on_hand <> 0
       ORDER BY pc.name, b.name, ci.origin`),
    queryOne<any>(
      `SELECT COALESCE(SUM(balance_due), 0) AS due
       FROM commodity_sales WHERE status = 'posted' AND balance_due > 0`),
    query<any>(
      `SELECT s.*, bp.name AS partner_name FROM business_partner_settlements s
       JOIN business_partners bp ON bp.id = s.partner_id
       ORDER BY s.id DESC LIMIT 10`),
  ])

  const revenue = Number(kpis?.revenue ?? 0)
  const cogs    = Number(kpis?.cogs ?? 0)
  const inventoryValue = inventory.reduce(
    (s: number, r: any) => s + Math.max(0, Number(r.qty_on_hand)) * Number(r.weighted_avg_cost), 0)
  const negativeStock = inventory.filter((r: any) => Number(r.qty_on_hand) < 0)

  return {
    period: { from, to },
    kpis: {
      sales_count: Number(kpis?.sales_count ?? 0),
      revenue, cogs, margin: revenue - cogs,
      margin_pct: revenue > 0 ? Math.round(((revenue - cogs) / revenue) * 1000) / 10 : 0,
      collected: Number(collected?.collected ?? 0),
      outstanding: Number(outstanding?.due ?? 0),
      inventory_value: Math.round(inventoryValue * 100) / 100,
    },
    inventory,
    negative_stock: negativeStock,
    settlements,
  }
})
