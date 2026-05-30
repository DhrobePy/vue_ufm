import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const from = (q.from as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const to   = (q.to   as string) || new Date().toISOString().slice(0, 10)

  // Per-trip summary
  const trips = await query<any>(
    `SELECT
       t.id, t.trip_number, t.trip_date, t.trip_status, t.report_status,
       t.origin, t.destination, t.goods_description,
       t.trip_charge,
       v.registration_no AS vehicle_no,
       d.full_name       AS driver_name,
       c.name            AS customer_name,
       COALESCE((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id), 0) AS total_expense,
       COALESCE((SELECT SUM(amount) FROM trip_advances WHERE trip_id = t.id), 0) AS total_advance
     FROM trips t
     JOIN fleet_vehicles v ON v.id = t.vehicle_id
     JOIN fleet_drivers  d ON d.id = t.driver_id
     LEFT JOIN customers c ON c.id = t.customer_id
     WHERE t.trip_date BETWEEN ? AND ?
     ORDER BY t.trip_date DESC, t.id DESC`,
    [from, to],
  )

  // Summary by driver
  const byDriver = await query<any>(
    `SELECT
       d.full_name AS driver_name,
       COUNT(t.id) AS trips,
       COALESCE(SUM(t.trip_charge), 0) AS revenue,
       COALESCE(SUM((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id)), 0) AS expenses
     FROM trips t
     JOIN fleet_drivers d ON d.id = t.driver_id
     WHERE t.trip_date BETWEEN ? AND ?
     GROUP BY d.id, d.full_name
     ORDER BY revenue DESC`,
    [from, to],
  )

  // Summary by vehicle
  const byVehicle = await query<any>(
    `SELECT
       v.registration_no,
       COUNT(t.id) AS trips,
       COALESCE(SUM(t.trip_charge), 0) AS revenue,
       COALESCE(SUM((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id)), 0) AS expenses
     FROM trips t
     JOIN fleet_vehicles v ON v.id = t.vehicle_id
     WHERE t.trip_date BETWEEN ? AND ?
     GROUP BY v.id, v.registration_no
     ORDER BY revenue DESC`,
    [from, to],
  )

  // Totals
  const totalRevenue  = trips.reduce((s: number, t: any) => s + Number(t.trip_charge || 0), 0)
  const totalExpenses = trips.reduce((s: number, t: any) => s + Number(t.total_expense || 0), 0)
  const totalAdvances = trips.reduce((s: number, t: any) => s + Number(t.total_advance || 0), 0)

  return {
    trips, byDriver, byVehicle,
    summary: {
      total_trips:   trips.length,
      revenue:       totalRevenue,
      total_expense: totalExpenses,
      total_advance: totalAdvances,
      net:           totalRevenue - totalExpenses,
    },
    from, to,
  }
})
