import { query } from '~/server/utils/db'
import { crmUser, customerHealth } from '~/server/utils/crm'

/** POST /api/crm/interactions { party_type, party_id, channel, summary, outcome?, direction?, follow_up_date?, promise_amount?, lat?, lon?, accuracy_m?, pin? } — log a call / visit / message; optionally set the follow-up or promise-to-pay in the same step. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  const type = b?.party_type === 'prospect' ? 'prospect' : 'customer', pid = Number(b?.party_id), summary = String(b?.summary ?? '').trim().slice(0, 1000)
  if (!pid || !summary) throw createError({ statusCode: 400, statusMessage: 'party_id and summary are required' })
  const channel = ['call', 'visit', 'sms', 'whatsapp', 'email', 'note'].includes(b?.channel) ? b.channel : 'note'
  const lat = Number(b?.lat), lon = Number(b?.lon), geo = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0)
  const label = type === 'customer' ? (await customerHealth()).find(r => r.id === pid)?.label ?? null : null     // state of the account when it was contacted — lets us measure what works
  const cols = ['party_type', 'party_id', 'channel', 'direction', 'summary', 'outcome', 'user_id'], vals: unknown[] = [type, pid, channel, b?.direction === 'in' ? 'in' : 'out', summary, String(b?.outcome ?? '').slice(0, 120) || null, me.id]
  let r: any
  try {
    r = await query(`INSERT INTO crm_interactions (${[...cols, 'label_at', 'lat', 'lon', 'accuracy_m'].join(', ')}) VALUES (${[...cols, 'x', 'x', 'x', 'x'].map(() => '?').join(', ')})`, [...vals, label, geo ? lat : null, geo ? lon : null, geo ? Math.round(Number(b?.accuracy_m)) || null : null])
  } catch (e: any) {
    if (e?.errno !== 1054) throw e       // columns not added yet (migration pending) — fall back to the plain insert
    r = await query(`INSERT INTO crm_interactions (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, vals)
  }
  if (geo && b?.pin) await query(`UPDATE ${type === 'customer' ? 'customers' : 'crm_prospects'} SET lat = ?, lon = ? WHERE id = ?`, [lat, lon, pid]).catch(() => {})   // "this is where they are"
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(b?.follow_up_date ?? '')))
    await query(`INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, promise_amount, assigned_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, pid, Number(b?.promise_amount) > 0 ? 'promise' : 'follow_up', Number(b?.promise_amount) > 0 ? `Promised ৳${Number(b.promise_amount).toLocaleString()} — check it arrived` : `Follow up: ${summary.slice(0, 120)}`, b.follow_up_date, Number(b?.promise_amount) || null, me.id, me.id])
  return { ok: true, id: r.insertId }
})
