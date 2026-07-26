import { query } from '~/server/utils/db'
import { TELEGRAM_CATEGORIES } from '~/server/utils/telegram'

/** Telegram notifier settings (admin only). Token is masked. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const keys = [
    'telegram_bot_token', 'telegram_chat_id',
    ...TELEGRAM_CATEGORIES.map(c => `telegram_chat_id_${c}`),
  ]
  const rows = await query<{ setting_key: string; setting_value: string }>(
    `SELECT setting_key, setting_value FROM system_settings
     WHERE setting_key IN (${keys.map(() => '?').join(',')})`,
    keys,
  )
  const map = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]))
  const token = map.telegram_bot_token ?? ''
  return {
    has_token: !!token,
    token_masked: token ? `${token.slice(0, 6)}…${token.slice(-4)}` : '',
    chat_id: map.telegram_chat_id ?? '',
    categories: TELEGRAM_CATEGORIES.map(c => ({
      key: c,
      chat_id: map[`telegram_chat_id_${c}`] ?? '',
    })),
  }
})
