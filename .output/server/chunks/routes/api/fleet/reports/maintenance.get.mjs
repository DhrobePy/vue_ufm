import { o as defineEventHandler, F as getQuery, ac as query } from '../../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const maintenance_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const from = q.from || new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1).toISOString().slice(0, 10);
  const to = q.to || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const byVehicle = await query(
    `SELECT
       v.registration_no, v.vehicle_type,
       COUNT(mr.id)                  AS total_requests,
       SUM(CASE WHEN mr.repair_type='corrective'  THEN 1 ELSE 0 END) AS corrective,
       SUM(CASE WHEN mr.repair_type='preventive'  THEN 1 ELSE 0 END) AS preventive,
       SUM(CASE WHEN mr.status='completed'        THEN 1 ELSE 0 END) AS completed,
       COALESCE(SUM(mr.total_cost), 0)   AS total_cost,
       MAX(mr.request_date)              AS last_service
     FROM maintenance_requests mr
     JOIN fleet_vehicles v ON v.id = mr.vehicle_id
     WHERE mr.request_date BETWEEN ? AND ?
     GROUP BY v.id, v.registration_no, v.vehicle_type
     ORDER BY total_cost DESC`,
    [from, to]
  );
  const monthly = await query(
    `SELECT
       DATE_FORMAT(request_date, '%Y-%m') AS month,
       COUNT(*)                           AS requests,
       SUM(CASE WHEN repair_type='corrective' THEN 1 ELSE 0 END) AS corrective,
       SUM(CASE WHEN repair_type='preventive' THEN 1 ELSE 0 END) AS preventive,
       COALESCE(SUM(total_cost), 0)       AS total_cost
     FROM maintenance_requests
     WHERE request_date BETWEEN ? AND ?
     GROUP BY month
     ORDER BY month`,
    [from, to]
  );
  const requests = await query(
    `SELECT mr.*, v.registration_no AS vehicle_no
     FROM maintenance_requests mr
     JOIN fleet_vehicles v ON v.id = mr.vehicle_id
     WHERE mr.request_date BETWEEN ? AND ?
     ORDER BY mr.request_date DESC
     LIMIT 100`,
    [from, to]
  );
  const totalCost = byVehicle.reduce((s, r) => s + Number(r.total_cost || 0), 0);
  return { byVehicle, monthly, requests, totalCost, from, to };
});

export { maintenance_get as default };
//# sourceMappingURL=maintenance.get.mjs.map
