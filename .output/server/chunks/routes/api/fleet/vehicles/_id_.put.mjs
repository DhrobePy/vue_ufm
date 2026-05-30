import { g as defineEventHandler, t as getRouterParam, d as createError, G as readBody, E as query } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const _id__put = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
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
  await query(
    `UPDATE fleet_vehicles SET
       registration_no   = ?, vehicle_type      = ?, make              = ?,
       model             = ?, engine_no         = ?, chassis_no        = ?,
       year_of_mfg       = ?, fuel_type         = ?, ownership_type    = ?,
       weight_capacity_kg = ?, current_odometer  = ?, status            = ?,
       assigned_driver_id = ?, remarks          = ?
     WHERE id = ?`,
    [
      (registration_no == null ? void 0 : registration_no.trim().toUpperCase()) || null,
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
      remarks || null,
      id
    ]
  );
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
