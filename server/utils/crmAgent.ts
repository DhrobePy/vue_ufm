import Anthropic from '@anthropic-ai/sdk'
import { query } from '~/server/utils/db'
import { getAppSettings } from '~/server/utils/appSettings'
import { reorderRadar, crossSell, forecast, nextActions } from '~/server/utils/crmIntel'
import { outcomes } from '~/server/utils/crmOutcomes'
import { scopedHealth, portfolioSummary, assessProspect, customerHealth, dhakaToday, SEGMENTS, type CustomerHealth } from '~/server/utils/crm'

/**
 * The CRM assistant. Claude gets a fixed set of tools over the ERP and the CRM records:
 *   read   portfolio summary, find customers, one customer's card, prospects, a prospect's scored assessment (all computed by SQL / crm.ts — the model never does the arithmetic)
 *   write  only CRM records: new prospects (with a source), notes in the contact log, follow-up tasks
 *   never  money, orders, credit limits, approvals, or sending anything to a customer — it drafts, a person decides and sends
 * It runs as the signed-in user (branch scope applies), every answer is logged, and Settings → CRM can switch it off or cap questions per day.
 */
const SYSTEM = (company: string, today: string, web: boolean) => `You are the CRM assistant inside ${company}'s ERP (a flour mill selling mostly on credit to traders, bakeries and food makers in Bangladesh; mills at Demra and Sirajganj; today is ${today}, amounts are in taka ৳).

Your job: help staff get paid on time, keep customers ordering, assess and win good new customers, and remember the relationship.

Rules you must follow:
- Every figure comes from a tool result. Never calculate money yourself beyond simple comparisons and never guess a number; if a tool did not give it, say you don't have it.
- Name the customers / prospects you refer to (with #id) so staff can open them.
- You cannot change money, orders, credit limits or approvals, and you cannot send messages. You can draft them. Credit-limit or terms changes are suggestions for the existing approval process.
- Contact details for new prospects must come from a source you actually saw (give its URL). Never invent a phone number, email or address. If you did not find one, say "not found".
- Only add a prospect, task or note when the user asked you to (or clearly agreed); say what you created.
- Be short and practical: lead with the answer, then at most a few next steps. Reply in the language the user writes in (Bangla or English). Drafts (SMS / WhatsApp / email) must be brief, polite, specific to the business type, with no pressure tactics, and end with a simple way to opt out.
- Do not infer anything from a person's name, religion or gender.${web ? '\n- You may search the web to find prospects. Use public business information only, prefer a few good leads over many weak ones, and record for each lead where you found it.' : ''}`

/** The company phone is still the install-time placeholder (…000000) → leave a visible [PHONE] marker instead of a fake number; sending is refused until it is replaced. */
const realPhone = (p: any) => ({ ...p, phone: /0{6}/.test(String(p?.phone ?? '')) || !String(p?.phone ?? '').trim() ? '[PHONE]' : p.phone })
const mask = (p: string | null | undefined, on: boolean) => !p ? null : on ? String(p).replace(/\d(?=\d{3})/g, 'X') : p
const slim = (r: CustomerHealth, maskPhones: boolean) => ({
  id: r.id, name: r.name, business: r.business_name, phone: mask(r.phone, maskPhones), segment: r.segment, district: r.district, branch: r.branch, label: r.label,
  value_12m: Math.round(r.value_12m), orders_12m: r.orders_12m, last_order: r.last_order, days_since_last_order: r.days_since_last, usual_gap_days: r.gap_days,
  balance: Math.round(r.balance), credit_limit: Math.round(r.credit_limit), over_limit: r.over_limit, overdue_30d: Math.round(r.overdue30), overdue_60d: Math.round(r.overdue60), avg_days_to_pay: r.pay_days,
  top_product: r.top_product, reasons: r.reasons, suggested_next_steps: r.suggestions,
})
const clip = (v: unknown) => { const s = JSON.stringify(v); return s.length > 14000 ? s.slice(0, 14000) + '…(truncated — ask a narrower question)' : s }

type Ctx = { event: any; userId: number; maskPhones: boolean; used: string[] }
const TOOLS: Anthropic.Beta.BetaTool[] = [
  { name: 'portfolio_summary', description: 'Whole-customer-portfolio assessment: concentration (top 1/5/10/20 share), health labels, business-type / district / branch / product mix, credit exposure, data gaps. Use for any "how is our portfolio / where are we weak" question.', input_schema: { type: 'object', properties: {} } },
  { name: 'find_customers', description: 'List customers with their health label, reasons and suggested next steps. Filter by label (Never bought, Dormant, Risky, Slipping, Growing, Loyal, Steady), segment, district, or text. Sorted by urgency. Max 25 rows.', input_schema: { type: 'object', properties: { label: { type: 'string' }, segment: { type: 'string' }, district: { type: 'string' }, search: { type: 'string', description: 'part of a name, business name or area' }, limit: { type: 'integer' } } } },
  { name: 'customer_detail', description: 'One customer in full: health, recent orders and payments, contact log, open tasks.', input_schema: { type: 'object', properties: { customer_id: { type: 'integer' } }, required: ['customer_id'] } },
  { name: 'list_prospects', description: 'The prospect pipeline (optionally one stage: new, researching, contacted, quoted, trial, won, lost) with fit score, risk band and verdict.', input_schema: { type: 'object', properties: { stage: { type: 'string' } } } },
  { name: 'assess_prospect', description: 'Scored assessment of a saved prospect: fit, estimated potential (range, from similar customers), risk flags (duplicates, links to blocked customers, missing checks), suggested first-order terms, and what is still unknown.', input_schema: { type: 'object', properties: { prospect_id: { type: 'integer' } }, required: ['prospect_id'] } },
  { name: 'next_actions', description: 'The ranked to-do list for today across collections, reorders that are due, customers going quiet, products to cross-sell and prospects to chase. Use for "who should I call today / what should I do first".', input_schema: { type: 'object', properties: { limit: { type: 'integer' } } } },
  { name: 'reorder_radar', description: 'Regular customers with their usual reorder gap, expected next order date, how many days late, and a churn % (how likely they are slipping away). Optional filter by status (on_track, due_soon, due, late, lapsing). Max 25 rows, most value at risk first.', input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['on_track', 'due_soon', 'due', 'late', 'lapsing'] }, limit: { type: 'integer' } } } },
  { name: 'cross_sell', description: 'Products that peers of the same business type buy and a customer does not, with an estimated monthly value; plus the biggest product gaps by business type. Optional customer_id.', input_schema: { type: 'object', properties: { customer_id: { type: 'integer' } } } },
  { name: 'sales_forecast', description: 'Monthly sales history, the next 3 months with an error band measured by back-testing, this month\'s pace, and the orders expected in the next 30 days.', input_schema: { type: 'object', properties: {} } },
  { name: 'outcomes', description: 'Whether follow-ups work: share of contacted customers who ordered / paid within 14 days (by channel), promise-to-pay reliability, task punctuality, prospect win rate by source and type.', input_schema: { type: 'object', properties: {} } },
  { name: 'create_prospect', description: 'Save a new prospect. Include source_url for anything found online. Refused if the phone already belongs to a customer or prospect. Only call when the user asked for it.', input_schema: { type: 'object', properties: { name: { type: 'string' }, business_name: { type: 'string' }, segment: { type: 'string', enum: [...SEGMENTS] }, district: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string' }, website: { type: 'string' }, contact_person: { type: 'string' }, source_url: { type: 'string' }, source_note: { type: 'string', description: 'what the source showed, e.g. "Google Maps listing, 4.1★, bakery"' } }, required: ['name'] } },
  { name: 'add_note', description: 'Write a note into a customer\'s or prospect\'s contact log.', input_schema: { type: 'object', properties: { party_type: { type: 'string', enum: ['customer', 'prospect'] }, party_id: { type: 'integer' }, summary: { type: 'string' } }, required: ['party_type', 'party_id', 'summary'] } },
  { name: 'create_task', description: 'Create a follow-up task for the user (call, visit, collect, reorder, credit_review, other). Only when the user asked for it.', input_schema: { type: 'object', properties: { party_type: { type: 'string', enum: ['customer', 'prospect'] }, party_id: { type: 'integer' }, title: { type: 'string' }, kind: { type: 'string', enum: ['follow_up', 'collect', 'reorder', 'credit_review', 'visit', 'other'] }, due_date: { type: 'string', description: 'YYYY-MM-DD' } }, required: ['party_type', 'party_id', 'title'] } },
]

async function runTool(name: string, input: any, c: Ctx): Promise<string> {
  c.used.push(name)
  try {
    if (name === 'portfolio_summary') return clip(await portfolioSummary(await scopedHealth(c.event)))
    if (name === 'find_customers') {
      const s = String(input?.search ?? '').toLowerCase().trim(), lim = Math.min(25, Math.max(1, Number(input?.limit) || 15))
      const rows = (await scopedHealth(c.event)).filter(r => (!input?.label || r.label === input.label) && (!input?.segment || r.segment === input.segment) && (!input?.district || r.district === input.district)
        && (!s || `${r.name} ${r.business_name ?? ''} ${r.address ?? ''}`.toLowerCase().includes(s))).sort((a, b) => b.priority - a.priority || b.value_12m - a.value_12m)
      return clip({ total_matching: rows.length, customers: rows.slice(0, lim).map(r => slim(r, c.maskPhones)) })
    }
    if (name === 'next_actions') { const r = await nextActions(await scopedHealth(c.event), { userId: c.userId, limit: Math.min(25, Number(input?.limit) || 12) }); return clip({ total: r.total, counts: r.counts, actions: r.actions.map(a => ({ type: a.type, id: a.party_id, kind: a.party_type, name: a.name, headline: a.headline, why: a.why, value: Math.round(a.value), last_contact_days: a.last_contact_days })) }) }
    if (name === 'reorder_radar') { const rows = (await reorderRadar(await scopedHealth(c.event))).filter(r => !input?.status || r.status === input.status); return clip({ matching: rows.length, rows: rows.slice(0, Math.min(25, Number(input?.limit) || 15)).map(({ phone, ...r }) => r) }) }
    if (name === 'cross_sell') { const r = await crossSell(await scopedHealth(c.event)), id = Number(input?.customer_id); return clip(id ? { suggestions: r.suggestions.filter(s => s.customer_id === id).slice(0, 5) } : { biggest_gaps: r.gaps, top_suggestions: r.suggestions.slice(0, 15) }) }
    if (name === 'sales_forecast') return clip(await forecast(await scopedHealth(c.event)))
    if (name === 'outcomes') return clip(await outcomes(await scopedHealth(c.event)))
    if (name === 'customer_detail') {
      const id = Number(input?.customer_id), me = (await scopedHealth(c.event)).find(r => r.id === id)
      if (!me) return 'Customer not found, or outside this user\'s branch.'
      const [orders, payments, inter, tasks] = await Promise.all([
        query<any>(`SELECT order_number, order_date, total_amount AS amount, balance_due AS due, status FROM credit_orders WHERE customer_id = ? ORDER BY order_date DESC, id DESC LIMIT 8`, [id]),
        query<any>(`SELECT payment_date, amount, payment_method AS method FROM customer_payments WHERE customer_id = ? AND reversed_at IS NULL ORDER BY payment_date DESC LIMIT 8`, [id]),
        query<any>(`SELECT channel, summary, outcome, created_at FROM crm_interactions WHERE party_type = 'customer' AND party_id = ? ORDER BY id DESC LIMIT 10`, [id]),
        query<any>(`SELECT id, kind, title, due_date FROM crm_tasks WHERE party_type = 'customer' AND party_id = ? AND status = 'open' ORDER BY due_date LIMIT 10`, [id])])
      return clip({ customer: slim(me, c.maskPhones), recent_orders: orders, recent_payments: payments, contact_log: inter, open_tasks: tasks })
    }
    if (name === 'list_prospects') {
      const rows = await query<any>(`SELECT * FROM crm_prospects ${input?.stage ? 'WHERE stage = ?' : ''} ORDER BY updated_at DESC LIMIT 30`, input?.stage ? [input.stage] : [])
      const h = await customerHealth()
      return clip(await Promise.all(rows.map(async p => { const a = await assessProspect({ ...p, checklist: typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : p.checklist }, h)
        return { id: p.id, name: p.name, stage: p.stage, segment: a.segment, district: a.district, fit: a.fit, risk: a.risk.band, verdict: a.verdict, confidence: a.confidence } })))
    }
    if (name === 'assess_prospect') {
      const [p] = await query<any>(`SELECT * FROM crm_prospects WHERE id = ?`, [Number(input?.prospect_id)])
      if (!p) return 'Prospect not found.'
      const a = await assessProspect({ ...p, checklist: typeof p.checklist === 'string' ? JSON.parse(p.checklist || '{}') : p.checklist }, await customerHealth())
      return clip({ prospect: { id: p.id, name: p.name, stage: p.stage, source: p.source_url ?? p.source }, assessment: { ...a, checklist: { completeness: a.checklist.completeness, missing: a.checklist.missing } } })
    }
    if (name === 'create_prospect') {
      const name2 = String(input?.name ?? '').trim(); if (!name2) return 'A name is required.'
      const phone = String(input?.phone ?? '').trim() || null, last9 = String(phone ?? '').replace(/\D/g, '').slice(-9)
      if (last9.length >= 8) {
        const dc = await query<any>(`SELECT id, name FROM customers WHERE RIGHT(REGEXP_REPLACE(phone_number, '[^0-9]', ''), 9) = ? LIMIT 1`, [last9]); if (dc.length) return `Not created: that phone already belongs to customer ${dc[0].name} (#${dc[0].id}).`
        const dp = await query<any>(`SELECT id, name FROM crm_prospects WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', ''), 9) = ? LIMIT 1`, [last9]); if (dp.length) return `Not created: already a prospect ${dp[0].name} (#${dp[0].id}).`
      }
      const g = (k: string, n = 300) => String(input?.[k] ?? '').trim().slice(0, n) || null
      const seg = (SEGMENTS as readonly string[]).includes(input?.segment) ? input.segment : null
      const r: any = await query(`INSERT INTO crm_prospects (name, business_name, segment, district, address, phone, email, website, contact_person, source, source_url, source_note, owner_user_id, created_by_user_id, created_by_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'assistant', ?, ?, ?, ?, 1)`,
        [name2.slice(0, 160), g('business_name', 160), seg, g('district', 40), g('address'), phone?.slice(0, 40) ?? null, g('email', 160), g('website'), g('contact_person', 120), g('source_url', 500), g('source_note', 500), c.userId, c.userId])
      return `Created prospect #${r.insertId} (${name2}).`
    }
    if (name === 'add_note') {
      const type = input?.party_type === 'prospect' ? 'prospect' : 'customer'
      await query(`INSERT INTO crm_interactions (party_type, party_id, channel, summary, user_id, via_agent) VALUES (?, ?, 'note', ?, ?, 1)`, [type, Number(input?.party_id), String(input?.summary ?? '').slice(0, 1000), c.userId])
      return 'Note saved.'
    }
    if (name === 'create_task') {
      const type = input?.party_type === 'prospect' ? 'prospect' : 'customer', kind = ['follow_up', 'collect', 'reorder', 'credit_review', 'visit', 'other'].includes(input?.kind) ? input.kind : 'follow_up'
      const due = /^\d{4}-\d{2}-\d{2}$/.test(String(input?.due_date ?? '')) ? input.due_date : null
      const r: any = await query(`INSERT INTO crm_tasks (party_type, party_id, kind, title, due_date, assigned_user_id, created_by_user_id, created_by_agent) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`, [type, Number(input?.party_id), kind, String(input?.title ?? '').slice(0, 300), due, c.userId, c.userId])
      return `Task #${r.insertId} created${due ? ` for ${due}` : ''}.`
    }
    return 'Unknown tool.'
  } catch (e: any) { return `Tool error: ${String(e?.message ?? e).slice(0, 200)}` }
}

export async function agentStatus() {
  const cfg = useRuntimeConfig(), pol = (await getAppSettings(true)).crm_policy
  const [u] = await query<any>(`SELECT COUNT(*) n, COALESCE(SUM(web_searches),0) w FROM crm_agent_log WHERE created_at >= ?`, [dhakaToday() + ' 00:00:00'])
  return { enabled: !!pol.agentEnabled, configured: !!cfg.anthropicApiKey, web_search: !!pol.webSearch, model: String(cfg.crmAgentModel || 'claude-opus-5-5'), used_today: Number(u.n), web_searches_today: Number(u.w), daily_limit: Number(pol.dailyLimit) || 100, mask_phones: !!pol.maskPhones }
}

export async function askAgent(event: any, userId: number, question: string, history: { role: 'user' | 'assistant'; text: string }[] = []) {
  const cfg = useRuntimeConfig(), st = await agentStatus(), pol = (await getAppSettings()).crm_policy
  if (!st.enabled) throw createError({ statusCode: 403, statusMessage: 'The CRM assistant is switched off (Admin → Settings → CRM).' })
  if (!st.configured) throw createError({ statusCode: 503, statusMessage: 'The CRM assistant has no API key yet — ask the administrator to set NUXT_ANTHROPIC_API_KEY on the server.' })
  if (st.used_today >= st.daily_limit) throw createError({ statusCode: 429, statusMessage: `Daily limit of ${st.daily_limit} questions reached — try again tomorrow or ask an admin to raise it.` })
  const company = (await getAppSettings()).company_profile.name
  const client = new Anthropic({ apiKey: String(cfg.anthropicApiKey), maxRetries: 2, timeout: 180_000 })
  const used: string[] = [], ctx: Ctx = { event, userId, maskPhones: !!pol.maskPhones, used }
  const tools: Anthropic.Beta.BetaToolUnion[] = [...TOOLS]
  if (pol.webSearch) tools.push({ type: 'web_search_20260209', name: 'web_search', max_uses: 5, user_location: { type: 'approximate', country: 'BD', city: 'Dhaka', region: 'Dhaka', timezone: 'Asia/Dhaka' } } as any)

  const messages: Anthropic.Beta.BetaMessageParam[] = [...history.slice(-8).map(h => ({ role: h.role, content: h.text.slice(0, 4000) })), { role: 'user', content: question.slice(0, 2000) }]
  let inTok = 0, outTok = 0, webSearches = 0, answer = ''
  let useFallbacks = true
  try {
    for (let turn = 0; turn < 8; turn++) {
      const req: any = {
        model: st.model, max_tokens: 8000, system: SYSTEM(company, dhakaToday(), !!pol.webSearch), tools, messages,
        output_config: { effort: 'medium' }, cache_control: { type: 'ephemeral' },
        ...(useFallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
      }
      let res: Anthropic.Beta.BetaMessage
      try { res = await client.beta.messages.create(req) }
      catch (e: any) {
        // if this account/model rejects the fallback option, run once without it
        if (useFallbacks && e instanceof Anthropic.BadRequestError && /fallback/i.test(String(e.message))) { useFallbacks = false; turn--; continue }
        throw e
      }
      inTok += res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0); outTok += res.usage.output_tokens
      webSearches += (res.usage as any).server_tool_use?.web_search_requests ?? 0
      messages.push({ role: 'assistant', content: res.content })          // keep thinking / server-tool blocks exactly as returned
      if (res.stop_reason === 'refusal') { answer = 'I can\'t help with that request.'; break }
      if (res.stop_reason === 'pause_turn') continue                         // a server tool (web search) paused the turn — carry on
      if (res.stop_reason === 'tool_use') {
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = []
        for (const b of res.content) if (b.type === 'tool_use') results.push({ type: 'tool_result', tool_use_id: b.id, content: await runTool(b.name, b.input, ctx) })
        messages.push({ role: 'user', content: results })                    // all results of one turn go back together
        continue
      }
      answer = res.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map(b => b.text).join('\n').trim()
      if (res.stop_reason === 'max_tokens') answer += '\n\n(The answer was cut short — ask a narrower question.)'
      break
    }
    if (!answer) answer = 'I could not finish that in the allowed steps — please ask a narrower question.'
    await query(`INSERT INTO crm_agent_log (user_id, question, tools_used, answer_preview, input_tokens, output_tokens, web_searches, model, ok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, question.slice(0, 1000), [...new Set(used)].join(',').slice(0, 500), answer.slice(0, 400), inTok, outTok, webSearches, st.model])
    return { answer, tools_used: [...new Set(used)], tokens: { input: inTok, output: outTok }, web_searches: webSearches }
  } catch (e: any) {
    const msg = e instanceof Anthropic.AuthenticationError ? 'The API key was rejected.' : e instanceof Anthropic.RateLimitError ? 'The AI service is busy — try again in a minute.' : String(e?.statusMessage ?? e?.message ?? e).slice(0, 250)
    await query(`INSERT INTO crm_agent_log (user_id, question, tools_used, model, ok, error) VALUES (?, ?, ?, ?, 0, ?)`, [userId, question.slice(0, 1000), [...new Set(used)].join(',').slice(0, 500), st.model, msg]).catch(() => {})
    throw createError({ statusCode: e?.statusCode ?? 502, statusMessage: msg })
  }
}

/** A first-contact message for a prospect. With the assistant on, Claude writes it (no tools, one cheap call); otherwise a plain template. Always a draft — a person sends it. */
export async function draftOutreach(p: any, a: any, channel: 'sms' | 'whatsapp' | 'email', lang: 'bn' | 'en') {
  const company = realPhone((await getAppSettings()).company_profile)
  const tpl = () => {
    const who = p.contact_person || p.name, prod = a.benchmark?.top_products?.[0]?.replace(/\s*\(.*\)/, '') ?? 'flour'
    if (lang === 'bn') {
      const body = `আসসালামু আলাইকুম ${who}। আমি ${company.name} থেকে বলছি। আমরা ${prod}সহ ময়দা, আটা ও ভুসি নিয়মিত সরবরাহ করি। আপনার ব্যবসার জন্য ভালো দাম ও সময়মতো ডেলিভারি দিতে পারব। কথা বলতে চাইলে ${company.phone} নম্বরে কল করুন। আর বার্তা না চাইলে জানাবেন।`
      return channel === 'email' ? { subject: `${company.name} — আপনার ব্যবসার জন্য ময়দা ও আটা সরবরাহ`, body } : { body }
    }
    const body = `Hello ${who}, this is ${company.name}. We supply flour (${prod}), atta and bran with steady supply and on-time delivery, and can quote for ${p.business_name || p.name}. Please call ${company.phone} if you'd like a quote. Reply STOP if you'd rather not hear from us.`
    return channel === 'email' ? { subject: `Flour supply for ${p.business_name || p.name} — ${company.name}`, body } : { body }
  }
  const cfg = useRuntimeConfig(), st = await agentStatus()
  if (!st.enabled || !st.configured) return { ...tpl(), source: 'template' }
  try {
    const client = new Anthropic({ apiKey: String(cfg.anthropicApiKey), maxRetries: 1, timeout: 60_000 })
    const res = await client.messages.create({
      model: st.model, max_tokens: 1200, output_config: { effort: 'low' },
      system: `You write short first-contact ${channel === 'sms' ? 'SMS (under 300 characters)' : channel === 'whatsapp' ? 'WhatsApp messages (under 600 characters)' : 'emails (a subject line and under 120 words)'} for ${company.name}, a flour mill, to a prospective business customer in Bangladesh. Write in ${lang === 'bn' ? 'Bangla' : 'English'}. Polite, specific to their business type, no pressure, no invented facts or prices, include ${company.phone} as the way to reply, end with a simple opt-out line. Output only the message${channel === 'email' ? ' as: Subject: ...\\n\\nbody' : ''}.`,
      messages: [{ role: 'user', content: `Business: ${p.business_name || p.name}\nType: ${a.segment}\nDistrict: ${a.district}\nContact person: ${p.contact_person || 'unknown'}\nProducts customers like them buy most: ${(a.benchmark?.top_products ?? []).join(', ') || 'Moyda, atta'}` }],
    })
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n').trim()
    if (channel === 'email') { const m = text.match(/^Subject:\s*(.+)\n+([\s\S]+)$/i); return { subject: m?.[1] ?? `Flour supply — ${company.name}`, body: (m?.[2] ?? text).trim(), source: 'assistant' } }
    return { body: text, source: 'assistant' }
  } catch { return { ...tpl(), source: 'template' } }
}

/** A message to an existing customer: payment reminder, reorder nudge, win-back, cross-sell or a plain check-in. Figures come from the ledger / radar, never from the model. Always a draft — a person sends it. */
export async function draftCustomerMessage(c: CustomerHealth, kind: 'reorder' | 'collect' | 'winback' | 'crosssell' | 'checkin', channel: 'sms' | 'whatsapp' | 'email', lang: 'bn' | 'en', extra: { product?: string; gap?: number } = {}) {
  const company = realPhone((await getAppSettings()).company_profile), who = c.name, n0 = (v: number) => Math.round(v).toLocaleString('en-US')
  const old60 = c.overdue60 > 0, amt = old60 ? c.overdue60 : c.overdue30 > 0 ? c.overdue30 : Math.max(0, c.balance), last = c.last_order ? String(c.last_order).slice(0, 10) : null
  const bn: Record<string, string> = {
    collect: `আপনার হিসাবে ৳${n0(amt)} বকেয়া আছে${old60 ? ' (৬০ দিনের বেশি পুরনো)' : ''}। সুবিধামতো কবে পরিশোধ করতে পারবেন জানালে ধন্যবাদ।`,
    reorder: `আপনার শেষ অর্ডার ছিল ${last ?? 'কিছুদিন আগে'}${extra.gap ? `; সাধারণত ${extra.gap} দিন পরপর আপনি অর্ডার করেন` : ''}। এবার মাল লাগলে জানাবেন, আমরা সময়মতো ডেলিভারি দেব।`,
    winback: `${last ? last + ' থেকে' : 'অনেকদিন'} আপনার অর্ডার পাইনি। দাম, মান বা ডেলিভারি নিয়ে কোনো সমস্যা থাকলে জানাবেন — আমরা সমাধান করতে চাই।`,
    crosssell: `আপনার মতো অনেক ব্যবসায়ী ${extra.product ?? 'আমাদের অন্য পণ্য'} নিচ্ছেন। চাইলে দাম ও ডেলিভারি জানাতে পারি।`,
    checkin: `আশা করি ভালো আছেন। ব্যবসা কেমন চলছে, আমাদের কাছ থেকে কিছু লাগলে জানাবেন।`,
  }
  const en: Record<string, string> = {
    collect: `Our records show ৳${n0(amt)} outstanding${old60 ? ' (over 60 days old)' : ''}. Could you let us know when you can settle it? Thank you.`,
    reorder: `Your last order was ${last ?? 'a while ago'}${extra.gap ? `; you usually order about every ${extra.gap} days` : ''}. Let us know when you need stock and we'll deliver on time.`,
    winback: `We haven't had an order from you since ${last ?? 'some time'}. If price, quality or delivery has been a problem, please tell us — we'd like to put it right.`,
    crosssell: `Many businesses like yours buy ${extra.product ?? 'our other products'}. Happy to share the price and delivery if you're interested.`,
    checkin: `Hope business is going well. Please tell us if you need anything from us.`,
  }
  const tpl = () => {
    const body = lang === 'bn' ? `আসসালামু আলাইকুম ${who}। ${company.name} থেকে বলছি। ${bn[kind]} ${company.phone}। বার্তা না চাইলে STOP লিখুন।` : `Hello ${who}, this is ${company.name}. ${en[kind]} ${company.phone}. Reply STOP to opt out.`
    return channel === 'email' ? { subject: `${company.name} — ${kind === 'collect' ? (lang === 'bn' ? 'বকেয়া সম্পর্কে' : 'Outstanding balance') : (lang === 'bn' ? 'আপনার সাথে যোগাযোগ' : 'Staying in touch')}`, body } : { body }
  }
  const cfg = useRuntimeConfig(), st = await agentStatus()
  if (!st.enabled || !st.configured) return { ...tpl(), source: 'template', kind }
  try {
    const client = new Anthropic({ apiKey: String(cfg.anthropicApiKey), maxRetries: 1, timeout: 60_000 })
    const res = await client.messages.create({
      model: st.model, max_tokens: 1200, output_config: { effort: 'low' },
      system: `You write short ${channel === 'sms' ? 'SMS (under 300 characters)' : channel === 'whatsapp' ? 'WhatsApp messages (under 600 characters)' : 'emails (a subject line and under 120 words)'} from ${company.name}, a flour mill, to an EXISTING business customer in Bangladesh. Write in ${lang === 'bn' ? 'Bangla' : 'English'}. Warm, respectful, specific; for a payment reminder be polite and factual, never threatening. Use ONLY the facts given — no invented prices, dates or amounts. Include ${company.phone} to reply and end with a short opt-out line (reply STOP). Output only the message${channel === 'email' ? ' as: Subject: ...\\n\\nbody' : ''}.`,
      messages: [{ role: 'user', content: `Purpose: ${kind}\nCustomer: ${who}\nBusiness type: ${c.segment}\nFacts: ${en[kind]}\nLast order: ${last ?? 'unknown'}` }],
    })
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('\n').trim()
    if (channel === 'email') { const m = text.match(/^Subject:\s*(.+)\n+([\s\S]+)$/i); return { subject: m?.[1] ?? `${company.name}`, body: (m?.[2] ?? text).trim(), source: 'assistant', kind } }
    return { body: text, source: 'assistant', kind }
  } catch { return { ...tpl(), source: 'template', kind } }
}
