import { h as defineEventHandler, M as readBody, x as getUserSession, e as createError, K as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const trips_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    vehicle_id,
    driver_id,
    trip_date,
    scheduled_time,
    trip_type = "single",
    total_orders = 1,
    total_weight_kg = 0,
    route_summary,
    notes
  } = body != null ? body : {};
  if (!vehicle_id || !driver_id || !trip_date)
    throw createError({ statusCode: 400, statusMessage: "vehicle_id, driver_id, and trip_date are required" });
  const vehicles = await query(
    `SELECT capacity_kg FROM vehicles WHERE id = ? LIMIT 1`,
    [Number(vehicle_id)]
  );
  const vehicleCapacityKg = Number((_d = (_c = vehicles[0]) == null ? void 0 : _c.capacity_kg) != null ? _d : 0);
  const remainingCapacity = Math.max(0, vehicleCapacityKg - Number(total_weight_kg));
  const result = await query(
    `INSERT INTO trip_assignments
       (vehicle_id, driver_id, trip_date, scheduled_time, trip_type,
        total_orders, total_weight_kg, remaining_capacity_kg,
        route_summary, notes, status, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
    [
      Number(vehicle_id),
      Number(driver_id),
      trip_date,
      scheduled_time || null,
      trip_type,
      Number(total_orders),
      Number(total_weight_kg),
      remainingCapacity,
      route_summary || null,
      notes || null,
      userId
    ]
  );
  return { ok: true, id: result.insertId };
});

export { trips_post as default };
//# sourceMappingURL=trips.post.mjs.map
