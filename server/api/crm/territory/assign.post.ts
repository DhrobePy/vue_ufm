import { query } from '~/server/utils/db'
import { scopedHealth, crmUser, clearCrmCache } from '~/server/utils/crm'

/** POST /api/crm/territory/assign { district, owner_user_id (null clears), only_unassigned? } — who looks after the customers of a district. Admin only; changes the CRM owner field only. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  if (!['admin', 'superadmin'].includes(me.role)) throw createError({ statusCode: 403, statusMessage: 'Only an administrator can assign territories.' })
  const district = String(b?.district ?? '').trim(); if (!district) throw createError({ statusCode: 400, statusMessage: 'district is required' })
  const owner = Number(b?.owner_user_id) || null
  if (owner && !(await query<any>(`SELECT 1 FROM users WHERE id = ? AND status = 'active'`, [owner])).length) throw createError({ statusCode: 400, statusMessage: 'Unknown or inactive user' })
  const ids = (await scopedHealth(event)).filter(r => r.district === district && (!b?.only_unassigned || !r.owner_user_id)).map(r => r.id)
  if (!ids.length) return { ok: true, updated: 0 }
  await query(`UPDATE customers SET owner_user_id = ? WHERE id IN (?)`, [owner, ids])
  clearCrmCache()
  return { ok: true, updated: ids.length }
})
