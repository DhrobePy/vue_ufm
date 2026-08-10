/**
 * Telegram notifier — business event messages, routed per category.
 *
 * Token + chat ids live in system_settings so they are configurable from
 * Admin → Settings without a redeploy:
 *   telegram_bot_token          — the bot token (shared by every category)
 *   telegram_chat_id            — the general/fallback group
 *   telegram_chat_id_{category} — optional dedicated group per category
 *
 * Categories mirror the legacy app's 9-group routing: orders | production |
 * payment_received | dispatch | purchase | payment | goods_received |
 * bank_approved | expense. An unset category falls back to the general
 * group, so routing is safe to adopt incrementally.
 *
 * Failure NEVER propagates: notifications must not break business writes.
 * Always call AFTER the transaction commits.
 */
import { query } from '~/server/utils/db'

export const TELEGRAM_CATEGORIES = [
  'orders', 'production', 'payment_received', 'dispatch', 'purchase',
  'payment', 'goods_received', 'bank_approved', 'expense', 'backup',
] as const
export type TelegramCategory = typeof TELEGRAM_CATEGORIES[number]

interface Creds { token: string; generalChatId: string; byCategory: Record<string, string> }
let cached: Creds | null | undefined

async function loadCreds(): Promise<Creds | null> {
  if (cached !== undefined) return cached
  try {
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
    if (map.telegram_bot_token && map.telegram_chat_id) {
      const byCategory: Record<string, string> = {}
      for (const c of TELEGRAM_CATEGORIES) {
        const v = (map[`telegram_chat_id_${c}`] ?? '').trim()
        if (v) byCategory[c] = v
      }
      cached = { token: map.telegram_bot_token, generalChatId: map.telegram_chat_id, byCategory }
    } else {
      cached = null
    }
  } catch {
    cached = null
  }
  return cached
}

/** Invalidate the cache after settings change. */
export function resetTelegramCache() { cached = undefined }

/**
 * Fire-and-forget HTML message. Safe to call unawaited.
 * Pass a category to route to that category's dedicated group when one is
 * configured; otherwise (or with no category) it goes to the general group.
 */
export async function sendTelegram(html: string, category?: TelegramCategory): Promise<void> {
  try {
    const creds = await loadCreds()
    if (!creds) return
    const chatId = (category && creds.byCategory[category]) || creds.generalChatId
    await $fetch(`https://api.telegram.org/bot${creds.token}/sendMessage`, {
      method: 'POST',
      body: { chat_id: chatId, text: html.slice(0, 4000), parse_mode: 'HTML' },
      timeout: 8000,
    })
  } catch (e: any) {
    console.warn('[telegram] send failed:', e?.message ?? e)
  }
}
