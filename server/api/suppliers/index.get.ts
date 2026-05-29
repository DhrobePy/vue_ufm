import { query, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const page   = Number(q.page) || 1
  const { limit, offset } = paginate(page, 25)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(s.company_name LIKE ? OR s.supplier_code LIKE ? OR s.phone LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [suppliers, [cnt]] = await Promise.all([
    query(
      `SELECT s.id, s.supplier_code, s.company_name, s.contact_person,
              s.phone, s.mobile, s.city, s.country, s.supplier_type,
              s.payment_terms, s.credit_limit, s.current_balance, s.status,
              COUNT(DISTINCT o.id) AS total_pos
       FROM suppliers s
       LEFT JOIN purchase_orders_adnan o ON o.supplier_id = s.id
       ${w}
       GROUP BY s.id
       ORDER BY s.company_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM suppliers s ${w}`, params) as any,
  ])

  return { suppliers, total: (cnt as any).total, page, perPage: limit }
})
