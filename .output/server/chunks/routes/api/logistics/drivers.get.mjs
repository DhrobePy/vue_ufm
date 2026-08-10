import { q as defineEventHandler, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const drivers_get = defineEventHandler(async () => {
  const drivers = await query(
    `SELECT d.id, d.driver_name, d.phone_number, d.license_number, d.license_type,
            d.license_expiry_date, d.driver_type, d.status, d.rating, d.total_trips,
            d.salary, d.join_date,
            v.vehicle_number AS assigned_vehicle
     FROM drivers d
     LEFT JOIN vehicles v ON v.id = d.assigned_vehicle_id
     WHERE d.status != 'Inactive'
     ORDER BY d.driver_name`
  );
  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "Active").length,
    on_leave: drivers.filter((d) => d.status === "On Leave").length
  };
  return { drivers, stats };
});

export { drivers_get as default };
//# sourceMappingURL=drivers.get.mjs.map
