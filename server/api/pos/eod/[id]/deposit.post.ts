import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'

/** POST /api/pos/eod/:id/deposit — next-day bank deposit confirmation for an approved EOD count. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Accounts/Admin only' })
  const userId = Number((session!.user as any).id)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event).catch(() => ({}))
  const reference = String(body?.deposit_reference ?? '').trim()
  if (!reference) throw createError({ statusCode: 400, statusMessage: 'A deposit reference is required' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const [[row]] = await conn.query<any>(`SELECT * FROM cash_verification_log WHERE id = ? FOR UPDATE`, [id])
    if (!row) throw createError({ statusCode: 404, statusMessage: 'EOD entry not found' })
    if (row.status !== 'approved') throw createError({ statusCode: 409, statusMessage: 'Only approved EOD counts can be marked deposited' })
    if (row.deposited_at) throw createError({ statusCode: 409, statusMessage: 'Already marked deposited' })

    await conn.query(
      `UPDATE cash_verification_log SET deposited_at = NOW(), deposited_by_user_id = ?, deposit_reference = ? WHERE id = ?`,
      [userId, reference, id],
    )
    await auditLog(conn, {
      userId, action: 'updated', module: 'other', recordType: 'cash_verification', recordId: id,
      description: `EOD cash deposit confirmed — ref ${reference}`,
      severity: 'info',
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
