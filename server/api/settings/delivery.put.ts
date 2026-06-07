/**
 * PUT /api/settings/delivery
 * Saves delivery verification settings to system_settings.
 * Body: { require_dispatch_pin: boolean, require_delivery_pin: boolean }
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { require_dispatch_pin, require_delivery_pin } = body ?? {}

  const settings = {
    require_dispatch_pin:  require_dispatch_pin  !== undefined ? Boolean(require_dispatch_pin)  : true,
    require_delivery_pin:  require_delivery_pin  !== undefined ? Boolean(require_delivery_pin)  : false,
  }

  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('delivery_verification', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
    [JSON.stringify(settings)],
  )

  return { ok: true, settings }
})
