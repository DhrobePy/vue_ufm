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

  // Table is guaranteed by db-migrate startup plugin — no DDL needed here.
  const db   = getDb()
  const conn = await db.getConnection()
  try {
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
