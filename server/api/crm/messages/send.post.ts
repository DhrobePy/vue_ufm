import { query } from '~/server/utils/db'
import { crmUser } from '~/server/utils/crm'
import { sendMessage } from '~/server/utils/crmMessaging'

/** POST /api/crm/messages/send { party_type?, party_id?, channel: 'sms'|'whatsapp', text, to? } — a person pressing Send. Never called by the assistant. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  const type = b?.party_type === 'prospect' ? 'prospect' : b?.party_type === 'customer' ? 'customer' : null, pid = Number(b?.party_id) || null
  let to = String(b?.to ?? '').trim()
  if (!to && type && pid) to = String((await query<any>(type === 'customer' ? `SELECT phone_number AS ph FROM customers WHERE id = ?` : `SELECT phone AS ph FROM crm_prospects WHERE id = ?`, [pid]))[0]?.ph ?? '')
  if (!to) throw createError({ statusCode: 400, statusMessage: 'No phone number on record for this contact.' })
  return sendMessage({ channel: b?.channel === 'whatsapp' ? 'whatsapp' : 'sms', partyType: type, partyId: pid, to, text: String(b?.text ?? ''), userId: me.id })
})
