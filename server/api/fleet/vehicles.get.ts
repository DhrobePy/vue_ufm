import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const status = (q.status as string) || ''
  const search = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (status) { where.push('v.status = ?'); params.push(status) }
  if (search) {
    where.push('(v.registration_no LIKE ? OR v.make LIKE ? OR v.model LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [vehicles, stats] = await Promise.all([
    query(
      `SELECT v.*,
              d.full_name AS driver_name, d.mobile AS driver_mobile
       FROM fleet_vehicles v
       LEFT JOIN fleet_drivers d ON d.id = v.assigned_driver_id
       ${w}
       ORDER BY v.registration_no`,
      params,
    ) as any[],

    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'available') AS available,
         SUM(status = 'busy')      AS busy,
         SUM(status = 'repair')    AS repair,
         SUM(status = 'inactive')  AS inactive
       FROM fleet_vehicles`,
    ) as any,
  ])

  return { vehicles, stats }
})
