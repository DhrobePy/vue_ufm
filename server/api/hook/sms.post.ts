import { recordInbound, safeEqual } from '~/server/utils/crmMessaging'

/** POST /api/hook/sms?token=… { from, text } — incoming SMS from the gateway (common field names accepted). Needs NUXT_CRM_WEBHOOK_SECRET. */
export default defineEventHandler(async (event) => {
  const secret = String(useRuntimeConfig().crmWebhookSecret ?? '')
  if (!secret) throw createError({ statusCode: 503, statusMessage: 'Not configured' })
  if (!safeEqual(String(getQuery(event).token ?? ''), secret)) throw createError({ statusCode: 403, statusMessage: 'Invalid token' })
  const b: any = await readBody(event).catch(() => ({})) ?? {}, q: any = getQuery(event)
  const pick = (...k: string[]) => { for (const key of k) { const v = b[key] ?? q[key]; if (v) return String(v) } return '' }
  return { ok: true, ...(await recordInbound('sms', pick('from', 'msisdn', 'sender', 'number'), pick('text', 'message', 'content', 'body'), pick('id', 'message_id') || null)) }
})
