import { q as defineEventHandler, J as getQuery, an as query, ao as queryOne } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const drivers_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const status = q.status || "";
  const search = q.search || "";
  const where = [];
  const params = [];
  if (status) {
    where.push("d.status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(d.full_name LIKE ? OR d.mobile LIKE ? OR d.nid LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const [drivers, stats] = await Promise.all([
    query(
      `SELECT d.*, v.registration_no AS vehicle_no
       FROM fleet_drivers d
       LEFT JOIN fleet_vehicles v ON v.id = d.assigned_vehicle_id
       ${w}
       ORDER BY d.full_name`,
      params
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'active')    AS active,
         SUM(status = 'inactive')  AS inactive,
         SUM(status = 'suspended') AS suspended
       FROM fleet_drivers`
    )
  ]);
  return { drivers, stats };
});

export { drivers_get as default };
//# sourceMappingURL=drivers.get.mjs.map
