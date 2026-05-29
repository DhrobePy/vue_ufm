import { query, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''
  const page   = Number(q.page) || 1
  const { limit, offset } = paginate(page, 30)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(p.reference_number LIKE ? OR c.name LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
  if (status) { where.push('p.allocation_status = ?'); params.push(status) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [payments, [cnt]] = await Promise.all([
    query(
      `SELECT p.id, p.reference_number, p.payment_date, p.amount,
              p.allocated_amount, p.allocation_status, p.payment_method,
              p.notes, p.status, p.created_at,
              c.id AS customer_id, c.name AS customer_name
       FROM customer_payments p
       JOIN customers c ON c.id = p.customer_id
       ${w}
       ORDER BY p.payment_date DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM customer_payments p JOIN customers c ON c.id = p.customer_id ${w}`, params) as any,
  ])

  return { payments, total: (cnt as any).total, page, perPage: limit }
})
