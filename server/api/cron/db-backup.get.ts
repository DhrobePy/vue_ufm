import { runDbBackupNow } from '~/server/utils/dbBackup'

/**
 * GET /api/cron/db-backup?token=...
 * Wire this to a cPanel "Cron Jobs" scheduled task, e.g. every 30 minutes:
 *   curl -s "https://cerp.ujjalfm.com/api/cron/db-backup?token=YOUR_SECRET"
 * Requires NUXT_CRON_SECRET (same secret /api/cron/daily-digest uses) plus
 * NUXT_GOOGLE_SERVICE_ACCOUNT_JSON + NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.cronSecret ?? '')
  if (!secret)
    throw createError({ statusCode: 503, statusMessage: 'Cron endpoints are not configured (set NUXT_CRON_SECRET)' })

  const token = String(getQuery(event).token ?? '')
  if (token !== secret)
    throw createError({ statusCode: 403, statusMessage: 'Invalid token' })

  return await runDbBackupNow()
})
