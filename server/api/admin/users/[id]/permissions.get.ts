/**
 * GET /api/admin/users/:id/permissions
 * Returns saved permission config for a user, or role-based defaults if none saved yet.
 * Admin / superadmin only.
 */
import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = (session?.user?.role ?? '').toLowerCase()

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can view permissions' })
  }

  const targetId = Number(getRouterParam(event, 'id'))
  if (!targetId) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    // Load target user
    const [[user]] = await conn.query<any>(
      `SELECT id, display_name, email, role, status, last_login_at FROM users WHERE id = ?`,
      [targetId],
    )
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    // Load saved permissions (if any)
    const [[saved]] = await conn.query<any>(
      `SELECT data_scope, allowed_branches, permissions FROM user_permissions WHERE user_id = ?`,
      [targetId],
    )

    let data_scope       = saved?.data_scope       ?? 'branch'
    let allowed_branches: string[] = []
    let permissions: Record<string, any> = {}

    if (saved) {
      try { allowed_branches = JSON.parse(saved.allowed_branches ?? '[]') ?? [] } catch { allowed_branches = [] }
      try { permissions      = JSON.parse(saved.permissions      ?? '{}') ?? {} } catch { permissions = {} }
    } else {
      // Role-based defaults: give managers a sensible starting set
      data_scope = user.role === 'superadmin' || user.role === 'admin' ? 'all' : 'branch'
      allowed_branches = ['srg']
    }

    return {
      user: {
        id:         user.id,
        name:       user.display_name,
        email:      user.email,
        role:       user.role,
        status:     user.status,
        last_login: user.last_login_at,
      },
      data_scope,
      allowed_branches,
      permissions,
    }
  } finally {
    conn.release()
  }
})
