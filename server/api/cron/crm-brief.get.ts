import { sendCrmBrief } from '~/server/utils/crmBrief'

/**
 * GET /api/cron/crm-brief?token=…  (&force=1 to send a test right now)
 * Wire to a cPanel cron every 30 minutes — it only sends once a day, after the hour set in Settings → CRM, and skips the off days.
 * Same secret as the other cron endpoints (NUXT_CRON_SECRET); refuses everything until it is set.
 */
export default defineEventHandler(async (event) => {
  const secret = String(useRuntimeConfig().cronSecret ?? '')
  if (!secret) throw createError({ statusCode: 503, statusMessage: 'Cron endpoints are not configured (set NUXT_CRON_SECRET)' })
  const q = getQuery(event)
  if (String(q.token ?? '') !== secret) throw createError({ statusCode: 403, statusMessage: 'Invalid token' })
  return { ok: true, ...(await sendCrmBrief(q.force === '1')) }
})
