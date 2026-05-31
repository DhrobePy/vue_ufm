import type mysql from 'mysql2/promise'

// ─── Auto-provision ───────────────────────────────────────────────────────────
// system_audit_log is not in the original schema_seed.sql.
// We create it on first use so no manual migration is needed.
// created_at uses UTC_TIMESTAMP() to guarantee UTC regardless of MySQL server TZ.

const ENSURE_TABLE_SQL = `
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
`

let tableEnsured = false   // process-level flag — only CREATE once per server boot

async function ensureTable(conn: mysql.PoolConnection) {
  if (tableEnsured) return
  try {
    await conn.query(ENSURE_TABLE_SQL)
    tableEnsured = true
  } catch { /* ignore — table may already exist */ }
}

// ─── Public helper ────────────────────────────────────────────────────────────
/**
 * Write a row to system_audit_log inside an existing DB transaction.
 * Silently swallowed so audit failures never abort the main operation.
 * created_at is explicitly UTC_TIMESTAMP() to avoid MySQL server-TZ drift.
 */
export async function auditLog(
  conn: mysql.PoolConnection,
  opts: {
    userId?:          number | null
    action:           string
    module?:          string
    recordType?:      string
    referenceNumber?: string
    description:      string
    severity?:        'info' | 'warning' | 'error'
    status?:          string
    ipAddress?:       string
  },
) {
  try {
    await ensureTable(conn)
    await conn.query(
      `INSERT INTO system_audit_log
         (user_id, action, module, record_type, reference_number,
          description, severity, status, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        opts.userId          ?? null,
        opts.action,
        opts.module          ?? 'credit_sales',
        opts.recordType      ?? null,
        opts.referenceNumber ?? null,
        opts.description,
        opts.severity        ?? 'info',
        opts.status          ?? null,
        opts.ipAddress       ?? null,
      ],
    )
  } catch {
    // Never crash or roll back the main operation due to audit failure
  }
}
