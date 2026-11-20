import { query } from '~/server/utils/db'

/**
 * GET /api/accounts/balance-sheet?as_of=YYYY-MM-DD&compare=YYYY-MM-DD
 * Assets, liabilities and equity from the general ledger as of a date (every entry dated on or before it), optionally beside a second date.
 * Profit & loss accumulated to the date is shown inside equity so the sheet balances.
 */
const CURRENT_ASSET = new Set(['Bank', 'Petty Cash', 'Cash', 'Accounts Receivable', 'Other Current Asset'])
const CURRENT_LIAB = new Set(['Accounts Payable'])
const iso = (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : null

async function balances(asOf: string) {
  const rows = await query<any>(
    `SELECT c.id, c.account_number AS code, c.name, c.account_type AS type, c.account_type_group AS grp,
            COALESCE(SUM(x.debit_amount), 0) AS dr, COALESCE(SUM(x.credit_amount), 0) AS cr
     FROM chart_of_accounts c
     LEFT JOIN (SELECT l.account_id, l.debit_amount, l.credit_amount FROM transaction_lines l
                JOIN journal_entries je ON je.id = l.journal_entry_id WHERE je.transaction_date <= ?) x ON x.account_id = c.id
     WHERE c.is_active = 1 GROUP BY c.id`, [asOf])
  return new Map<number, any>(rows.map(r => [r.id, { ...r, dr: Number(r.dr), cr: Number(r.cr) }]))
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
  const asOf = iso(q.as_of) ?? today, compare = iso(q.compare)
  const [a, b] = [await balances(asOf), compare ? await balances(compare) : null]

  const SECTIONS: { key: string; label: string; test: (r: any) => boolean; side: 'dr' | 'cr' }[] = [
    { key: 'ca', label: 'Current assets', test: r => r.grp === 'Asset' && CURRENT_ASSET.has(r.type), side: 'dr' },
    { key: 'fa', label: 'Fixed & other assets', test: r => r.grp === 'Asset' && !CURRENT_ASSET.has(r.type), side: 'dr' },
    { key: 'cl', label: 'Current liabilities', test: r => r.grp === 'Liability' && CURRENT_LIAB.has(r.type), side: 'cr' },
    { key: 'll', label: 'Long-term & other liabilities', test: r => r.grp === 'Liability' && !CURRENT_LIAB.has(r.type), side: 'cr' },
    { key: 'eq', label: 'Equity', test: r => r.grp === 'Equity', side: 'cr' },
  ]
  const amt = (m: Map<number, any> | null, id: number, side: 'dr' | 'cr') => { const r = m?.get(id); return r ? (side === 'dr' ? r.dr - r.cr : r.cr - r.dr) : 0 }
  const round = (n: number) => Math.round(n * 100) / 100

  const sections = SECTIONS.map(s => {
    const rows = [...a.values()].filter(s.test).map(r => ({ code: r.code ?? '', name: r.name, amount: round(amt(a, r.id, s.side)), compare: compare ? round(amt(b, r.id, s.side)) : null }))
      .filter(r => r.amount !== 0 || (r.compare ?? 0) !== 0).sort((x, y) => String(x.code).localeCompare(String(y.code)) || x.name.localeCompare(y.name))
    // profit & loss to date sits in equity
    if (s.key === 'eq') {
      const pl = (m: Map<number, any> | null) => m ? round([...m.values()].filter(r => r.grp === 'Revenue' || r.grp === 'Expense').reduce((t, r) => t + (r.cr - r.dr), 0)) : null
      const p1 = pl(a), p2 = pl(b)
      if (p1 !== 0 || (p2 ?? 0) !== 0) rows.push({ code: '', name: 'Profit & loss to date (current + prior periods)', amount: p1 as number, compare: p2 })
    }
    return { key: s.key, label: s.label, rows, total: round(rows.reduce((t, r) => t + r.amount, 0)), totalCompare: compare ? round(rows.reduce((t, r) => t + (r.compare ?? 0), 0)) : null }
  })
  const tot = (keys: string[], f: 'total' | 'totalCompare') => round(sections.filter(s => keys.includes(s.key)).reduce((t, s) => t + (s[f] ?? 0), 0))
  return {
    as_of: asOf, compare, sections,
    assets: { total: tot(['ca', 'fa'], 'total'), compare: compare ? tot(['ca', 'fa'], 'totalCompare') : null },
    liabilitiesEquity: { total: tot(['cl', 'll', 'eq'], 'total'), compare: compare ? tot(['cl', 'll', 'eq'], 'totalCompare') : null },
  }
})
