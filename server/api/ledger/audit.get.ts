import { requireAction } from '~/server/utils/permissions'
import { runLedgerAudit, AUDIT_TITLES } from '~/server/utils/ledgerAudit'

/** GET /api/ledger/audit — document-level cross-checks (read-only). Same grant as Ledger Review. */
export default defineEventHandler(async (event) => {
  await requireAction(event, { module: 'customers', page: 'list', action: 'review_ledger', roleFallback: [], explicit: true },
    'Only admin, or a user granted "Review Ledger Lines", may open the cross-checks')
  const exceptions = await runLedgerAudit()
  const groups: Record<string, any> = {}
  for (const e of exceptions) {
    const g = (groups[e.code] ??= { code: e.code, title: AUDIT_TITLES[e.code] ?? e.code, severity: e.severity, n: 0, customers: new Set(), amount: 0 })
    g.n++; g.customers.add(e.customer_id); g.amount += Math.abs(Number(e.amount) || 0)
  }
  const order: Record<string, number> = { high: 0, medium: 1, review: 2, info: 3 }
  return {
    groups: Object.values(groups).map((g: any) => ({ ...g, customers: g.customers.size })).sort((a: any, b: any) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9) || b.n - a.n),
    exceptions: exceptions.map(e => ({ ...e, date: String(e.date ?? '').slice(0, 10) })),
  }
})
