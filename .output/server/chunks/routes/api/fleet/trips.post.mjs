import { q as defineEventHandler, ar as readBody, m as createError, ap as queryOne, ao as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const trips_post = defineEventHandler(async (event) => {
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
  const [clashVehicle, clashDriver] = await Promise.all([
    queryOne(
      `SELECT trip_number FROM trips
       WHERE vehicle_id = ? AND trip_date = ? AND trip_status IN ('scheduled','in_progress')
       LIMIT 1`,
      [Number(vehicle_id), trip_date]
    ),
    queryOne(
      `SELECT trip_number FROM trips
       WHERE driver_id = ? AND trip_date = ? AND trip_status IN ('scheduled','in_progress')
       LIMIT 1`,
      [Number(driver_id), trip_date]
    )
  ]);
  if (clashVehicle)
    throw createError({ statusCode: 409, statusMessage: `This vehicle is already booked on ${trip_date} (${clashVehicle.trip_number})` });
  if (clashDriver)
    throw createError({ statusCode: 409, statusMessage: `This driver is already booked on ${trip_date} (${clashDriver.trip_number})` });
  const dateStr = trip_date.replace(/-/g, "");
  const last = await queryOne(
    `SELECT MAX(CAST(SUBSTRING_INDEX(trip_number, '-', -1) AS UNSIGNED)) AS maxSeq
     FROM trips WHERE trip_number LIKE ?`,
    [`TRIP-${dateStr}-%`]
  );
  const seq = String((Number(last == null ? void 0 : last.maxSeq) || 0) + 1).padStart(4, "0");
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
