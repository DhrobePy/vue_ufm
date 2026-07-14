import { getExceptionRadar } from '~/server/utils/exceptionRadar'
import { maybeTriggerOwnerDigest } from '~/server/utils/ownerDigest'

/**
 * GET /api/dashboard/exception-radar
 * Owner visibility (spec §2.13): counts of everything that needs a human
 * to look at it. Defensive per-metric — a missing/unmigrated table yields 0
 * for that tile instead of failing the whole dashboard.
 *
 * Also doubles as the in-app fallback trigger for the daily owner digest
 * (spec §2.13: "first admin-dashboard load after 6am") — fire-and-forget,
 * never blocks or fails this response.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  maybeTriggerOwnerDigest() // fire-and-forget; internally idempotent + time-gated

  return getExceptionRadar()
})
