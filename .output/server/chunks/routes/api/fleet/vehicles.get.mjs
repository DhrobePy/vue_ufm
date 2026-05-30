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

const vehicles_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const status = q.status || "";
  const search = q.search || "";
  const where = [];
  const params = [];
  if (status) {
    where.push("v.status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(v.registration_no LIKE ? OR v.make LIKE ? OR v.model LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [vehicles, stats] = await Promise.all([
    query(
      `SELECT v.*,
              d.full_name AS driver_name, d.mobile AS driver_mobile
       FROM fleet_vehicles v
       LEFT JOIN fleet_drivers d ON d.id = v.assigned_driver_id
       ${w}
       ORDER BY v.registration_no`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'available') AS available,
         SUM(status = 'busy')      AS busy,
         SUM(status = 'repair')    AS repair,
         SUM(status = 'inactive')  AS inactive
       FROM fleet_vehicles`
    )
  ]);
  return { vehicles, stats };
});

export { vehicles_get as default };
//# sourceMappingURL=vehicles.get.mjs.map
