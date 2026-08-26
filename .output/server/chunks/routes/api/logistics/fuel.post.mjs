import { q as defineEventHandler, at as readBody, X as getUserSession, m as createError, z as getDb } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const fuel_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const session = await getUserSession(event);
  const userId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const {
    vehicle_id,
    fuel_date,
    fuel_type,
    quantity_liters,
    price_per_liter,
    station_name,
    odometer_reading,
    filled_by,
    receipt_number,
    notes
  } = body != null ? body : {};
  if (!vehicle_id || !quantity_liters || !price_per_liter) {
    throw createError({ statusCode: 400, statusMessage: "vehicle_id, quantity_liters, and price_per_liter are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO fuel_logs
         (vehicle_id, fuel_date, fuel_type, quantity_liters, price_per_liter,
          station_name, odometer_reading, filled_by, receipt_number, notes, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        fuel_date != null ? fuel_date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        fuel_type != null ? fuel_type : "Diesel",
        Number(quantity_liters),
        Number(price_per_liter),
        station_name != null ? station_name : null,
        odometer_reading ? Number(odometer_reading) : null,
        filled_by != null ? filled_by : null,
        receipt_number != null ? receipt_number : null,
        notes != null ? notes : null,
        userId
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { fuel_post as default };
//# sourceMappingURL=fuel.post.mjs.map
