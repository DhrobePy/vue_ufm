import { recordInbound, verifyMetaSignature } from '~/server/utils/crmMessaging'

/** POST /api/hook/whatsapp — incoming WhatsApp messages. Refused unless Meta's signature checks out (needs NUXT_WHATSAPP_APP_SECRET). */
export default defineEventHandler(async (event) => {
  const secret = String(useRuntimeConfig().whatsappAppSecret ?? '')
  if (!secret) throw createError({ statusCode: 503, statusMessage: 'Not configured' })
  const raw = (await readRawBody(event, 'utf8')) ?? ''
  if (!verifyMetaSignature(raw, getHeader(event, 'x-hub-signature-256'), secret)) throw createError({ statusCode: 403, statusMessage: 'Bad signature' })
  let body: any; try { body = JSON.parse(raw) } catch { return { ok: true } }
  for (const e of body?.entry ?? []) for (const ch of e?.changes ?? []) for (const m of ch?.value?.messages ?? [])
    if (m?.type === 'text' && m?.text?.body) await recordInbound('whatsapp', String(m.from ?? ''), m.text.body, String(m.id ?? '') || null).catch(err => console.warn('[hook/whatsapp]', err?.message ?? err))
    else if (m?.type === 'button' && m?.button?.text) await recordInbound('whatsapp', String(m.from ?? ''), m.button.text, String(m.id ?? '') || null).catch(() => {})
  return { ok: true }
})
