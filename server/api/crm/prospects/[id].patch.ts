import { query } from '~/server/utils/db'
import { SEGMENTS, crmUser } from '~/server/utils/crm'

/** PATCH /api/crm/prospects/:id — edit details, move stage, merge checklist answers, link the customer record once converted. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), id = Number(getRouterParam(event, 'id')), b = await readBody(event)
  const [p] = await query<any>(`SELECT * FROM crm_prospects WHERE id = ?`, [id])
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Prospect not found' })
  const sets: string[] = [], params: unknown[] = []
  for (const k of ['name', 'business_name', 'district', 'address', 'phone', 'phone2', 'email', 'website', 'contact_person', 'source', 'source_url', 'source_note', 'notes', 'lost_reason'])
    if (k in b) { sets.push(`${k} = ?`); params.push(String(b[k] ?? '').trim().slice(0, k === 'notes' ? 2000 : 500) || null) }
  if ('segment' in b) { const v = String(b.segment ?? ''); if (v && !(SEGMENTS as readonly string[]).includes(v)) throw createError({ statusCode: 400, statusMessage: 'Unknown business type' }); sets.push('segment = ?'); params.push(v || null) }
  if ('owner_user_id' in b) { sets.push('owner_user_id = ?'); params.push(Number(b.owner_user_id) || null) }
  if ('converted_customer_id' in b) { sets.push('converted_customer_id = ?'); params.push(Number(b.converted_customer_id) || null) }
  if (b?.checklist && typeof b.checklist === 'object') {
    const cur = typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : (p.checklist ?? {})
    sets.push('checklist = ?'); params.push(JSON.stringify({ ...cur, ...b.checklist }))
  }
  let stageNote = ''
  if (['new', 'researching', 'contacted', 'quoted', 'trial', 'won', 'lost'].includes(b?.stage) && b.stage !== p.stage) {
    sets.push('stage = ?'); params.push(b.stage); stageNote = `Stage: ${p.stage} → ${b.stage}${b.stage === 'lost' && b.lost_reason ? ` (${String(b.lost_reason).slice(0, 100)})` : ''}`
  }
  if (!sets.length) return { ok: true }
  await query(`UPDATE crm_prospects SET ${sets.join(', ')} WHERE id = ?`, [...params, id])
  if (stageNote) await query(`INSERT INTO crm_interactions (party_type, party_id, channel, summary, user_id) VALUES ('prospect', ?, 'note', ?, ?)`, [id, stageNote, me.id])
  return { ok: true }
})
