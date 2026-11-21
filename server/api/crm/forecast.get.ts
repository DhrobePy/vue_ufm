import { scopedHealth } from '~/server/utils/crm'
import { forecast } from '~/server/utils/crmIntel'

/** GET /api/crm/forecast — monthly sales, the next 3 months with a back-tested error band, and orders expected in the next 30 days. */
export default defineEventHandler(async (event) => forecast(await scopedHealth(event)))
