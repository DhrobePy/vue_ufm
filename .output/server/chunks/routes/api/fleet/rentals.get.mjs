import { q as defineEventHandler, J as getQuery, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const rentals_get = defineEventHandler(async (event) => {
  var _a;
  const q = getQuery(event);
  const status = q.status || "";
  const where = [];
  const params = [];
  if (status) {
    where.push("r.status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const rentals = await query(
    `SELECT r.*, v.registration_no AS vehicle_no, c.name AS customer_name
     FROM vehicle_rentals r
     JOIN fleet_vehicles v ON v.id = r.vehicle_id
     JOIN customers c      ON c.id = r.customer_id
     ${w}
     ORDER BY r.start_datetime DESC
     LIMIT 200`,
    params
  );
  const stats = await query(
    `SELECT
       SUM(status = 'Scheduled')   AS scheduled,
       SUM(status = 'In Progress') AS in_progress,
       SUM(status = 'Completed' AND MONTH(start_datetime) = MONTH(CURDATE()) AND YEAR(start_datetime) = YEAR(CURDATE())) AS completed_this_month,
       COALESCE(SUM(CASE WHEN MONTH(start_datetime) = MONTH(CURDATE()) AND YEAR(start_datetime) = YEAR(CURDATE()) THEN total_amount ELSE 0 END), 0) AS revenue_this_month
     FROM vehicle_rentals`
  );
  return { rentals, stats: (_a = stats[0]) != null ? _a : {} };
});

export { rentals_get as default };
//# sourceMappingURL=rentals.get.mjs.map
