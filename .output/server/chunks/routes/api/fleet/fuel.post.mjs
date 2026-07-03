import { j as defineEventHandler, _ as readBody, f as createError, Z as queryOne, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const fuel_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const {
    vehicle_id,
    driver_id,
    fuel_date,
    fuel_type,
    quantity_liters,
    price_per_liter,
    total_amount,
    odometer_reading,
    station_name,
    receipt_no,
    trip_id
  } = body != null ? body : {};
  if (!vehicle_id || !fuel_date || !quantity_liters)
    throw createError({ statusCode: 400, statusMessage: "vehicle_id, fuel_date, quantity_liters are required" });
  const prev = await queryOne(
    `SELECT odometer_reading FROM fleet_fuel_logs
     WHERE vehicle_id = ? AND fuel_date <= ? AND odometer_reading IS NOT NULL
     ORDER BY fuel_date DESC, id DESC LIMIT 1`,
    [Number(vehicle_id), fuel_date]
  );
  const qty = Number(quantity_liters);
  const price = price_per_liter ? Number(price_per_liter) : null;
  const total = total_amount ? Number(total_amount) : price && qty ? Math.round(price * qty * 100) / 100 : null;
  const result = await query(
    `INSERT INTO fleet_fuel_logs
       (vehicle_id, driver_id, fuel_date, fuel_type,
        quantity_liters, price_per_liter, total_amount,
        odometer_reading, previous_odometer,
        station_name, receipt_no, trip_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      Number(vehicle_id),
      driver_id ? Number(driver_id) : null,
      fuel_date,
      fuel_type || "DIESEL",
      qty,
      price,
      total,
      odometer_reading ? Number(odometer_reading) : null,
      (_a = prev == null ? void 0 : prev.odometer_reading) != null ? _a : null,
      station_name || null,
      receipt_no || null,
      trip_id ? Number(trip_id) : null
    ]
  );
  if (odometer_reading) {
    await query(
      `UPDATE fleet_vehicles SET current_odometer = ? WHERE id = ? AND current_odometer < ?`,
      [Number(odometer_reading), Number(vehicle_id), Number(odometer_reading)]
    );
  }
  return { ok: true, id: result.insertId };
});

export { fuel_post as default };
//# sourceMappingURL=fuel.post.mjs.map
