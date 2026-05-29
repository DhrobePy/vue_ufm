import { query, paginate } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''
  const page   = Number(q.page) || 1
  const { limit, offset } = paginate(page, 25)

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(o.po_number LIKE ? OR o.supplier_name LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
  if (status) { where.push('o.po_status = ?'); params.push(status) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [orders, [cnt]] = await Promise.all([
    query(
      `SELECT o.id, o.po_number, o.po_date, o.supplier_name, o.wheat_origin,
              o.quantity_kg, o.unit_price_per_kg, o.total_order_value,
              o.total_received_qty, o.qty_yet_to_receive,
              o.total_paid, o.balance_payable,
              o.po_status, o.delivery_status, o.payment_status,
              o.is_delivery_locked, o.expected_delivery_date,
              b.name AS branch_name
       FROM purchase_orders_adnan o
       LEFT JOIN branches b ON b.id = o.branch_id
       ${w}
       ORDER BY o.po_date DESC, o.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM purchase_orders_adnan o ${w}`, params) as any,
  ])

  return { orders, total: (cnt as any).total, page, perPage: limit }
})
