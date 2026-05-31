import { query, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''
  const page   = Number(q.page) || 1
  const per    = Number(q.per)  || 15
  const { limit, offset } = paginate(page, per)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(p.payment_number LIKE ? OR p.reference_number LIKE ? OR c.name LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (status) { where.push('p.allocation_status = ?'); params.push(status) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [payments, [cnt]] = await Promise.all([
    query(
      `SELECT p.id,
              p.payment_number,
              p.reference_number,
              p.payment_date,
              p.amount,
              p.payment_method,
              p.payment_type,
              p.allocation_status,
              p.allocated_amount,
              p.notes,
              p.created_at,
              p.order_id,
              c.id   AS customer_id,
              c.name AS customer_name,
              o.order_number,
              u.display_name AS collected_by
       FROM   customer_payments p
       JOIN   customers c  ON c.id = p.customer_id
       LEFT JOIN credit_orders o ON o.id = p.order_id
       LEFT JOIN users u         ON u.id = p.created_by_user_id
       ${w}
       ORDER BY p.payment_date DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM   customer_payments p
       JOIN   customers c ON c.id = p.customer_id
       ${w}`,
      params,
    ) as any,
  ])

  return { payments, total: (cnt as any).total, page, perPage: per }
})
