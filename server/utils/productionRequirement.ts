/**
 * Hourly shortfall alert for the Today's Production Requirement page
 * (pages/production/requirement.vue). This codebase has no cron worker, so
 * the alert is triggered opportunistically from the page's own GET load and
 * rate-limited to once per (calendar date + hour) via a system_settings
 * claim row — the same pattern as maybeTriggerOwnerDigest() in ownerDigest.ts.
 */
import { getDb } from '~/server/utils/db'
import { sendTelegram } from '~/server/utils/telegram'

const SETTING_KEY = 'last_production_shortfall_alert'

async function claimHourSlot(slot: string): Promise<boolean> {
  const db = getDb()
  const [[row]] = await db.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`, [SETTING_KEY],
  ) as any
  if (row?.setting_value === slot) return false
  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [SETTING_KEY, slot],
  )
  return true
}

/** Fire-and-forget — never throws, never awaited by callers. */
export function maybeTriggerProductionShortfallAlert(date: string, rows: any[]): void {
  ;(async () => {
    try {
      const short = rows.filter(r => r.still_needed_bags > 0)
      if (!short.length) return

      const now = new Date()
      const slot = `${date} ${now.getHours()}` // once per calendar hour
      const claimed = await claimHourSlot(slot)
      if (!claimed) return

      const lines = short
        .slice(0, 10)
        .map(r => `  · ${r.branch_name} — ${r.product}: short <b>${r.still_needed_bags}</b> bags` +
          (r.still_needed_kg ? ` (${r.still_needed_kg} kg)` : ''))
        .join('\n')

      await sendTelegram(
        `⚠️ <b>Production Shortfall — ${date}</b>\n\n${lines}` +
        (short.length > 10 ? `\n  …and ${short.length - 10} more` : ''),
        'production',
      )
    } catch (e) {
      console.warn('[production-requirement] shortfall alert failed:', e)
    }
  })()
}
