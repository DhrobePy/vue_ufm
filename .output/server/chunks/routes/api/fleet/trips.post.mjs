import { h as defineEventHandler, M as readBody, e as createError, L as queryOne, K as query } from '../../../nitro/nitro.mjs';
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
  var _a, _b;
  const body = await readBody(event);
  const {
    trip_date,
    departure_time,
    origin,
    destination,
    customer_id,
    vehicle_id,
    driver_id,
    estimated_duration,
    quantity,
    weight_kg,
    goods_description,
    trip_charge,
    advance_amount,
    destination_account,
    payment_date,
    start_immediately,
    notes
  } = body != null ? body : {};
  if (!trip_date || !vehicle_id || !driver_id)
    throw createError({ statusCode: 400, statusMessage: "trip_date, vehicle_id and driver_id are required" });
  const count = (_b = (_a = await queryOne(
    `SELECT COUNT(*) AS n FROM trips WHERE DATE(created_at) = CURDATE()`
  )) == null ? void 0 : _a.n) != null ? _b : 0;
  const seq = String(Number(count) + 1).padStart(4, "0");
  const dateStr = trip_date.replace(/-/g, "");
  const trip_number = `TRIP-${dateStr}-${seq}`;
  const initial_status = start_immediately ? "in_progress" : "scheduled";
  const result = await query(
    `INSERT INTO trips
       (trip_number, trip_date, departure_time, origin, destination,
        customer_id, vehicle_id, driver_id,
        estimated_duration, quantity, weight_kg, goods_description,
        trip_charge, advance_amount, destination_account, payment_date,
        trip_status, report_status, notes, created_by_user_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'${initial_status}','unreported',?,?)`,
    [
      trip_number,
      trip_date,
      departure_time || null,
      origin || null,
      destination || null,
      customer_id ? Number(customer_id) : null,
      Number(vehicle_id),
      Number(driver_id),
      estimated_duration ? Number(estimated_duration) : null,
      quantity ? Number(quantity) : null,
      weight_kg ? Number(weight_kg) : null,
      goods_description || null,
      trip_charge ? Number(trip_charge) : 0,
      advance_amount ? Number(advance_amount) : 0,
      destination_account || null,
      payment_date || null,
      notes || null,
      null
      // created_by_user_id — add session auth later
    ]
  );
  if (advance_amount && Number(advance_amount) > 0) {
    await query(
      `INSERT INTO trip_advances (trip_id, amount, purpose) VALUES (?, ?, 'Initial advance')`,
      [result.insertId, Number(advance_amount)]
    );
  }
  if (start_immediately) {
    await query(`UPDATE fleet_vehicles SET status = 'busy' WHERE id = ?`, [Number(vehicle_id)]);
  }
  return { ok: true, id: result.insertId, trip_number };
});

export { trips_post as default };
//# sourceMappingURL=trips.post.mjs.map
