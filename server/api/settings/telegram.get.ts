import { query } from '~/server/utils/db'

/** Telegram notifier settings (admin only). Token is masked. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const rows = await query<{ setting_key: string; setting_value: string }>(
    `SELECT setting_key, setting_value FROM system_settings
     WHERE setting_key IN ('telegram_bot_token', 'telegram_chat_id')`,
  )
  const map = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]))
  const token = map.telegram_bot_token ?? ''
  return {
    has_token: !!token,
    token_masked: token ? `${token.slice(0, 6)}…${token.slice(-4)}` : '',
    chat_id: map.telegram_chat_id ?? '',
  }
})
