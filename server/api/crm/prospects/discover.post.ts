import { crmUser } from '~/server/utils/crm'
import { discover, AREAS, KINDS } from '~/server/utils/prospectSearch'

/** POST /api/crm/prospects/discover { district, kinds[] } — search public listings; returns candidates, saves nothing. */
export default defineEventHandler(async (event) => {
  await crmUser(event)
  const b = await readBody(event)
  const key = String(useRuntimeConfig(event).googlePlacesKey ?? '')
  return { ...(await discover(String(b?.district ?? ''), Array.isArray(b?.kinds) ? b.kinds : [], key)), areas: Object.keys(AREAS), kinds: Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, v.label])) }
})
