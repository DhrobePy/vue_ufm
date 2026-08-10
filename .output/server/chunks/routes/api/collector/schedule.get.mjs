import { q as defineEventHandler, ap as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const schedule_get = defineEventHandler(async () => {
  const schedule = await query(
    `SELECT
       c.id,
       c.name,
       c.business_address AS area,
       SUM(co.balance_due) AS outstanding
     FROM customers c
     JOIN credit_orders co ON co.customer_id = c.id
     WHERE co.status NOT IN ('completed', 'rejected', 'cancelled')
       AND co.balance_due > 0
     GROUP BY c.id
     ORDER BY outstanding DESC
     LIMIT 30`
  );
  const recentCollections = await query(
    `SELECT
       cp.id,
       cp.payment_date  AS date,
       c.name  AS customer,
       cp.amount,
       cp.payment_method AS paymentMode,
       cp.reference_number AS reference,
       COALESCE(u.display_name, 'Field Collector') AS collector
     FROM customer_payments cp
     JOIN customers c ON c.id = cp.customer_id
     LEFT JOIN users u ON u.id = cp.created_by_user_id
     ORDER BY cp.payment_date DESC, cp.id DESC
     LIMIT 30`
  );
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [[statsRow]] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN DATE(payment_date) = ? THEN amount END), 0) AS today_total,
       COALESCE(SUM(CASE WHEN payment_date >= DATE_FORMAT(NOW(),'%Y-%m-01') THEN amount END), 0) AS month_total
     FROM customer_payments`,
    [todayStr]
  );
  return { schedule, recentCollections, stats: statsRow };
});

export { schedule_get as default };
//# sourceMappingURL=schedule.get.mjs.map
