import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const role    = (session?.user?.role ?? '').toLowerCase()
  if (!['admin', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied — admin/superadmin only' })
  }

  const rows = await query(
    `SELECT
       g.id,
       g.grn_date,
       g.grn_number,
       g.truck_number,
       g.quantity_received_kg  AS received_quantity,
       g.expected_quantity     AS expected_quantity,
       g.variance_percentage,
       g.remarks,
       po.po_number,
       po.supplier_name,
       po.quantity_kg          AS ordered_quantity,
       po.unit_price_per_kg,
       -- weight variance in KG
       (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) AS variance,
       -- value impact
       (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg))
         * po.unit_price_per_kg AS variance_value,
       -- type
       CASE
         WHEN (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) < -10 THEN 'loss'
         WHEN (g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) > 10  THEN 'gain'
         ELSE 'normal'
       END AS variance_type
     FROM goods_received_adnan g
     LEFT JOIN purchase_orders_adnan po ON g.purchase_order_id = po.id
     WHERE g.grn_status != 'cancelled'
       AND ABS(g.quantity_received_kg - COALESCE(g.expected_quantity, po.quantity_kg)) > 0
     ORDER BY g.grn_date DESC
     LIMIT 500`,
  ) as any[]

  return { variances: rows }
})
