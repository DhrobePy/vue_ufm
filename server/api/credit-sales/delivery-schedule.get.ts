import { query } from '~/server/utils/db'
import { requireAction } from '~/server/utils/permissions'
import { ACCOUNTS_ROLES, PRODUCTION_ROLES } from '~/server/utils/creditOrders'

/**
 * GET /api/credit-sales/delivery-schedule?tab=schedule|overdue&order=&customer=&vehicle=&from=&to=&branch=
 * Orders still to be delivered (approved … shipped), by required date then drag-drop priority.
 */
export default defineEventHandler(async (event) => {
  await requireAction(event, { module: 'credit_sales', page: 'delivery-schedule', action: 'view', roleFallback: [...ACCOUNTS_ROLES, ...PRODUCTION_ROLES] })
  const q = getQuery(event)
  const today = new Date().toISOString().slice(0, 10)
  const tab = q.tab === 'overdue' ? 'overdue' : 'schedule'

  const where = [`co.status IN ('approved','in_production','produced','ready_to_ship','shipped')`, 'co.assigned_branch_id IS NOT NULL',
    `co.required_date ${tab === 'overdue' ? '<' : '>='} ?`]
  const params: any[] = [today]
  if (q.order)    { where.push('co.order_number LIKE ?'); params.push(`%${q.order}%`) }
  if (q.customer) { where.push('(c.name LIKE ? OR c.phone_number LIKE ?)'); params.push(`%${q.customer}%`, `%${q.customer}%`) }
  if (['big_truck', 'mini_truck'].includes(String(q.vehicle))) { where.push('co.delivery_type = ?'); params.push(q.vehicle) }
  if (q.from)     { where.push('co.required_date >= ?'); params.push(q.from) }
  if (q.to)       { where.push('co.required_date <= ?'); params.push(q.to) }
  if (Number(q.branch)) { where.push('co.assigned_branch_id = ?'); params.push(Number(q.branch)) }

  const orders: any[] = await query(
    `SELECT co.id, co.order_number, co.order_date, co.required_date, co.delivery_type, co.status,
            co.assigned_branch_id, co.delivery_priority,
            c.name AS customer_name, c.phone_number AS customer_phone, b.name AS branch_name
     FROM credit_orders co
     JOIN customers c ON c.id = co.customer_id
     LEFT JOIN branches b ON b.id = co.assigned_branch_id
     WHERE ${where.join(' AND ')}
     ORDER BY co.required_date ASC, co.delivery_priority ASC, co.id ASC
     LIMIT 500`, params) as any[]

  if (orders.length) {
    const ids = orders.map(o => o.id)
    const items: any[] = await query(
      `SELECT coi.order_id, coi.quantity, p.base_name AS product_name, pv.grade, pv.weight_variant
       FROM credit_order_items coi
       LEFT JOIN products p ON p.id = coi.product_id
       LEFT JOIN product_variants pv ON pv.id = coi.variant_id
       WHERE coi.order_id IN (${ids.map(() => '?').join(',')}) ORDER BY coi.order_id, coi.id`, ids) as any[]
    const by = new Map<number, any[]>()
    for (const it of items) (by.get(it.order_id) ?? by.set(it.order_id, []).get(it.order_id)!).push(it)
    for (const o of orders) o.items = by.get(o.id) ?? []
  }
  const branches = await query(`SELECT id, name FROM branches WHERE status = 'active' ORDER BY name`)
  return { orders, branches, today }
})
