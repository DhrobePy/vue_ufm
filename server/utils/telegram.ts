/**
 * Telegram notifier — business event messages to the company group.
 *
 * Token + chat id live in system_settings (keys: telegram_bot_token,
 * telegram_chat_id) so they are configurable from Admin → Settings without
 * a redeploy. Failure NEVER propagates: notifications must not break
 * business writes. Always call AFTER the transaction commits.
 */
import { query } from '~/server/utils/db'

let cached: { token: string; chatId: string } | null | undefined

async function loadCreds(): Promise<{ token: string; chatId: string } | null> {
  if (cached !== undefined) return cached
  try {
    const rows = await query<{ setting_key: string; setting_value: string }>(
      `SELECT setting_key, setting_value FROM system_settings
       WHERE setting_key IN ('telegram_bot_token', 'telegram_chat_id')`,
    )
    const map = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]))
    cached = map.telegram_bot_token && map.telegram_chat_id
      ? { token: map.telegram_bot_token, chatId: map.telegram_chat_id }
      : null
  } catch {
    cached = null
  }
  return cached
}

/** Invalidate the cache after settings change. */
export function resetTelegramCache() { cached = undefined }

/** Fire-and-forget HTML message. Safe to call unawaited. */
export async function sendTelegram(html: string): Promise<void> {
  try {
    const creds = await loadCreds()
    if (!creds) return
    await $fetch(`https://api.telegram.org/bot${creds.token}/sendMessage`, {
      method: 'POST',
      body: { chat_id: creds.chatId, text: html.slice(0, 4000), parse_mode: 'HTML' },
      timeout: 8000,
    })
  } catch (e: any) {
    console.warn('[telegram] send failed:', e?.message ?? e)
  }
}
