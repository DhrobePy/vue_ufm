import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const q        = getQuery(event)
  const severity = (q.severity as string) || ''
  const userId   = (q.user     as string) || ''
  const module_  = (q.module   as string) || ''
  const date     = (q.date     as string) || ''
  const page     = Math.max(1, Number(q.page || 1))
  const per      = Math.min(100, Number(q.per || 50))
  const offset   = (page - 1) * per

  const conditions: string[] = []
  const params: any[]        = []

  if (severity) { conditions.push('al.severity = ?');         params.push(severity) }
  if (userId)   { conditions.push('al.user_id = ?');          params.push(userId) }
  if (module_)  { conditions.push('al.module = ?');           params.push(module_) }
  if (date)     { conditions.push('DATE(al.created_at) = ?'); params.push(date) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const [rows, totalRow, users] = await Promise.all([
    query(
      `SELECT al.id, al.user_id, u.display_name AS user_name,
              al.action, al.module, al.record_type, al.reference_number,
              al.description, al.severity, al.status, al.ip_address, al.created_at
       FROM system_audit_log al
       LEFT JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, per, offset],
    ) as any[],

    queryOne(`SELECT COUNT(*) AS total FROM system_audit_log al ${where}`, params) as any,

    query(
      `SELECT u.id, u.display_name FROM users u
       WHERE EXISTS (SELECT 1 FROM system_audit_log al WHERE al.user_id = u.id)
       ORDER BY u.display_name`,
    ) as any[],
  ])

  return {
    logs:  rows,
    total: Number(totalRow?.total || 0),
    page,
    per,
    users,
  }
})
