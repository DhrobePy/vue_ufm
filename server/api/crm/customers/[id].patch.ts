import { getDb } from '~/server/utils/db'
import { SEGMENTS, clearCrmCache, crmUser } from '~/server/utils/crm'
import { auditLog } from '~/server/utils/audit'

/** PATCH /api/crm/customers/:id  { segment?, district?, owner_user_id? } — confirm the business type / district / account owner (blank = go back to the automatic guess). */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), id = Number(getRouterParam(event, 'id')), b = await readBody(event)
  const sets: string[] = [], params: unknown[] = []
  if ('segment' in b) { const v = String(b.segment ?? '').trim(); if (v && !(SEGMENTS as readonly string[]).includes(v)) throw createError({ statusCode: 400, statusMessage: 'Unknown business type' }); sets.push('segment = ?'); params.push(v || null) }
  if ('district' in b) { sets.push('district = ?'); params.push(String(b.district ?? '').trim().slice(0, 40) || null) }
  if ('owner_user_id' in b) { sets.push('owner_user_id = ?'); params.push(Number(b.owner_user_id) || null) }
  if (!sets.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to change' })
  const conn = await getDb().getConnection()
  try {
    const [r] = await conn.query<any>(`UPDATE customers SET ${sets.join(', ')} WHERE id = ?`, [...params, id])
    if (!r.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
    await auditLog(conn, { userId: me.id, action: 'crm_profile_set', module: 'crm', recordType: 'customer', recordId: id, description: `CRM profile changed (${Object.keys(b).join(', ')}) by ${me.name}`, severity: 'info' })
  } finally { conn.release() }
  clearCrmCache()
  return { ok: true }
})
