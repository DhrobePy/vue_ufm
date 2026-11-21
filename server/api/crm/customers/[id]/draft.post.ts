import { scopedHealth } from '~/server/utils/crm'
import { draftCustomerMessage } from '~/server/utils/crmAgent'
import { reorderRadar, crossSell } from '~/server/utils/crmIntel'

/** POST /api/crm/customers/:id/draft { kind: 'reorder'|'collect'|'winback'|'crosssell'|'checkin', channel, lang } — a draft message. Never sent automatically. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id')), b = await readBody(event), rows = await scopedHealth(event), c = rows.find(r => r.id === id)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Customer not found, or outside your branch.' })
  const kind = ['reorder', 'collect', 'winback', 'crosssell', 'checkin'].includes(b?.kind) ? b.kind : 'checkin'
  const channel = ['sms', 'whatsapp', 'email'].includes(b?.channel) ? b.channel : 'whatsapp'
  const extra: any = {}
  if (kind === 'crosssell') extra.product = (await crossSell(rows)).suggestions.find(s => s.customer_id === id)?.product
  if (kind === 'reorder') extra.gap = (await reorderRadar(rows)).find(r => r.id === id)?.usual_gap
  return await draftCustomerMessage(c, kind, channel, b?.lang === 'en' ? 'en' : 'bn', extra)
})
