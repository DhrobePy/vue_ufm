import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q      = getQuery(event)
  const search = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    where.push('(u.display_name LIKE ? OR u.email LIKE ? OR u.role LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const [users, stats] = await Promise.all([
    query(
      `SELECT u.id, u.display_name, u.email, u.role, u.status,
              u.last_login, u.created_at
       FROM users u
       ${w}
       ORDER BY u.display_name`,
      params,
    ),
    queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'active')    AS active,
         SUM(status = 'pending')   AS pending,
         SUM(status = 'suspended') AS suspended
       FROM users`,
    ),
  ])

  return { users, stats }
})
