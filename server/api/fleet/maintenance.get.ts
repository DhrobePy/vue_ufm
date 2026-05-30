import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const status = (q.status as string) || ''
  const search = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (status) { where.push('mr.status = ?'); params.push(status) }
  if (search) {
    where.push('(mr.request_no LIKE ? OR v.registration_no LIKE ? OR mr.station_supplier LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [requests, stats] = await Promise.all([
    query(
      `SELECT mr.*,
              v.registration_no AS vehicle_no, v.vehicle_type,
              u.display_name AS created_by_name
       FROM maintenance_requests mr
       JOIN fleet_vehicles v ON v.id = mr.vehicle_id
       LEFT JOIN users u ON u.id = mr.created_by_user_id
       ${w}
       ORDER BY mr.request_date DESC, mr.id DESC
       LIMIT 100`,
      params,
    ) as any[],

    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'pending')     AS pending,
         SUM(status = 'in_progress') AS in_progress,
         SUM(status = 'completed')   AS completed,
         COALESCE(SUM(total_cost), 0) AS total_cost,
         COALESCE(SUM(CASE WHEN MONTH(request_date) = MONTH(CURDATE()) THEN total_cost ELSE 0 END), 0) AS this_month_cost
       FROM maintenance_requests`,
    ) as any,
  ])

  return { requests, stats }
})
