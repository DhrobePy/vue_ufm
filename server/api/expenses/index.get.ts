import { query, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q           = getQuery(event)
  const search      = (q.search     as string) || ''
  const status      = (q.status     as string) || ''
  const branch_id   = Number(q.branch_id)   || 0
  const category_id = Number(q.category_id) || 0
  const date_from   = (q.date_from  as string) || ''
  const date_to     = (q.date_to    as string) || ''
  const page        = Number(q.page) || 1
  const perPage     = Number(q.per)  || 25
  const { limit, offset } = paginate(page, perPage)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(e.voucher_number LIKE ? OR e.handled_by_person LIKE ? OR cat.category_name LIKE ? OR e.remarks LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (status)      { where.push('e.status = ?');         params.push(status) }
  if (branch_id)   { where.push('e.branch_id = ?');      params.push(branch_id) }
  if (category_id) { where.push('e.category_id = ?');    params.push(category_id) }
  if (date_from)   { where.push('e.expense_date >= ?');  params.push(date_from) }
  if (date_to)     { where.push('e.expense_date <= ?');  params.push(date_to) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const baseJoins = `
    FROM expense_vouchers e
    LEFT JOIN expense_categories cat    ON cat.id = e.category_id
    LEFT JOIN expense_subcategories sub ON sub.id = e.subcategory_id
    LEFT JOIN branches b ON b.id = e.branch_id`

  const [expenses, [cnt], stats] = await Promise.all([
    query(
      `SELECT e.id, e.voucher_number, e.expense_date, e.total_amount,
              e.payment_method, e.status, e.remarks, e.handled_by_person,
              e.unit_quantity, e.per_unit_cost, e.created_at,
              cat.category_name, sub.subcategory_name,
              cr.display_name AS created_by_name,
              ap.display_name AS approved_by_name,
              b.name AS branch_name
       ${baseJoins}
       LEFT JOIN users cr ON cr.id = e.created_by_user_id
       LEFT JOIN users ap ON ap.id = e.approved_by_user_id
       ${w}
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(
      `SELECT COUNT(*) AS total ${baseJoins} ${w}`,
      params,
    ) as any,
    // Stats (unfiltered by date/search for card consistency, only status-split)
    query(
      `SELECT
         COUNT(*)                                                    AS total_count,
         SUM(status = 'pending')                                     AS pending_count,
         SUM(status = 'approved')                                    AS approved_count,
         SUM(status = 'rejected')                                    AS rejected_count,
         COALESCE(SUM(CASE WHEN status='approved' THEN total_amount ELSE 0 END), 0) AS approved_amount,
         COALESCE(SUM(CASE WHEN status='pending'  THEN total_amount ELSE 0 END), 0) AS pending_amount
       FROM expense_vouchers`,
      [],
    ) as any,
  ])

  const s = (stats as any[])[0] ?? {}

  return {
    expenses,
    total:   Number((cnt as any).total),
    page,
    perPage: limit,
    stats: {
      totalCount:     Number(s.total_count    ?? 0),
      pendingCount:   Number(s.pending_count  ?? 0),
      approvedCount:  Number(s.approved_count ?? 0),
      rejectedCount:  Number(s.rejected_count ?? 0),
      approvedAmount: Number(s.approved_amount ?? 0),
      pendingAmount:  Number(s.pending_amount  ?? 0),
    },
  }
})
