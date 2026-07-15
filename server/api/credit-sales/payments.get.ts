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
    query<any>(
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

  // customer-level collections (Task 21) split across multiple orders via
  // payment_allocations and leave p.order_id NULL — resolve those here so
  // the list/detail views always have something to link to.
  const splitIds = payments.filter(p => !p.order_id).map(p => p.id)
  if (splitIds.length) {
    const allocations = await query<any>(
      `SELECT pa.payment_id, pa.order_id, pa.allocated_amount, o.order_number
       FROM   payment_allocations pa
       JOIN   credit_orders o ON o.id = pa.order_id
       WHERE  pa.payment_id IN (${splitIds.map(() => '?').join(',')})
       ORDER BY pa.id`,
      splitIds,
    )
    const byPayment = new Map<number, any[]>()
    for (const a of allocations) {
      if (!byPayment.has(a.payment_id)) byPayment.set(a.payment_id, [])
      byPayment.get(a.payment_id)!.push({
        order_id: a.order_id, order_number: a.order_number, amount: a.allocated_amount,
      })
    }
    for (const p of payments) {
      if (!p.order_id) (p as any).allocations = byPayment.get(p.id) ?? []
    }
  }

  return { payments, total: (cnt as any).total, page, perPage: per }
})
