import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid GRN ID' })

  const grn = await queryOne(
    `SELECT g.*,
            po.po_number, po.unit_price_per_kg AS po_unit_price,
            po.total_order_value, po.quantity_kg AS po_quantity_kg,
            po.wheat_origin,
            b.name AS unload_branch_name
     FROM goods_received_adnan g
     LEFT JOIN purchase_orders_adnan po ON g.purchase_order_id = po.id
     LEFT JOIN branches b ON b.id = g.unload_point_branch_id
     WHERE g.id = ?`,
    [id],
  ) as any

  if (!grn) throw createError({ statusCode: 404, statusMessage: 'GRN not found' })
  return { grn }
})
