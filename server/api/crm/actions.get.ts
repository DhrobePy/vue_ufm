import { scopedHealth, crmUser } from '~/server/utils/crm'
import { nextActions } from '~/server/utils/crmIntel'

/** GET /api/crm/actions?limit=25&mine=1 — the ranked next-best-action list. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), q = getQuery(event)
  const r = await nextActions(await scopedHealth(event), { userId: me.id, limit: Math.min(60, Math.max(1, Number(q.limit) || 25)) })
  return q.mine === '1' ? { ...r, actions: r.actions.filter(a => a.owner_user_id === me.id) } : r
})
