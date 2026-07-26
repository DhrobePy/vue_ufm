import { query } from '~/server/utils/db'
import { resetTelegramCache, sendTelegram, TELEGRAM_CATEGORIES } from '~/server/utils/telegram'

/** Save Telegram notifier settings + optional test message (admin only). */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const body   = await readBody(event)
  const chatId = String(body?.chat_id ?? '').trim()
  const token  = body?.token !== undefined ? String(body.token).trim() : undefined

  const upsert = async (key: string, value: string) => query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value],
  )

  if (token !== undefined && token !== '') await upsert('telegram_bot_token', token)
  await upsert('telegram_chat_id', chatId)

  // Per-category routing groups — empty string clears a category back to
  // the general-group fallback.
  if (body?.categories && typeof body.categories === 'object') {
    for (const c of TELEGRAM_CATEGORIES) {
      if (body.categories[c] !== undefined) {
        await upsert(`telegram_chat_id_${c}`, String(body.categories[c]).trim())
      }
    }
  }
  resetTelegramCache()

  if (body?.send_test) {
    await sendTelegram('🔔 <b>Ujjal FMC ERP</b> — Telegram notifications are connected.')
  }
  return { ok: true }
})
