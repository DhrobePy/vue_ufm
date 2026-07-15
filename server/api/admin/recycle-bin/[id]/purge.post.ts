import { getDb } from '~/server/utils/db'
import { auditLog } from '~/server/utils/audit'
import { recyclePurge } from '~/server/utils/recycleBin'

/**
 * POST /api/admin/recycle-bin/:id/purge
 * Permanently forgets a batch — the snapshot itself is deleted. Irreversible;
 * superadmin only (a notch above the admin bar the rest of the recycle bin uses).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (role !== 'superadmin')
    throw createError({ statusCode: 403, statusMessage: 'Superadmin access required to permanently purge' })
  const userId   = Number((session?.user as any).id)
  const userName = (session?.user as any).name ?? `User ${userId}`

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid batch ID' })

  const [[batch]] = await getDb().query<any>(`SELECT entity_type, label FROM recycle_bin_batches WHERE id = ?`, [id])
  if (!batch) throw createError({ statusCode: 404, statusMessage: 'Batch not found' })

  await recyclePurge(getDb, id, userId)

  await auditLog(getDb() as any, {
    userId,
    action:          'other',
    module:          'admin',
    recordType:      'recycle_bin_batch',
    recordId:        id,
    referenceNumber: batch.label,
    description:     `Permanently purged from Recycle Bin — ${batch.entity_type} "${batch.label}" by ${userName} — unrecoverable`,
    severity:        'critical',
  })

  return { ok: true }
})
