import { query } from '~/server/utils/db'

/**
 * GET /api/purchase/commodities
 * Full catalog for the PO-create picker: each commodity carries its origin
 * list and linked-supplier ids inline so the client can drive origin/supplier
 * dropdowns off one fetch. A commodity with zero supplier links means "no
 * scoping configured" — every active supplier is a valid choice for it.
 */
export default defineEventHandler(async () => {
  const commodities = await query<any>(
    `SELECT id, name, unit, inventory_account_id, status, sort_order
     FROM purchase_commodities
     WHERE status = 'active'
     ORDER BY sort_order ASC, name ASC`,
  )
  if (!commodities.length) return { commodities: [] }

  const ids = commodities.map((c: any) => c.id)
  const placeholders = ids.map(() => '?').join(',')

  const [origins, links] = await Promise.all([
    query<any>(
      `SELECT commodity_id, origin_name FROM purchase_commodity_origins
       WHERE commodity_id IN (${placeholders}) ORDER BY sort_order ASC, origin_name ASC`,
      ids,
    ),
    query<any>(
      `SELECT commodity_id, supplier_id FROM supplier_commodities
       WHERE commodity_id IN (${placeholders})`,
      ids,
    ),
  ])

  return {
    commodities: commodities.map((c: any) => ({
      ...c,
      origins:      origins.filter((o: any) => o.commodity_id === c.id).map((o: any) => o.origin_name),
      supplier_ids: links.filter((l: any) => l.commodity_id === c.id).map((l: any) => l.supplier_id),
    })),
  }
})
