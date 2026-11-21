import { query } from '~/server/utils/db'
import { scopedHealth, dhakaToday } from '~/server/utils/crm'

/** GET /api/crm/territory — district by district: customers, sales, who looks after them, and how much of it has been contacted in the last 60 days. */
export default defineEventHandler(async (event) => {
  const rows = await scopedHealth(event), today = dhakaToday()
  const touched = new Set((await query<any>(`SELECT DISTINCT party_id FROM crm_interactions WHERE party_type = 'customer' AND channel <> 'note' AND direction = 'out' AND created_at >= DATE_SUB(?, INTERVAL 60 DAY)`, [today])).map(r => r.party_id))
  const users = new Map((await query<any>(`SELECT id, display_name FROM users`)).map(u => [u.id, u.display_name]))
  const total = rows.reduce((t, r) => t + r.value_12m, 0), groups = new Map<string, typeof rows>()
  for (const r of rows) (groups.get(r.district) ?? groups.set(r.district, []).get(r.district)!).push(r)
  const districts = [...groups].map(([district, rs]) => {
    const buyers = rs.filter(r => r.value_12m > 0), owners = new Map<string, number>()
    for (const r of rs) { const o = r.owner_user_id ? users.get(r.owner_user_id) ?? `user ${r.owner_user_id}` : 'unassigned'; owners.set(o, (owners.get(o) ?? 0) + 1) }
    const value = buyers.reduce((t, r) => t + r.value_12m, 0)
    return { district, customers: rs.length, buyers: buyers.length, value_12m: Math.round(value), share: total ? Math.round(value / total * 100) : 0,
      slipping: rs.filter(r => r.label === 'Slipping' || r.label === 'Dormant').length, risky: rs.filter(r => r.label === 'Risky').length,
      not_contacted_60d: buyers.filter(r => !touched.has(r.id)).length, owners: [...owners].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n) }
  }).sort((a, b) => b.value_12m - a.value_12m)
  return { districts, users: [...users].map(([id, name]) => ({ id, name })).sort((a, b) => String(a.name).localeCompare(String(b.name))) }
})
