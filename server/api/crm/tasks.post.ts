import { query } from '~/server/utils/db'
import { crmUser } from '~/server/utils/crm'

/** POST /api/crm/tasks { party_type, party_id, title, kind?, due_date?, promise_amount?, assigned_user_id? } */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  const type = b?.party_type === 'prospect' ? 'prospect' : 'customer', pid = Number(b?.party_id), title = String(b?.title ?? '').trim().slice(0, 300)
  if (!pid || !title) throw createError({ statusCode: 400, statusMessage: 'party_id and title are required' })
  const kind = ['follow_up', 'promise', 'collect', 'reorder', 'credit_review', 'visit', 'other'].includes(b?.kind) ? b.kind : 'follow_up'
  const due = /^\d{4}-\d{2}-\d{2}$/.test(String(b?.due_date ?? '')) ? b.due_date : null
  const r: any = await query(`INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, promise_amount, assigned_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [type, pid, kind, title, due, Number(b?.promise_amount) || null, Number(b?.assigned_user_id) || me.id, me.id])
  return { ok: true, id: r.insertId }
})
