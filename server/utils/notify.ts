/**
 * Notification utility — creates in-app notification rows.
 *
 * The notifications table is auto-created on first use.
 * All operations are INSERT IGNORE / best-effort so a notification
 * failure never blocks the calling transaction.
 *
 * stable_id is a content-based key (e.g. "exp-7-approved-u3") that
 * prevents duplicate rows for the same event + user combination.
 */

const TABLE_DDL = `
  CREATE TABLE IF NOT EXISTS notifications (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    stable_id    VARCHAR(150) NOT NULL,
    user_id      INT          NOT NULL,
    text         VARCHAR(500) NOT NULL,
    type         ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
    route        VARCHAR(300) NOT NULL DEFAULT '/',
    module       VARCHAR(50),
    reference_id INT,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_stable (stable_id),
    INDEX  idx_user_time (user_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`

let _tableEnsured = false

async function ensureTable(conn: any): Promise<void> {
  if (_tableEnsured) return
  await conn.query(TABLE_DDL).catch(() => {})
  _tableEnsured = true
}

export interface NotifyOptions {
  /** DB connection — must already be inside the caller's transaction */
  conn:        any
  /** Unique event key; appended with -u{userId} for per-user deduplication */
  stableId:    string
  /** ID of the user who should see this notification */
  userId:      number
  /** Short human-readable message shown in the dropdown */
  text:        string
  /** Badge colour */
  type:        'info' | 'success' | 'warning' | 'error'
  /** Vue-router path to navigate to when the notification is clicked */
  route:       string
  module?:     string
  referenceId?: number
}

/** Send one notification to one user. Idempotent on stable_id. */
export async function notify(opts: NotifyOptions): Promise<void> {
  try {
    await ensureTable(opts.conn)
    await opts.conn.query(
      `INSERT IGNORE INTO notifications
         (stable_id, user_id, text, type, route, module, reference_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        opts.stableId,
        opts.userId,
        opts.text.slice(0, 499),
        opts.type,
        opts.route,
        opts.module ?? null,
        opts.referenceId ?? null,
      ],
    )
  } catch {
    // Notifications must never block the main transaction
  }
}

/** Send the same notification to every active admin / superadmin user. */
export async function notifyAdmins(opts: Omit<NotifyOptions, 'userId' | 'stableId'> & { stableId: string }): Promise<void> {
  try {
    const [admins] = await opts.conn.query<any[]>(
      `SELECT id FROM users WHERE role IN ('admin','superadmin') AND status = 'active'`,
    ).catch(() => [[]])
    for (const admin of (admins as any[])) {
      await notify({ ...opts, userId: admin.id, stableId: `${opts.stableId}-u${admin.id}` })
    }
  } catch {
    // Best-effort
  }
}
