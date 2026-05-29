import { query, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const page   = Number(q.page) || 1
  const { limit, offset } = paginate(page, 25)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(g.grn_number LIKE ? OR g.supplier_name LIKE ? OR g.po_number LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [grns, [cnt]] = await Promise.all([
    query(
      `SELECT g.id, g.grn_number, g.grn_date, g.po_number, g.supplier_name,
              g.quantity_received_kg, g.unit_price_per_kg, g.total_value,
              g.weight_variance, g.variance_percentage, g.grn_status,
              g.truck_number, g.unload_point_name,
              b.name AS unload_branch_name
       FROM goods_received_adnan g
       LEFT JOIN branches b ON b.id = g.unload_point_branch_id
       ${w}
       ORDER BY g.grn_date DESC, g.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM goods_received_adnan g ${w}`, params) as any,
  ])

  return { grns, total: (cnt as any).total, page, perPage: limit }
})
