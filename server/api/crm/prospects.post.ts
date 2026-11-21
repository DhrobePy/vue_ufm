import { query } from '~/server/utils/db'
import { SEGMENTS, crmUser } from '~/server/utils/crm'

/** POST /api/crm/prospects — add a prospect. Duplicates (same phone as a prospect or a customer) are reported back, not silently created. */
export default defineEventHandler(async (event) => {
  const me = await crmUser(event), b = await readBody(event)
  const name = String(b?.name ?? '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'A name is required' })
  const phone = String(b?.phone ?? '').trim() || null, last9 = String(phone ?? '').replace(/\D/g, '').slice(-9)
  if (last9.length >= 8 && !b?.allow_duplicate) {
    const dupC = await query<any>(`SELECT id, name FROM customers WHERE RIGHT(REGEXP_REPLACE(phone_number, '[^0-9]', ''), 9) = ? LIMIT 1`, [last9])
    if (dupC.length) throw createError({ statusCode: 409, statusMessage: `Already a customer: ${dupC[0].name} (#${dupC[0].id}) — has the same phone number` })
    const dupP = await query<any>(`SELECT id, name FROM crm_prospects WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', ''), 9) = ? LIMIT 1`, [last9])
    if (dupP.length) throw createError({ statusCode: 409, statusMessage: `Already a prospect: ${dupP[0].name} (#${dupP[0].id}) — has the same phone number` })
  }
  const seg = (SEGMENTS as readonly string[]).includes(b?.segment) ? b.segment : null
  const s = (k: string, n = 200) => String(b?.[k] ?? '').trim().slice(0, n) || null
  const r: any = await query(
    `INSERT INTO crm_prospects (name, business_name, segment, district, address, phone, phone2, email, website, contact_person, source, source_url, source_note, owner_user_id, created_by_user_id, created_by_agent, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [name.slice(0, 160), s('business_name', 160), seg, s('district', 40), s('address', 300), phone?.slice(0, 40) ?? null, s('phone2', 40), s('email', 160), s('website', 300), s('contact_person', 120), s('source', 60) ?? 'manual', s('source_url', 500), s('source_note', 500), me.id, me.id, s('notes', 2000)])
  return { ok: true, id: r.insertId }
})
