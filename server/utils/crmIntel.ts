import { query } from '~/server/utils/db'
import { customerHealth, assessProspect, dhakaToday, type CustomerHealth } from '~/server/utils/crm'

/**
 * CRM intelligence — everything here is plain arithmetic over the order history, so every number can be traced.
 *   reorderRadar   when each regular customer is due to order again, and how likely they are to be slipping away
 *   crossSell      products that customers like this one buy, which they do not
 *   forecast       next 3 months of sales (with a back-tested error band) and the orders expected in the next 30 days
 *   nextActions    one ranked to-do list across all of the above plus collections and prospects
 */
const num = (v: any) => Number(v ?? 0)
const median = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b.slice(0, 10)) - Date.parse(a.slice(0, 10))) / 864e5)
const addDays = (d: string, n: number) => new Date(Date.parse(d.slice(0, 10)) + n * 864e5).toISOString().slice(0, 10)
const SHIPPED = `('shipped','delivered','goods_on_board')`

// ── order history, shared by the radar and the forecast (one query, cached 5 min) ──
let histCache: { at: number; byCustomer: Map<number, { d: string; v: number }[]>; monthly: Map<string, number> } | null = null
async function history() {
  if (histCache && Date.now() - histCache.at < 300_000) return histCache
  const rows = await query<any>(
    `SELECT customer_id, DATE_FORMAT(order_date, '%Y-%m-%d') d, SUM(total_amount) v FROM credit_orders
     WHERE status IN ${SHIPPED} AND order_date >= DATE_SUB(CURDATE(), INTERVAL 38 MONTH) GROUP BY customer_id, order_date ORDER BY customer_id, order_date`)
  const byCustomer = new Map<number, { d: string; v: number }[]>(), monthly = new Map<string, number>()
  for (const r of rows) {
    ;(byCustomer.get(r.customer_id) ?? byCustomer.set(r.customer_id, []).get(r.customer_id)!).push({ d: r.d, v: num(r.v) })
    monthly.set(r.d.slice(0, 7), (monthly.get(r.d.slice(0, 7)) ?? 0) + num(r.v))
  }
  histCache = { at: Date.now(), byCustomer, monthly }
  return histCache
}
export const clearIntelCache = () => { histCache = null }

// ── reorder radar ──
export type ReorderStatus = 'on_track' | 'due_soon' | 'due' | 'late' | 'lapsing'
export interface ReorderRow {
  id: number; name: string; segment: string; district: string; branch: string | null; phone: string | null; label: string
  last_order: string; days_since: number; usual_gap: number; regular: boolean; expected_date: string; days_to_expected: number
  status: ReorderStatus; avg_order: number; value_12m: number; churn_pct: number; value_at_risk: number; reason: string
}
/** Customers with at least 4 order dates. Usual gap = median days between recent orders; churn % = how far past the usual gap they are, measured in units of their own variability. */
export async function reorderRadar(rows?: CustomerHealth[]): Promise<ReorderRow[]> {
  const all = rows ?? await customerHealth(), h = await history(), today = dhakaToday(), out: ReorderRow[] = []
  for (const r of all) {
    const hist = h.byCustomer.get(r.id)
    if (!hist || hist.length < 4) continue
    const dates = hist.map(x => x.d).slice(-10), gaps: number[] = []
    for (let i = 1; i < dates.length; i++) gaps.push(Math.max(1, dayDiff(dates[i - 1], dates[i])))
    const gap = Math.max(7, median(gaps)), mad = median(gaps.map(g => Math.abs(g - gap)))
    const last = dates[dates.length - 1], dsl = dayDiff(last, today)
    if (dsl > 365) continue
    const ratio = dsl / gap, z = (dsl - gap) / Math.max(gap * 0.35, 1.4826 * mad)
    const churn = 1 / (1 + Math.exp(-(Math.min(z, 12) - 2.5)))
    const status: ReorderStatus = ratio < 0.8 ? 'on_track' : ratio < 1 ? 'due_soon' : ratio < 1.5 ? 'due' : ratio < 2.5 ? 'late' : 'lapsing'
    const avg = hist.slice(-6).reduce((t, x) => t + x.v, 0) / Math.min(6, hist.length)
    const expected = addDays(last, Math.round(gap))
    out.push({
      id: r.id, name: r.name, segment: r.segment, district: r.district, branch: r.branch, phone: r.phone, label: r.label,
      last_order: last, days_since: dsl, usual_gap: Math.round(gap), regular: mad <= gap * 0.4, expected_date: expected, days_to_expected: dayDiff(today, expected),
      status, avg_order: Math.round(avg), value_12m: Math.round(r.value_12m), churn_pct: Math.round(churn * 100), value_at_risk: Math.round(r.value_12m * churn),
      reason: status === 'on_track' ? `Usually orders every ~${Math.round(gap)} days; ${dsl} since the last` : `Usually orders every ~${Math.round(gap)} days; ${dsl} days of silence (${ratio.toFixed(1)}× the usual gap)`,
    })
  }
  return out.sort((a, b) => b.value_at_risk - a.value_at_risk || a.days_to_expected - b.days_to_expected)
}

// ── cross-sell ──
export interface CrossSellRow { customer_id: number; name: string; segment: string; district: string; product: string; peers_buying_pct: number; peers: number; est_monthly: number }
export interface ProductGap { product: string; segment: string; customers_missing: number; peers_buying_pct: number; est_monthly_total: number }
/** For each business type: products that ≥25 % of its buyers purchase. A customer who buys none of one gets it suggested, sized from what those peers spend (scaled to the customer's own size). */
export async function crossSell(rows?: CustomerHealth[]): Promise<{ suggestions: CrossSellRow[]; gaps: ProductGap[] }> {
  const all = (rows ?? await customerHealth()).filter(r => r.value_12m > 0)
  const spend = await query<any>(
    `SELECT co.customer_id, p.base_name product, SUM(coi.line_total) v FROM credit_order_items coi JOIN credit_orders co ON co.id = coi.order_id JOIN products p ON p.id = coi.product_id
     WHERE co.status IN ${SHIPPED} AND co.order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY) GROUP BY co.customer_id, p.base_name`)
  const bought = new Map<number, Map<string, number>>()
  for (const s of spend) (bought.get(s.customer_id) ?? bought.set(s.customer_id, new Map()).get(s.customer_id)!).set(s.product, num(s.v))
  const bySeg = new Map<string, CustomerHealth[]>()
  for (const r of all) (bySeg.get(r.segment) ?? bySeg.set(r.segment, []).get(r.segment)!).push(r)
  const suggestions: CrossSellRow[] = [], gapMap = new Map<string, ProductGap>()
  for (const [seg, peers] of bySeg) {
    if (peers.length < 6 || seg === 'Unclassified') continue
    const medValue = median(peers.map(p => p.value_12m)) || 1, buyers = new Map<string, number[]>()
    for (const p of peers) for (const [prod, v] of bought.get(p.id) ?? []) (buyers.get(prod) ?? buyers.set(prod, []).get(prod)!).push(v / 12)
    for (const [prod, monthly] of buyers) {
      const support = monthly.length / peers.length
      if (support < 0.25 || monthly.length < 3) continue
      const typical = median(monthly)
      for (const c of peers) {
        if (bought.get(c.id)?.has(prod)) continue
        const est = Math.round(typical * Math.min(1.5, Math.max(0.3, c.value_12m / medValue)))
        suggestions.push({ customer_id: c.id, name: c.name, segment: seg, district: c.district, product: prod, peers_buying_pct: Math.round(support * 100), peers: monthly.length, est_monthly: est })
        const g = gapMap.get(`${seg}|${prod}`) ?? gapMap.set(`${seg}|${prod}`, { product: prod, segment: seg, customers_missing: 0, peers_buying_pct: Math.round(support * 100), est_monthly_total: 0 }).get(`${seg}|${prod}`)!
        g.customers_missing++; g.est_monthly_total += est
      }
    }
  }
  suggestions.sort((a, b) => b.est_monthly * b.peers_buying_pct - a.est_monthly * a.peers_buying_pct)
  return { suggestions, gaps: [...gapMap.values()].sort((a, b) => b.est_monthly_total - a.est_monthly_total).slice(0, 12) }
}

// ── forecast ──
const monthKey = (d: string) => d.slice(0, 7)
const shiftMonth = (k: string, n: number) => { const [y, m] = k.split('-').map(Number), t = y * 12 + (m - 1) + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}` }
export async function forecast(rows?: CustomerHealth[]) {
  const all = rows ?? await customerHealth(), h = await history(), today = dhakaToday(), cur = monthKey(today)
  const val = (k: string) => h.monthly.get(k) ?? 0
  // the first month on record is usually a part month, and months before the data starts are "unknown", not "zero"
  const firstKey = [...h.monthly.keys()].sort()[0] ?? cur, startFull = shiftMonth(firstKey, 1)
  const avg = (end: string, n: number) => { let t = 0, c = 0; for (let i = 0; i < n; i++) { const k = shiftMonth(end, -i); if (k < startFull) break; t += val(k); c++ } return c ? t / c : 0 }
  const base = (prev: string) => 0.5 * avg(prev, 3) + 0.5 * avg(prev, 12)        // prev = last full month before the one forecast
  const season = (target: string) => { const ly = shiftMonth(target, -12), yearAvg = avg(shiftMonth(ly, 5), 12); return yearAvg > 0 && val(ly) > 0 ? Math.min(1.4, Math.max(0.7, 1 + 0.5 * (val(ly) / yearAvg - 1))) : 1 }
  const hasTwoYears = val(shiftMonth(cur, -24)) > 0 || val(shiftMonth(cur, -23)) > 0
  const predict = (target: string, useSeason: boolean, anchor = shiftMonth(target, -1)) => base(anchor) * (useSeason ? season(target) : 1)   // anchor = last full month the forecast may look at
  // back-test the last 6 full months: which variant predicted better, and by how much were we off?
  const tests = Array.from({ length: 6 }, (_, i) => shiftMonth(cur, -(i + 1))).filter(k => val(k) > 0 && shiftMonth(k, -1) >= startFull)
  const mape = (useSeason: boolean) => tests.length ? tests.reduce((t, k) => t + Math.abs(predict(k, useSeason) - val(k)) / val(k), 0) / tests.length : 0.25
  const eBase = mape(false), eSeason = hasTwoYears ? mape(true) : Infinity
  const useSeason = eSeason < eBase, err = Math.min(0.6, Math.max(tests.length < 4 ? 0.15 : 0.08, useSeason ? eSeason : eBase))
  const months = Array.from({ length: 12 }, (_, i) => shiftMonth(cur, i - 11)).map(k => ({ month: k, value: Math.round(val(k)), partial: k === cur }))
  const next = Array.from({ length: 3 }, (_, i) => shiftMonth(cur, i + 1)).map(k => {
    const f = predict(k, useSeason, shiftMonth(cur, -1))
    return { month: k, expected: Math.round(f), low: Math.round(f * (1 - err)), high: Math.round(f * (1 + err)) }
  })
  const thisMonthSoFar = val(cur), daysIn = Number(today.slice(8, 10)), daysTotal = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0).getDate()
  const radar = await reorderRadar(all), horizon = addDays(today, 30)
  const calendar = radar.filter(r => r.status !== 'lapsing' && r.expected_date <= horizon && r.churn_pct < 60)
  const seg = new Map<string, number>(); let tot90 = 0
  for (const r of all) { seg.set(r.segment, (seg.get(r.segment) ?? 0) + r.value_90); tot90 += r.value_90 }
  return {
    months, next, method: useSeason ? 'recent months + same-month-last-year pattern' : 'average of the last 3 and last 12 months', error_pct: Math.round(err * 100), backtest_months: tests.length, thin_history: tests.length < 4, history_from: firstKey,
    this_month: { so_far: Math.round(thisMonthSoFar), days_in: daysIn, days_total: daysTotal, pace: Math.round(thisMonthSoFar / Math.max(1, daysIn) * daysTotal) },
    by_segment: [...seg].map(([segment, v]) => ({ segment, share: tot90 ? Math.round(v / tot90 * 100) : 0, expected_next_month: Math.round((next[0]?.expected ?? 0) * (tot90 ? v / tot90 : 0)) })).sort((a, b) => b.share - a.share),
    orders_expected_30d: { count: calendar.length, value: calendar.reduce((t, r) => t + r.avg_order, 0), customers: calendar.slice(0, 30).map(r => ({ id: r.id, name: r.name, expected_date: r.expected_date, avg_order: r.avg_order, status: r.status })) },
  }
}

// ── next best action ──
export interface Action {
  key: string; type: 'collect' | 'reorder' | 'winback' | 'crosssell' | 'prospect'; party_type: 'customer' | 'prospect'; party_id: number; name: string; segment: string; district: string
  headline: string; why: string[]; value: number; score: number; channel: 'call' | 'visit' | 'whatsapp'; phone: string | null
  last_contact_days: number | null; open_task: boolean; owner_user_id: number | null
}
const urgencyValue = (urgency: number, value: number) => Math.round(urgency + Math.min(40, 10 * Math.log10(1 + Math.max(0, value) / 5000)))
const fmt = (v: number) => '৳' + Math.round(v).toLocaleString('en-US')

/** One ranked list: money to collect, regular customers due to reorder, silent customers to win back, products to cross-sell, prospects to chase. One line per customer — the most valuable reason first. */
export async function nextActions(rows: CustomerHealth[], opts: { userId?: number | null; limit?: number } = {}) {
  const today = dhakaToday(), byId = new Map(rows.map(r => [r.id, r]))
  const [radar, cs, lastTouch, openTasks] = await Promise.all([
    reorderRadar(rows), crossSell(rows),
    query<any>(`SELECT party_type, party_id, DATEDIFF(?, MAX(created_at)) days FROM crm_interactions WHERE direction = 'out' AND channel <> 'note' GROUP BY party_type, party_id`, [today]),
    query<any>(`SELECT party_type, party_id FROM crm_tasks WHERE status = 'open' GROUP BY party_type, party_id`)])
  const touch = new Map(lastTouch.map(t => [`${t.party_type}:${t.party_id}`, num(t.days)])), hasTask = new Set(openTasks.map(t => `${t.party_type}:${t.party_id}`))
  const pool = new Map<string, Action>()
  const add = (a: Omit<Action, 'key' | 'last_contact_days' | 'open_task' | 'score'> & { urgency: number }) => {
    const key = `${a.party_type}:${a.party_id}`, score = urgencyValue(a.urgency, a.value), prev = pool.get(key)
    const full: Action = { ...a, key, score, last_contact_days: touch.get(key) ?? null, open_task: hasTask.has(key) }
    if (!prev) pool.set(key, full)
    else if (score > prev.score) { full.why = [...full.why, ...prev.why.filter(w => !full.why.includes(w))]; pool.set(key, full) }
    else prev.why = [...prev.why, ...a.why.filter(w => !prev.why.includes(w))]
  }
  const base = (r: CustomerHealth) => ({ party_type: 'customer' as const, party_id: r.id, name: r.name, segment: r.segment, district: r.district, phone: r.phone, owner_user_id: r.owner_user_id })
  for (const r of rows) {
    if (r.overdue60 > 0) add({ ...base(r), type: 'collect', headline: `Collect ${fmt(r.overdue60)} that is over 60 days old`, why: [`${fmt(r.balance)} owed in total${r.over_limit ? ', over the credit limit' : ''}`, r.pay_days != null ? `Usually pays in ~${r.pay_days} days` : 'No payment pattern yet'], value: r.overdue60, urgency: r.label === 'Risky' ? 62 : 52, channel: 'call' })
    else if (r.overdue30 > 0 && r.balance > 0) add({ ...base(r), type: 'collect', headline: `Remind about ${fmt(r.overdue30)} older than 30 days`, why: [`${fmt(r.balance)} owed in total`], value: r.overdue30, urgency: 38, channel: 'whatsapp' })
  }
  for (const x of radar) {
    const r = byId.get(x.id)!
    if (x.status === 'due' || x.status === 'late') add({ ...base(r), type: 'reorder', headline: `Due to reorder — ${Math.abs(x.days_to_expected)} days ${x.days_to_expected <= 0 ? 'past' : 'before'} the usual date`, why: [x.reason, `Typical order ${fmt(x.avg_order)}`], value: x.avg_order, urgency: x.status === 'late' ? 50 : 36, channel: 'call' })
    else if (x.status === 'due_soon' && x.days_to_expected <= 3) add({ ...base(r), type: 'reorder', headline: `Expected to reorder within ${Math.max(0, x.days_to_expected)} days`, why: [x.reason, `Typical order ${fmt(x.avg_order)}`], value: x.avg_order, urgency: 20, channel: 'whatsapp' })
    else if (x.status === 'lapsing') add({ ...base(r), type: 'winback', headline: `Going quiet — ${x.churn_pct}% chance they are lost`, why: [x.reason, `${fmt(x.value_12m)} bought in the last 12 months`], value: x.value_12m / 4, urgency: 46, channel: 'call' })
  }
  for (const r of rows) if (r.label === 'Dormant' && r.value_12m > 0) add({ ...base(r), type: 'winback', headline: `Dormant — last order ${r.days_since_last} days ago`, why: [`${fmt(r.value_12m)} bought in the last 12 months`], value: r.value_12m / 4, urgency: 42, channel: 'call' })
  const topCs = new Map<number, CrossSellRow>()
  for (const s of cs.suggestions) if (!topCs.has(s.customer_id)) topCs.set(s.customer_id, s)
  for (const s of topCs.values()) { const r = byId.get(s.customer_id)!; if (r.label === 'Loyal' || r.label === 'Steady' || r.label === 'Growing') add({ ...base(r), type: 'crosssell', headline: `Offer ${s.product}`, why: [`${s.peers_buying_pct}% of ${s.segment} customers buy it; they don't`, `Could add about ${fmt(s.est_monthly)} a month`], value: s.est_monthly * 3, urgency: 14, channel: 'whatsapp' }) }
  // prospects worth a push: scored with the same assessment the dossier uses
  const pros = await query<any>(`SELECT * FROM crm_prospects WHERE stage IN ('new','researching','contacted','quoted','trial') ORDER BY updated_at DESC LIMIT 60`)
  for (const p of pros) {
    const idle = num((await query<any>(`SELECT DATEDIFF(?, COALESCE(MAX(created_at), ?)) d FROM crm_interactions WHERE party_type = 'prospect' AND party_id = ?`, [today, String(p.created_at).slice(0, 10), p.id]))[0]?.d)
    if (idle < 4 && p.stage !== 'new') continue
    const a = await assessProspect({ ...p, checklist: typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : p.checklist }, rows)
    if (a.same_as_customers.length || a.verdict === 'Low priority' || a.risk.band === 'High') continue
    add({ party_type: 'prospect', party_id: p.id, name: p.name, segment: a.segment, district: a.district, phone: p.phone, owner_user_id: p.owner_user_id ?? null, type: 'prospect',
      headline: p.stage === 'new' ? 'New prospect — nobody has made first contact' : `${p.stage} — ${idle} days since last contact`, why: [`Fit ${a.fit}/100, risk ${a.risk.band}`, `Could be worth ${fmt(a.potential.monthly_low)}–${fmt(a.potential.monthly_high)} a month`],
      value: a.potential.monthly_low * 3, urgency: 28 + Math.min(14, idle), channel: p.phone ? 'call' : 'visit' })
  }
  let list = [...pool.values()].filter(a => a.last_contact_days == null || a.last_contact_days > 2)
  const cooling = pool.size - list.length
  if (opts.userId) list = list.map(a => a.owner_user_id === opts.userId ? { ...a, score: a.score + 6 } : a)
  list.sort((a, b) => b.score - a.score)
  const counts: Record<string, number> = {}; for (const a of list) counts[a.type] = (counts[a.type] ?? 0) + 1
  const lim = opts.limit ?? 25, maxCollect = Math.ceil(lim * 0.4)      // collections are numerous; keep room for reorders, win-backs and prospects
  const top: Action[] = []; let nCollect = 0
  for (const a of list) { if (top.length >= lim) break; if (a.type === 'collect' && nCollect >= maxCollect) continue; if (a.type === 'collect') nCollect++; top.push(a) }
  return { actions: top, total: list.length, counts, recently_contacted: cooling }
}
