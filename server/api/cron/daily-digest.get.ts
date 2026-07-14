import { sendOwnerDigestNow } from '~/server/utils/ownerDigest'

/**
 * GET /api/cron/daily-digest?token=...
 * Wire this to a cPanel "Cron Jobs" scheduled task (Cron Jobs panel ->
 * add a job that runs e.g. `curl -s "https://yourdomain/api/cron/daily-digest?token=YOUR_SECRET"`
 * once a day). Requires NUXT_CRON_SECRET to be set in .env — the endpoint
 * refuses all requests until it is, so it can never fire by accident.
 * Idempotent: won't send twice on the same calendar day even if triggered
 * more than once (e.g. cron + the in-app dashboard fallback both fire).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.cronSecret ?? '')
  if (!secret)
    throw createError({ statusCode: 503, statusMessage: 'Cron endpoints are not configured (set NUXT_CRON_SECRET)' })

  const token = String(getQuery(event).token ?? '')
  if (token !== secret)
    throw createError({ statusCode: 403, statusMessage: 'Invalid token' })

  const result = await sendOwnerDigestNow()
  return { ok: true, ...result }
})
