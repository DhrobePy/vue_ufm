import { askAgent } from '~/server/utils/crmAgent'
import { crmUser } from '~/server/utils/crm'

/** POST /api/crm/agent { question, history?: [{role, text}] } — ask the CRM assistant. Needs Settings → CRM switched on and a server API key. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  const question = String(b?.question ?? '').trim()
  if (!question) throw createError({ statusCode: 400, statusMessage: 'Ask a question' })
  const history = Array.isArray(b?.history) ? b.history.filter((h: any) => ['user', 'assistant'].includes(h?.role) && typeof h?.text === 'string') : []
  return await askAgent(event, me.id, question, history)
})
