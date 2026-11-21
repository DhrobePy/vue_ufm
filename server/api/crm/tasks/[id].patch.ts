import { query } from '~/server/utils/db'
import { crmUser } from '~/server/utils/crm'

/** PATCH /api/crm/tasks/:id { status?: 'done'|'cancelled'|'open', due_date?, title?, outcome? } — completing a task can log what happened to the contact log. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), id = Number(getRouterParam(event, 'id')), b = await readBody(event)
  const [t] = await query<any>(`SELECT * FROM crm_tasks WHERE id = ?`, [id])
  if (!t) throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  const sets: string[] = [], params: unknown[] = []
  if (['open', 'done', 'cancelled'].includes(b?.status)) { sets.push('status = ?', 'completed_at = ?'); params.push(b.status, b.status === 'open' ? null : new Date().toISOString().slice(0, 19).replace('T', ' ')) }
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(b?.due_date ?? ''))) { sets.push('due_date = ?'); params.push(b.due_date) }
  if (b?.title) { sets.push('title = ?'); params.push(String(b.title).slice(0, 300)) }
  if (sets.length) await query(`UPDATE crm_tasks SET ${sets.join(', ')} WHERE id = ?`, [...params, id])
  if (b?.status === 'done' && String(b?.outcome ?? '').trim())
    await query(`INSERT INTO crm_interactions (party_type, party_id, channel, summary, outcome, user_id) VALUES (?, ?, 'note', ?, 'task done', ?)`, [t.party_type, t.party_id, `${t.title} — ${String(b.outcome).trim().slice(0, 800)}`, me.id])
  return { ok: true }
})
