/**
 * GET /api/settings/delivery
 * Returns current delivery verification settings from system_settings.
 */
import { query } from '~/server/utils/db'

const DEFAULTS = {
  require_dispatch_pin:  true,   // Dispatcher must enter PIN on invoice to confirm dispatch
  require_delivery_pin:  false,  // Driver-side confirmation — provisioned, not active yet
}

export default defineEventHandler(async () => {
  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`,
    ) as any[]
    if (rows[0]?.setting_value) {
      const parsed = JSON.parse(rows[0].setting_value)
      return { settings: { ...DEFAULTS, ...parsed } }
    }
  } catch { /* fall through */ }
  return { settings: { ...DEFAULTS } }
})
