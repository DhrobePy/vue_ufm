import { query } from '~/server/utils/db'

/**
 * GET /api/trading/commodities — sellable commodities for the sale form:
 * origins, per-branch×origin stock (with weighted-avg cost as a reference
 * price hint), unit, inventory-account readiness.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const commodities = await query<any>(
    `SELECT id, name, unit, is_sellable, inventory_account_id
     FROM purchase_commodities
     WHERE status = 'active' AND is_sellable = 1
     ORDER BY sort_order, name`,
  )
  const ids = commodities.map((c: any) => c.id)
  if (!ids.length) return { commodities: [] }

  const ph = ids.map(() => '?').join(',')
  const [origins, stock] = await Promise.all([
    query<any>(
      `SELECT commodity_id, origin_name FROM purchase_commodity_origins
       WHERE commodity_id IN (${ph}) ORDER BY sort_order`, ids,
    ),
    query<any>(
      `SELECT commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost
       FROM commodity_inventory WHERE commodity_id IN (${ph})`, ids,
    ),
  ])

  for (const c of commodities as any[]) {
    c.origins = origins.filter((o: any) => o.commodity_id === c.id).map((o: any) => o.origin_name)
    c.stock   = stock
      .filter((s: any) => s.commodity_id === c.id)
      .map((s: any) => ({
        branch_id: s.branch_id, origin: s.origin,
        qty: Number(s.qty_on_hand), avg_cost: Number(s.weighted_avg_cost),
      }))
    c.ready = !!c.inventory_account_id
  }
  return { commodities }
})
