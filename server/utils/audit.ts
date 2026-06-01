import type mysql from 'mysql2/promise'

// ─── Column constraints from actual system_audit_log schema ──────────────────
//
// action  ENUM: 'created','updated','deleted','approved','rejected','cancelled',
//               'viewed','printed','exported','shipped','dispatched','received',
//               'allocated','paid','refunded','logged_in','logged_out',
//               'login_failed','login_error','session_timeout','status_changed',
//               'priority_changed','assigned','other'
//
// severity ENUM: 'info','warning','critical'   ← NOT 'error'
//
// status   ENUM: 'success','failed','pending'  ← NOT 'deleted'/'completed' etc.
//
// user_id  bigint NOT NULL                     ← cannot be null

// Map our internal action names → valid DB ENUM values
const ACTION_MAP: Record<string, string> = {
  // ── Credit sales ──────────────────────────────────────────────────────────
  order_deleted:    'deleted',
  order_completed:  'status_changed',
  payment_received: 'paid',
  delivered:        'dispatched',
  partial_delivery: 'dispatched',
  return_submitted: 'other',
  return_approved:  'approved',
  return_rejected:  'rejected',

  // ── Purchase module ───────────────────────────────────────────────────────
  po_created:       'created',
  po_updated:       'updated',
  po_cancelled:     'cancelled',
  po_closed:        'status_changed',
  po_reopened:      'status_changed',
  po_locked:        'other',
  po_unlocked:      'other',
  grn_created:      'received',
  grn_updated:      'updated',
  grn_cancelled:    'cancelled',
  grn_deleted:      'deleted',
  payment_made:     'paid',
  payment_updated:  'updated',
  payment_deleted:  'deleted',
  adj_created:      'created',
  adj_approved:     'approved',
  adj_posted:       'status_changed',
  adj_cancelled:    'cancelled',
}

// Map severity → valid DB ENUM  ('error' is not in the ENUM; use 'critical')
const SEVERITY_MAP: Record<string, string> = {
  info:     'info',
  warning:  'warning',
  error:    'critical',
  critical: 'critical',
}

/**
 * Write a row to system_audit_log inside an existing DB transaction.
 * Silently swallowed so audit failures never abort the main operation.
 *
 * Maps our internal action/severity strings to the correct ENUM values
 * enforced by the real table schema.
 */
export async function auditLog(
  conn: mysql.PoolConnection,
  opts: {
    userId?:          number | null
    action:           string
    module?:          string
    recordType?:      string
    recordId?:        number | null
    referenceNumber?: string
    description:      string
    severity?:        'info' | 'warning' | 'error' | 'critical'
    ipAddress?:       string
  },
) {
  try {
    const dbAction   = ACTION_MAP[opts.action]   ?? opts.action  // pass through if already valid
    const dbSeverity = SEVERITY_MAP[opts.severity ?? 'info'] ?? 'info'

    await conn.query(
      `INSERT INTO system_audit_log
         (user_id, module, action, record_type, record_id, reference_number,
          description, ip_address, severity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'success')`,
      [
        opts.userId          ?? 1,        // NOT NULL — fallback to system user id=1
        opts.module          ?? 'credit_sales',
        dbAction,
        opts.recordType      ?? null,
        opts.recordId        ?? null,
        opts.referenceNumber ?? null,
        opts.description,
        opts.ipAddress       ?? null,
        dbSeverity,
      ],
    )
  } catch (e) {
    // Never crash or roll back the main operation due to audit failure
    // Uncomment below for debugging if audit writes are still failing:
    // console.error('[auditLog] INSERT failed:', e)
  }
}
