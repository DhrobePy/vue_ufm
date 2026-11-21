import { getDb, query } from '~/server/utils/db'
import { getAppSettings } from '~/server/utils/appSettings'
import { sendTelegram } from '~/server/utils/telegram'
import { customerHealth, dhakaToday } from '~/server/utils/crm'
import { reorderRadar, forecast, nextActions } from '~/server/utils/crmIntel'

/**
 * The CRM morning brief — one Telegram message with what to do today.
 * Sent once a day, after the configured hour (Dhaka time), skipping the configured off days (default Friday).
 * Triggered by the token-protected /api/cron/crm-brief (cPanel cron) and, as a fallback, by anyone opening CRM → Today.
 */
const SETTING_KEY = 'last_crm_brief'
const esc = (s: unknown) => String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
const n0 = (v: number) => '৳' + Math.round(v).toLocaleString('en-US')
const ICON: Record<string, string> = { collect: '💰', reorder: '🔁', winback: '🛟', crosssell: '➕', prospect: '🎯' }
const dhakaNow = () => new Date(Date.now() + 6 * 3600_000)

async function claim(today: string): Promise<boolean> {
  const db = getDb()
  await db.query(`INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, '')`, [SETTING_KEY])
  const [r] = await db.query(`UPDATE system_settings SET setting_value = ? WHERE setting_key = ? AND setting_value <> ?`, [today, SETTING_KEY, today]) as any
  return Number(r.affectedRows) === 1       // exactly one worker wins the day
}

export async function buildBrief(): Promise<string> {
  const rows = await customerHealth(), today = dhakaToday()
  const [radar, fc, acts] = await Promise.all([reorderRadar(rows), forecast(rows), nextActions(rows, { limit: 6 })])
  const [t] = await query<any>(`SELECT SUM(due_date = ?) due_today, SUM(due_date < ?) overdue FROM crm_tasks WHERE status = 'open'`, [today, today])
  const [cold] = await query<any>(`SELECT COUNT(*) n FROM crm_prospects p WHERE p.stage IN ('new','researching','contacted','quoted','trial') AND DATEDIFF(?, COALESCE((SELECT MAX(i.created_at) FROM crm_interactions i WHERE i.party_type = 'prospect' AND i.party_id = p.id), p.created_at)) >= 5`, [today])
  let replies = 0; try { replies = Number((await query<any>(`SELECT COUNT(*) n FROM crm_messages WHERE direction = 'in' AND read_at IS NULL`))[0].n) } catch { /* table not there yet */ }
  const due = radar.filter(r => r.status === 'due' || r.status === 'late'), slipping = radar.filter(r => r.churn_pct >= 60).sort((a, b) => b.value_at_risk - a.value_at_risk)
  const over60 = rows.filter(r => r.overdue60 > 0), prevMonth = fc.months[fc.months.length - 2]
  const label = dhakaNow().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' })
  const lines = [
    `☀️ <b>CRM brief — ${label}</b>`, '',
    `<b>Do first</b>`, ...acts.actions.map(a => `${ICON[a.type] ?? '•'} ${esc(a.name)} — ${esc(a.headline)}`), '',
    `<b>Tasks</b>: ${Number(t?.due_today ?? 0)} due today · ${Number(t?.overdue ?? 0)} overdue`,
    `<b>Reorders due</b>: ${due.length} customers (about ${n0(due.reduce((s, r) => s + r.avg_order, 0))} of orders)`,
    `<b>Slipping away</b>: ${slipping.length} customers, ${n0(slipping.reduce((s, r) => s + r.value_at_risk, 0))} of yearly sales at risk${slipping.length ? '\n   ' + slipping.slice(0, 3).map(r => `${esc(r.name)} (${r.churn_pct}%)`).join(', ') : ''}`,
    `<b>Overdue 60+ days</b>: ${n0(over60.reduce((s, r) => s + r.overdue60, 0))} across ${over60.length} customers`,
    `<b>Prospects going cold</b>: ${Number(cold?.n ?? 0)}` + (replies ? ` · <b>💬 ${replies} reply(ies) waiting</b>` : ''), '',
    `<b>This month</b>: ${n0(fc.this_month.so_far)} so far (day ${fc.this_month.days_in}/${fc.this_month.days_total}) · pace ${n0(fc.this_month.pace)}${prevMonth ? ` · last month ${n0(prevMonth.value)}` : ''}`,
  ]
  return lines.join('\n').slice(0, 3900)
}

/** force = send now, ignoring the hour / off-day / once-a-day rules (used to test from the cron URL). */
export async function sendCrmBrief(force = false): Promise<{ sent: boolean; reason?: string }> {
  const pol = (await getAppSettings(true)).crm_policy, now = dhakaNow(), today = dhakaToday()
  if (!force) {
    if (!pol.briefEnabled) return { sent: false, reason: 'switched off' }
    if (now.getUTCHours() < Number(pol.briefHour ?? 8)) return { sent: false, reason: 'too early' }
    if ((pol.briefOffDays ?? [5]).includes(now.getUTCDay())) return { sent: false, reason: 'off day' }
    if (!(await claim(today))) return { sent: false, reason: 'already sent today' }
  }
  try { await sendTelegram(await buildBrief()); return { sent: true } }
  catch (e: any) { console.warn('[crm-brief] failed:', e?.message ?? e); return { sent: false, reason: 'error' } }
}

let lastTry = 0
/** Fire-and-forget fallback — at most one attempt a minute per worker, never throws. */
export function maybeTriggerCrmBrief(): void {
  if (Date.now() - lastTry < 60_000) return
  lastTry = Date.now()
  sendCrmBrief().catch(() => {})
}
