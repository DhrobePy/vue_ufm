import { createHmac, timingSafeEqual } from 'node:crypto'
import { query } from '~/server/utils/db'
import { getAppSettings } from '~/server/utils/appSettings'
import { sendTelegram } from '~/server/utils/telegram'
import { customerHealth, dhakaToday } from '~/server/utils/crm'

/**
 * Two-way SMS / WhatsApp for the CRM.
 *  - Sending is always a person's click (never automatic), only when Settings → CRM → messaging is on, never to a number on the do-not-contact list,
 *    capped per day, and every message is written to the contact log.
 *  - Receiving: providers call /api/hook/sms or /api/hook/whatsapp; replies are matched to a customer / prospect by phone and logged; "STOP" adds the number to the do-not-contact list.
 *  - Provider details (URL, keys, template) live in the server .env, never in code or the database.
 */
export const phone9 = (p: unknown) => String(p ?? '').replace(/\D/g, '').slice(-9)
/** Bangladesh numbers → international digits without "+" (01711… → 880 1711…). */
export const toIntl = (p: unknown) => { const d = String(p ?? '').replace(/\D/g, ''); return d.startsWith('880') ? d : d.startsWith('0') ? '88' + d : d.length === 10 ? '880' + d : d }
const bad = (statusCode: number, statusMessage: string) => createError({ statusCode, statusMessage })

export async function gatewayStatus() {
  const c = useRuntimeConfig(), pol = (await getAppSettings(true)).crm_policy
  return { enabled: !!pol.messagingEnabled, sms: !!c.smsGatewayUrl, whatsapp: !!(c.whatsappToken && c.whatsappPhoneId), whatsapp_template: !!c.whatsappTemplate,
    inbound_sms: !!c.crmWebhookSecret, inbound_whatsapp: !!(c.whatsappVerifyToken && c.whatsappAppSecret), daily_limit: Number(pol.messageDailyLimit) || 100 }
}

const fill = (tpl: string, vals: Record<string, string>, json = false) => tpl.replace(/\{(to|text|key)\}/g, (_, k) => json ? JSON.stringify(vals[k]).slice(1, -1) : encodeURIComponent(vals[k]))

async function viaSms(to: string, text: string): Promise<string | null> {
  const c = useRuntimeConfig(), vals = { to, text, key: String(c.smsGatewayKey ?? '') }
  const res: any = c.smsGatewayBody
    ? await $fetch(String(c.smsGatewayUrl).replace(/\{key\}/g, encodeURIComponent(vals.key)), { method: 'POST', body: JSON.parse(fill(String(c.smsGatewayBody), vals, true)), timeout: 15000, responseType: 'text' })
    : await $fetch(fill(String(c.smsGatewayUrl), vals), { timeout: 15000, responseType: 'text' })
  const body = typeof res === 'string' ? res : JSON.stringify(res)
  if (c.smsGatewayOkMatch && !new RegExp(String(c.smsGatewayOkMatch), 'i').test(body)) throw new Error(`Provider replied: ${body.slice(0, 160)}`)
  return body.slice(0, 100)
}
async function viaWhatsapp(to: string, text: string, inSession: boolean): Promise<string | null> {
  const c = useRuntimeConfig()
  const payload = inSession
    ? { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }
    : { messaging_product: 'whatsapp', to, type: 'template', template: { name: String(c.whatsappTemplate), language: { code: String(c.whatsappTemplateLang || 'bn') }, components: [{ type: 'body', parameters: [{ type: 'text', text: text.replace(/\s*\n+\s*/g, ' ').slice(0, 900) }] }] } }
  const res: any = await $fetch(`https://graph.facebook.com/v21.0/${c.whatsappPhoneId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${c.whatsappToken}` }, body: payload, timeout: 15000 })
  return res?.messages?.[0]?.id ?? null
}

export async function sendMessage(o: { channel: 'sms' | 'whatsapp'; partyType: 'customer' | 'prospect' | null; partyId: number | null; to: string; text: string; userId: number }) {
  const st = await gatewayStatus(), c = useRuntimeConfig()
  if (!st.enabled) throw bad(403, 'Sending is switched off (Admin → Settings → CRM → messaging).')
  if (o.channel === 'sms' ? !st.sms : !st.whatsapp) throw bad(503, `${o.channel === 'sms' ? 'SMS' : 'WhatsApp'} is not connected yet — the server .env needs the provider details (see docs/CRM_ASSISTANT.md).`)
  const text = String(o.text ?? '').trim()
  if (!text) throw bad(400, 'Write a message first.')
  if (/\[(PHONE|ফোন)\]/i.test(text)) throw bad(400, 'The message still has the [PHONE] placeholder — put in the company phone number (Admin → Settings → Company) or type it, then send.')
  if (text.length > (o.channel === 'sms' ? 700 : 1000)) throw bad(400, 'The message is too long for this channel.')
  const to = toIntl(o.to), p9 = phone9(to)
  if (to.length < 11 || to.length > 15) throw bad(400, 'That phone number does not look valid.')
  const [opt] = await query<any>(`SELECT 1 x FROM crm_optout WHERE phone9 = ?`, [p9])
  if (opt) throw bad(409, 'This number asked not to be contacted (do-not-contact list). Nothing was sent.')
  const [sentToday] = await query<any>(`SELECT COUNT(*) n FROM crm_messages WHERE direction = 'out' AND created_at >= ?`, [dhakaToday() + ' 00:00:00'])
  if (Number(sentToday.n) >= st.daily_limit) throw bad(429, `Daily sending limit of ${st.daily_limit} reached.`)
  let inSession = false
  if (o.channel === 'whatsapp') {
    const [s] = await query<any>(`SELECT 1 x FROM crm_messages WHERE phone9 = ? AND direction = 'in' AND channel = 'whatsapp' AND created_at >= DATE_SUB(NOW(), INTERVAL 23 HOUR) LIMIT 1`, [p9])
    inSession = !!s
    if (!inSession && !c.whatsappTemplate) throw bad(409, 'WhatsApp only allows free text within 24 hours of the customer\'s last message. Starting a conversation needs an approved template (NUXT_WHATSAPP_TEMPLATE).')
  }
  const label = o.partyType === 'customer' && o.partyId ? (await customerHealth()).find(r => r.id === o.partyId)?.label ?? null : null
  let ref: string | null = null, err: string | null = null
  try { ref = o.channel === 'sms' ? await viaSms(to, text) : await viaWhatsapp(to, text, inSession) } catch (e: any) { err = String(e?.data?.error?.message ?? e?.statusMessage ?? e?.message ?? e).slice(0, 280) }
  await query(`INSERT INTO crm_messages (party_type, party_id, channel, direction, phone, phone9, body, status, provider_ref, error, user_id) VALUES (?, ?, ?, 'out', ?, ?, ?, ?, ?, ?, ?)`,
    [o.partyType, o.partyId, o.channel, to, p9, text, err ? 'failed' : 'sent', ref, err, o.userId])
  if (err) throw bad(502, `Not sent: ${err}`)
  if (o.partyType && o.partyId) await query(`INSERT INTO crm_interactions (party_type, party_id, channel, direction, summary, user_id, label_at) VALUES (?, ?, ?, 'out', ?, ?, ?)`, [o.partyType, o.partyId, o.channel, text.slice(0, 1000), o.userId, label])
  return { ok: true, ref }
}

const STOP = /^\s*(stop|unsubscribe|cancel|no more|বন্ধ|বন্ধ করুন|আর না|আর পাঠাবেন না)\s*[.!।]*\s*$/i
/** A reply arrived. Match it to a customer / prospect by phone, log it, honour STOP, tell the owner on Telegram. */
export async function recordInbound(channel: 'sms' | 'whatsapp', from: string, text: string, ref: string | null) {
  const p9 = phone9(from); text = String(text ?? '').trim().slice(0, 1500)
  if (p9.length < 8 || !text) return { matched: false }
  const [dup] = ref ? await query<any>(`SELECT 1 x FROM crm_messages WHERE provider_ref = ? AND direction = 'in' LIMIT 1`, [ref]) : []
  if (dup) return { matched: false, duplicate: true }
  let [party] = await query<any>(`SELECT id, name FROM customers WHERE RIGHT(REGEXP_REPLACE(phone_number, '[^0-9]', ''), 9) = ? LIMIT 1`, [p9]).then(r => r.map((x: any) => ({ ...x, type: 'customer' as const })))
  if (!party) [party] = await query<any>(`SELECT id, name FROM crm_prospects WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', ''), 9) = ? OR RIGHT(REGEXP_REPLACE(phone2, '[^0-9]', ''), 9) = ? LIMIT 1`, [p9, p9]).then(r => r.map((x: any) => ({ ...x, type: 'prospect' as const })))
  await query(`INSERT INTO crm_messages (party_type, party_id, channel, direction, phone, phone9, body, status, provider_ref) VALUES (?, ?, ?, 'in', ?, ?, ?, 'received', ?)`, [party?.type ?? null, party?.id ?? null, channel, toIntl(from), p9, text, ref])
  const optout = STOP.test(text)
  if (optout) await query(`INSERT IGNORE INTO crm_optout (phone9, reason) VALUES (?, ?)`, [p9, `replied "${text.slice(0, 40)}" on ${channel}`])
  if (party) await query(`INSERT INTO crm_interactions (party_type, party_id, channel, direction, summary, outcome) VALUES (?, ?, ?, 'in', ?, ?)`, [party.type, party.id, channel, text.slice(0, 1000), optout ? 'asked not to be contacted' : 'replied'])
  const esc = (s: string) => s.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))
  sendTelegram(`💬 <b>${optout ? 'Opt-out' : 'Reply'}</b> from ${party ? `${esc(party.name)} (${party.type})` : `unknown number …${p9.slice(-4)}`}\n${esc(text.slice(0, 300))}${optout ? '\n<i>Added to the do-not-contact list.</i>' : ''}`).catch(() => {})
  return { matched: !!party, optout }
}

export const safeEqual = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y) }
export const verifyMetaSignature = (raw: string, header: string | undefined, secret: string) => !!header && header.startsWith('sha256=') && safeEqual(header.slice(7), createHmac('sha256', secret).update(raw).digest('hex'))
