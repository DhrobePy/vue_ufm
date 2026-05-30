import { g as defineEventHandler, E as query } from '../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  const [schedule, pending] = await Promise.all([
    // Active / in-progress production
    query(
      `SELECT ps.id, ps.scheduled_date, ps.status, ps.priority_order, ps.notes,
              ps.production_started_at, ps.production_completed_at,
              o.order_number, o.total_weight_kg, o.status AS order_status,
              c.name AS customer_name,
              b.name AS branch_name,
              u.display_name AS manager_name
       FROM production_schedule ps
       JOIN credit_orders o ON o.id = ps.order_id
       JOIN customers c     ON c.id = o.customer_id
       LEFT JOIN branches b ON b.id = ps.branch_id
       LEFT JOIN users u    ON u.id = ps.production_manager_id
       WHERE ps.status IN ('pending','in_progress')
       ORDER BY ps.priority_order ASC, ps.scheduled_date ASC
       LIMIT 50`
    ),
    // Orders approved but not yet in production_schedule
    query(
      `SELECT o.id, o.order_number, o.order_date, o.required_date,
              o.total_amount, o.total_weight_kg, o.priority,
              c.name AS customer_name
       FROM credit_orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.status = 'approved'
         AND o.id NOT IN (SELECT order_id FROM production_schedule WHERE status != 'completed')
       ORDER BY o.priority DESC, o.required_date ASC
       LIMIT 30`
    )
  ]);
  return { schedule, pendingOrders: pending };
});

export { index_get as default };
//# sourceMappingURL=index.get4.mjs.map
