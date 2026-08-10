import { q as defineEventHandler, J as getQuery, ap as query, aq as queryOne } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const trips_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const status = q.status || "";
  const search = q.search || "";
  const date = q.date || "";
  const report = q.report || "";
  const where = [];
  const params = [];
  if (status === "today") {
    where.push("DATE(t.trip_date) = CURDATE()");
  } else if (status === "ongoing") {
    where.push("t.trip_status = 'in_progress'");
  } else if (status === "unreported") {
    where.push("t.trip_status = 'completed' AND t.report_status = 'unreported'");
  } else if (status && status !== "all") {
    where.push("t.trip_status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(t.trip_number LIKE ? OR t.origin LIKE ? OR t.destination LIKE ? OR v.registration_no LIKE ? OR d.full_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (date) {
    where.push("t.trip_date = ?");
    params.push(date);
  }
  if (report) {
    where.push("t.report_status = ?");
    params.push(report);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [trips, stats] = await Promise.all([
    query(
      `SELECT t.*,
              v.registration_no AS vehicle_no,
              d.full_name AS driver_name,
              c.name AS customer_name
       FROM trips t
       JOIN fleet_vehicles v  ON v.id = t.vehicle_id
       JOIN fleet_drivers d   ON d.id = t.driver_id
       LEFT JOIN customers c  ON c.id = t.customer_id
       ${w}
       ORDER BY t.trip_date DESC, t.id DESC
       LIMIT 200`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(trip_status = 'in_progress')            AS ongoing,
         SUM(DATE(trip_date) = CURDATE())            AS today,
         SUM(trip_status = 'completed' AND report_status = 'unreported') AS unreported,
         COALESCE(SUM(
           CASE WHEN trip_status IN ('completed','closed') AND DATE(trip_date) = CURDATE()
                THEN trip_charge ELSE 0 END
         ), 0) AS revenue_today
       FROM trips`
    )
  ]);
  return { trips, stats };
});

export { trips_get as default };
//# sourceMappingURL=trips.get.mjs.map
