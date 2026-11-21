import { query } from '~/server/utils/db'
import { assessProspect, dhakaToday, type CustomerHealth } from '~/server/utils/crm'

/**
 * Outcome tracking — did the follow-ups work? Everything is counted from what was actually logged:
 *   contacts → did the customer order / pay within 14 days
 *   promises → did the promised money arrive by the due date (+3 days)
 *   prospects → funnel, win rate by source / business type, time to first order, and whether a higher fit score really means a better chance
 * A contact followed by an order is not proof the contact caused it; the baseline is shown next to it for that reason.
 */
const num = (v: any) => Number(v ?? 0)
const pct = (a: number, b: number) => b ? Math.round(a / b * 100) : null
const SHIPPED = `('shipped','delivered','goods_on_board')`

export async function outcomes(rows: CustomerHealth[]) {
  const today = dhakaToday()
  // 1. contacts → order / payment within 14 days (only contacts old enough to have had the chance)
  const contacts = await query<any>(
    `SELECT i.channel, COALESCE(i.label_at, 'not recorded') label_at, (i.created_at <= DATE_SUB(NOW(), INTERVAL 14 DAY)) matured,
            EXISTS(SELECT 1 FROM credit_orders o WHERE o.customer_id = i.party_id AND o.status IN ${SHIPPED} AND o.order_date >= DATE(i.created_at) AND o.order_date <= DATE_ADD(DATE(i.created_at), INTERVAL 14 DAY)) ordered,
            EXISTS(SELECT 1 FROM customer_payments p WHERE p.customer_id = i.party_id AND p.reversed_at IS NULL AND p.payment_date >= DATE(i.created_at) AND p.payment_date <= DATE_ADD(DATE(i.created_at), INTERVAL 14 DAY)) paid
     FROM crm_interactions i WHERE i.party_type = 'customer' AND i.direction = 'out' AND i.channel IN ('call','visit','sms','whatsapp','email') AND i.created_at >= DATE_SUB(CURDATE(), INTERVAL 180 DAY)`)
  const group = (key: (r: any) => string) => {
    const m = new Map<string, { contacts: number; ordered: number; paid: number }>()
    for (const r of contacts.filter(c => num(c.matured))) { const k = key(r), g = m.get(k) ?? m.set(k, { contacts: 0, ordered: 0, paid: 0 }).get(k)!; g.contacts++; g.ordered += num(r.ordered) ? 1 : 0; g.paid += num(r.paid) ? 1 : 0 }
    return [...m].map(([k, g]) => ({ key: k, ...g, order_rate: pct(g.ordered, g.contacts), pay_rate: pct(g.paid, g.contacts) })).sort((a, b) => b.contacts - a.contacts)
  }
  const buyers = rows.filter(r => r.value_12m > 0)
  const matured = contacts.filter(c => num(c.matured))
  // 2. promises to pay
  const promises = await query<any>(
    `SELECT t.id, t.party_id, c.name, t.promise_amount amount, DATE_FORMAT(t.due_date, '%Y-%m-%d') due,
            (SELECT COALESCE(SUM(p.amount), 0) FROM customer_payments p WHERE p.customer_id = t.party_id AND p.reversed_at IS NULL AND p.payment_date >= DATE(t.created_at) AND p.payment_date <= DATE_ADD(t.due_date, INTERVAL 3 DAY)) paid
     FROM crm_tasks t JOIN customers c ON c.id = t.party_id WHERE t.kind = 'promise' AND t.party_type = 'customer' AND t.promise_amount > 0 AND t.status <> 'cancelled' AND t.due_date < DATE_SUB(?, INTERVAL 3 DAY)
     ORDER BY t.due_date DESC LIMIT 100`, [today])
  const kept = promises.filter(p => num(p.paid) >= num(p.amount) * 0.8)
  // 3. tasks
  const [tk] = await query<any>(
    `SELECT SUM(status = 'done') done, SUM(status = 'done' AND (due_date IS NULL OR DATE(completed_at) <= due_date)) on_time, SUM(status = 'open' AND due_date < ?) overdue, SUM(status = 'open') open_n FROM crm_tasks WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 180 DAY) OR status = 'open'`, [today])
  // 4. prospects
  const pros = await query<any>(`SELECT * FROM crm_prospects`)
  const stages: Record<string, number> = {}; for (const p of pros) stages[p.stage] = (stages[p.stage] ?? 0) + 1
  const won = pros.filter(p => p.stage === 'won'), lost = pros.filter(p => p.stage === 'lost')
  const by = (key: (p: any) => string) => {
    const m = new Map<string, { n: number; won: number; lost: number }>()
    for (const p of pros) { const k = key(p) || 'unknown', g = m.get(k) ?? m.set(k, { n: 0, won: 0, lost: 0 }).get(k)!; g.n++; if (p.stage === 'won') g.won++; if (p.stage === 'lost') g.lost++ }
    return [...m].map(([k, g]) => ({ key: k, ...g, win_rate: pct(g.won, g.won + g.lost) })).sort((a, b) => b.n - a.n)
  }
  const ttf = await query<any>(
    `SELECT DATEDIFF(MIN(o.order_date), DATE(p.created_at)) d FROM crm_prospects p JOIN credit_orders o ON o.customer_id = p.converted_customer_id AND o.status IN ${SHIPPED} WHERE p.converted_customer_id IS NOT NULL GROUP BY p.id`)
  const days = ttf.map(t => num(t.d)).filter(d => d >= 0).sort((a, b) => a - b)
  const reasons = new Map<string, number>(); for (const p of lost) { const k = String(p.lost_reason ?? 'no reason recorded').trim().toLowerCase() || 'no reason recorded'; reasons.set(k, (reasons.get(k) ?? 0) + 1) }
  const fitOf = async (list: any[]) => { const f: number[] = []; for (const p of list.slice(0, 60)) f.push((await assessProspect({ ...p, checklist: typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : p.checklist }, rows)).fit); return f.length ? Math.round(f.reduce((t, x) => t + x, 0) / f.length) : null }
  const [fitWon, fitLost] = [await fitOf(won), await fitOf(lost)]
  // 5. messages
  let messages: any = { available: false }
  try {
    const m = await query<any>(`SELECT channel, direction, status, COUNT(*) n FROM crm_messages WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY channel, direction, status`)
    const [o] = await query<any>(`SELECT COUNT(*) n FROM crm_optout`)
    const sent = m.filter(x => x.direction === 'out' && x.status === 'sent').reduce((t, x) => t + num(x.n), 0), failed = m.filter(x => x.status === 'failed').reduce((t, x) => t + num(x.n), 0), got = m.filter(x => x.direction === 'in').reduce((t, x) => t + num(x.n), 0)
    messages = { available: true, sent_30d: sent, failed_30d: failed, replies_30d: got, reply_rate: pct(got, sent), opted_out: num(o.n) }
  } catch { /* table not created yet */ }
  return {
    contacts: { total_180d: contacts.length, matured: matured.length, ordered_14d: matured.filter(c => num(c.ordered)).length, paid_14d: matured.filter(c => num(c.paid)).length,
      order_rate: pct(matured.filter(c => num(c.ordered)).length, matured.length), pay_rate: pct(matured.filter(c => num(c.paid)).length, matured.length),
      baseline_order_rate: pct(buyers.filter(r => (r.days_since_last ?? 999) <= 14).length, buyers.length), by_channel: group(r => r.channel), by_label: group(r => r.label_at) },
    promises: { due_checked: promises.length, kept: kept.length, kept_rate: pct(kept.length, promises.length), recent: promises.slice(0, 8).map(p => ({ name: p.name, customer_id: p.party_id, amount: num(p.amount), due: p.due, paid: Math.round(num(p.paid)), kept: num(p.paid) >= num(p.amount) * 0.8 })) },
    tasks: { done: num(tk?.done), on_time: num(tk?.on_time), on_time_rate: pct(num(tk?.on_time), num(tk?.done)), overdue: num(tk?.overdue), open: num(tk?.open_n) },
    prospects: { total: pros.length, stages, won: won.length, lost: lost.length, win_rate: pct(won.length, won.length + lost.length), median_days_to_first_order: days.length ? days[days.length >> 1] : null,
      by_source: by(p => String(p.source ?? '')), by_segment: by(p => String(p.segment ?? '')), lost_reasons: [...reasons].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([reason, n]) => ({ reason, n })),
      avg_fit_won: fitWon, avg_fit_lost: fitLost },
    messages,
  }
}
