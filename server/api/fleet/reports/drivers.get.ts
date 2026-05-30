import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q    = getQuery(event)
  const from = (q.from as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const to   = (q.to   as string) || new Date().toISOString().slice(0, 10)

  const drivers = await query<any>(
    `SELECT
       d.id, d.full_name, d.mobile, d.status,
       COUNT(DISTINCT t.id)                                              AS total_trips,
       COALESCE(SUM(CASE WHEN t.trip_status='completed' THEN 1 END), 0) AS completed_trips,
       COALESCE(SUM(CASE WHEN t.trip_status='cancelled' THEN 1 END), 0) AS cancelled_trips,
       COALESCE(SUM(t.trip_charge), 0)                                   AS total_revenue,
       COALESCE(SUM((SELECT SUM(amount) FROM trip_expenses WHERE trip_id = t.id)), 0) AS total_expenses,
       COALESCE(SUM((SELECT SUM(amount) FROM trip_advances WHERE trip_id = t.id)), 0) AS total_advances
     FROM fleet_drivers d
     LEFT JOIN trips t
            ON t.driver_id = d.id AND t.trip_date BETWEEN ? AND ?
     GROUP BY d.id, d.full_name, d.mobile, d.status
     ORDER BY total_revenue DESC`,
    [from, to],
  )

  // Monthly trips per driver (top 5 drivers only)
  const monthly = await query<any>(
    `SELECT
       d.full_name AS driver_name,
       DATE_FORMAT(t.trip_date, '%Y-%m') AS month,
       COUNT(*) AS trips,
       COALESCE(SUM(t.trip_charge), 0) AS revenue
     FROM trips t
     JOIN fleet_drivers d ON d.id = t.driver_id
     WHERE t.trip_date BETWEEN ? AND ?
     GROUP BY d.id, d.full_name, month
     ORDER BY month, revenue DESC`,
    [from, to],
  )

  return { drivers, monthly, from, to }
})
