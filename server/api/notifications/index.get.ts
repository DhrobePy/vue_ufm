import { getDb } from '~/server/utils/db'

/**
 * GET /api/notifications
 * Returns the 50 most recent notifications for the current user.
 * Shape matches AppTopbar.vue's Notification interface:
 *   { id: string, text: string, type, time, route, read: false }
 *
 * "read" is always false from the API — the client tracks read state
 * in localStorage so it persists across sessions without extra round-trips.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId  = session?.user?.id ?? 0
  if (!userId) return []

  const db   = getDb()
  const conn = await db.getConnection()
  try {
    // Ensure table exists (safe repeated calls)
    await conn.query(`
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
    `).catch(() => {})

    const [rows] = await conn.query<any[]>(
      `SELECT stable_id            AS id,
              text,
              type,
              route,
              DATE_FORMAT(created_at, '%d %b %Y %H:%i') AS time
       FROM   notifications
       WHERE  user_id = ?
       ORDER  BY created_at DESC
       LIMIT  50`,
      [userId],
    )

    // read is always false from API — client manages read state via localStorage
    return (rows as any[]).map(r => ({ ...r, read: false }))
  } finally {
    conn.release()
  }
})
