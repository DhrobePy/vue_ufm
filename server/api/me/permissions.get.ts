/**
 * GET /api/me/permissions
 * Returns the logged-in user's own permission config.
 * Used by the client to enforce sidebar visibility and route access.
 */
import { query } from '~/server/utils/db'
import { resolvePermissions } from '~/server/utils/permissions'
import { presetBranches } from '~/server/utils/permCatalog'

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

  const perms = await resolvePermissions(userId, role)
  const { __preset, ...permissions } = perms as Record<string, any>

  let data_scope       = 'branch'
  let allowed_branches: string[] = presetBranches(role)
  try {
    const [row] = await query<any>(
      `SELECT data_scope, allowed_branches FROM user_permissions WHERE user_id = ?`, [userId])
    if (row) {
      data_scope = row.data_scope ?? 'branch'
      try { allowed_branches = JSON.parse(row.allowed_branches ?? '[]') } catch { allowed_branches = [] }
    }
  } catch { /* table missing — defaults */ }

  return { isAdmin: false, permissions, data_scope, allowed_branches }
})
