import { h as defineEventHandler, G as query, H as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const productionQueue_get = defineEventHandler(async () => {
  var _a, _b;
  const [orders, stats] = await Promise.all([
    // Orders in production or approved (waiting to be produced) with their items
    query(
      `SELECT o.id, o.order_number, o.order_date, o.status, o.priority,
              o.total_weight_kg,
              c.name AS customer_name,
              oi.id AS item_id,
              p.base_name AS product_name, pv.weight_variant,
              oi.quantity AS qty_bags, oi.line_total,
              ps.status AS production_status,
              ps.production_started_at AS started_at, ps.notes AS production_notes
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN credit_order_items oi ON oi.order_id = o.id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       LEFT JOIN products p ON p.id = pv.product_id
       LEFT JOIN production_schedule ps ON ps.order_id = o.id
       WHERE o.status IN ('approved', 'in_production')
       ORDER BY o.priority = 'urgent' DESC, o.priority = 'high' DESC, o.created_at ASC
       LIMIT 100`
    ),
    queryOne(
      `SELECT
         SUM(status = 'in_production') AS in_production,
         SUM(status = 'ready_to_ship') AS ready_today,
         COALESCE(SUM(CASE WHEN status = 'in_production' THEN total_weight_kg ELSE 0 END),0) AS total_weight_kg
       FROM credit_orders`
    )
  ]);
  const orderMap = /* @__PURE__ */ new Map();
  for (const row of orders) {
    if (!orderMap.has(row.id)) {
      orderMap.set(row.id, {
        id: row.id,
        orderNo: row.order_number,
        customer: row.customer_name,
        status: row.status,
        priority: row.priority,
        progress: (_a = row.progress_pct) != null ? _a : 0,
        totalWeightKg: row.total_weight_kg,
        items: []
      });
    }
    if (row.item_id) {
      orderMap.get(row.id).items.push({
        product: row.product_name ? `${row.product_name} ${(_b = row.weight_variant) != null ? _b : ""}`.trim() : "\u2014",
        qty: row.qty_bags
      });
    }
  }
  return { orders: Array.from(orderMap.values()), stats };
});

export { productionQueue_get as default };
//# sourceMappingURL=production-queue.get.mjs.map
