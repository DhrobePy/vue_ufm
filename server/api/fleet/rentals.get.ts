import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const status = (q.status as string) || ''

  const where: string[] = []
  const params: unknown[] = []
  if (status) { where.push('r.status = ?'); params.push(status) }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const rentals = await query(
    `SELECT r.*, v.registration_no AS vehicle_no, c.name AS customer_name
     FROM vehicle_rentals r
     JOIN fleet_vehicles v ON v.id = r.vehicle_id
     JOIN customers c      ON c.id = r.customer_id
     ${w}
     ORDER BY r.start_datetime DESC
     LIMIT 200`,
    params,
  ) as any[]

  const stats = await query(
    `SELECT
       SUM(status = 'Scheduled')   AS scheduled,
       SUM(status = 'In Progress') AS in_progress,
       SUM(status = 'Completed' AND MONTH(start_datetime) = MONTH(CURDATE()) AND YEAR(start_datetime) = YEAR(CURDATE())) AS completed_this_month,
       COALESCE(SUM(CASE WHEN MONTH(start_datetime) = MONTH(CURDATE()) AND YEAR(start_datetime) = YEAR(CURDATE()) THEN total_amount ELSE 0 END), 0) AS revenue_this_month
     FROM vehicle_rentals`,
  ) as any[]

  return { rentals, stats: stats[0] ?? {} }
})
