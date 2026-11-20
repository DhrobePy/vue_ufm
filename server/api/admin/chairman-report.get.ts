import { buildChairmanReport, REPORT_TYPES } from '~/server/utils/chairmanReports'

/** GET /api/admin/chairman-report?type=&date_from=&date_to=&branch_id= — see server/utils/chairmanReports.ts */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
  const ok = (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ''))
  let from = ok(q.date_from) ? String(q.date_from) : today.slice(0, 8) + '01', to = ok(q.date_to) ? String(q.date_to) : today
  if (from > to) [from, to] = [to, from]
  const type = String(q.type ?? 'completed_sales')
  const built = await buildChairmanReport(type, { from, to, branch: Number(q.branch_id) || 0 })
  return { type, label: REPORT_TYPES[type], from, to, types: REPORT_TYPES, ...built }
})
