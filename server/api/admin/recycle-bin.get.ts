import { query } from '~/server/utils/db'

/** GET /api/admin/recycle-bin?status=active — list delete batches. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const q = getQuery(event)
  const status = q.status ? String(q.status) : 'active'

  const batches = await query<any>(
    `SELECT b.*, c.name AS customer_name
     FROM recycle_bin_batches b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE (? = '' OR b.status = ?)
     ORDER BY b.deleted_at DESC
     LIMIT 300`,
    [status, status],
  )
  return { batches }
})
