import { g as defineEventHandler, E as query, F as queryOne } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const dispatch_get = defineEventHandler(async () => {
  const [orders, stats] = await Promise.all([
    query(
      `SELECT o.id, o.order_number, o.order_date, o.shipping_address AS delivery_address,
              o.total_weight_kg, o.status, o.priority,
              c.name AS customer_name, c.phone_number,
              b.name AS branch_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = o.assigned_branch_id
       WHERE o.status IN ('ready_to_ship', 'approved', 'produced')
       ORDER BY o.priority = 'urgent' DESC, o.priority = 'high' DESC, o.required_date ASC
       LIMIT 50`
    ),
    queryOne(
      `SELECT
         SUM(status IN ('ready_to_ship','approved','produced'))               AS ready_count,
         SUM(CASE WHEN status = 'shipped' AND DATE(updated_at) = CURDATE() THEN 1 ELSE 0 END) AS dispatched_today,
         COALESCE(SUM(CASE WHEN status = 'shipped' AND DATE(updated_at) = CURDATE() THEN total_weight_kg ELSE 0 END), 0) AS dispatched_kg_today
       FROM credit_orders`
    )
  ]);
  return { orders, stats };
});

export { dispatch_get as default };
//# sourceMappingURL=dispatch.get.mjs.map
