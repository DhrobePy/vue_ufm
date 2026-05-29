import { query, queryOne, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''
  const page   = Number(q.page)       || 1
  const { limit, offset } = paginate(page, 20)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(dv.voucher_number LIKE ? OR dv.paid_to LIKE ? OR dv.description LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (status) { where.push('dv.status = ?'); params.push(status) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [vouchers, [cnt], stats] = await Promise.all([
    query(
      `SELECT dv.id, dv.voucher_number, dv.voucher_date AS date,
              dv.paid_to, dv.description AS purpose,
              dv.amount, dv.status,
              ea.name AS expense_account,
              pa.name AS payment_account,
              u.display_name AS created_by
       FROM debit_vouchers dv
       LEFT JOIN chart_of_accounts ea ON ea.id = dv.expense_account_id
       LEFT JOIN chart_of_accounts pa ON pa.id = dv.payment_account_id
       LEFT JOIN users u ON u.id = dv.created_by_user_id
       ${w}
       ORDER BY dv.voucher_date DESC, dv.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ) as any[],

    query(`SELECT COUNT(*) AS total FROM debit_vouchers dv ${w}`, params) as any,

    queryOne(
      `SELECT
         SUM(DATE(voucher_date) = CURDATE())   AS today_count,
         SUM(CASE WHEN DATE(voucher_date) = CURDATE() THEN amount ELSE 0 END) AS today_total,
         SUM(status = 'draft')                 AS pending_count,
         SUM(CASE WHEN MONTH(voucher_date) = MONTH(CURDATE()) THEN amount ELSE 0 END) AS month_total
       FROM debit_vouchers`,
    ) as any,
  ])

  return {
    vouchers,
    total:   (cnt as any).total,
    page,
    perPage: limit,
    stats,
  }
})
