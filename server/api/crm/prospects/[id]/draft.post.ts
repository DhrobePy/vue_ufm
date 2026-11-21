import { query } from '~/server/utils/db'
import { customerHealth, assessProspect } from '~/server/utils/crm'
import { draftOutreach } from '~/server/utils/crmAgent'

/** POST /api/crm/prospects/:id/draft { channel: 'sms'|'whatsapp'|'email', lang: 'bn'|'en' } — a first-contact draft. Never sent automatically. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id')), b = await readBody(event)
  const [p] = await query<any>(`SELECT * FROM crm_prospects WHERE id = ?`, [id])
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Prospect not found' })
  p.checklist = typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : (p.checklist ?? {})
  const a = await assessProspect(p, await customerHealth())
  const channel = ['sms', 'whatsapp', 'email'].includes(b?.channel) ? b.channel : 'sms'
  return await draftOutreach(p, a, channel, b?.lang === 'en' ? 'en' : 'bn')
})
