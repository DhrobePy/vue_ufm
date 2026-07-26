/**
 * PUT /api/settings/credit-workflow
 * Body: { dispatch_global_hold: boolean, credit_limit_auto_release: boolean }
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can change credit workflow settings' })
  }

  const body = await readBody(event)
  const settings = {
    dispatch_global_hold:      body?.dispatch_global_hold !== undefined ? Boolean(body.dispatch_global_hold) : true,
    credit_limit_auto_release: Boolean(body?.credit_limit_auto_release),
    payment_require_approval:  body?.payment_require_approval !== undefined ? Boolean(body.payment_require_approval) : true,
  }

  await query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('credit_workflow_policy', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
    [JSON.stringify(settings)],
  )

  return { ok: true, settings }
})
