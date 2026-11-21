<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <div class="glass-card p-5 space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-xl font-bold text-gray-100">{{ p.name }}</h1><span class="text-xs text-gray-500">{{ p.business_name }}</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="verdictCls">{{ a.verdict }}</span>
          <div class="ml-auto flex flex-wrap gap-1.5"><button v-for="s in stages" :key="s" class="px-2.5 py-1 rounded-lg text-[11px] border" :class="p.stage === s ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07] hover:text-gray-300'" @click="setStage(s)">{{ s }}</button></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <label class="text-gray-500">Business type <select v-model="edit.segment" class="field-input text-xs w-full mt-0.5" @change="save({ segment: edit.segment })"><option value="">{{ a.segment }} (guess)</option><option v-for="s in segments" :key="s" :value="s">{{ s }}</option></select></label>
          <label class="text-gray-500">Phone <input v-model="edit.phone" class="field-input text-xs w-full mt-0.5" @change="save({ phone: edit.phone })" /></label>
          <label class="text-gray-500">Contact person <input v-model="edit.contact_person" class="field-input text-xs w-full mt-0.5" @change="save({ contact_person: edit.contact_person })" /></label>
          <label class="text-gray-500 sm:col-span-2">Address <input v-model="edit.address" class="field-input text-xs w-full mt-0.5" @change="save({ address: edit.address })" /></label>
          <label class="text-gray-500">District <input v-model="edit.district" :placeholder="a.district + ' (guess)'" class="field-input text-xs w-full mt-0.5" @change="save({ district: edit.district })" /></label>
        </div>
        <p class="text-[11px] text-gray-600">Source: {{ p.source ?? '—' }}<template v-if="p.source_url"> · <a :href="p.source_url" target="_blank" rel="noopener" class="text-gold-400 hover:underline">{{ p.source_url }}</a></template><template v-if="p.source_note"> · {{ p.source_note }}</template><template v-if="p.created_by_agent"> · found by the assistant — check before relying on it</template></p>
        <div v-if="a.same_as_customers.length" class="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">Already a customer: <NuxtLink v-for="m in a.same_as_customers" :key="m.id" :to="`/crm/customers/${m.id}`" class="underline mr-2">{{ m.name }} (#{{ m.id }})</NuxtLink></div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="k in tiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono" :class="k.cls ?? 'text-gray-100'">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
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
const verdictCls = computed(() => a.value.verdict.startsWith('Pursue') ? 'bg-emerald-500/15 text-emerald-300' : a.value.verdict.startsWith('Already') ? 'bg-amber-500/15 text-amber-300' : 'bg-white/10 text-gray-300')
const tiles = computed(() => { const x = a.value; return [
  { l: 'Fit', v: `${x.fit}/100`, s: `${x.segment} · ${x.district}` },
  { l: 'Estimated monthly potential', v: `৳${n0(x.potential.monthly_low)}–${n0(x.potential.monthly_high)}`, s: x.potential.basis },
  { l: 'Risk', v: x.risk.band, s: `score ${x.risk.score} · ${x.risk.flags.length} flag(s)`, cls: x.risk.band === 'High' ? 'text-red-400' : x.risk.band === 'Medium' ? 'text-amber-400' : 'text-emerald-400' },
  { l: 'Confidence', v: `${x.confidence}%`, s: `${x.checklist.completeness}% of the checklist done` }] })
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
