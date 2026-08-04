import { getDb, queryOne } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * PATCH /api/admin/users/:id
 *
 * Regular update:   body = { display_name, email, role, status, password? }
 * Suspend account:  body = { action: 'suspend' }
 * Activate account: body = { action: 'activate' }
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const body      = await readBody(event)
  const session   = await getUserSession(event)
  const actorId   = session?.user?.id   ?? 1
  const actorName = session?.user?.name ?? session?.user?.email ?? 'System'

  // Prevent acting on own account for destructive actions
  const actionType = body?.action as string | undefined

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Fetch current user for comparison + guard
    const [[old]] = await conn.query<any>(
      `SELECT id, display_name, email, role, status FROM users WHERE id = ?`, [id],
    )
    if (!old) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    // ── SUSPEND ────────────────────────────────────────────────────────────────
    if (actionType === 'suspend') {
      if (old.id === actorId)
        throw createError({ statusCode: 400, statusMessage: 'Cannot suspend your own account' })
      if (old.status === 'suspended')
        throw createError({ statusCode: 400, statusMessage: 'User is already suspended' })
      if (old.role?.toLowerCase() === 'superadmin') {
        const [[{ c }]] = await conn.query<any>(
          `SELECT COUNT(*) AS c FROM users WHERE LOWER(role) = 'superadmin' AND status = 'active' AND id != ?`,
          [id],
        )
        if (Number(c) === 0)
          throw createError({ statusCode: 400, statusMessage: 'Cannot suspend the last active Superadmin — the org would be locked out' })
      }

      await conn.query(
        `UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = ?`, [id],
      )
      await auditLog(conn, {
        userId:      actorId,
        action:      'user_suspended',
        module:      'admin',
        recordType:  'user',
        recordId:    id,
        referenceNumber: old.email,
        description: `User "${old.display_name}" (${old.email}) [${old.role}] suspended by ${actorName}`,
        severity:    'warning',
      })
      await conn.commit()
      return { ok: true, action: 'suspended' }
    }

    // ── ACTIVATE ───────────────────────────────────────────────────────────────
    if (actionType === 'activate') {
      await conn.query(
        `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = ?`, [id],
      )
      await auditLog(conn, {
        userId:      actorId,
        action:      'user_activated',
        module:      'admin',
        recordType:  'user',
        recordId:    id,
        referenceNumber: old.email,
        description: `User "${old.display_name}" (${old.email}) [${old.role}] activated (was: ${old.status}) by ${actorName}`,
        severity:    'info',
      })
      await conn.commit()
      return { ok: true, action: 'activated' }
    }

    // ── REGULAR UPDATE ─────────────────────────────────────────────────────────
    const { display_name, email, role, status, password } = body ?? {}

    if (!display_name || !email || !role)
      throw createError({ statusCode: 400, statusMessage: 'display_name, email, and role are required' })

    const demotingSuperadmin = old.role?.toLowerCase() === 'superadmin' && role.toLowerCase() !== 'superadmin'
    const deactivating       = (status ?? 'active') !== 'active' && old.status === 'active'
    if (old.role?.toLowerCase() === 'superadmin' && (demotingSuperadmin || deactivating)) {
      const [[{ c }]] = await conn.query<any>(
        `SELECT COUNT(*) AS c FROM users WHERE LOWER(role) = 'superadmin' AND status = 'active' AND id != ?`,
        [id],
      )
      if (Number(c) === 0)
        throw createError({ statusCode: 400, statusMessage: 'Cannot demote or deactivate the last active Superadmin — the org would be locked out' })
    }

    const setClauses: string[] = [
      'display_name = ?',
      'email        = ?',
      'role         = ?',
      'status       = ?',
    ]
    const params: unknown[] = [
      display_name.trim(),
      email.toLowerCase().trim(),
      role,
      status ?? 'active',
    ]

    const pwdChanged = !!(password && password.length >= 8)
    if (pwdChanged) {
      setClauses.push('password_hash = ?', 'plain_password = ?')
      params.push(password, password)
    }

    params.push(id)
    await conn.query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params,
    )

    // Build a meaningful audit description
    const changes: string[] = []
    if (display_name.trim() !== old.display_name) changes.push(`name: "${old.display_name}" → "${display_name.trim()}"`)
    if (email.toLowerCase().trim() !== old.email)  changes.push(`email: ${old.email} → ${email.toLowerCase().trim()}`)
    if (role !== old.role)                          changes.push(`role: [${old.role}] → [${role}]`)
    if ((status ?? 'active') !== old.status)        changes.push(`status: ${old.status} → ${status ?? 'active'}`)
    if (pwdChanged)                                 changes.push('password changed')

    const roleChanged = role !== old.role
    const auditAction = pwdChanged
      ? 'user_pwd_changed'
      : roleChanged
      ? 'user_role_changed'
      : 'user_updated'

    await auditLog(conn, {
      userId:      actorId,
      action:      auditAction,
      module:      'admin',
      recordType:  'user',
      recordId:    id,
      referenceNumber: old.email,
      description: changes.length
        ? `User "${old.display_name}" updated by ${actorName}: ${changes.join(' · ')}`
        : `User "${old.display_name}" saved (no field changes) by ${actorName}`,
      severity:    (pwdChanged || roleChanged) ? 'warning' : 'info',
    })

    await conn.commit()
    return { ok: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
