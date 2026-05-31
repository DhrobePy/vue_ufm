import { h as defineEventHandler, p as getQuery, G as query, H as queryOne } from '../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const fuel_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const vehicle_id = q.vehicle_id || "";
  const search = q.search || "";
  const where = [];
  const params = [];
  if (vehicle_id) {
    where.push("fl.vehicle_id = ?");
    params.push(Number(vehicle_id));
  }
  if (search) {
    where.push("(v.registration_no LIKE ? OR fl.station_name LIKE ? OR fl.receipt_no LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [logs, stats] = await Promise.all([
    query(
      `SELECT fl.*,
              v.registration_no AS vehicle_no,
              d.full_name AS driver_name
       FROM fleet_fuel_logs fl
       JOIN fleet_vehicles v ON v.id = fl.vehicle_id
       LEFT JOIN fleet_drivers d ON d.id = fl.driver_id
       ${w}
       ORDER BY fl.fuel_date DESC, fl.id DESC
       LIMIT 100`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total_logs,
         COALESCE(SUM(total_amount), 0)      AS total_cost,
         COALESCE(SUM(quantity_liters), 0)   AS total_liters,
         COALESCE(SUM(CASE WHEN MONTH(fuel_date) = MONTH(CURDATE()) THEN total_amount ELSE 0 END), 0) AS this_month_cost,
         COALESCE(SUM(CASE WHEN MONTH(fuel_date) = MONTH(CURDATE()) THEN quantity_liters ELSE 0 END), 0) AS this_month_liters
       FROM fleet_fuel_logs`
    )
  ]);
  return { logs, stats };
});

export { fuel_get as default };
//# sourceMappingURL=fuel.get.mjs.map
