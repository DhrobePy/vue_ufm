import { m as defineEventHandler, y as getQuery, a2 as query, a3 as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const maintenance_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const status = q.status || "";
  const search = q.search || "";
  const where = [];
  const params = [];
  if (status) {
    where.push("mr.status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(mr.request_no LIKE ? OR v.registration_no LIKE ? OR mr.station_supplier LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [requests, stats] = await Promise.all([
    query(
      `SELECT mr.*,
              v.registration_no AS vehicle_no, v.vehicle_type,
              u.display_name AS created_by_name
       FROM maintenance_requests mr
       JOIN fleet_vehicles v ON v.id = mr.vehicle_id
       LEFT JOIN users u ON u.id = mr.created_by_user_id
       ${w}
       ORDER BY mr.request_date DESC, mr.id DESC
       LIMIT 100`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'pending')     AS pending,
         SUM(status = 'in_progress') AS in_progress,
         SUM(status = 'completed')   AS completed,
         COALESCE(SUM(total_cost), 0) AS total_cost,
         COALESCE(SUM(CASE WHEN MONTH(request_date) = MONTH(CURDATE()) THEN total_cost ELSE 0 END), 0) AS this_month_cost
       FROM maintenance_requests`
    )
  ]);
  return { requests, stats };
});

export { maintenance_get as default };
//# sourceMappingURL=maintenance.get.mjs.map
