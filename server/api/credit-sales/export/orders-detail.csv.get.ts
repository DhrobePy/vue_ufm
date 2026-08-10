import { query } from '~/server/utils/db'

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Credit orders — detailed CSV, one row per line item.
 * Adds product/variant detail, delivery/truck info, and workflow milestone
 * timestamps (approved/dispatched/delivered) that the summary export
 * (orders.csv.get.ts) doesn't carry. Optional ?status= & ?from= & ?to= & ?customer_id=.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const q = getQuery(event)
  const conds: string[] = []
  const params: any[] = []
  if (q.status)      { conds.push('o.status = ?');       params.push(String(q.status)) }
  if (q.customer_id) { conds.push('o.customer_id = ?');  params.push(Number(q.customer_id)) }
  if (q.from) { conds.push('o.order_date >= ?'); params.push(String(q.from)) }
  if (q.to)   { conds.push('o.order_date <= ?'); params.push(String(q.to)) }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

  const orders = await query<any>(
    `SELECT o.id, o.order_number, o.order_date, c.name AS customer, b.name AS branch,
            o.status, o.priority, o.delivery_type,
            o.subtotal, o.mini_truck_surcharge, o.total_amount,
            o.advance_paid, o.amount_paid, o.balance_due
     FROM credit_orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN branches b ON b.id = o.assigned_branch_id
     ${where}
     ORDER BY o.id DESC
     LIMIT 10000`,
    params,
  )

  if (!orders.length) {
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition',
      `attachment; filename="credit-orders-detail-${new Date().toISOString().slice(0, 10)}.csv"`)
    return '﻿Order,Date,Customer,Branch,Status,Priority,Delivery,Product,Variant,QtyBags,LineAmount,TruckNumber,DriverName,DeliveryDate,DeliveredQty,Approved,Dispatched,Delivered'
  }

  const orderIds = orders.map((o: any) => o.id)

  const items = await query<any>(
    `SELECT oi.order_id, p.base_name AS product_name, pv.weight_variant,
            oi.quantity AS qty_bags, oi.line_total AS line_amount
     FROM credit_order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     WHERE oi.order_id IN (?)
     ORDER BY oi.order_id, oi.id`,
    [orderIds],
  )

  const deliveries = await query<any>(
    `SELECT order_id, truck_number, driver_name, delivery_date, total_qty_delivered
     FROM credit_order_deliveries
     WHERE order_id IN (?)
     ORDER BY order_id, delivery_date DESC`,
    [orderIds],
  )

  const workflow = await query<any>(
    `SELECT order_id, to_status, performed_at
     FROM credit_order_workflow
     WHERE order_id IN (?) AND to_status IN ('approved', 'goods_on_board', 'delivered')
     ORDER BY order_id, performed_at ASC`,
    [orderIds],
  )

  const itemsByOrder = new Map<number, any[]>()
  for (const it of items) {
    if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, [])
    itemsByOrder.get(it.order_id)!.push(it)
  }
  const deliveryByOrder = new Map<number, any>()
  for (const d of deliveries) if (!deliveryByOrder.has(d.order_id)) deliveryByOrder.set(d.order_id, d)
  const milestoneByOrder = new Map<number, { approved?: string; goods_on_board?: string; delivered?: string }>()
  for (const w of workflow) {
    const m = milestoneByOrder.get(w.order_id) ?? {}
    ;(m as any)[w.to_status] = w.performed_at
    milestoneByOrder.set(w.order_id, m)
  }

  const header = 'Order,Date,Customer,Branch,Status,Priority,Delivery,Product,Variant,QtyBags,LineAmount,TruckNumber,DriverName,DeliveryDate,DeliveredQty,Approved,Dispatched,Delivered'
  const lines: string[] = []

  for (const o of orders) {
    const orderItems = itemsByOrder.get(o.id) ?? [{ product_name: '', weight_variant: '', qty_bags: '', line_amount: '' }]
    const d = deliveryByOrder.get(o.id) ?? {}
    const m = milestoneByOrder.get(o.id) ?? {}
    for (const it of orderItems) {
      lines.push([
        o.order_number, String(o.order_date).slice(0, 10), o.customer, o.branch,
        o.status, o.priority, o.delivery_type,
        it.product_name, it.weight_variant, it.qty_bags, it.line_amount,
        d.truck_number ?? '', d.driver_name ?? '', d.delivery_date ? String(d.delivery_date).slice(0, 10) : '',
        d.total_qty_delivered ?? '',
        m.approved ? String(m.approved).slice(0, 16).replace('T', ' ') : '',
        m.goods_on_board ? String(m.goods_on_board).slice(0, 16).replace('T', ' ') : '',
        m.delivered ? String(m.delivered).slice(0, 16).replace('T', ' ') : '',
      ].map(csvCell).join(','))
    }
  }

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition',
    `attachment; filename="credit-orders-detail-${new Date().toISOString().slice(0, 10)}.csv"`)
  return '﻿' + [header, ...lines].join('\n')
})
