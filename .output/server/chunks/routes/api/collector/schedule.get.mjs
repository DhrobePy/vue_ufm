import { Z as defineEventHandler, bn as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const schedule_get = defineEventHandler(async () => {
  var _a, _b;
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
  const todays = await query(
    `SELECT customer_id, SUM(amount) AS collected, SUBSTRING_INDEX(GROUP_CONCAT(payment_method ORDER BY id DESC), ',', 1) AS method
     FROM customer_payments WHERE payment_date = CURDATE() GROUP BY customer_id`
  );
  const tmap = new Map(todays.map((t) => [t.customer_id, t]));
  for (const v of schedule) {
    const t = tmap.get(v.id);
    v.outstanding = Number(v.outstanding);
    v.collected = Number((_a = t == null ? void 0 : t.collected) != null ? _a : 0);
    v.method = (_b = t == null ? void 0 : t.method) != null ? _b : "";
    v.status = v.collected > 0 ? "partial" : "pending";
  }
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
  const [statsRow] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN payment_date = CURDATE() THEN amount END), 0) AS today_total,
       COALESCE(SUM(CASE WHEN payment_date >= DATE_FORMAT(NOW(),'%Y-%m-01') THEN amount END), 0) AS month_total
     FROM customer_payments`
  );
  return { schedule, recentCollections, stats: statsRow };
});

export { schedule_get as default };
//# sourceMappingURL=schedule.get.mjs.map
