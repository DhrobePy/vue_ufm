import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { sendTelegram } from '~/server/utils/telegram'
import { recycleRestore } from '~/server/utils/recycleBin'

/** POST /api/admin/recycle-bin/:id/restore */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  const userId   = Number((session?.user as any).id)
  const userName = (session?.user as any).name ?? `User ${userId}`

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid batch ID' })

  const [[batch]] = await getDb().query<any>(`SELECT entity_type, label FROM recycle_bin_batches WHERE id = ?`, [id])
  if (!batch) throw createError({ statusCode: 404, statusMessage: 'Batch not found' })

  const result = await recycleRestore(getDb, id, userId)

  await auditLog(getDb() as any, {
    userId,
    action:          'other',
    module:          'admin',
    recordType:      'recycle_bin_batch',
    recordId:        id,
    referenceNumber: batch.label,
    description:     `Restored from Recycle Bin — ${batch.entity_type} "${batch.label}" (${result.restored} rows) by ${userName}`,
    severity:        'critical',
  })

  sendTelegram(
    `♻️ <b>Restored from Recycle Bin</b>\n${batch.entity_type}: ${batch.label}\n${result.restored} rows restored · by ${userName}`,
  )

  return { ok: true, ...result }
})
