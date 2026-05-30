import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  // Per-vehicle efficiency summary
  const vehicleSummary = await query<any>(
    `SELECT
       v.id AS vehicle_id,
       v.registration_no,
       v.vehicle_type,
       v.make,
       v.model,
       COUNT(f.id)                          AS fill_count,
       COALESCE(SUM(f.quantity_liters), 0)  AS total_liters,
       COALESCE(SUM(f.total_amount), 0)     AS total_cost,
       MAX(f.odometer_reading)              AS latest_odometer,
       MIN(f.odometer_reading)              AS first_odometer,
       AVG(NULLIF(f.mileage_km_per_liter,0)) AS avg_mileage
     FROM fleet_vehicles v
     LEFT JOIN fleet_fuel_logs f ON f.vehicle_id = v.id
     GROUP BY v.id, v.registration_no, v.vehicle_type, v.make, v.model
     ORDER BY avg_mileage DESC`,
    [],
  )

  // Monthly fuel cost trend (last 12 months)
  const monthlyTrend = await query<any>(
    `SELECT
       DATE_FORMAT(fuel_date, '%Y-%m') AS month,
       SUM(quantity_liters)            AS total_liters,
       SUM(total_amount)               AS total_cost,
       COUNT(*)                        AS fill_count
     FROM fleet_fuel_logs
     WHERE fuel_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY month
     ORDER BY month`,
    [],
  )

  // Top fuel consumers
  const topConsumers = await query<any>(
    `SELECT
       v.registration_no,
       v.vehicle_type,
       SUM(f.quantity_liters) AS total_liters,
       SUM(f.total_amount)    AS total_cost,
       COUNT(f.id)            AS fill_count
     FROM fleet_fuel_logs f
     JOIN fleet_vehicles v ON v.id = f.vehicle_id
     WHERE f.fuel_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAYS)
     GROUP BY v.id, v.registration_no, v.vehicle_type
     ORDER BY total_liters DESC
     LIMIT 10`,
    [],
  )

  // Fleet-wide stats
  const [fleetStats] = await query<any>(
    `SELECT
       COUNT(DISTINCT vehicle_id)           AS vehicles_fuelled,
       SUM(quantity_liters)                 AS total_liters,
       SUM(total_amount)                    AS total_cost,
       AVG(NULLIF(mileage_km_per_liter, 0)) AS avg_mileage
     FROM fleet_fuel_logs`,
    [],
  )

  return { vehicleSummary, monthlyTrend, topConsumers, fleetStats }
})
