import { query } from '~/server/utils/db'
import { customerHealth, assessProspect } from '~/server/utils/crm'

/** GET /api/crm/prospects?stage= — the prospect pipeline with a quick score on each. */
export default defineEventHandler(async (event) => {
  const stage = String(getQuery(event).stage ?? '')
  const rows = await query<any>(
    `SELECT p.*, (SELECT MAX(i.created_at) FROM crm_interactions i WHERE i.party_type = 'prospect' AND i.party_id = p.id) AS last_contact, u.display_name AS owner_name
     FROM crm_prospects p LEFT JOIN users u ON u.id = p.owner_user_id ${stage ? 'WHERE p.stage = ?' : ''} ORDER BY FIELD(p.stage,'new','researching','contacted','quoted','trial','won','lost'), p.updated_at DESC LIMIT 300`, stage ? [stage] : [])
  const health = await customerHealth()
  const out = []
  for (const p of rows) {
    const checklist = typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : (p.checklist ?? {})
    const a = await assessProspect({ ...p, checklist }, health)
    out.push({ ...p, checklist, fit: a.fit, risk_band: a.risk.band, verdict: a.verdict, confidence: a.confidence, potential_monthly_low: a.potential.monthly_low, potential_monthly_high: a.potential.monthly_high })
  }
  return { prospects: out }
})
