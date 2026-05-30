import { g as defineEventHandler, t as getRouterParam, d as createError, F as queryOne, E as query } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [order, items, workflow, deliveries] = await Promise.all([
    queryOne(
      `SELECT o.*,
              c.name AS customer_name, c.business_name, c.phone_number,
              c.customer_type, c.credit_limit, c.current_balance,
              cr.display_name AS created_by_name,
              ap.display_name AS approved_by_name,
              b.name AS branch_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users cr ON cr.id = o.created_by_user_id
       LEFT JOIN users ap ON ap.id = o.approved_by_user_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.id = ?`,
      [id]
    ),
    query(
      `SELECT oi.*, p.base_name AS product_name, pv.weight_variant, pv.grade, pv.sku
       FROM credit_order_items oi
       LEFT JOIN products p  ON p.id = oi.product_id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       WHERE oi.order_id = ?
       ORDER BY oi.id`,
      [id]
    ),
    query(
      `SELECT w.*, u.display_name AS performed_by_name
       FROM credit_order_workflow w
       LEFT JOIN users u ON u.id = w.performed_by_user_id
       WHERE w.order_id = ?
       ORDER BY w.performed_at DESC`,
      [id]
    ),
    query(
      `SELECT d.*, u.display_name AS created_by_name
       FROM credit_order_deliveries d
       LEFT JOIN users u ON u.id = d.created_by_user_id
       WHERE d.order_id = ?
       ORDER BY d.delivery_date DESC`,
      [id]
    )
  ]);
  if (!order) throw createError({ statusCode: 404, statusMessage: "Order not found" });
  return { order, items, workflow, deliveries };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
