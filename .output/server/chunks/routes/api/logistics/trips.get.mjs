import { o as defineEventHandler, E as getQuery, a9 as query, aa as queryOne } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const trips_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const search = q.search || "";
  const status = q.status || "";
  const where = [];
  const params = [];
  if (search) {
    where.push("(v.vehicle_number LIKE ? OR d.driver_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("ta.status = ?");
    params.push(status);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [trips, stats] = await Promise.all([
    query(
      `SELECT ta.id, ta.trip_date AS date, ta.status,
              ta.trip_type, ta.total_orders,
              ROUND(ta.total_weight_kg / 1000, 2) AS weight_mt,
              v.vehicle_number AS vehicle,
              d.driver_name    AS driver,
              ta.route_summary AS route
       FROM trip_assignments ta
       JOIN vehicles v ON v.id = ta.vehicle_id
       JOIN drivers d  ON d.id = ta.driver_id
       ${w}
       ORDER BY ta.trip_date DESC, ta.id DESC
       LIMIT 100`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'In Progress') AS active,
         SUM(status = 'Scheduled')   AS scheduled,
         SUM(status = 'Completed'  AND DATE(trip_date) = CURDATE()) AS completed_today
       FROM trip_assignments`
    )
  ]);
  return { trips, stats };
});

export { trips_get as default };
//# sourceMappingURL=trips.get.mjs.map
