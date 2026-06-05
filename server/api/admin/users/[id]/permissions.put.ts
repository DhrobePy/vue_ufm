/**
 * PUT /api/admin/users/:id/permissions
 * Saves (upserts) permission config for a user.
 * Admin / superadmin only.
 *
 * Body: { data_scope: string, allowed_branches: string[], permissions: Record<string,any> }
 */
import { getDb }   from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  const session  = await getUserSession(event)
  const role     = (session?.user?.role ?? '').toLowerCase()
  const actorId  = session?.user?.id ?? 1
  const ipAddress = getRequestHeader(event, 'x-forwarded-for') ?? getRequestHeader(event, 'x-real-ip') ?? undefined

  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admin/superadmin can update permissions' })
  }

  const targetId = Number(getRouterParam(event, 'id'))
  if (!targetId) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const {
    data_scope       = 'branch',
    allowed_branches = [],
    permissions      = {},
  } = body

  if (!['all', 'branch', 'own'].includes(data_scope)) {
    throw createError({ statusCode: 400, statusMessage: 'data_scope must be all | branch | own' })
  }
  if (!Array.isArray(allowed_branches)) {
    throw createError({ statusCode: 400, statusMessage: 'allowed_branches must be an array' })
  }
  if (typeof permissions !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'permissions must be an object' })
  }

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Verify target user exists
    const [[user]] = await conn.query<any>(
      `SELECT id, display_name, role FROM users WHERE id = ?`, [targetId],
    )
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    await conn.query(
      `INSERT INTO user_permissions
         (user_id, data_scope, allowed_branches, permissions, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         data_scope       = VALUES(data_scope),
         allowed_branches = VALUES(allowed_branches),
         permissions      = VALUES(permissions),
         updated_by       = VALUES(updated_by),
         updated_at       = NOW()`,
      [
        targetId,
        data_scope,
        JSON.stringify(allowed_branches),
        JSON.stringify(permissions),
        actorId,
      ],
    )

    // Count enabled modules for the audit description
    const enabledModules = Object.entries(permissions as Record<string, any>)
      .filter(([, v]) => v?.enabled)
      .map(([k]) => k)

    await auditLog(conn, {
      userId:      actorId,
      action:      'permissions_updated',
      module:      'admin',
      recordType:  'user_permissions',
      recordId:    targetId,
      description: `Permissions updated for user "${user.display_name}" (${user.role}) — scope: ${data_scope} — ${enabledModules.length} modules enabled`,
      severity:    'warning',
      ipAddress,
    })

    await conn.commit()
    return { ok: true, user_id: targetId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
