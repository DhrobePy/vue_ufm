import { query } from '~/server/utils/db'

/**
 * GET /api/dashboard/activity
 * Returns the 20 most recent audit log entries for the live activity feed.
 */
export default defineEventHandler(async () => {
  try {
    const rows = await query<any>(
      `SELECT l.id, l.action, l.module, l.record_type, l.reference_number,
              l.description, l.severity, l.created_at,
              u.display_name AS user_name
       FROM system_audit_log l
       LEFT JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT 20`,
    )
    return rows
  } catch {
    return []
  }
})
