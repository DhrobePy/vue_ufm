import { query } from '~/server/utils/db'
import { crmUser } from '~/server/utils/crm'

/** POST /api/crm/interactions { party_type, party_id, channel, summary, outcome?, direction?, follow_up_date?, promise_amount? } — log a call / visit / message; optionally set the follow-up or promise-to-pay in the same step. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  const type = b?.party_type === 'prospect' ? 'prospect' : 'customer', pid = Number(b?.party_id), summary = String(b?.summary ?? '').trim().slice(0, 1000)
  if (!pid || !summary) throw createError({ statusCode: 400, statusMessage: 'party_id and summary are required' })
  const channel = ['call', 'visit', 'sms', 'whatsapp', 'email', 'note'].includes(b?.channel) ? b.channel : 'note'
  const r: any = await query(`INSERT INTO crm_interactions (party_type, party_id, channel, direction, summary, outcome, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, pid, channel, b?.direction === 'in' ? 'in' : 'out', summary, String(b?.outcome ?? '').slice(0, 120) || null, me.id])
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(b?.follow_up_date ?? '')))
    await query(`INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, promise_amount, assigned_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, pid, Number(b?.promise_amount) > 0 ? 'promise' : 'follow_up', Number(b?.promise_amount) > 0 ? `Promised ৳${Number(b.promise_amount).toLocaleString()} — check it arrived` : `Follow up: ${summary.slice(0, 120)}`, b.follow_up_date, Number(b?.promise_amount) || null, me.id, me.id])
  return { ok: true, id: r.insertId }
})
