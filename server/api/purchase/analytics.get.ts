import { query } from '~/server/utils/db'

/**
 * GET /api/purchase/analytics?date_from&date_to&scope=open|all&origin=&supplier_id=&delivery_status=
 * Purchase analytics (legacy purchase/reports.php, minus its AI commentary): headline KPIs, supplier performance, procurement by origin,
 * receipts by unloading point, and a PO-by-PO detail. scope=open (legacy default) looks at orders not yet completed/closed.
 * "Payable" = what the supplier has billed (expected qty × PO price) + posted adjustments − paid.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!['admin', 'superadmin'].includes(String((session?.user as any)?.role ?? '').toLowerCase()))
    throw createError({ statusCode: 403, statusMessage: 'Purchase analytics is for admin / superadmin' })
  const q = getQuery(event)
  const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
  const ok = (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ''))
  let from = ok(q.date_from) ? String(q.date_from) : new Date(Date.now() + 6 * 3600_000 - 29 * 86400_000).toISOString().slice(0, 10)
  let to = ok(q.date_to) ? String(q.date_to) : today
  if (from > to) [from, to] = [to, from]
  const openOnly = String(q.scope ?? 'open') !== 'all'
  const scopeSql = `po.po_status <> 'cancelled'${openOnly ? ` AND po.delivery_status NOT IN ('closed','completed')` : ''}`
  const num = (v: any) => Number(v ?? 0)

  const billed = `(SELECT purchase_order_id, SUM(expected_quantity) AS exp_qty FROM goods_received_adnan WHERE grn_status <> 'cancelled' GROUP BY purchase_order_id) g`
  const payable = `COALESCE(g.exp_qty,0) * po.unit_price_per_kg + COALESCE(po.total_adjustment_amount,0) - COALESCE(po.total_paid,0)`

  const [k] = await query<any>(
    `SELECT COUNT(*) orders, COALESCE(SUM(po.total_order_value),0) order_value, COALESCE(SUM(po.quantity_kg),0) ordered_kg, COALESCE(SUM(po.total_received_qty),0) received_kg,
            COALESCE(SUM(po.total_received_value),0) received_value, COALESCE(SUM(po.total_paid),0) paid, COALESCE(SUM(${payable}),0) outstanding,
            COUNT(DISTINCT po.supplier_id) suppliers, AVG(po.unit_price_per_kg) avg_price,
            SUM(po.delivery_status IN ('completed','closed')) completed, SUM(po.payment_status = 'paid') fully_paid
     FROM purchase_orders_adnan po LEFT JOIN ${billed} ON g.purchase_order_id = po.id WHERE ${scopeSql} AND po.po_date BETWEEN ? AND ?`, [from, to])
  const kpis = { orders: num(k.orders), order_value: num(k.order_value), ordered_kg: num(k.ordered_kg), received_kg: num(k.received_kg), received_value: num(k.received_value), paid: num(k.paid), outstanding: num(k.outstanding), suppliers: num(k.suppliers), avg_price: num(k.avg_price),
    fulfillment_pct: num(k.ordered_kg) > 0 ? num(k.received_kg) / num(k.ordered_kg) * 100 : 0, payment_pct: num(k.received_value) > 0 ? num(k.paid) / num(k.received_value) * 100 : 0, completion_pct: num(k.orders) > 0 ? num(k.completed) / num(k.orders) * 100 : 0 }

  const suppliers = (await query<any>(
    `SELECT COALESCE(s.company_name, po.supplier_name) AS supplier, COUNT(DISTINCT po.id) orders, SUM(po.total_order_value) value, SUM(po.quantity_kg) ordered_kg, SUM(po.total_received_qty) received_kg,
            SUM(${payable}) outstanding, AVG(po.unit_price_per_kg) avg_price,
            (SELECT AVG(DATEDIFF(gr.grn_date, p2.po_date)) FROM goods_received_adnan gr JOIN purchase_orders_adnan p2 ON p2.id = gr.purchase_order_id WHERE p2.supplier_id = po.supplier_id AND gr.grn_status <> 'cancelled' AND p2.po_date BETWEEN ? AND ?) AS avg_delivery_days,
            (SELECT AVG(ABS(gr.quantity_received_kg - gr.expected_quantity) / NULLIF(gr.expected_quantity,0) * 100) FROM goods_received_adnan gr JOIN purchase_orders_adnan p2 ON p2.id = gr.purchase_order_id WHERE p2.supplier_id = po.supplier_id AND gr.grn_status <> 'cancelled' AND p2.po_date BETWEEN ? AND ?) AS avg_variance_pct
     FROM purchase_orders_adnan po LEFT JOIN suppliers s ON s.id = po.supplier_id LEFT JOIN ${billed} ON g.purchase_order_id = po.id
     WHERE ${scopeSql} AND po.po_date BETWEEN ? AND ? GROUP BY po.supplier_id, supplier ORDER BY value DESC LIMIT 25`, [from, to, from, to, from, to]))
    .map(r => ({ ...r, orders: num(r.orders), value: num(r.value), ordered_kg: num(r.ordered_kg), received_kg: num(r.received_kg), outstanding: num(r.outstanding), avg_price: num(r.avg_price), avg_delivery_days: r.avg_delivery_days == null ? null : num(r.avg_delivery_days), avg_variance_pct: r.avg_variance_pct == null ? null : num(r.avg_variance_pct) }))

  // procurement by origin (with the optional filters)
  const where = [scopeSql, 'po.po_date BETWEEN ? AND ?'], params: unknown[] = [from, to]
  if (q.origin) { where.push('po.wheat_origin = ?'); params.push(String(q.origin)) }
  if (Number(q.supplier_id)) { where.push('po.supplier_id = ?'); params.push(Number(q.supplier_id)) }
  if (q.delivery_status) { where.push('po.delivery_status = ?'); params.push(String(q.delivery_status)) }
  const origins = (await query<any>(
    `SELECT COALESCE(NULLIF(po.wheat_origin,''),'Unknown') origin, COUNT(*) pos, SUM(po.quantity_kg) ordered_kg, SUM(COALESCE(po.total_received_qty,0)) received_kg,
            SUM(GREATEST(COALESCE(po.quantity_kg,0) - COALESCE(po.total_received_qty,0),0)) pending_kg, SUM(po.total_order_value) value, SUM(COALESCE(po.total_paid,0)) paid,
            SUM(${payable}) payable, AVG(po.unit_price_per_kg) avg_price
     FROM purchase_orders_adnan po LEFT JOIN ${billed} ON g.purchase_order_id = po.id WHERE ${where.join(' AND ')} GROUP BY origin ORDER BY ordered_kg DESC`, params))
    .map(r => ({ ...r, pos: num(r.pos), ordered_kg: num(r.ordered_kg), received_kg: num(r.received_kg), pending_kg: num(r.pending_kg), value: num(r.value), paid: num(r.paid), payable: num(r.payable), avg_price: num(r.avg_price) }))
  const detail = (await query<any>(
    `SELECT po.po_number po, po.po_date date, COALESCE(s.company_name, po.supplier_name) supplier, COALESCE(NULLIF(po.wheat_origin,''),'Unknown') origin, po.quantity_kg ordered_kg, po.unit_price_per_kg rate,
            po.total_order_value value, COALESCE(po.total_received_qty,0) received_kg, GREATEST(COALESCE(po.quantity_kg,0) - COALESCE(po.total_received_qty,0),0) pending_kg,
            COALESCE(po.total_paid,0) paid, COALESCE(po.total_adjustment_amount,0) adjustments, ${payable} AS payable, po.delivery_status delivery, po.payment_status payment
     FROM purchase_orders_adnan po LEFT JOIN suppliers s ON s.id = po.supplier_id LEFT JOIN ${billed} ON g.purchase_order_id = po.id
     WHERE ${where.join(' AND ')} ORDER BY origin, po.po_date DESC LIMIT 500`, params))
    .map(r => ({ ...r, date: String(r.date).slice(0, 10), ordered_kg: num(r.ordered_kg), rate: num(r.rate), value: num(r.value), received_kg: num(r.received_kg), pending_kg: num(r.pending_kg), paid: num(r.paid), adjustments: num(r.adjustments), payable: num(r.payable) }))

  // receipts by unloading point × origin (GRN date in range) — Bengali/English spellings of the same branch are merged
  const receipts = (await query<any>(
    `SELECT CASE WHEN g2.unload_point_name IN ('ডেমরা','Demra','demra') THEN 'Demra'
                 WHEN g2.unload_point_name IN ('সিরাজগঞ্জ','Sirajgonj','Sirajganj','sirajgonj') THEN 'Sirajganj'
                 WHEN g2.unload_point_name IN ('রামপুরা','Rampura','rampura') THEN 'Rampura'
                 WHEN g2.unload_point_name IN ('Head Office','head office') THEN 'Head Office'
                 ELSE COALESCE(NULLIF(g2.unload_point_name,''),'Unknown') END AS branch,
            COALESCE(NULLIF(po.wheat_origin,''),'Unknown') origin, COUNT(*) grns, SUM(COALESCE(g2.expected_quantity,0)) expected_kg, SUM(g2.quantity_received_kg) received_kg, SUM(g2.total_value) value
     FROM goods_received_adnan g2 JOIN purchase_orders_adnan po ON po.id = g2.purchase_order_id
     WHERE g2.grn_status <> 'cancelled' AND g2.grn_date BETWEEN ? AND ? GROUP BY branch, origin ORDER BY branch, received_kg DESC`, [from, to]))
    .map(r => ({ ...r, grns: num(r.grns), expected_kg: num(r.expected_kg), received_kg: num(r.received_kg), value: num(r.value) }))

  const origins_list = (await query<any>(`SELECT DISTINCT wheat_origin FROM purchase_orders_adnan WHERE wheat_origin IS NOT NULL AND wheat_origin <> '' ORDER BY wheat_origin`)).map(r => r.wheat_origin)
  const suppliers_list = await query<any>(`SELECT supplier_id AS id, MAX(supplier_name) AS name FROM purchase_orders_adnan WHERE supplier_id IS NOT NULL GROUP BY supplier_id ORDER BY name`)
  return { from, to, scope: openOnly ? 'open' : 'all', kpis, suppliers, origins, detail, receipts, origins_list, suppliers_list }
})
