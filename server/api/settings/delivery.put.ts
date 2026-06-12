/**
 * PUT /api/settings/delivery
 * Saves delivery verification settings to system_settings.
 * Body: { require_dispatch_pin: boolean, delivery_confirm_user_ids: number[] }
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can change delivery settings' })
  }

  const body = await readBody(event)
  const { require_dispatch_pin, delivery_confirm_user_ids } = body ?? {}

  const settings = {
    require_dispatch_pin: require_dispatch_pin !== undefined ? Boolean(require_dispatch_pin) : true,
    delivery_confirm_user_ids: Array.isArray(delivery_confirm_user_ids)
      ? delivery_confirm_user_ids.map(Number).filter(n => Number.isFinite(n) && n > 0)
      : [],
  }

  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('delivery_verification', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
    [JSON.stringify(settings)],
  )

  return { ok: true, settings }
})
