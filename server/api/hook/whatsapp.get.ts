import { safeEqual } from '~/server/utils/crmMessaging'

/** GET /api/hook/whatsapp — Meta's one-time webhook verification (hub.challenge). */
export default defineEventHandler(async (event) => {
  const q = getQuery(event), token = String(useRuntimeConfig().whatsappVerifyToken ?? '')
  if (!token || q['hub.mode'] !== 'subscribe' || !safeEqual(String(q['hub.verify_token'] ?? ''), token)) throw createError({ statusCode: 403, statusMessage: 'Verification failed' })
  return String(q['hub.challenge'] ?? '')
})
