import { h as defineEventHandler, G as query, H as queryOne } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const fuel_get = defineEventHandler(async () => {
  const [logs, stats] = await Promise.all([
    query(
      `SELECT fl.id, fl.fuel_date AS date, fl.fuel_type, fl.quantity_liters,
              fl.price_per_liter, fl.total_cost, fl.station_name,
              fl.odometer_reading, fl.filled_by, fl.receipt_number,
              v.vehicle_number AS vehicle
       FROM fuel_logs fl
       JOIN vehicles v ON v.id = fl.vehicle_id
       ORDER BY fl.fuel_date DESC, fl.id DESC
       LIMIT 100`
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total_logs,
         COALESCE(SUM(total_cost), 0)       AS total_cost,
         COALESCE(SUM(quantity_liters), 0)  AS total_liters,
         COALESCE(SUM(CASE WHEN MONTH(fuel_date) = MONTH(CURDATE()) THEN total_cost ELSE 0 END), 0) AS this_month_cost
       FROM fuel_logs`
    )
  ]);
  return { logs, stats };
});

export { fuel_get as default };
//# sourceMappingURL=fuel.get.mjs.map
