import { query, queryOne } from '~/server/utils/db'

/** GET /api/admin/recycle-bin/:id — batch detail + what it contains, for review before restoring. */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role = ((session?.user as any)?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role))
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid batch ID' })

  const batch = await queryOne<any>(
    `SELECT b.*, c.name AS customer_name
     FROM recycle_bin_batches b
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.id = ?`,
    [id],
  )
  if (!batch) throw createError({ statusCode: 404, statusMessage: 'Batch not found' })

  // Summarize items by table rather than dumping every full JSON snapshot —
  // this view is "what's in here", not a raw data browser.
  const items = await query<any>(
    `SELECT table_name, op, COUNT(*) AS row_count
     FROM recycle_bin_items WHERE batch_id = ?
     GROUP BY table_name, op
     ORDER BY MIN(id) ASC`,
    [id],
  )
  return { batch, items }
})
