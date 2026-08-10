import { getDb, query } from '~/server/utils/db'
import { getUserBranchScope } from '~/server/utils/creditOrders'
import { maybeTriggerProductionShortfallAlert } from '~/server/utils/productionRequirement'

/**
 * GET /api/production/requirement?date=YYYY-MM-DD&branch_id=N
 *
 * Today's Production Requirement — per-product aggregate of what's needed
 * (from orders due `date` that are approved/in_production), what's already
 * in hand + produced today (production_daily_stock), and what's still short.
 *
 * Branch scoping mirrors production-queue.get.ts: non-admin/accounts users
 * are locked to their own branch; admins/accounts get every branch and may
 * pass ?branch_id= to filter (omitted = all branches, read-only aggregate).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = Number((session.user as any).id)
  const role = ((session.user as any).role ?? '').toLowerCase()

  const q = getQuery(event)
  const date = (q.date as string) || new Date().toISOString().slice(0, 10)

  let scope: number | null = null
  const conn = await getDb().getConnection()
  try {
    scope = await getUserBranchScope(conn, userId, role)
  } finally {
    conn.release()
  }

  // Locked scope wins; otherwise admins may filter by ?branch_id=.
  const branchId = scope !== null ? scope : (q.branch_id ? Number(q.branch_id) : null)

  const branches = await query<any>(
    `SELECT id, name, code FROM branches WHERE branch_type = 'factory' AND status = 'active' ORDER BY name`,
  )

  const orderConds = [`o.required_date = ?`, `o.status IN ('approved','in_production')`]
  const orderParams: any[] = [date]
  if (branchId !== null) { orderConds.push('o.assigned_branch_id = ?'); orderParams.push(branchId) }

  const items = await query<any>(
    `SELECT oi.variant_id, o.assigned_branch_id AS branch_id,
            p.base_name, pv.weight_variant, pv.unit_of_measure,
            oi.quantity AS qty_bags
     FROM credit_order_items oi
     JOIN credit_orders o ON o.id = oi.order_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     LEFT JOIN products p ON p.id = pv.product_id
     WHERE ${orderConds.join(' AND ')} AND oi.variant_id IS NOT NULL AND o.assigned_branch_id IS NOT NULL`,
    orderParams,
  )

  const stockConds = [`production_date = ?`]
  const stockParams: any[] = [date]
  if (branchId !== null) { stockConds.push('branch_id = ?'); stockParams.push(branchId) }
  const stock = await query<any>(
    `SELECT branch_id, variant_id, in_hand_qty, produced_qty
     FROM production_daily_stock
     WHERE ${stockConds.join(' AND ')}`,
    stockParams,
  )
  const stockBySlot = new Map<string, any>()
  for (const s of stock) stockBySlot.set(`${s.branch_id}:${s.variant_id}`, s)

  function bagWeightKg(weightVariant: string, unit: string): number | null {
    if ((unit || '').toLowerCase() !== 'kg') return null
    const n = parseFloat(weightVariant)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const bySlot = new Map<string, any>()
  for (const it of items) {
    const key = `${it.branch_id}:${it.variant_id}`
    const entry = bySlot.get(key) ?? {
      branch_id: it.branch_id,
      variant_id: it.variant_id,
      product: `${it.base_name ?? '—'}${it.weight_variant ? ' ' + it.weight_variant : ''}`,
      bag_kg: bagWeightKg(it.weight_variant, it.unit_of_measure),
      required_bags: 0,
    }
    entry.required_bags += Number(it.qty_bags) || 0
    bySlot.set(key, entry)
  }

  const branchName = new Map(branches.map((b: any) => [b.id, b.name]))
  const rows = [...bySlot.values()].map((r: any) => {
    const s = stockBySlot.get(`${r.branch_id}:${r.variant_id}`)
    const inHand = Number(s?.in_hand_qty ?? 0)
    const produced = Number(s?.produced_qty ?? 0)
    const stillNeeded = Math.max(0, r.required_bags - (inHand + produced))
    const round1 = (n: number) => Math.round(n * 10) / 10
    return {
      branch_id: r.branch_id,
      branch_name: branchName.get(r.branch_id) ?? `#${r.branch_id}`,
      variant_id: r.variant_id,
      product: r.product,
      required_bags: round1(r.required_bags),
      in_hand_bags: round1(inHand),
      produced_bags: round1(produced),
      still_needed_bags: round1(stillNeeded),
      required_kg: r.bag_kg ? round1(r.required_bags * r.bag_kg) : null,
      still_needed_kg: r.bag_kg ? round1(stillNeeded * r.bag_kg) : null,
    }
  }).sort((a, b) => b.still_needed_bags - a.still_needed_bags)

  // Best-effort, rate-limited hourly shortfall alert — never blocks the response.
  maybeTriggerProductionShortfallAlert(date, rows)

  return {
    date,
    branch_id: branchId,
    locked_to_branch: scope !== null,
    branches: scope === null ? branches : [],
    rows,
  }
})
