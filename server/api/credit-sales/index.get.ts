import { query, paginate, getDb } from '~/server/utils/db'
import { getUserBranchScope } from '~/server/utils/creditOrders'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''
  const page   = Number(q.page)   || 1
  const per    = Number(q.per)    || 25
  const { limit, offset } = paginate(page, per)

  const whereClauses: string[] = []
  const params: unknown[]      = []

  // Branch-coded roles (sales-srg, dispatch-demra, …) only see their branch
  const session = await getUserSession(event)
  if (session?.user) {
    const conn = await getDb().getConnection()
    try {
      const scope = await getUserBranchScope(
        conn, Number((session.user as any).id), ((session.user as any).role ?? '').toLowerCase(),
      )
      if (scope !== null) {
        whereClauses.push('o.assigned_branch_id = ?')
        params.push(scope)
      }
    } finally {
      conn.release()
    }
  }

  if (search) {
    whereClauses.push('(o.order_number LIKE ? OR c.name LIKE ? OR c.business_name LIKE ?)')
    const like = `%${search}%`
    params.push(like, like, like)
  }
  if (status) {
    whereClauses.push('o.status = ?')
    params.push(status)
  }

  const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''

  const [orders, totals] = await Promise.all([
    query(
      `SELECT o.id, o.order_number,
              DATE_FORMAT(o.order_date, '%d %b %Y') AS order_date,
              o.required_date, o.priority, o.total_amount, o.balance_due, o.amount_paid,
              o.total_weight_kg,
              -- Auto-heal: delivered + fully paid → completed (even if DB not updated yet)
              CASE WHEN o.status = 'delivered' AND o.balance_due = 0 THEN 'completed'
                   ELSE o.status END AS status,
              c.id AS customer_id, c.name AS customer_name, c.business_name,
              c.phone_number, c.credit_limit, c.current_balance
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(
      `SELECT COUNT(*) AS total FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id ${where}`,
      params,
    ),
  ])

  return {
    orders,
    total:   (totals[0] as any).total,
    page,
    perPage: limit,
  }
})
