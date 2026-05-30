import { g as defineEventHandler, t as getRouterParam, d as createError, F as queryOne, E as query } from '../../../../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [driver, documents, employment, trips] = await Promise.all([
    queryOne(
      `SELECT d.*, v.registration_no AS vehicle_no
       FROM fleet_drivers d
       LEFT JOIN fleet_vehicles v ON v.id = d.assigned_vehicle_id
       WHERE d.id = ?`,
      [id]
    ),
    query(`SELECT * FROM driver_documents WHERE driver_id = ? ORDER BY expiry_date`, [id]),
    query(`SELECT * FROM driver_employment_history WHERE driver_id = ? ORDER BY start_date DESC`, [id]),
    query(
      `SELECT t.id, t.trip_number, t.trip_date, t.origin, t.destination,
              t.trip_status, t.trip_charge, v.registration_no AS vehicle_no
       FROM trips t
       LEFT JOIN fleet_vehicles v ON v.id = t.vehicle_id
       WHERE t.driver_id = ?
       ORDER BY t.trip_date DESC LIMIT 20`,
      [id]
    )
  ]);
  if (!driver) throw createError({ statusCode: 404, statusMessage: "Driver not found" });
  return { driver, documents, employment, trips };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
