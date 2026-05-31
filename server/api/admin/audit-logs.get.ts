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

  // ── Auto-provision system_audit_log if it doesn't yet exist ──────────────
  // Same table created by server/utils/audit.ts — safe to run CREATE IF NOT EXISTS here too
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS system_audit_log (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id          INT UNSIGNED,
        action           VARCHAR(80)  NOT NULL,
        module           VARCHAR(60)  DEFAULT 'credit_sales',
        record_type      VARCHAR(60),
        reference_number VARCHAR(80),
        description      TEXT,
        severity         ENUM('info','warning','error') DEFAULT 'info',
        status           VARCHAR(50),
        ip_address       VARCHAR(45),
        created_at       DATETIME DEFAULT UTC_TIMESTAMP(),
        INDEX idx_created_at (created_at),
        INDEX idx_action     (action),
        INDEX idx_user_id    (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  } catch { /* ignore */ }

  // ── Build WHERE conditions ────────────────────────────────────────────────
  const conditions: string[] = []
  const params:     any[]    = []

  if (severity) { conditions.push('sal.severity = ?');         params.push(severity) }
  if (userId)   { conditions.push('sal.user_id = ?');          params.push(userId) }
  if (module_)  { conditions.push('sal.module = ?');           params.push(module_) }
  if (date)     { conditions.push('DATE(sal.created_at) = ?'); params.push(date) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  // ── Queries ───────────────────────────────────────────────────────────────
  const [rows, totalRow, users] = await Promise.all([
    query(
      `SELECT sal.id,
              sal.user_id,
              COALESCE(u.display_name, sal.action) AS user_name,
              sal.action,
              sal.module,
              sal.record_type,
              sal.reference_number,
              sal.description,
              sal.severity,
              sal.status,
              sal.ip_address,
              sal.created_at
       FROM system_audit_log sal
       LEFT JOIN users u ON u.id = sal.user_id
       ${where}
       ORDER BY sal.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, per, offset],
    ) as any[],

    queryOne(
      `SELECT COUNT(*) AS total FROM system_audit_log sal ${where}`,
      params,
    ) as any,

    // Users who have audit entries (for the filter dropdown)
    query(
      `SELECT DISTINCT u.id, u.display_name
       FROM users u
       WHERE EXISTS (SELECT 1 FROM system_audit_log sal WHERE sal.user_id = u.id)
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
