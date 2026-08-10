import { query } from '~/server/utils/db'

/**
 * POST /api/fleet/trips/consolidation-suggestions — dismiss one suggested
 * pair. Body: { trip_id_a, trip_id_b }. Stored normalized (min, max) so the
 * unique key can't be dodged by swapping the order the two trip ids arrive
 * in. Idempotent — dismissing twice just refreshes dismissed_at.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const idA = Number(body?.trip_id_a)
  const idB = Number(body?.trip_id_b)
  if (!idA || !idB || idA === idB)
    throw createError({ statusCode: 400, statusMessage: 'trip_id_a and trip_id_b are required and must differ' })

  const lo = Math.min(idA, idB)
  const hi = Math.max(idA, idB)

  const session = await getUserSession(event)
  const userId  = Number((session?.user as any)?.id) || null

  await query(
    `INSERT INTO fleet_trip_consolidation_dismissals (trip_id_a, trip_id_b, dismissed_by_user_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE dismissed_at = CURRENT_TIMESTAMP, dismissed_by_user_id = VALUES(dismissed_by_user_id)`,
    [lo, hi, userId],
  )

  return { ok: true }
})
