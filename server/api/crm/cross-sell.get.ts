import { scopedHealth } from '~/server/utils/crm'
import { crossSell } from '~/server/utils/crmIntel'

/** GET /api/crm/cross-sell — products peers buy that a customer does not, and the biggest gaps by business type. */
export default defineEventHandler(async (event) => {
  const r = await crossSell(await scopedHealth(event))
  return { gaps: r.gaps, suggestions: r.suggestions.slice(0, 120), total: r.suggestions.length }
})
