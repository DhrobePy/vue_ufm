import type mysql from 'mysql2/promise'

/**
 * Write a row to system_audit_log using an already-open transaction connection.
 * Wrapped in try/catch so an audit failure never aborts the main operation.
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
    await conn.query(
      `INSERT INTO system_audit_log
         (user_id, action, module, record_type, reference_number,
          description, severity, status, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    // Never let audit failure crash or roll back the main operation
  }
}
