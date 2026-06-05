/**
 * GET /api/me/permissions
 * Returns the logged-in user's own permission config.
 * Used by the client to enforce sidebar visibility and route access.
 */
import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const userId = session.user.id
  const role   = (session.user.role ?? '').toLowerCase()

  // Admins and superadmins bypass all permission checks
  if (['admin', 'superadmin'].includes(role)) {
    return { isAdmin: true, permissions: {}, data_scope: 'all', allowed_branches: [] }
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    let permissions: Record<string, any> = {}
    let data_scope       = 'branch'
    let allowed_branches: string[] = []

    try {
      const [[row]] = await conn.query<any>(
        `SELECT data_scope, allowed_branches, permissions FROM user_permissions WHERE user_id = ?`,
        [userId],
      )
      if (row) {
        data_scope = row.data_scope ?? 'branch'
        try { allowed_branches = JSON.parse(row.allowed_branches ?? '[]') } catch { /* keep default */ }
        try { permissions      = JSON.parse(row.permissions      ?? '{}') } catch { /* keep default */ }
      }
    } catch {
      // user_permissions table may not exist yet — return empty (no access until configured)
    }

    return { isAdmin: false, permissions, data_scope, allowed_branches }
  } finally {
    conn.release()
  }
})
