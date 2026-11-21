import { query, getDb } from '~/server/utils/db'
import { getUserBranchIds } from '~/server/utils/creditOrders'

/**
 * The CRM "brain": everything the screens and the AI assistant share, computed from the ledger and orders — never by the AI.
 *   • business type + district for each customer (confirmed value if someone set it, else a guess from the name / address)
 *   • a health label per customer with plain-language reasons and suggested next steps
 *   • the portfolio summary (concentration, mix, credit, data gaps)
 *   • benchmarks from similar customers and a scored assessment of a prospect
 * Every number here is a database figure; the assistant only explains and acts on them.
 */

export const SEGMENTS = ['Trader / Store', 'Bakery', 'Food manufacturer', 'Hotel / Institution', 'Other business', 'Unclassified'] as const
export type Segment = typeof SEGMENTS[number]
/** how much each business type matters to us (0-1) — used in the prospect fit score */
export const SEGMENT_WEIGHT: Record<string, number> = { 'Trader / Store': 1, 'Bakery': 0.9, 'Food manufacturer': 0.9, 'Hotel / Institution': 0.7, 'Other business': 0.3, 'Unclassified': 0.5 }

const SEGMENT_RULES: [Segment, RegExp][] = [
  ['Bakery', /bekary|bakery|bakers?\b|bread|cake|pastry|bakeri/i],
  ['Food manufacturer', /\bfoods?\b|industr|biscuit|noodle|confection|sweets?\b|mistanno|snacks?|\bfactory\b/i],
  ['Hotel / Institution', /hotel|restaurant|canteen|hospital|school|madrasa|housing|\bmess\b|catering|resort/i],
  ['Other business', /\boil\b|transport|\bmill\b|construction|gas|pharma/i],
  ['Trader / Store', /traders?|trading|enterprise|corporation|bonik|bepari|agency|distribut|wholesale|\bstores?\b|\bpoint\b|seles|sales|bhandar|gudam|\bshop\b/i],
]
export function inferSegment(name: string, business: string | null, orders12m = 0): Segment {
  const text = `${name ?? ''} ${business ?? ''}`
  for (const [seg, re] of SEGMENT_RULES) if (re.test(text)) return seg
  return orders12m >= 12 ? 'Trader / Store' : 'Unclassified'      // someone ordering this often is a trader, whatever their name says
}

const DISTRICTS: Record<string, string[]> = {
  Dhaka: ['dhaka', 'badda', 'mirpur', 'jatrabari', 'malibagh', 'kamrangirchar', 'new market', 'newmarket', 'khilgaon', 'mugda', 'mohammadpur', 'karwan', 'lalbag', 'rampura', 'demra', 'narinda', 'savar', 'saver', 'gulshan', 'uttara', 'tejgaon', 'motijheel', 'kachukhet', 'gopibag', 'banker goli', 'krishi market', 'baridhara', 'dania', 'keraniganj', 'beriba', 'sotota', 'b.n.p'],
  Tangail: ['tangail', 'madhupur', 'modhupur', 'dhanbari', 'bhuapur', 'bhuyapur', 'vuyapur', 'ghatail', 'elenga', 'gopalpur', 'nagarpur', 'mirzapur', 'sakhipur', 'basail', 'kalihati', 'kachukhet'],
  Sirajganj: ['sirajganj', 'sirajgonj', 'sirajganj', 'kazipur', 'ullapara', 'shahjadpur', 'tarash', 'belkuchi', 'raiganj', 'chauhali', 'kamarkhand', 'natuapara', 'gurkaw'],
  Mymensingh: ['mymensingh', 'muktagacha', 'phulpur', 'trishal', 'bhaluka', 'gouripur', 'nandail', 'ishwarganj', 'haluaghat', 'fulbaria'],
  Sherpur: ['sherpur', 'nalitabari', 'jhenaigati', 'sreebardi'],
  Jamalpur: ['jamalpur', 'bakshiganj', 'bokshiganj', 'melandaha', 'islampur', 'madarganj', 'sarishabari', 'sorishabari'],
  Gazipur: ['gazipur', 'tongi', 'kaliakair', 'kapasia', 'sreepur'],
  Narayanganj: ['narayanganj', 'sonargaon', 'araihazar'],
  Sylhet: ['sylhet'], Chattogram: ['chattogram', 'chittagong', 'ctg'], Bogura: ['bogra', 'bogura'], Pabna: ['pabna'], Rajshahi: ['rajshahi'], Natore: ['natore'],
}
export function inferDistrict(address: string | null | undefined): string {
  const a = String(address ?? '').toLowerCase()
  if (!a) return 'Unknown'
  // check specific districts before the broad "Dhaka" list (e.g. "Gazipur, Dhaka")
  for (const d of Object.keys(DISTRICTS).filter(k => k !== 'Dhaka')) if (DISTRICTS[d].some(k => a.includes(k))) return d
  return DISTRICTS.Dhaka.some(k => a.includes(k)) ? 'Dhaka' : 'Other'
}

const num = (v: any) => Number(v ?? 0)
const r0 = (v: number) => Math.round(v)
const days = (a: string | null, today: string) => a ? Math.floor((Date.parse(today) - Date.parse(String(a).slice(0, 10))) / 864e5) : null
export const dhakaToday = () => new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)

export type Label = 'Never bought' | 'Dormant' | 'Risky' | 'Slipping' | 'Growing' | 'Loyal' | 'Steady'
export interface CustomerHealth {
  id: number; name: string; business_name: string | null; phone: string | null; address: string | null
  segment: string; segment_confirmed: boolean; district: string; district_confirmed: boolean; branch: string | null; owner_user_id: number | null
  balance: number; credit_limit: number; over_limit: boolean; overdue30: number; overdue60: number; pay_days: number | null
  orders_12m: number; value_12m: number; value_90: number; value_prev90: number; first_order: string | null; last_order: string | null
  days_since_last: number | null; gap_days: number | null; products: number; top_product: string | null; top_product_share: number
  label: Label; reasons: string[]; suggestions: string[]; priority: number
}

let flags: { segment: boolean } | null = null
async function colFlags() {
  if (flags) return flags
  const r = await query<any>(`SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'segment'`)
  flags = { segment: num(r[0]?.n) > 0 }
  return flags
}

let healthCache: { at: number; rows: CustomerHealth[] } | null = null
export const clearCrmCache = () => { healthCache = null }
/** Every active customer with its metrics, label, reasons and suggested next steps (cached 60 s — the figures move slowly). */
export async function customerHealth(): Promise<CustomerHealth[]> {
  if (healthCache && Date.now() - healthCache.at < 60_000) return healthCache.rows
  const rows = await computeCustomerHealth()
  healthCache = { at: Date.now(), rows }
  return rows
}
async function computeCustomerHealth(): Promise<CustomerHealth[]> {
  const today = dhakaToday()
  const f = await colFlags()
  const base = await query<any>(
    `SELECT c.id, c.name, c.business_name, c.phone_number AS phone, c.business_address AS address, c.credit_limit, c.current_balance AS balance, c.status,
            ${f.segment ? 'c.segment AS seg_set, c.district AS dist_set, c.owner_user_id' : 'NULL AS seg_set, NULL AS dist_set, NULL AS owner_user_id'}
     FROM customers c WHERE c.status = 'active' AND c.customer_type <> 'POS'`)
  const ord = new Map<number, any>((await query<any>(
    `SELECT customer_id, COUNT(*) all_orders, MIN(order_date) first_order, MAX(order_date) last_order,
            SUM(order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)) orders_12m,
            SUM(CASE WHEN order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY) THEN total_amount ELSE 0 END) value_12m,
            SUM(CASE WHEN order_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN total_amount ELSE 0 END) value_90,
            SUM(CASE WHEN order_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND order_date >= DATE_SUB(CURDATE(), INTERVAL 180 DAY) THEN total_amount ELSE 0 END) value_prev90
     FROM credit_orders WHERE status IN ('shipped','delivered','goods_on_board') GROUP BY customer_id`)).map(r => [r.customer_id, r]))
  const aging = new Map<number, any>((await query<any>(
    `SELECT customer_id, SUM(CASE WHEN DATEDIFF(CURDATE(), order_date) > 30 THEN balance_due ELSE 0 END) overdue30, SUM(CASE WHEN DATEDIFF(CURDATE(), order_date) > 60 THEN balance_due ELSE 0 END) overdue60
     FROM credit_orders WHERE balance_due > 0.01 AND status NOT IN ('cancelled','rejected','draft') GROUP BY customer_id`)).map(r => [r.customer_id, r]))
  const pay = new Map<number, number>((await query<any>(
    `SELECT co.customer_id, AVG(DATEDIFF(pa.allocation_date, co.order_date)) d FROM payment_allocations pa JOIN credit_orders co ON co.id = pa.order_id
     WHERE pa.allocated_amount > 0 AND pa.allocation_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY) GROUP BY co.customer_id`)).map(r => [r.customer_id, num(r.d)]))
  const prods = new Map<number, { name: string; v: number }[]>()
  for (const r of await query<any>(
    `SELECT co.customer_id, p.base_name AS name, SUM(coi.line_total) v FROM credit_order_items coi JOIN credit_orders co ON co.id = coi.order_id JOIN products p ON p.id = coi.product_id
     WHERE co.status IN ('shipped','delivered','goods_on_board') AND co.order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY) GROUP BY co.customer_id, p.id`))
    (prods.get(r.customer_id) ?? prods.set(r.customer_id, []).get(r.customer_id)!).push({ name: r.name, v: num(r.v) })
  const branch = new Map<number, string>()
  const bv = new Map<number, [string, number]>()
  for (const r of await query<any>(
    `SELECT co.customer_id, COALESCE(b.name, '—') AS b, SUM(co.total_amount) v FROM credit_orders co LEFT JOIN branches b ON b.id = co.assigned_branch_id
     WHERE co.status IN ('shipped','delivered','goods_on_board') AND co.order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY) GROUP BY co.customer_id, b.id`)) {
    const cur = bv.get(r.customer_id); if (!cur || num(r.v) > cur[1]) bv.set(r.customer_id, [r.b, num(r.v)])
  }
  for (const [id, [b]] of bv) if (b !== '—') branch.set(id, b)

  return base.map((c): CustomerHealth => {
    const o = ord.get(c.id) ?? {}, a = aging.get(c.id) ?? {}
    const orders12 = num(o.orders_12m), v12 = num(o.value_12m), v90 = num(o.value_90), vp90 = num(o.value_prev90)
    const dsl = days(o.last_order ?? null, today)
    const gap = orders12 >= 2 && o.first_order ? Math.max(1, Math.round(Math.min(365, days(o.first_order, today) ?? 365) / orders12)) : null
    const pl = (prods.get(c.id) ?? []).sort((x, y) => y.v - x.v), plTotal = pl.reduce((t, p) => t + p.v, 0)
    const balance = num(c.balance), limit = num(c.credit_limit), over60 = num(a.overdue60), over30 = num(a.overdue30)
    const payDays = pay.has(c.id) ? Math.round(pay.get(c.id)!) : null
    const limitSet = limit >= 1000                 // limits like ৳10 are placeholders, not real limits
    const overLimit = limitSet && balance > limit

    const reasons: string[] = [], sugg: string[] = []
    let label: Label = 'Steady', priority = 0
    const everBought = num(o.all_orders) > 0
    if (!everBought) { label = 'Never bought'; reasons.push('No shipped order on record'); sugg.push('Check whether this is a live account; if yes, call to offer a first order, if not archive it') }
    else if ((dsl ?? 0) > 90) { label = 'Dormant'; reasons.push(`Last order ${dsl} days ago`); sugg.push(`Win-back call: lifetime orders ${num(o.all_orders)}, last 12 months ৳${r0(v12).toLocaleString()}`); priority = Math.min(80, v12 / 1e5 + 20) }
    if (label !== 'Never bought' && (over60 > 0 && (overLimit || (payDays ?? 0) > 30))) { label = 'Risky'; reasons.push(`৳${r0(over60).toLocaleString()} is more than 60 days old${overLimit ? ' and the balance is over the credit limit' : ''}`); sugg.push('Collect before the next dispatch; consider holding new orders until the old balance is cleared'); priority = Math.max(priority, 90) }
    if (label === 'Steady' || label === 'Loyal') {
      const slow = gap && dsl != null && dsl > Math.max(21, gap * 2.2)
      const drop = vp90 > 0 && v90 < vp90 * 0.5
      if (slow || drop) { label = 'Slipping'; if (slow) reasons.push(`Usually orders every ~${gap} days, silent for ${dsl}`); if (drop) reasons.push(`Last 90 days ৳${r0(v90).toLocaleString()} vs ৳${r0(vp90).toLocaleString()} before`); sugg.push('Call to ask what changed (price, quality, delivery, competitor) and offer a reason to reorder'); priority = Math.max(priority, 70) }
      else if (vp90 > 0 && v90 > vp90 * 1.5 && v90 >= 300000 && orders12 >= 3) { label = 'Growing'; reasons.push(`Last 90 days ৳${r0(v90).toLocaleString()} vs ৳${r0(vp90).toLocaleString()} before`); sugg.push('Protect the relationship: confirm supply, review the credit limit and price tier'); priority = Math.max(priority, 40) }
      else if (orders12 >= 6 && (dsl ?? 99) <= 30) { label = 'Loyal'; reasons.push(`${orders12} orders in 12 months, ordered ${dsl} days ago`) }
    }
    if (overLimit) { reasons.push(`Balance ৳${r0(balance).toLocaleString()} is over the ৳${r0(limit).toLocaleString()} limit`); priority = Math.max(priority, label === 'Risky' ? 90 : 55) }
    if (overLimit && (payDays ?? 99) <= 15 && over60 === 0 && orders12 >= 6) {
      const avg = v12 / Math.max(1, orders12), suggested = Math.max(limit, Math.ceil((avg * 2) / 50000) * 50000)
      if (suggested > limit) sugg.push(`Pays in ~${payDays} days with nothing old outstanding — review raising the limit toward ৳${suggested.toLocaleString()} (needs approval)`)
    } else if (!limitSet && balance > 0 && orders12 > 0) sugg.push(`No real credit limit is set (${limit > 0 ? 'only ৳' + r0(limit) : 'none'}) but the customer owes ৳${r0(balance).toLocaleString()} — set one`)
    if (pl.length === 1 && v12 > 0) sugg.push(`Buys only ${pl[0].name} — offer another product from the range`)
    if (over30 > 0 && label !== 'Risky') { reasons.push(`৳${r0(over30).toLocaleString()} older than 30 days`); priority = Math.max(priority, 45); sugg.push('Remind about the older balance') }

    const segConf = !!c.seg_set, distConf = !!c.dist_set
    return {
      id: c.id, name: c.name, business_name: c.business_name, phone: c.phone, address: c.address,
      segment: c.seg_set || inferSegment(c.name, c.business_name, orders12), segment_confirmed: segConf,
      district: c.dist_set || inferDistrict(c.address), district_confirmed: distConf, branch: branch.get(c.id) ?? null, owner_user_id: c.owner_user_id ?? null,
      balance, credit_limit: limit, over_limit: overLimit, overdue30: over30, overdue60: over60, pay_days: payDays,
      orders_12m: orders12, value_12m: v12, value_90: v90, value_prev90: vp90, first_order: o.first_order ?? null, last_order: o.last_order ?? null,
      days_since_last: dsl, gap_days: gap, products: pl.length, top_product: pl[0]?.name ?? null, top_product_share: plTotal ? pl[0].v / plTotal : 0,
      label, reasons, suggestions: sugg, priority,
    }
  })
}

const median = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const pct = (a: number[], p: number) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))] }
const group = <T,>(rows: T[], key: (r: T) => string) => { const m = new Map<string, T[]>(); for (const r of rows) (m.get(key(r)) ?? m.set(key(r), []).get(key(r))!).push(r); return m }

export async function portfolioSummary(rows?: CustomerHealth[]) {
  const all = rows ?? await customerHealth()
  const buyers = all.filter(r => r.value_12m > 0).sort((a, b) => b.value_12m - a.value_12m)
  const total = buyers.reduce((t, r) => t + r.value_12m, 0)
  const share = (n: number) => total ? buyers.slice(0, n).reduce((t, r) => t + r.value_12m, 0) / total * 100 : 0
  const labels: Record<string, number> = {}; for (const r of all) labels[r.label] = (labels[r.label] ?? 0) + 1
  const rollup = (key: (r: CustomerHealth) => string) => [...group(all, key)].map(([k, rs]) => {
    const b = rs.filter(r => r.value_12m > 0), pays = b.map(r => r.pay_days).filter((x): x is number => x != null)
    return { key: k, customers: rs.length, buyers: b.length, value_12m: b.reduce((t, r) => t + r.value_12m, 0), share: total ? b.reduce((t, r) => t + r.value_12m, 0) / total * 100 : 0,
      avg_pay_days: pays.length ? Math.round(pays.reduce((t, x) => t + x, 0) / pays.length) : null, owing: rs.reduce((t, r) => t + Math.max(0, r.balance), 0), over_limit: rs.filter(r => r.over_limit).length }
  }).sort((a, b) => b.value_12m - a.value_12m)
  const prod = (await query<any>(
    `SELECT p.base_name AS product, SUM(coi.line_total) v, SUM(coi.quantity) q, COUNT(DISTINCT co.customer_id) customers FROM credit_order_items coi JOIN credit_orders co ON co.id = coi.order_id JOIN products p ON p.id = coi.product_id
     WHERE co.status IN ('shipped','delivered','goods_on_board') AND co.order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY) GROUP BY p.id ORDER BY v DESC LIMIT 12`)).map(r => ({ product: r.product, value: num(r.v), qty: num(r.q), customers: num(r.customers), share: total ? num(r.v) / total * 100 : 0 }))
  const noBranch = num((await query<any>(`SELECT COUNT(DISTINCT customer_id) n FROM credit_orders WHERE assigned_branch_id IS NULL AND status IN ('shipped','delivered','goods_on_board') AND order_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`))[0]?.n)
  return {
    customers: all.length, buyers: buyers.length, value_12m: total,
    concentration: { top1: share(1), top5: share(5), top10: share(10), top20: share(20), biggest: buyers[0] ? { id: buyers[0].id, name: buyers[0].name, value: buyers[0].value_12m } : null },
    labels, segments: rollup(r => r.segment), districts: rollup(r => r.district), branches: rollup(r => r.branch ?? 'No branch recorded'), products: prod,
    credit: { credit_customers: all.length, owing_count: all.filter(r => r.balance > 0.01).length, owed: all.reduce((t, r) => t + Math.max(0, r.balance), 0), over_limit: all.filter(r => r.over_limit).length, over_limit_amount: all.filter(r => r.over_limit).reduce((t, r) => t + (r.balance - r.credit_limit), 0), no_limit_owing: all.filter(r => r.credit_limit < 1000 && r.balance > 0.01).length },
    data_gaps: { no_address: all.filter(r => !r.address).length, segment_unconfirmed: all.filter(r => !r.segment_confirmed).length, district_unknown: all.filter(r => r.district === 'Unknown').length, buyers_without_branch: noBranch },
  }
}

/** What customers like this prospect look like in our own book (same business type, and district when there are enough). */
export function benchmarksFor(rows: CustomerHealth[], segment: string, district: string) {
  const bySeg = rows.filter(r => r.segment === segment && r.value_12m > 0)
  const byBoth = bySeg.filter(r => r.district === district)
  const sample = byBoth.length >= 5 ? byBoth : bySeg.length >= 5 ? bySeg : rows.filter(r => r.value_12m > 0)
  const scope = sample === byBoth ? `${segment} in ${district}` : sample === bySeg ? segment : 'all buying customers'
  const monthly = sample.map(r => r.value_12m / 12), pays = sample.map(r => r.pay_days).filter((x): x is number => x != null)
  const orderVals = sample.map(r => r.value_12m / Math.max(1, r.orders_12m))
  const risky = sample.filter(r => r.label === 'Risky' || r.over_limit).length
  return { scope, n: sample.length, monthly_p25: pct(monthly, 0.25), monthly_median: median(monthly), monthly_p75: pct(monthly, 0.75), order_value_median: median(orderVals), pay_days_median: median(pays),
    risky_rate: sample.length ? risky / sample.length : 0, branch: [...group(sample.filter(r => r.branch), r => r.branch!)].sort((a, b) => b[1].length - a[1].length)[0]?.[0] ?? null,
    top_products: [...group(sample.filter(r => r.top_product), r => r.top_product!)].sort((a, b) => b[1].length - a[1].length).slice(0, 3).map(([p]) => p) }
}

export interface ProspectInput { id?: number; name: string; business_name?: string | null; segment?: string | null; district?: string | null; address?: string | null; phone?: string | null; phone2?: string | null; email?: string | null; website?: string | null; contact_person?: string | null; source?: string | null; source_url?: string | null; checklist?: Record<string, any> | null }
export const CHECKLIST_ITEMS: { key: string; label: string; weight: number }[] = [
  { key: 'visited', label: 'Visited the premises', weight: 20 }, { key: 'shop_photo', label: 'Photo of shop / factory taken', weight: 8 }, { key: 'trade_license_no', label: 'Trade licence number', weight: 15 },
  { key: 'nid_checked', label: 'Owner ID checked', weight: 10 }, { key: 'monthly_bags_declared', label: 'Monthly flour use (bags) declared', weight: 15 }, { key: 'current_supplier', label: 'Current supplier known', weight: 7 },
  { key: 'references', label: 'Two trade references collected', weight: 15 }, { key: 'years_in_business', label: 'Years in business', weight: 5 }, { key: 'payment_history_notes', label: 'How they pay other suppliers', weight: 5 },
]

/** Scored assessment of a prospect: fit, estimated potential, risk, suggested first-order terms, what is still unknown. Deterministic — the AI explains it, never invents it. */
export async function assessProspect(p: ProspectInput, rows?: CustomerHealth[]) {
  const all = rows ?? await customerHealth()
  const segment = p.segment && (SEGMENTS as readonly string[]).includes(p.segment) ? p.segment : inferSegment(p.name, p.business_name ?? null, 0)
  const district = p.district || inferDistrict(p.address)
  const bench = benchmarksFor(all, segment, district)
  const cl = (p.checklist ?? {}) as Record<string, any>
  const done = (k: string) => k === 'references' ? Array.isArray(cl.references) && cl.references.filter((x: any) => x?.name || x?.phone).length >= 2 : !!cl[k]
  const completeness = CHECKLIST_ITEMS.reduce((t, i) => t + (done(i.key) ? i.weight : 0), 0)

  // potential volume: declared monthly bags × our average price per bag, shared with other suppliers; else the benchmark range
  const declared = Number(cl.monthly_bags_declared) || 0
  const avgPrice = bench.n ? (all.filter(r => r.value_12m > 0).reduce((t, r) => t + r.value_12m, 0) / Math.max(1, all.filter(r => r.value_12m > 0).reduce((t, r) => t + r.orders_12m, 0))) / 40 : 2800
  const potential = declared > 0
    ? { basis: 'declared monthly use × 30–60% share (they keep other suppliers)', monthly_low: declared * 0.3 * avgPrice, monthly_high: declared * 0.6 * avgPrice }
    : { basis: `typical customer — ${bench.scope} (25th–75th percentile of ${bench.n})`, monthly_low: bench.monthly_p25, monthly_high: bench.monthly_p75 }

  // fit (0-100)
  const have = (d: string) => all.filter(r => r.district === d && r.value_12m > 0).length
  const coverage = district === 'Unknown' || district === 'Other' ? 0.4 : Math.min(1, have(district) / 5)
  const contact = (p.phone ? 0.6 : 0) + (p.email || p.website ? 0.2 : 0) + (p.address ? 0.2 : 0)
  const fit = Math.round(100 * (0.4 * (SEGMENT_WEIGHT[segment] ?? 0.5) + 0.3 * coverage + 0.15 * contact + 0.15 * Math.min(1, bench.n / 10)))

  // risk: duplicates / links to existing customers, segment risk rate, missing checks
  const flags: string[] = []
  const norm = (s: string | null | undefined) => String(s ?? '').replace(/\D/g, '').slice(-9)
  const phones = [p.phone, p.phone2].map(norm).filter(x => x.length >= 8)
  const nameKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const same = all.filter(r => (phones.length && phones.includes(norm(r.phone))) || (nameKey(p.name).length >= 5 && nameKey(r.name) === nameKey(p.name)))
  for (const m of same) flags.push(`Already a customer: ${m.name} (#${m.id}, ${m.label})`)
  const dead = await query<any>(`SELECT id, name FROM customers WHERE status <> 'active' AND (${phones.length ? 'RIGHT(REGEXP_REPLACE(phone_number, \'[^0-9]\', \'\'), 9) IN (?)' : '1=0'} OR LOWER(REPLACE(name, ' ', '')) = ?)`, phones.length ? [phones, nameKey(p.name)] : [nameKey(p.name)]).catch(() => [])
  for (const m of dead) flags.push(`Matches an inactive / blocked customer: ${m.name} (#${m.id}) — find out why before opening credit`)
  if (bench.risky_rate > 0.35) flags.push(`${Math.round(bench.risky_rate * 100)}% of similar customers have gone over limit or fallen behind`)
  if (!done('references')) flags.push('No trade references yet')
  if (!done('trade_license_no')) flags.push('Trade licence not seen')
  if (!p.phone) flags.push('No phone number — cannot be contacted yet')
  const riskScore = Math.min(100, Math.round(25 + (same.length ? 40 : 0) + (dead.length ? 35 : 0) + bench.risky_rate * 40 + (100 - completeness) * 0.3))
  const riskBand = riskScore >= 70 ? 'High' : riskScore >= 45 ? 'Medium' : 'Low'

  // first-order terms: cautious start, stepped up on good payment
  const adv = riskBand === 'High' ? 100 : riskBand === 'Medium' ? 50 : 30
  const first = Math.max(50000, Math.round((bench.order_value_median * 0.6) / 10000) * 10000)
  const terms = {
    first_order: `${adv}% advance on the first order${adv === 100 ? ' (cash-first)' : ''}, order size up to about ৳${first.toLocaleString()}`,
    credit_limit: `Start at ৳0 credit; after 3 orders paid within ${Math.max(7, Math.round(bench.pay_days_median || 10))} days, open ৳${first.toLocaleString()}; step toward ৳${Math.round(bench.order_value_median * 2 / 50000) * 50000 || first} on good payment`,
    price_tier: bench.n ? `Quote like other ${segment} customers; volume discounts only after the first month` : 'Quote the standard list price',
    delivery: bench.branch ? `Likely served from ${bench.branch} (where most similar customers buy)` : 'Branch to be decided from location',
  }
  const missing = CHECKLIST_ITEMS.filter(i => !done(i.key)).map(i => i.label)
  const confidence = Math.round(Math.min(100, 20 + Math.min(40, bench.n * 3) + completeness * 0.4))
  const verdict = same.length ? 'Already a customer — do not treat as a new lead' : fit >= 65 && riskBand !== 'High' ? 'Pursue' : fit >= 45 ? 'Worth a call, verify first' : 'Low priority'
  return { segment, district, benchmark: bench, potential: { ...potential, monthly_low: Math.round(potential.monthly_low), monthly_high: Math.round(potential.monthly_high), yearly_low: Math.round(potential.monthly_low * 12), yearly_high: Math.round(potential.monthly_high * 12) },
    fit, risk: { score: riskScore, band: riskBand, flags }, terms, checklist: { completeness, missing, items: CHECKLIST_ITEMS.map(i => ({ ...i, done: done(i.key) })) }, confidence, verdict, same_as_customers: same.map(m => ({ id: m.id, name: m.name })) }
}

/** Customers the signed-in user may see: everyone for admin / head-office roles, only their branch(es) for branch-coded roles. */
export async function scopedHealth(event: any): Promise<CustomerHealth[]> {
  const rows = await customerHealth()
  const session = await getUserSession(event)
  if (!session?.user) return rows
  const conn = await getDb().getConnection()
  try {
    const scope = await getUserBranchIds(conn, Number((session.user as any).id), String((session.user as any).role ?? '').toLowerCase())
    if (scope === null) return rows
    const names = new Set((await query<any>(`SELECT name FROM branches WHERE id IN (?)`, [scope.length ? scope : [0]])).map(b => b.name))
    return rows.filter(r => !r.branch || names.has(r.branch))
  } finally { conn.release() }
}
export const crmUser = async (event: any) => {
  const s = await getUserSession(event)
  if (!s?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  return { id: Number((s.user as any).id), role: String((s.user as any).role ?? '').toLowerCase(), name: String((s.user as any).name ?? (s.user as any).email ?? 'user') }
}
