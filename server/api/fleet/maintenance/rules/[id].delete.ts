import { getDb, queryOne } from '~/server/utils/db'
import { recycleBegin, recycleArchiveDelete, recycleFinalize } from '~/server/utils/recycleBin'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const session  = await getUserSession(event)
  const userId   = (session?.user as any)?.id   ?? 1
  const userName = (session?.user as any)?.name ?? 'System'

  const rule = await queryOne<any>(`SELECT id, rule_name FROM preventive_maintenance_rules WHERE id = ?`, [id])
  if (!rule) throw createError({ statusCode: 404, statusMessage: 'Rule not found' })

  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const batchId = await recycleBegin(conn, {
      entityType: 'maintenance_rule', label: rule.rule_name ?? `Rule-${id}`, userId, userName,
    })
    await recycleArchiveDelete(conn, batchId, 'preventive_maintenance_rules', 'id', id)
    await recycleFinalize(conn, batchId)
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
  return { ok: true }
})
