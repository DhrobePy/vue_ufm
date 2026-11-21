<template>
  <div class="space-y-4 dx">
    <HubTabs hub="crm" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <!-- ═════ DOSSIER HERO ═════ -->
      <section class="dx-hero">
        <div class="dx-strip">
          <span><i class="dx-dot"></i> CASE FILE № {{ String(p.id).padStart(5, '0') }}</span>
          <span class="hidden sm:inline">CLASS: {{ String(a.segment).toUpperCase() }}</span>
          <span class="hidden md:inline">SECTOR: {{ String(a.district).toUpperCase() }}</span>
          <span class="ml-auto">LAST CONTACT: {{ lastContact }}</span>
        </div>

        <div class="dx-grid">
          <!-- identity -->
          <div class="dx-id">
            <div class="dx-avatar" aria-hidden="true">
              <svg viewBox="0 0 120 120" class="dx-ring"><circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 5" /><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="40 120" /></svg>
              <div class="dx-hex"><span>{{ initials }}</span><b class="dx-scan"></b></div>
            </div>
            <div class="min-w-0">
              <p class="dx-eyebrow">SUBJECT</p>
              <h1 class="dx-name">{{ p.name }}</h1>
              <p v-if="p.business_name" class="dx-aka">A.K.A. {{ p.business_name }}</p>
              <p class="dx-stamp" :class="stampCls">{{ stamp }}</p>
            </div>
          </div>

          <!-- radar -->
          <div class="dx-radar">
            <svg viewBox="0 0 280 250" role="img" :aria-label="`Profile radar: ${radar.axes.map(x => x.label + ' ' + x.v).join(', ')}`">
              <g transform="translate(140,125)">
                <polygon v-for="r in [0.25, 0.5, 0.75, 1]" :key="r" :points="ring(r)" class="dx-grid-ring" />
                <line v-for="(ax, i) in radar.axes" :key="'l' + i" x1="0" y1="0" :x2="ax.x" :y2="ax.y" class="dx-grid-ring" />
                <polygon :points="radar.points" class="dx-shape" />
                <circle v-for="(ax, i) in radar.axes" :key="'c' + i" :cx="ax.px" :cy="ax.py" r="3" class="dx-node" />
                <text v-for="(ax, i) in radar.axes" :key="'t' + i" :x="ax.lx" :y="ax.ly" text-anchor="middle" class="dx-axis">{{ ax.label }} <tspan class="dx-axis-v">{{ ax.v }}</tspan></text>
              </g>
            </svg>
          </div>
        </div>

        <!-- gauges -->
        <div class="dx-gauges">
          <div v-for="g in gauges" :key="g.l" class="dx-gauge" :class="g.tone">
            <p class="dx-lab">{{ g.l }}</p>
            <p class="dx-big">{{ g.v }}</p>
            <div v-if="g.bar != null" class="dx-seg" aria-hidden="true"><i v-for="n in 20" :key="n" :class="{ on: n <= Math.round(g.bar / 5) }"></i></div>
            <p class="dx-sub">{{ g.s }}</p>
          </div>
        </div>

        <!-- pipeline rail (these are the real stage buttons) -->
        <div class="dx-rail" role="group" aria-label="Pipeline stage">
          <button v-for="(s, i) in stages" :key="s" type="button" class="dx-step" :class="{ cur: p.stage === s, done: stageIdx > i && p.stage !== 'lost' && s !== 'lost', lost: s === 'lost' }" @click="setStage(s)">
            <i></i><span>{{ s }}</span>
          </button>
        </div>

        <div v-if="a.same_as_customers.length" class="dx-alert">⚠ ASSET ALREADY ON FILE — <NuxtLink v-for="m in a.same_as_customers" :key="m.id" :to="`/crm/customers/${m.id}`" class="underline mr-2">{{ m.name }} (#{{ m.id }})</NuxtLink></div>
      </section>

      <!-- field intel (editable) + redacted unknowns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="glass-card p-4 space-y-2 lg:col-span-2">
          <h2 class="section-title">Field intel</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <label class="text-gray-500">Business type <select v-model="edit.segment" class="field-input text-xs w-full mt-0.5" @change="save({ segment: edit.segment })"><option value="">{{ a.segment }} (guess)</option><option v-for="s in segments" :key="s" :value="s">{{ s }}</option></select></label>
            <label class="text-gray-500">Phone <input v-model="edit.phone" class="field-input text-xs w-full mt-0.5" @change="save({ phone: edit.phone })" /></label>
            <label class="text-gray-500">Contact person <input v-model="edit.contact_person" class="field-input text-xs w-full mt-0.5" @change="save({ contact_person: edit.contact_person })" /></label>
            <label class="text-gray-500 sm:col-span-2">Address <input v-model="edit.address" class="field-input text-xs w-full mt-0.5" @change="save({ address: edit.address })" /></label>
            <label class="text-gray-500">District <input v-model="edit.district" :placeholder="a.district + ' (guess)'" class="field-input text-xs w-full mt-0.5" @change="save({ district: edit.district })" /></label>
          </div>
          <p class="text-[11px] text-gray-600">Source: {{ p.source ?? '—' }}<template v-if="p.source_url"> · <a :href="p.source_url" target="_blank" rel="noopener" class="text-gold-400 hover:underline">{{ p.source_url }}</a></template><template v-if="p.source_note"> · {{ p.source_note }}</template><template v-if="p.created_by_agent"> · found by the assistant — check before relying on it</template> · <a :href="mapUrl" target="_blank" rel="noopener" class="text-gold-400 hover:underline">📍 Locate on map</a></p>
        </div>
        <div class="glass-card p-4 space-y-2">
          <h2 class="section-title">Unverified intel <span class="text-gray-600 font-normal">— {{ a.checklist.missing.length }} redacted</span></h2>
          <div v-for="m in a.checklist.missing" :key="m" class="dx-redact"><span>{{ m }}</span></div>
          <p v-if="!a.checklist.missing.length" class="text-xs text-emerald-400">Nothing redacted — file complete.</p>
          <p v-else class="text-[11px] text-gray-600">Visit or call, then tick the checklist below to declassify.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-4 space-y-2 text-xs">
          <h2 class="section-title">Suggested first-order terms</h2>
          <p><span class="text-gray-500">First order: </span>{{ a.terms.first_order }}</p><p><span class="text-gray-500">Credit: </span>{{ a.terms.credit_limit }}</p><p><span class="text-gray-500">Price: </span>{{ a.terms.price_tier }}</p><p><span class="text-gray-500">Delivery: </span>{{ a.terms.delivery }}</p>
          <p class="text-[11px] text-gray-600 pt-1">A suggestion from how {{ a.benchmark.n }} similar customers behaved ({{ a.benchmark.scope }}); they usually pay in ~{{ Math.round(a.benchmark.pay_days_median) }} days. Opening credit still goes through your normal approval.</p>
          <h2 class="section-title pt-2">Risk flags</h2>
          <ul class="list-disc pl-5 space-y-0.5"><li v-for="f in a.risk.flags" :key="f" class="text-amber-200/90">{{ f }}</li><li v-if="!a.risk.flags.length" class="text-emerald-400 list-none -ml-5">No flags found</li></ul>
        </div>

        <div class="glass-card p-4 space-y-2 text-xs">
          <h2 class="section-title">Visit / call checklist <span class="text-gray-600 font-normal">— {{ a.checklist.completeness }}% complete</span></h2>
          <label class="flex items-center gap-2"><input v-model="cl.visited" type="checkbox" @change="saveCl" /> Visited the premises</label>
          <label class="flex items-center gap-2"><input v-model="cl.shop_photo" type="checkbox" @change="saveCl" /> Photo of shop / factory taken</label>
          <label class="flex items-center gap-2"><input v-model="cl.nid_checked" type="checkbox" @change="saveCl" /> Owner ID checked</label>
          <div class="grid grid-cols-2 gap-2">
            <input v-model="cl.trade_license_no" class="field-input text-xs" placeholder="Trade licence no." @change="saveCl" /><input v-model.number="cl.monthly_bags_declared" type="number" class="field-input text-xs" placeholder="Monthly flour use (bags)" @change="saveCl" />
            <input v-model="cl.current_supplier" class="field-input text-xs" placeholder="Current supplier" @change="saveCl" /><input v-model="cl.years_in_business" class="field-input text-xs" placeholder="Years in business" @change="saveCl" />
          </div>
          <div v-for="(r, i) in cl.references" :key="i" class="grid grid-cols-2 gap-2"><input v-model="r.name" class="field-input text-xs" :placeholder="`Reference ${i + 1} name`" @change="saveCl" /><input v-model="r.phone" class="field-input text-xs" placeholder="Phone" @change="saveCl" /></div>
          <input v-model="cl.payment_history_notes" class="field-input text-xs w-full" placeholder="How they pay other suppliers" @change="saveCl" />
          <p v-if="a.checklist.missing.length" class="text-[11px] text-gray-600">Still unknown: {{ a.checklist.missing.join(' · ') }}</p>
        </div>
      </div>

      <div class="glass-card p-4 space-y-2">
        <h2 class="section-title">First-contact message <span class="text-gray-600 font-normal">— a draft; a person sends it</span></h2>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <select v-model="dr.channel" class="field-input text-xs py-1.5 w-32"><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select>
          <select v-model="dr.lang" class="field-input text-xs py-1.5 w-28"><option value="bn">বাংলা</option><option value="en">English</option></select>
          <button class="btn-gold text-xs" :disabled="dbusy" @click="draft">{{ dbusy ? 'Writing…' : 'Write draft' }}</button>
          <span v-if="dr.source" class="text-[11px] text-gray-600">{{ dr.source === 'assistant' ? 'written by the assistant' : 'standard template (switch the assistant on in Settings → CRM for tailored drafts)' }}</span>
        </div>
        <template v-if="dr.body">
          <input v-if="dr.subject" v-model="dr.subject" class="field-input text-xs w-full" />
          <textarea v-model="dr.body" rows="5" class="field-input text-xs w-full" />
          <div class="flex flex-wrap gap-2">
            <button class="btn-ghost text-xs" @click="copyDraft">Copy</button>
            <a v-if="dr.channel === 'whatsapp' && waUrl" :href="waUrl" target="_blank" rel="noopener" class="btn-ghost text-xs">Open in WhatsApp</a>
            <a v-if="dr.channel === 'email' && p.email" :href="`mailto:${p.email}?subject=${encodeURIComponent(dr.subject)}&body=${encodeURIComponent(dr.body)}`" class="btn-ghost text-xs">Open in email</a>
            <button class="btn-ghost text-xs" @click="markSent">I sent it — log it</button>
          </div>
        </template>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-4 space-y-2">
          <h2 class="section-title">Log a contact</h2>
          <div class="flex gap-2"><select v-model="f.channel" class="field-input text-xs py-1.5 w-32"><option v-for="x in ['call','visit','whatsapp','sms','email','note']" :key="x" :value="x">{{ x }}</option></select><input v-model="f.outcome" class="field-input text-xs py-1.5 flex-1" placeholder="Outcome" /></div>
          <textarea v-model="f.summary" rows="2" class="field-input text-xs w-full" placeholder="What was said / agreed…" />
          <div class="flex items-center gap-2 text-xs text-gray-400">Follow up on <input v-model="f.follow_up_date" type="date" class="field-input text-xs py-1.5 w-36" /><button class="btn-gold text-xs ml-auto" :disabled="!f.summary.trim()" @click="log">Save</button></div>
          <div class="pt-2 border-t border-white/[0.06] max-h-60 overflow-y-auto">
            <div v-for="i in d.interactions" :key="i.id" class="text-xs py-1.5 border-b border-white/[0.04]"><span class="text-gray-500">{{ String(i.created_at).slice(0, 16) }}</span> <span class="px-1.5 py-0.5 rounded bg-white/10 mx-1">{{ i.channel }}</span>{{ i.summary }}<span v-if="i.outcome" class="text-emerald-400"> — {{ i.outcome }}</span></div>
          </div>
        </div>
        <div class="glass-card p-4 space-y-2 text-xs">
          <h2 class="section-title">Make them a customer</h2>
          <p v-if="p.converted_customer_id" class="text-emerald-400">Linked to customer <NuxtLink :to="`/crm/customers/${p.converted_customer_id}`" class="underline">#{{ p.converted_customer_id }}</NuxtLink>.</p>
          <template v-else>
            <p class="text-gray-400">Creates the customer record with a ৳0 credit limit (credit is opened later, through your normal approval, following the terms above) and marks this prospect Won.</p>
            <button class="btn-gold text-xs" :disabled="!p.phone || a.same_as_customers.length > 0 || busy" @click="convert">Create customer</button>
            <p v-if="!p.phone" class="text-[11px] text-amber-300">A phone number is needed first.</p>
          </template>
          <h2 class="section-title pt-3">Danger zone</h2>
          <div class="flex gap-2"><button class="btn-ghost text-xs" @click="setStage('lost')">Mark lost…</button><button v-if="isAdmin" class="btn-ghost text-xs text-red-400" @click="remove">Delete</button></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { whatsappLink } from '~/composables/usePrintSize'
definePageMeta({ layout: 'default' })
const route = useRoute(), { success, error: toastError } = useToast(), { user } = useUserSession()
const isAdmin = computed(() => ['admin', 'superadmin'].includes(String((user.value as any)?.role ?? '').toLowerCase()))
const segments = ['Trader / Store', 'Bakery', 'Food manufacturer', 'Hotel / Institution', 'Other business', 'Unclassified']
const stages = ['new', 'researching', 'contacted', 'quoted', 'trial', 'won', 'lost']
const { data: d, pending, error, refresh } = await useFetch<any>(`/api/crm/prospects/${route.params.id}`)
const p = computed(() => d.value.prospect), a = computed(() => d.value.assessment)
const edit = reactive({ segment: '', phone: '', contact_person: '', address: '', district: '' })
const cl = reactive<any>({ visited: false, shop_photo: false, nid_checked: false, trade_license_no: '', monthly_bags_declared: null, current_supplier: '', years_in_business: '', payment_history_notes: '', references: [{ name: '', phone: '' }, { name: '', phone: '' }] })
watchEffect(() => { if (!d.value) return; const x = d.value.prospect; Object.assign(edit, { segment: x.segment ?? '', phone: x.phone ?? '', contact_person: x.contact_person ?? '', address: x.address ?? '', district: x.district ?? '' })
  Object.assign(cl, x.checklist ?? {}); if (!Array.isArray(cl.references) || cl.references.length < 2) cl.references = [...(cl.references ?? []), { name: '', phone: '' }, { name: '', phone: '' }].slice(0, 2) })
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')

// ── dossier view-model ──
const initials = computed(() => String(p.value.name ?? '?').split(/[\s/&]+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]!.toUpperCase()).join('') || '?')
const lastContact = computed(() => d.value.interactions?.[0]?.created_at ? String(d.value.interactions[0].created_at).slice(0, 10) : 'NONE ON RECORD')
const stageIdx = computed(() => stages.indexOf(p.value.stage))
const stamp = computed(() => { const v = a.value.verdict; return v.startsWith('Pursue') ? 'PURSUE' : v.startsWith('Already') ? 'EXISTING ASSET' : v.startsWith('Worth') ? 'VERIFY FIRST' : 'LOW PRIORITY' })
const stampCls = computed(() => stamp.value === 'PURSUE' ? 'go' : stamp.value === 'EXISTING ASSET' ? 'warn' : stamp.value === 'VERIFY FIRST' ? 'mid' : 'low')
const mapUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.value.name, p.value.address, p.value.district || a.value.district].filter(Boolean).join(' '))}`)
const R = 84
const axisXY = (i: number, k: number, r = R) => { const t = (-90 + i * 72) * Math.PI / 180; return [Math.cos(t) * r * k, Math.sin(t) * r * k] as const }
const ring = (k: number) => [0, 1, 2, 3, 4].map(i => axisXY(i, k).join(',')).join(' ')
const radar = computed(() => {
  const x = a.value, hi = Number(x.potential.monthly_high ?? 0)
  const vals = [['FIT', x.fit], ['VALUE', Math.min(100, Math.round(100 * Math.log10(1 + hi) / Math.log10(5e6)))], ['SAFETY', 100 - x.risk.score], ['CONFIDENCE', x.confidence], ['INTEL', x.checklist.completeness]] as const
  const axes = vals.map(([label, v], i) => { const [ex, ey] = axisXY(i, 1), [px, py] = axisXY(i, Math.max(0.04, v / 100)), [lx, ly] = axisXY(i, 1, R + 16); return { label, v: Math.round(v), x: ex, y: ey, px, py, lx, ly: ly + 3 } })
  return { axes, points: axes.map(q => `${q.px},${q.py}`).join(' ') }
})
const gauges = computed(() => { const x = a.value; return [
  { l: 'ACQUISITION INDEX', v: `${x.fit}`, bar: x.fit, s: `${x.segment} · ${x.district}`, tone: 'cy' },
  { l: 'RISK EXPOSURE', v: String(x.risk.band).toUpperCase(), bar: x.risk.score, s: `score ${x.risk.score} · ${x.risk.flags.length} flag(s)`, tone: x.risk.band === 'High' ? 'rd' : x.risk.band === 'Medium' ? 'am' : 'gn' },
  { l: 'EST. MONTHLY VALUE', v: `৳${n0(x.potential.monthly_low)}–${n0(x.potential.monthly_high)}`, bar: null, s: x.potential.basis, tone: 'cy' },
  { l: 'INTEL CONFIDENCE', v: `${x.confidence}%`, bar: x.confidence, s: `${x.checklist.completeness}% of the checklist done`, tone: 'cy' }] })
async function save(body: any) { try { await $fetch(`/api/crm/prospects/${p.value.id}`, { method: 'PATCH', body }); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } }
const saveCl = () => save({ checklist: { ...cl, monthly_bags_declared: Number(cl.monthly_bags_declared) || null } })
async function setStage(s: string) {
  let lost_reason: string | undefined
  if (s === 'lost') { lost_reason = prompt('Why was this prospect lost? (optional)') ?? ''; if (!confirm('Mark as lost?')) return }
  await save({ stage: s, lost_reason })
}
const dr = reactive({ channel: 'sms', lang: 'bn', subject: '', body: '', source: '' }), dbusy = ref(false)
async function draft() { dbusy.value = true; try { const r: any = await $fetch(`/api/crm/prospects/${p.value.id}/draft`, { method: 'POST', body: { channel: dr.channel, lang: dr.lang } }); Object.assign(dr, { subject: r.subject ?? '', body: r.body, source: r.source }) } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { dbusy.value = false } }
const waUrl = computed(() => whatsappLink(p.value.phone, dr.body))
async function copyDraft() { try { await navigator.clipboard.writeText((dr.subject ? dr.subject + '\n\n' : '') + dr.body); success('Copied') } catch { toastError('Could not copy') } }
async function markSent() { await $fetch('/api/crm/interactions', { method: 'POST', body: { party_type: 'prospect', party_id: p.value.id, channel: dr.channel, summary: `Sent first-contact ${dr.channel}: ${dr.body.slice(0, 200)}` } }); if (p.value.stage === 'new' || p.value.stage === 'researching') await save({ stage: 'contacted' }); success('Logged'); await refresh() }
const f = reactive({ channel: 'call', outcome: '', summary: '', follow_up_date: '' })
async function log() { try { await $fetch('/api/crm/interactions', { method: 'POST', body: { party_type: 'prospect', party_id: p.value.id, ...f, follow_up_date: f.follow_up_date || undefined } }); success('Saved'); Object.assign(f, { outcome: '', summary: '', follow_up_date: '' }); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } }
const busy = ref(false)
async function convert() {
  if (!confirm(`Create ${p.value.name} as a customer with a ৳0 credit limit?`)) return
  busy.value = true
  try {
    const c: any = await $fetch('/api/customers', { method: 'POST', body: { name: p.value.name, business_name: p.value.business_name, phone_number: p.value.phone, email: p.value.email, business_address: p.value.address, customer_type: 'Credit', credit_limit: 0 } })
    const id = c.id ?? c.customer?.id
    if (id) { await $fetch(`/api/crm/customers/${id}`, { method: 'PATCH', body: { segment: a.value.segment, district: a.value.district } }).catch(() => {}); await save({ converted_customer_id: id, stage: 'won' }) }
    success('Customer created'); await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed to create the customer') } finally { busy.value = false }
}
async function remove() { if (!confirm('Delete this prospect and its history?')) return; try { await $fetch(`/api/crm/prospects/${p.value.id}`, { method: 'DELETE' }); navigateTo('/crm/prospects') } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } }
</script>

<style scoped>
/* Dossier look built ONLY from the app's own theme tokens (surfaces, labels, accent), so it follows dark/light and the chosen accent colour. */
.dx { --dx-red:#ff453a; --dx-amb:#ff9f0a; --dx-grn:#30d158; --dx-ac:rgb(var(--accent)); --dx-ink:var(--accent-ink, rgb(var(--accent))); }
html[data-theme="light"] .dx { --dx-red:#d70015; --dx-amb:#b25000; --dx-grn:#248a3d; }
.dx-hero { position:relative; overflow:hidden; border-radius:14px; padding:12px 18px 18px; background:
    radial-gradient(700px 260px at 100% 0%, rgb(var(--accent) / .10), transparent 65%),
    radial-gradient(var(--a-sep-soft) 1px, transparent 1.2px) 0 0/18px 18px,
    var(--a-surface);
  box-shadow: inset 0 0 0 1px var(--a-sep), var(--a-card-shadow); color:var(--a-label); }
.dx-hero::before,.dx-hero::after { content:""; position:absolute; width:22px; height:22px; border:2px solid var(--dx-ac); pointer-events:none; }
.dx-hero::before { top:8px; left:8px; border-right:0; border-bottom:0; border-top-left-radius:6px; }
.dx-hero::after { bottom:8px; right:8px; border-left:0; border-top:0; border-bottom-right-radius:6px; }
.dx-strip { display:flex; flex-wrap:wrap; gap:4px 22px; font:600 10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.14em; color:var(--a-label-2); padding:0 20px 10px; border-bottom:1px solid var(--a-sep-soft); }
.dx-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--dx-red); margin-right:6px; animation:dxblink 1.8s steps(2,jump-none) infinite; }
.dx-grid { display:grid; grid-template-columns:1.25fr 1fr; gap:6px 18px; align-items:center; padding:10px 6px 0; }
@media (max-width: 860px) { .dx-grid { grid-template-columns:1fr; } }
.dx-id { display:flex; gap:18px; align-items:center; min-width:0; }
.dx-avatar { position:relative; flex:none; width:108px; height:108px; color:var(--dx-ac); }
.dx-ring { position:absolute; inset:0; width:100%; height:100%; animation:dxspin 40s linear infinite; opacity:.8; }
.dx-hex { position:absolute; inset:14px; display:grid; place-items:center; clip-path:polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
  background:var(--a-surface-2); font:700 26px/1 ui-monospace,Menlo,monospace; letter-spacing:.04em; color:var(--a-label); overflow:hidden; box-shadow:inset 0 0 0 2px rgb(var(--accent) / .55); }
.dx-scan { position:absolute; left:0; right:0; height:20px; top:-20px; background:linear-gradient(transparent, rgb(var(--accent) / .22), transparent); animation:dxscan 4.5s ease-in-out infinite; }
.dx-eyebrow { font:600 10px ui-monospace,Menlo,monospace; letter-spacing:.28em; color:var(--dx-red); }
.dx-name { font-size:clamp(22px,3.8vw,34px); line-height:1.1; font-weight:700; letter-spacing:.01em; text-transform:uppercase; color:var(--a-label); overflow-wrap:anywhere; margin:3px 0; }
.dx-aka { font:500 11px ui-monospace,Menlo,monospace; letter-spacing:.12em; color:var(--a-label-2); text-transform:uppercase; }
.dx-stamp { display:inline-block; margin-top:10px; padding:2px 10px; border:2px solid currentColor; border-radius:4px; font:700 11px ui-monospace,Menlo,monospace; letter-spacing:.24em; transform:rotate(-3deg); }
.dx-stamp.go { color:var(--dx-grn); } .dx-stamp.mid { color:var(--dx-amb); } .dx-stamp.low { color:var(--a-label-2); } .dx-stamp.warn { color:var(--dx-red); }
.dx-radar svg { width:100%; max-height:250px; display:block; }
.dx-grid-ring { fill:none; stroke:var(--a-sep); stroke-width:1; }
.dx-shape { fill:rgb(var(--accent) / .28); stroke:var(--dx-ac); stroke-width:2; stroke-linejoin:round; animation:dxfade .8s ease-out both; }
.dx-node { fill:var(--a-surface); stroke:var(--dx-ac); stroke-width:2; }
.dx-axis { fill:var(--a-label-2); font:600 9px ui-monospace,Menlo,monospace; letter-spacing:.12em; } .dx-axis-v { fill:var(--a-label); font-weight:700; }
.dx-gauges { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:14px; }
@media (max-width: 860px) { .dx-gauges { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.dx-gauge { padding:10px 12px; border-radius:10px; background:var(--a-surface-2); border-left:3px solid var(--dx-ac); }
.dx-gauge.rd { border-left-color:var(--dx-red); } .dx-gauge.am { border-left-color:var(--dx-amb); } .dx-gauge.gn { border-left-color:var(--dx-grn); }
.dx-lab { font:600 9px ui-monospace,Menlo,monospace; letter-spacing:.18em; color:var(--a-label-2); }
.dx-big { font:700 20px/1.2 ui-monospace,Menlo,monospace; color:var(--a-label); margin:3px 0 7px; overflow-wrap:anywhere; }
.dx-gauge.rd .dx-big { color:var(--dx-red); } .dx-gauge.am .dx-big { color:var(--dx-amb); } .dx-gauge.gn .dx-big { color:var(--dx-grn); }
.dx-seg { display:grid; grid-template-columns:repeat(20,1fr); gap:2px; height:6px; margin-bottom:6px; }
.dx-seg i { background:var(--a-fill); border-radius:1px; } .dx-seg i.on { background:var(--dx-ac); }
.dx-gauge.rd .dx-seg i.on { background:var(--dx-red); } .dx-gauge.am .dx-seg i.on { background:var(--dx-amb); } .dx-gauge.gn .dx-seg i.on { background:var(--dx-grn); }
.dx-sub { font-size:10.5px; color:var(--a-label-2); line-height:1.35; }
.dx-rail { display:flex; flex-wrap:wrap; gap:4px 0; margin-top:16px; }
.dx-step { position:relative; flex:1 1 84px; display:flex; flex-direction:column; align-items:center; gap:6px; padding:0 4px; cursor:pointer; background:none; border:0; color:var(--a-label-2); font:600 10px ui-monospace,Menlo,monospace; letter-spacing:.12em; text-transform:uppercase; min-height:44px; }
.dx-step i { position:relative; z-index:1; width:13px; height:13px; border-radius:50%; border:2px solid var(--a-sep); background:var(--a-surface); transition:background .2s, border-color .2s; }
.dx-step::before { content:""; position:absolute; top:6px; left:-50%; width:100%; height:2px; background:var(--a-sep-soft); }
.dx-step:first-child::before { display:none; }
.dx-step.done i { background:rgb(var(--accent) / .6); border-color:transparent; } .dx-step.done::before, .dx-step.cur::before { background:rgb(var(--accent) / .6); }
.dx-step.cur { color:var(--a-label); } .dx-step.cur i { background:var(--dx-ac); border-color:var(--a-surface); box-shadow:0 0 0 3px rgb(var(--accent) / .35); }
.dx-step.lost.cur i { background:var(--dx-red); box-shadow:0 0 0 3px rgb(255 69 58 / .35); } .dx-step.lost:hover { color:var(--dx-red); }
.dx-step:hover:not(.cur) { color:var(--a-label); } .dx-step:focus-visible { outline:2px solid var(--dx-ac); outline-offset:2px; border-radius:6px; }
.dx-alert { margin-top:14px; padding:8px 12px; border-radius:8px; background:rgb(255 69 58 / .12); color:var(--dx-red); font:600 11px ui-monospace,Menlo,monospace; letter-spacing:.05em; box-shadow:inset 0 0 0 1px rgb(255 69 58 / .4); }
.dx-redact { display:flex; align-items:center; gap:8px; padding:5px 10px; border-radius:4px; background:#0d0d10; color:transparent; font:600 10px ui-monospace,Menlo,monospace; letter-spacing:.12em; text-transform:uppercase; box-shadow:inset 0 0 0 1px var(--a-sep); }
.dx-redact span { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dx-redact:hover span { color:#e5e5ea; }
.dx-redact::after { content:"CLASSIFIED"; color:var(--dx-red); font-size:9px; letter-spacing:.14em; }
@keyframes dxspin { to { transform:rotate(360deg); } }
@keyframes dxscan { 0%,100% { top:-20px; } 50% { top:100%; } }
@keyframes dxblink { 50% { opacity:.3; } }
@keyframes dxfade { from { opacity:0; } to { opacity:1; } }
@media (prefers-reduced-motion: reduce) { .dx-ring, .dx-scan, .dx-dot, .dx-shape { animation:none !important; } }
</style>
