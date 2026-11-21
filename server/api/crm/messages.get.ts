import { query } from '~/server/utils/db'
import { gatewayStatus, phone9 } from '~/server/utils/crmMessaging'

/** GET /api/crm/messages — the inbox (one row per phone number). With ?phone=… the whole conversation, which is then marked read. */
export default defineEventHandler(async (event) => {
  const q = getQuery(event), gateway = await gatewayStatus()
  const nameOf = `COALESCE(c.name, p.name)`
  const join = `LEFT JOIN customers c ON m.party_type = 'customer' AND c.id = m.party_id LEFT JOIN crm_prospects p ON m.party_type = 'prospect' AND p.id = m.party_id`
  if (q.phone) {
    const p9 = phone9(q.phone)
    const messages = (await query<any>(`SELECT m.id, m.channel, m.direction, m.body, m.status, m.error, m.created_at, u.display_name by_user FROM crm_messages m LEFT JOIN users u ON u.id = m.user_id WHERE m.phone9 = ? ORDER BY m.id DESC LIMIT 100`, [p9])).reverse()
    await query(`UPDATE crm_messages SET read_at = NOW() WHERE phone9 = ? AND direction = 'in' AND read_at IS NULL`, [p9])
    const [party] = await query<any>(`SELECT m.party_type, m.party_id, ${nameOf} name, m.phone FROM crm_messages m ${join} WHERE m.phone9 = ? AND m.party_id IS NOT NULL ORDER BY m.id DESC LIMIT 1`, [p9])
    const [opt] = await query<any>(`SELECT 1 x FROM crm_optout WHERE phone9 = ?`, [p9])
    return { messages, party: party ?? null, opted_out: !!opt, gateway }
  }
  const threads = await query<any>(
    `SELECT t.phone9, t.unread, t.n, m.phone, m.channel, m.direction, m.body, m.status, m.created_at, m.party_type, m.party_id, ${nameOf} name
     FROM (SELECT phone9, MAX(id) last_id, SUM(direction = 'in' AND read_at IS NULL) unread, COUNT(*) n FROM crm_messages GROUP BY phone9) t
     JOIN crm_messages m ON m.id = t.last_id ${join} ORDER BY t.last_id DESC LIMIT 80`)
  const [o] = await query<any>(`SELECT COUNT(*) n FROM crm_optout`)
  return { threads, unread: threads.reduce((s, t) => s + Number(t.unread), 0), opted_out: Number(o.n), gateway }
})
