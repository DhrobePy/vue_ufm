import { scopedHealth } from '~/server/utils/crm'
import { outcomes } from '~/server/utils/crmOutcomes'

/** GET /api/crm/outcomes — did the follow-ups, promises and prospect work pay off? */
export default defineEventHandler(async (event) => outcomes(await scopedHealth(event)))
