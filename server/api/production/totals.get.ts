import { query } from '~/server/utils/db'

/**
 * GET /api/production/totals?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Production Totals report — actual output grouped by date and by product.
 *
 * production_schedule tracks bags_completed/target_bags at the ORDER-BATCH
 * level (one row per order), not per line item — there's no per-product
 * "actually produced" counter anywhere in the schema. To get an honest
 * by-product breakdown without inventing new tracking, each batch's
 * completion ratio (bags_completed / target_bags, capped at 1) is applied
 * proportionally across that order's credit_order_items — a batch that's
 * 60% complete contributes 60% of each of its line items' bag quantity to
 * the product totals. Single-product orders (the common case) get an exact
 * figure; multi-product orders get a reasonable proportional estimate.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const from = (q.from as string) || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to   = (q.to as string) || new Date().toISOString().slice(0, 10)

  const batches = await query<any>(
    `SELECT ps.id, ps.order_id, ps.scheduled_date, ps.production_completed_at,
            ps.bags_completed, ps.target_bags, ps.status
     FROM production_schedule ps
     WHERE COALESCE(DATE(ps.production_completed_at), ps.scheduled_date) BETWEEN ? AND ?
       AND ps.bags_completed > 0
     ORDER BY COALESCE(DATE(ps.production_completed_at), ps.scheduled_date)`,
    [from, to],
  )

  if (!batches.length) return { by_date: [], by_product: [], from, to }

  const orderIds = [...new Set(batches.map(b => b.order_id))]
  const items = orderIds.length
    ? await query<any>(
        `SELECT oi.order_id, oi.quantity AS qty_bags,
                p.base_name, pv.weight_variant, pv.unit_of_measure
         FROM credit_order_items oi
         JOIN product_variants pv ON pv.id = oi.variant_id
         JOIN products p ON p.id = pv.product_id
         WHERE oi.order_id IN (?)`,
        [orderIds],
      )
    : []

  const itemsByOrder = new Map<number, any[]>()
  for (const it of items) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, [])
    itemsByOrder.get(it.order_id)!.push(it)
  }

  function bagWeightKg(weightVariant: string, unit: string): number | null {
    if ((unit || '').toLowerCase() !== 'kg') return null
    const n = parseFloat(weightVariant)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const byDate = new Map<string, { bags: number; kg: number }>()
  const byProduct = new Map<string, { bags: number; kg: number }>()

  for (const b of batches) {
    const date = String(b.production_completed_at ? String(b.production_completed_at).slice(0, 10) : b.scheduled_date).slice(0, 10)
    const target = Number(b.target_bags) || 0
    const completed = Number(b.bags_completed) || 0
    const ratio = target > 0 ? Math.min(1, completed / target) : 1

    const orderItems = itemsByOrder.get(b.order_id) ?? []
    if (!orderItems.length) continue

    for (const it of orderItems) {
      const bagKg = bagWeightKg(it.weight_variant, it.unit_of_measure)
      const bags = Number(it.qty_bags) * ratio
      const kg = bagKg ? bags * bagKg : 0

      const dEntry = byDate.get(date) ?? { bags: 0, kg: 0 }
      dEntry.bags += bags; dEntry.kg += kg
      byDate.set(date, dEntry)

      const productLabel = `${it.base_name}${it.weight_variant ? ' ' + it.weight_variant : ''}`
      const pEntry = byProduct.get(productLabel) ?? { bags: 0, kg: 0 }
      pEntry.bags += bags; pEntry.kg += kg
      byProduct.set(productLabel, pEntry)
    }
  }

  const round1 = (n: number) => Math.round(n * 10) / 10

  return {
    from, to,
    by_date: [...byDate.entries()]
      .map(([date, v]) => ({ date, bags: round1(v.bags), kg: round1(v.kg) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    by_product: [...byProduct.entries()]
      .map(([product, v]) => ({ product, bags: round1(v.bags), kg: round1(v.kg) }))
      .sort((a, b) => b.bags - a.bags),
  }
})
