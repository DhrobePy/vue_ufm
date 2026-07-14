import { n as defineEventHandler, z as getQuery, a6 as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const vehicles_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const from = q.from || new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().slice(0, 10);
  const to = q.to || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 864e5) + 1);
  const vehicles = await query(
    `SELECT
       v.id, v.registration_no, v.vehicle_type, v.make, v.model, v.status,
       v.current_odometer,
       COUNT(DISTINCT t.id)                                              AS total_trips,
       COALESCE(SUM(CASE WHEN t.trip_status='completed' THEN 1 END), 0) AS completed_trips,
       COALESCE(SUM(t.trip_charge), 0)                                   AS revenue,
       COALESCE(SUM(fl.quantity_liters), 0)                              AS fuel_liters,
       COALESCE(SUM(fl.total_amount), 0)                                 AS fuel_cost,
       COALESCE(SUM(mr.total_cost), 0)                                   AS maint_cost
     FROM fleet_vehicles v
     LEFT JOIN trips t
            ON t.vehicle_id = v.id AND t.trip_date BETWEEN ? AND ?
     LEFT JOIN fleet_fuel_logs fl
            ON fl.vehicle_id = v.id AND fl.fuel_date BETWEEN ? AND ?
     LEFT JOIN maintenance_requests mr
            ON mr.vehicle_id = v.id AND mr.request_date BETWEEN ? AND ?
     GROUP BY v.id, v.registration_no, v.vehicle_type, v.make, v.model, v.status, v.current_odometer
     ORDER BY revenue DESC`,
    [from, to, from, to, from, to]
  );
  return { vehicles, from, to, days };
});

export { vehicles_get as default };
//# sourceMappingURL=vehicles.get.mjs.map
