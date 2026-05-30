import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const status = (q.status as string) || ''
  const search = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (status) { where.push('d.status = ?'); params.push(status) }
  if (search) {
    where.push('(d.full_name LIKE ? OR d.mobile LIKE ? OR d.nid LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [drivers, stats] = await Promise.all([
    query(
      `SELECT d.*, v.registration_no AS vehicle_no
       FROM fleet_drivers d
       LEFT JOIN fleet_vehicles v ON v.id = d.assigned_vehicle_id
       ${w}
       ORDER BY d.full_name`,
      params,
    ) as any[],

    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'active')    AS active,
         SUM(status = 'inactive')  AS inactive,
         SUM(status = 'suspended') AS suspended
       FROM fleet_drivers`,
    ) as any,
  ])

  return { drivers, stats }
})
