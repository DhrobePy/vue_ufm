/**
 * GET /api/verify/can-deliver
 * Tells the public scan page whether the current visitor is allowed to
 * confirm final delivery via QR.
 *
 * Allowed when logged into the ERP AND (role is admin/superadmin OR the
 * user id is in delivery_confirm_user_ids from Settings → Delivery).
 * Anonymous visitors simply get { allowed: false } — never an error.
 */
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user    = session?.user as any
  if (!user?.id) return { allowed: false }

  const role = (user.role ?? '').toLowerCase()
  if (['admin', 'superadmin'].includes(role)) {
    return { allowed: true, user_name: user.display_name ?? user.name ?? '' }
  }

  try {
    const rows = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'delivery_verification'`,
    ) as any[]
    const ids: number[] = rows[0]?.setting_value
      ? (JSON.parse(rows[0].setting_value).delivery_confirm_user_ids ?? [])
      : []
    if (ids.map(Number).includes(Number(user.id))) {
      return { allowed: true, user_name: user.display_name ?? user.name ?? '' }
    }
  } catch { /* fall through */ }

  return { allowed: false }
})
