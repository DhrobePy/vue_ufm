/**
 * GET /api/admin/users/:id/permissions
 * Returns saved permission config for a user, or role-based defaults if none saved yet.
 * Admin / superadmin only.
 *
 * Gracefully handles the case where user_permissions table doesn't exist yet
 * (returns empty defaults) so the page never shows a hard error on first deploy.
 */
import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = (session?.user?.role ?? '').toLowerCase()

  // Superadmin only — matches legacy's admin/privileges.php exactly. A plain
  // admin editing another admin's (or a superadmin's) permissions, or
  // self-escalating, was a real gap here; the whole feature is locked down
  // rather than trying to carve out a partial "admin may edit non-admins" rule.
  if (role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Only a Superadmin can view user permissions' })
  }

  const targetId = Number(getRouterParam(event, 'id'))
  if (!targetId) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    // Load target user (this table always exists)
    // NOTE: column is `last_login` (not `last_login_at`) per actual schema
    const [[user]] = await conn.query<any>(
      `SELECT id, display_name, email, role, status, last_login FROM users WHERE id = ?`,
      [targetId],
    )
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    // Load saved permissions — wrapped in try/catch so a missing table
    // (before first server restart after db-migrate) returns clean defaults.
    let data_scope       = user.role === 'superadmin' || user.role === 'admin' ? 'all' : 'branch'
    let allowed_branches: string[] = ['srg']
    let permissions: Record<string, any> = {}

    try {
      const [[saved]] = await conn.query<any>(
        `SELECT data_scope, allowed_branches, permissions FROM user_permissions WHERE user_id = ?`,
        [targetId],
      )
      if (saved) {
        data_scope = saved.data_scope ?? data_scope
        try { allowed_branches = JSON.parse(saved.allowed_branches ?? '[]') ?? [] } catch { /* keep default */ }
        try { permissions      = JSON.parse(saved.permissions      ?? '{}') ?? {} } catch { /* keep default */ }
      }
    } catch {
      // Table may not exist yet on first deploy — return defaults silently
    }

    return {
      user: {
        id:         user.id,
        name:       user.display_name,
        email:      user.email,
        role:       user.role,
        status:     user.status,
        last_login: user.last_login,
      },
      data_scope,
      allowed_branches,
      permissions,
    }
  } finally {
    conn.release()
  }
})
