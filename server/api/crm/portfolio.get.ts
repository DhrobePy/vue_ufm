import { scopedHealth, portfolioSummary } from '~/server/utils/crm'

/** GET /api/crm/portfolio?label=&segment=&district=&search= — the customer portfolio assessment: summary + every customer with health label, reasons and next steps. */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const rows = await scopedHealth(event)
  const s = String(q.search ?? '').toLowerCase().trim()
  const list = rows.filter(r => (!q.label || r.label === q.label) && (!q.segment || r.segment === q.segment) && (!q.district || r.district === q.district)
    && (!s || `${r.name} ${r.business_name ?? ''} ${r.phone ?? ''} ${r.address ?? ''}`.toLowerCase().includes(s)))
    .sort((a, b) => b.priority - a.priority || b.value_12m - a.value_12m)
  return { summary: await portfolioSummary(rows), customers: list.slice(0, 500) }
})
