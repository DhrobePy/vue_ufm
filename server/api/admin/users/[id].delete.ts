import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/**
 * DELETE /api/admin/users/:id
 *
 * Soft-deletes the user: sets status = 'deleted'.
 * The row is retained for audit trail and foreign-key integrity.
 * A user cannot delete their own account.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const session   = await getUserSession(event)
  const actorId   = session?.user?.id   ?? 1
  const actorName = session?.user?.name ?? session?.user?.email ?? 'System'

  if (id === actorId)
    throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account' })

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [[target]] = await conn.query<any>(
      `SELECT id, display_name, email, role, status FROM users WHERE id = ?`, [id],
    )
    if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    if (target.status === 'deleted')
      throw createError({ statusCode: 400, statusMessage: 'User is already deleted' })

    if (target.role?.toLowerCase() === 'superadmin') {
      const [[{ c }]] = await conn.query<any>(
        `SELECT COUNT(*) AS c FROM users WHERE LOWER(role) = 'superadmin' AND status != 'deleted' AND id != ?`,
        [id],
      )
      if (Number(c) === 0)
        throw createError({ statusCode: 400, statusMessage: 'Cannot delete the last remaining Superadmin — the org would be locked out' })
    }

    // Soft delete — preserve row for audit / FK integrity
    await conn.query(
      `UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = ?`, [id],
    )

    await auditLog(conn, {
      userId:      actorId,
      action:      'user_deleted',
      module:      'admin',
      recordType:  'user',
      recordId:    id,
      referenceNumber: target.email,
      description: `User "${target.display_name}" (${target.email}) [${target.role}] deleted by ${actorName}`,
      severity:    'critical',
    })

    await conn.commit()
    return { ok: true, message: `${target.display_name} has been deleted` }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
