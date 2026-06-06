import { h as defineEventHandler, J as query, K as queryOne } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c;
  const [orders, stats] = await Promise.all([
    query(
      `SELECT o.id, o.order_number, o.order_date, o.required_date,
              o.status, o.priority, o.total_amount, o.balance_due,
              o.total_weight_kg, o.production_seq,
              c.name AS customer_name,
              oi.id AS item_id,
              p.base_name AS product_name, pv.weight_variant,
              oi.quantity AS qty_bags, oi.line_total
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN credit_order_items oi ON oi.order_id = o.id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       LEFT JOIN products p ON p.id = pv.product_id
       WHERE o.status IN ('approved','in_production')
       ORDER BY
         -- Manual sequence first (0 = unset \u2192 pushed to back)
         CASE WHEN o.production_seq = 0 THEN 999999 ELSE o.production_seq END ASC,
         -- Fallback for unsequenced orders
         (o.priority = 'urgent') DESC,
         (o.priority = 'high') DESC,
         o.required_date ASC,
         o.created_at ASC
       LIMIT 100`
    ),
    queryOne(
      `SELECT
         SUM(status = 'in_production')                                        AS in_production,
         SUM(status = 'ready_to_ship')                                        AS ready_today,
         COALESCE(SUM(CASE WHEN status = 'in_production'
                      THEN total_weight_kg ELSE 0 END), 0)                   AS total_weight_kg
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
        required_date: (_a = row.required_date) != null ? _a : null,
        total_amount: row.total_amount,
        balance_due: row.balance_due,
        totalWeightKg: row.total_weight_kg,
        production_seq: Number((_b = row.production_seq) != null ? _b : 0),
        progress: row.status === "in_production" ? 50 : 0,
        // placeholder until production_schedule is wired
        items: []
      });
    }
    if (row.item_id) {
      orderMap.get(row.id).items.push({
        product: row.product_name ? `${row.product_name}${row.weight_variant ? " " + row.weight_variant : ""}` : "\u2014",
        qty: Number((_c = row.qty_bags) != null ? _c : 0)
      });
    }
  }
  return { orders: Array.from(orderMap.values()), stats };
});

export { productionQueue_get as default };
//# sourceMappingURL=production-queue.get.mjs.map
