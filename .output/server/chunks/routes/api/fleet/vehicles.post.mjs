import { j as defineEventHandler, _ as readBody, f as createError, Y as query } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const vehicles_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    registration_no,
    vehicle_type,
    make,
    model,
    engine_no,
    chassis_no,
    year_of_mfg,
    fuel_type,
    ownership_type,
    weight_capacity_kg,
    current_odometer,
    status,
    assigned_driver_id,
    remarks
  } = body != null ? body : {};
  if (!registration_no) throw createError({ statusCode: 400, statusMessage: "registration_no is required" });
  const result = await query(
    `INSERT INTO fleet_vehicles
       (registration_no, vehicle_type, make, model, engine_no, chassis_no,
        year_of_mfg, fuel_type, ownership_type, weight_capacity_kg,
        current_odometer, status, assigned_driver_id, remarks)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      registration_no.trim().toUpperCase(),
      vehicle_type || "TRUCK",
      make || null,
      model || null,
      engine_no || null,
      chassis_no || null,
      year_of_mfg || null,
      fuel_type || "DIESEL",
      ownership_type || "OWNED",
      weight_capacity_kg ? Number(weight_capacity_kg) : null,
      current_odometer ? Number(current_odometer) : 0,
      status || "available",
      assigned_driver_id ? Number(assigned_driver_id) : null,
      remarks || null
    ]
  );
  return { ok: true, id: result.insertId };
});

export { vehicles_post as default };
//# sourceMappingURL=vehicles.post.mjs.map
