import { n as defineEventHandler, a8 as queryOne, a7 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

async function safeQuery(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
const dashboard_get = defineEventHandler(async () => {
  const [vehicleStats, driverStats, tripStats, maintenanceStats, fuelStats, activeTrips, recentMaintenance, alerts] = await Promise.all([
    safeQuery(() => queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'available') AS available,
         SUM(status = 'busy')      AS busy,
         SUM(status = 'repair')    AS repair,
         SUM(status = 'inactive')  AS inactive
       FROM fleet_vehicles`
    ), { total: 0, available: 0, busy: 0, repair: 0, inactive: 0 }),
    safeQuery(() => queryOne(
      `SELECT COUNT(*) AS total, SUM(status = 'active') AS active FROM fleet_drivers`
    ), { total: 0, active: 0 }),
    safeQuery(() => queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(DATE(trip_date) = CURDATE()) AS today,
         SUM(trip_status = 'in_progress') AS ongoing,
         SUM(trip_status = 'completed' AND DATE(trip_date) = CURDATE()) AS completed_today,
         SUM(trip_status = 'completed' AND report_status = 'unreported') AS unreported,
         COALESCE(SUM(CASE WHEN trip_status IN ('completed','closed') AND DATE(trip_date) = CURDATE() THEN trip_charge ELSE 0 END), 0) AS revenue_today,
         COALESCE(SUM(CASE WHEN trip_status IN ('completed','closed') AND MONTH(trip_date) = MONTH(CURDATE()) THEN trip_charge ELSE 0 END), 0) AS revenue_month
       FROM trips`
    ), { total: 0, today: 0, ongoing: 0, completed_today: 0, unreported: 0, revenue_today: 0, revenue_month: 0 }),
    safeQuery(() => queryOne(
      `SELECT
         SUM(status = 'pending')     AS pending,
         SUM(status = 'in_progress') AS in_progress,
         COALESCE(SUM(CASE WHEN MONTH(request_date) = MONTH(CURDATE()) THEN total_cost ELSE 0 END), 0) AS this_month_cost
       FROM maintenance_requests`
    ), { pending: 0, in_progress: 0, this_month_cost: 0 }),
    safeQuery(() => queryOne(
      `SELECT
         COALESCE(SUM(CASE WHEN MONTH(fuel_date) = MONTH(CURDATE()) THEN total_amount ELSE 0 END), 0) AS this_month_cost,
         COALESCE(SUM(CASE WHEN MONTH(fuel_date) = MONTH(CURDATE()) THEN quantity_liters ELSE 0 END), 0) AS this_month_liters
       FROM fleet_fuel_logs`
    ), { this_month_cost: 0, this_month_liters: 0 }),
    // Active/recent trips
    safeQuery(() => query(
      `SELECT t.id, t.trip_number, t.trip_date, t.origin, t.destination,
              t.trip_status, t.trip_charge,
              v.registration_no AS vehicle_no,
              d.full_name AS driver_name
       FROM trips t
       JOIN fleet_vehicles v ON v.id = t.vehicle_id
       JOIN fleet_drivers d  ON d.id = t.driver_id
       WHERE t.trip_status IN ('scheduled','in_progress') OR DATE(t.trip_date) = CURDATE()
       ORDER BY t.trip_status = 'in_progress' DESC, t.trip_date DESC
       LIMIT 8`
    ), []),
    // Recent maintenance
    safeQuery(() => query(
      `SELECT mr.id, mr.request_no, mr.request_date, mr.repair_type,
              mr.status, mr.total_cost, mr.station_supplier,
              v.registration_no AS vehicle_no
       FROM maintenance_requests mr
       JOIN fleet_vehicles v ON v.id = mr.vehicle_id
       WHERE mr.status IN ('pending','in_progress')
       ORDER BY mr.request_date DESC LIMIT 5`
    ), []),
    // Alerts: expiring documents
    safeQuery(() => query(
      `SELECT 'document_expiry' AS type,
              CONCAT(v.registration_no, ' - ', vd.document_type) AS title,
              vd.expiry_date AS due_date,
              DATEDIFF(vd.expiry_date, CURDATE()) AS days_remaining
       FROM vehicle_documents vd
       JOIN fleet_vehicles v ON v.id = vd.vehicle_id
       WHERE vd.expiry_date BETWEEN CURDATE() AND CURDATE() + INTERVAL 30 DAY
       ORDER BY vd.expiry_date
       LIMIT 10`
    ), [])
  ]);
  return {
    vehicles: vehicleStats,
    drivers: driverStats,
    trips: tripStats,
    maintenance: maintenanceStats,
    fuel: fuelStats,
    active_trips: activeTrips,
    recent_maintenance: recentMaintenance,
    alerts
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
