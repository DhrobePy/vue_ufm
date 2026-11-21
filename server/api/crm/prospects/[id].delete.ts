import { query } from '~/server/utils/db'
import { crmUser } from '~/server/utils/crm'

/** DELETE /api/crm/prospects/:id — admin only; removes the prospect, its tasks and contact log. Prefer marking it Lost. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event)
  if (!['admin', 'superadmin'].includes(me.role)) throw createError({ statusCode: 403, statusMessage: 'Only admin can delete a prospect — mark it Lost instead' })
  const id = Number(getRouterParam(event, 'id'))
  await query(`DELETE FROM crm_tasks WHERE party_type = 'prospect' AND party_id = ?`, [id]); await query(`DELETE FROM crm_interactions WHERE party_type = 'prospect' AND party_id = ?`, [id]); await query(`DELETE FROM crm_prospects WHERE id = ?`, [id])
  return { ok: true }
})
