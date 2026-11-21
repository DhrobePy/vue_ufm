import { scopedHealth } from '~/server/utils/crm'
import { reorderRadar } from '~/server/utils/crmIntel'

/** GET /api/crm/reorder — when each regular customer is due to order again and how likely they are to be slipping away. */
export default defineEventHandler(async (event) => {
  const rows = await reorderRadar(await scopedHealth(event))
  const by: Record<string, number> = {}; for (const r of rows) by[r.status] = (by[r.status] ?? 0) + 1
  return { rows, counts: by, at_risk_value: rows.filter(r => r.churn_pct >= 50).reduce((t, r) => t + r.value_at_risk, 0) }
})
