import { query } from '~/server/utils/db'
import { scopedHealth, dhakaToday, DISTRICT_CENTRE } from '~/server/utils/crm'
import { nextActions } from '~/server/utils/crmIntel'

/**
 * GET /api/crm/route — who is worth visiting, with coordinates.
 * Exact position = a GPS pin saved at an earlier visit; otherwise the middle of the district (flagged approximate).
 * Order of stops is worked out in the browser (nearest-neighbour from the chosen start point).
 */
const centre = (d: string): [number, number] | null => DISTRICT_CENTRE[d] ?? null
export default defineEventHandler(async (event) => {
  const today = dhakaToday(), rows = await scopedHealth(event)
  const acts = await nextActions(rows, { limit: 60 })
  const pins = new Map<string, [number, number]>()
  try {
    for (const r of await query<any>(`SELECT id, lat, lon FROM customers WHERE lat IS NOT NULL AND lon IS NOT NULL`)) pins.set(`customer:${r.id}`, [Number(r.lat), Number(r.lon)])
    for (const r of await query<any>(`SELECT id, lat, lon FROM crm_prospects WHERE lat IS NOT NULL AND lon IS NOT NULL`)) pins.set(`prospect:${r.id}`, [Number(r.lat), Number(r.lon)])
  } catch { /* GPS columns not added yet */ }
  const visitTasks = await query<any>(`SELECT t.party_type, t.party_id, t.title, COALESCE(c.name, p.name) name, c.id cid, p.id pid, p.district pdistrict, p.stage FROM crm_tasks t LEFT JOIN customers c ON t.party_type = 'customer' AND c.id = t.party_id LEFT JOIN crm_prospects p ON t.party_type = 'prospect' AND p.id = t.party_id WHERE t.status = 'open' AND t.kind = 'visit' AND (t.due_date IS NULL OR t.due_date <= ?)`, [today])
  const byId = new Map(rows.map(r => [r.id, r]))
  const out = new Map<string, any>()
  const put = (type: string, id: number, name: string, district: string, reason: string, value: number, tag: string) => {
    const key = `${type}:${id}`, exact = pins.get(key), c = exact ?? centre(district)
    const cur = out.get(key)
    if (cur) { cur.tags.push(tag); return }
    out.set(key, { key, party_type: type, id, name, district, reason, value: Math.round(value), tags: [tag], lat: c?.[0] ?? null, lon: c?.[1] ?? null, exact: !!exact })
  }
  for (const t of visitTasks) { const r = t.party_type === 'customer' ? byId.get(t.party_id) : null; put(t.party_type, t.party_id, t.name ?? '—', r?.district ?? t.pdistrict ?? 'Unknown', t.title, 0, 'visit task') }
  for (const a of acts.actions) put(a.party_type, a.party_id, a.name, a.district, a.headline, a.value, a.type)
  const users = await query<any>(`SELECT id, display_name FROM users WHERE status = 'active' ORDER BY display_name`)
  return { today, stops: [...out.values()], pinned: pins.size, users,
    starts: [{ key: 'demra', label: 'Demra mill', lat: 23.7186, lon: 90.4955 }, { key: 'sirajganj', label: 'Sirajganj mill', lat: 24.4534, lon: 89.7007 }] }
})
