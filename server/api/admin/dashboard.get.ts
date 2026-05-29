import { query, queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [stats, users, recentAudit] = await Promise.all([
    queryOne(
      `SELECT
         COUNT(*)                AS total_users,
         SUM(status = 'active')  AS active_users,
         SUM(status = 'pending') AS pending_users,
         SUM(status = 'suspended') AS suspended_users
       FROM users`,
    ) as any,

    query(
      `SELECT u.id, u.display_name, u.email, u.role, u.status, u.last_login
       FROM users u
       ORDER BY FIELD(u.status,'active','pending','suspended'), u.display_name
       LIMIT 20`,
    ) as any[],

    // system_audit_log is the real table name
    query(
      `SELECT id, user_id, action, module, description, ip_address, created_at
       FROM system_audit_log
       ORDER BY created_at DESC
       LIMIT 10`,
    ) as any[],
  ])

  return { stats, users, recentAudit }
})
