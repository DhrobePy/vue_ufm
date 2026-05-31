import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q          = getQuery(event)
  const noteType   = (q.note_type   as string) || ''
  const status     = (q.status      as string) || ''
  const dateFrom   = (q.date_from   as string) || ''
  const dateTo     = (q.date_to     as string) || ''
  const search     = (q.search      as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (noteType)  { where.push('note_type = ?');              params.push(noteType) }
  if (status)    { where.push('status = ?');                 params.push(status) }
  if (dateFrom)  { where.push('DATE(created_at) >= ?');      params.push(dateFrom) }
  if (dateTo)    { where.push('DATE(created_at) <= ?');      params.push(dateTo) }
  if (search) {
    where.push('(note_number LIKE ? OR po_number LIKE ? OR supplier_name LIKE ?)')
    const like = `%${search}%`
    params.push(like, like, like)
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const notes = await query(
    `SELECT id, note_number, note_type, reason_type, purchase_order_id, po_number,
            supplier_id, supplier_name, quantity_kg, amount, status, created_at, approved_at, posted_at
     FROM purchase_adjustment_notes
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT 500`,
    params,
  ) as any[]

  return { notes }
})
