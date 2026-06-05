import { h as defineEventHandler, p as getQuery, I as query } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const trips_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const from = q.from || new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString().slice(0, 10);
  const to = q.to || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const trips = await query(
    `SELECT
       t.id, t.trip_number, t.trip_date, t.trip_status, t.report_status,
       t.origin, t.destination, t.goods_description,
       t.trip_charge,
       v.registration_no AS vehicle_no,
       d.full_name       AS driver_name,
       c.name            AS customer_name,
       COALESCE((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id), 0) AS total_expense,
       COALESCE((SELECT SUM(amount) FROM trip_advances WHERE trip_id = t.id), 0) AS total_advance
     FROM trips t
     JOIN fleet_vehicles v ON v.id = t.vehicle_id
     JOIN fleet_drivers  d ON d.id = t.driver_id
     LEFT JOIN customers c ON c.id = t.customer_id
     WHERE t.trip_date BETWEEN ? AND ?
     ORDER BY t.trip_date DESC, t.id DESC`,
    [from, to]
  );
  const byDriver = await query(
    `SELECT
       d.full_name AS driver_name,
       COUNT(t.id) AS trips,
       COALESCE(SUM(t.trip_charge), 0) AS revenue,
       COALESCE(SUM((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id)), 0) AS expenses
     FROM trips t
     JOIN fleet_drivers d ON d.id = t.driver_id
     WHERE t.trip_date BETWEEN ? AND ?
     GROUP BY d.id, d.full_name
     ORDER BY revenue DESC`,
    [from, to]
  );
  const byVehicle = await query(
    `SELECT
       v.registration_no,
       COUNT(t.id) AS trips,
       COALESCE(SUM(t.trip_charge), 0) AS revenue,
       COALESCE(SUM((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id)), 0) AS expenses
     FROM trips t
     JOIN fleet_vehicles v ON v.id = t.vehicle_id
     WHERE t.trip_date BETWEEN ? AND ?
     GROUP BY v.id, v.registration_no
     ORDER BY revenue DESC`,
    [from, to]
  );
  const totalRevenue = trips.reduce((s, t) => s + Number(t.trip_charge || 0), 0);
  const totalExpenses = trips.reduce((s, t) => s + Number(t.total_expense || 0), 0);
  const totalAdvances = trips.reduce((s, t) => s + Number(t.total_advance || 0), 0);
  return {
    trips,
    byDriver,
    byVehicle,
    summary: {
      total_trips: trips.length,
      revenue: totalRevenue,
      total_expense: totalExpenses,
      total_advance: totalAdvances,
      net: totalRevenue - totalExpenses
    },
    from,
    to
  };
});

export { trips_get as default };
//# sourceMappingURL=trips.get.mjs.map
