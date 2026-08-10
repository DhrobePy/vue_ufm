import { q as defineEventHandler, R as getRouterParam, m as createError, aq as queryOne, ap as query } from '../../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const [vehicle, documents, tyres, batteries, trips, fuel, maintenance] = await Promise.all([
    queryOne(
      `SELECT v.*, d.full_name AS driver_name, d.mobile AS driver_mobile
       FROM fleet_vehicles v
       LEFT JOIN fleet_drivers d ON d.id = v.assigned_driver_id
       WHERE v.id = ?`,
      [id]
    ),
    query(`SELECT * FROM vehicle_documents WHERE vehicle_id = ? ORDER BY expiry_date`, [id]),
    query(`SELECT * FROM vehicle_tyre_history WHERE vehicle_id = ? ORDER BY fitted_date DESC`, [id]),
    query(`SELECT * FROM vehicle_battery_history WHERE vehicle_id = ? ORDER BY fitted_date DESC`, [id]),
    query(
      `SELECT t.id, t.trip_number, t.trip_date, t.origin, t.destination,
              t.trip_status, t.trip_charge, d.full_name AS driver_name
       FROM trips t
       LEFT JOIN fleet_drivers d ON d.id = t.driver_id
       WHERE t.vehicle_id = ?
       ORDER BY t.trip_date DESC LIMIT 20`,
      [id]
    ),
    query(
      `SELECT * FROM fleet_fuel_logs WHERE vehicle_id = ? ORDER BY fuel_date DESC LIMIT 30`,
      [id]
    ),
    query(
      `SELECT mr.*, u.display_name AS created_by_name
       FROM maintenance_requests mr
       LEFT JOIN users u ON u.id = mr.created_by_user_id
       WHERE mr.vehicle_id = ?
       ORDER BY mr.request_date DESC LIMIT 20`,
      [id]
    )
  ]);
  if (!vehicle) throw createError({ statusCode: 404, statusMessage: "Vehicle not found" });
  return { vehicle, documents, tyres, batteries, trips, fuel, maintenance };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
