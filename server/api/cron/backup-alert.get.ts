import { sendTelegram } from '~/server/utils/telegram'

/** GET /api/cron/backup-alert?token=…&msg=… — called by scripts/server-backup.sh when a backup step fails. */
export default defineEventHandler(async (event) => {
  const secret = String(useRuntimeConfig().cronSecret ?? '')
  const q = getQuery(event)
  if (!secret || String(q.token ?? '') !== secret) throw createError({ statusCode: 403, statusMessage: 'Invalid token' })
  await sendTelegram(`🔴 <b>Database backup problem</b>\n<code>${String(q.msg ?? '').slice(0, 300).replace(/[<>&]/g, '')}</code>`, 'backup')
  return { ok: true }
})
