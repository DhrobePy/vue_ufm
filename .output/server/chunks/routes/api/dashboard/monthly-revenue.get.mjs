import { h as defineEventHandler, G as query } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const monthlyRevenue_get = defineEventHandler(async () => {
  const rows = await query(
    `SELECT
       DATE_FORMAT(order_date, '%b %Y') AS month,
       DATE_FORMAT(order_date, '%Y-%m') AS sort_key,
       COALESCE(SUM(total_amount), 0)   AS revenue,
       COUNT(*)                         AS order_count
     FROM credit_orders
     WHERE order_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
       AND status NOT IN ('cancelled', 'rejected')
     GROUP BY DATE_FORMAT(order_date, '%Y-%m')
     ORDER BY sort_key ASC`
  );
  return rows;
});

export { monthlyRevenue_get as default };
//# sourceMappingURL=monthly-revenue.get.mjs.map
