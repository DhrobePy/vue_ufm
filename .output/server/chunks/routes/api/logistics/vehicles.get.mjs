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

const vehicles_get = defineEventHandler(async () => {
  const vehicles = await query(
    `SELECT v.id, v.vehicle_number, v.vehicle_type, v.category,
            v.capacity_kg, v.status, v.next_service_due_date,
            d.driver_name, d.phone_number AS driver_phone
     FROM vehicles v
     LEFT JOIN drivers d ON d.assigned_vehicle_id = v.id AND d.status = 'Active'
     WHERE v.status != 'Inactive'
     ORDER BY v.vehicle_number`
  );
  return { vehicles };
});

export { vehicles_get as default };
//# sourceMappingURL=vehicles.get.mjs.map
