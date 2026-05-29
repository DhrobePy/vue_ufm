import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(v.vehicle_number LIKE ? OR d.driver_name LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
  if (status) { where.push('ta.status = ?'); params.push(status) }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [trips, stats] = await Promise.all([
    query(
      `SELECT ta.id, ta.trip_date AS date, ta.status,
              ta.trip_type, ta.total_orders,
              ROUND(ta.total_weight_kg / 1000, 2) AS weight_mt,
              v.vehicle_number AS vehicle,
              d.driver_name    AS driver,
              ta.route_summary AS route
       FROM trip_assignments ta
       JOIN vehicles v ON v.id = ta.vehicle_id
       JOIN drivers d  ON d.id = ta.driver_id
       ${w}
       ORDER BY ta.trip_date DESC, ta.id DESC
       LIMIT 100`,
      params,
    ) as any[],

    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'In Progress') AS active,
         SUM(status = 'Scheduled')   AS scheduled,
         SUM(status = 'Completed'  AND DATE(trip_date) = CURDATE()) AS completed_today
       FROM trip_assignments`,
    ) as any,
  ])

  return { trips, stats }
})
