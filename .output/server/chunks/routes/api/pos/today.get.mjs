import { g as defineEventHandler, o as getQuery, E as query, F as queryOne } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const today_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const branchId = q.branch_id ? Number(q.branch_id) : 1;
  const [orders, stats] = await Promise.all([
    query(
      `SELECT o.id, o.order_number, o.order_date, o.order_status,
              o.total_amount, o.payment_method, o.payment_status,
              COALESCE(c.name, 'Walk-in') AS customer_name,
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.order_type = 'POS'
         AND DATE(o.order_date) = CURDATE()
         AND o.branch_id = ?
       GROUP BY o.id
       ORDER BY o.order_date DESC`,
      [branchId]
    ),
    queryOne(
      `SELECT
         COUNT(*)                                              AS total_orders,
         COALESCE(SUM(total_amount), 0)                       AS total_revenue,
         COALESCE(SUM(CASE WHEN payment_method='Cash'    THEN total_amount ELSE 0 END), 0) AS cash_total,
         COALESCE(SUM(CASE WHEN payment_method!='Cash'   THEN total_amount ELSE 0 END), 0) AS mobile_total
       FROM orders
       WHERE order_type = 'POS' AND DATE(order_date) = CURDATE() AND branch_id = ?`,
      [branchId]
    )
  ]);
  return { orders, stats };
});

export { today_get as default };
//# sourceMappingURL=today.get.mjs.map
