import { resetAppSettingsCache } from '~/server/utils/appSettings'
import { resetTelegramCache } from '~/server/utils/telegram'
import { clearAllPerms } from '~/server/utils/permCache'

/** Settings → Security → Clear Cache. Drops this worker's in-memory copies of settings/permissions so they reload from the database. Nobody is signed out. */
export default defineEventHandler(async (event) => {
  const role = (((await getUserSession(event))?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  resetAppSettingsCache(); resetTelegramCache()
  clearAllPerms()
  return { ok: true }
})
