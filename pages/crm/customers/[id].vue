<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <div class="glass-card p-5 space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-xl font-bold text-gray-100">{{ c.name }}</h1><CrmLabel :label="c.label" />
          <span class="text-xs text-gray-500">{{ c.business_name }}</span>
          <div class="ml-auto flex gap-2"><NuxtLink :to="`/customers/${c.id}`" class="btn-ghost text-xs">Customer profile</NuxtLink><NuxtLink :to="`/credit-sales/ledger?customer=${c.id}`" class="btn-ghost text-xs">Ledger</NuxtLink></div>
        </div>
        <p v-if="c.reasons.length" class="text-xs text-gray-400">{{ c.reasons.join(' · ') }}</p>
        <ul v-if="c.suggestions.length" class="text-xs text-gray-200 list-disc pl-5 space-y-0.5"><li v-for="s in c.suggestions" :key="s">{{ s }}</li></ul>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="k in tiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono text-gray-100">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-4 space-y-3">
          <h2 class="section-title">Log a contact</h2>
          <div class="flex flex-wrap gap-2">
            <select v-model="f.channel" class="field-input text-xs py-1.5 w-32"><option v-for="x in ['call','visit','whatsapp','sms','email','note']" :key="x" :value="x">{{ x }}</option></select>
            <input v-model="f.outcome" class="field-input text-xs py-1.5 flex-1 min-w-[8rem]" placeholder="Outcome (e.g. promised to pay)" />
          </div>
          <textarea v-model="f.summary" rows="2" class="field-input text-xs w-full" placeholder="What was said / agreed…" />
          <div class="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            Follow up on <input v-model="f.follow_up_date" type="date" class="field-input text-xs py-1.5 w-36" />
            promised ৳ <input v-model.number="f.promise_amount" type="number" min="0" class="field-input text-xs py-1.5 w-28" placeholder="optional" />
            <button class="btn-gold text-xs ml-auto" :disabled="!f.summary.trim() || busy" @click="log">Save</button>
          </div>
        </div>
        <div class="glass-card p-4 space-y-2">
          <h2 class="section-title">Profile</h2>
          <div class="flex flex-wrap items-center gap-2 text-xs"><span class="w-20 text-gray-500">Business type</span>
            <select :value="c.segment_confirmed ? c.segment : ''" class="field-input text-xs py-1.5 w-48" @change="setProfile({ segment: ($event.target as HTMLSelectElement).value })"><option value="">{{ c.segment }} (guess)</option><option v-for="s in segments" :key="s" :value="s">{{ s }}</option></select></div>
          <div class="flex flex-wrap items-center gap-2 text-xs"><span class="w-20 text-gray-500">District</span>
            <input :value="c.district_confirmed ? c.district : ''" :placeholder="`${c.district} (guess)`" class="field-input text-xs py-1.5 w-48" @change="setProfile({ district: ($event.target as HTMLInputElement).value })" /></div>
          <p class="text-[11px] text-gray-600">Phone {{ c.phone ?? '—' }} · {{ c.address ?? 'no address' }} · branch {{ c.branch ?? '—' }}</p>
        </div>
      </div>

      <div class="glass-card p-4 space-y-2">
        <h2 class="section-title">Tasks</h2>
        <div v-for="t in d.tasks" :key="t.id" class="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.05]">
          <span class="px-2 py-0.5 rounded bg-white/10 text-gray-300">{{ t.kind.replace('_', ' ') }}</span><span class="flex-1" :class="t.status === 'open' ? 'text-gray-200' : 'text-gray-600 line-through'">{{ t.title }}</span>
          <span class="text-gray-500">{{ t.due_date ? String(t.due_date).slice(0, 10) : '' }}</span><button v-if="t.status === 'open'" class="btn-gold text-[11px] px-2.5 py-1" @click="doneTask(t)">Done</button>
        </div>
        <p v-if="!d.tasks.length" class="text-xs text-gray-600">No tasks. Saving a contact with a follow-up date creates one.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-4"><h2 class="section-title mb-2">Recent orders</h2>
          <div v-for="o in d.orders" :key="o.id" class="flex items-center gap-2 text-xs py-1 border-b border-white/[0.04]"><NuxtLink :to="`/credit-sales/${o.id}`" class="text-gold-400 hover:underline">{{ o.order_number }}</NuxtLink><span class="text-gray-500">{{ String(o.order_date).slice(0, 10) }}</span><span class="text-gray-500">{{ o.status }}</span><span class="ml-auto font-mono">৳{{ n0(o.amount) }}</span><span v-if="Number(o.due) > 0" class="font-mono text-amber-400">due {{ n0(o.due) }}</span></div></div>
        <div class="glass-card p-4"><h2 class="section-title mb-2">Recent payments</h2>
          <div v-for="p in d.payments" :key="p.payment_number" class="flex items-center gap-2 text-xs py-1 border-b border-white/[0.04]"><span class="font-mono text-gray-400">{{ p.payment_number }}</span><span class="text-gray-500">{{ String(p.payment_date).slice(0, 10) }}</span><span class="text-gray-500">{{ p.method }}</span><span class="ml-auto font-mono text-emerald-400">৳{{ n0(p.amount) }}</span></div></div>
      </div>

      <div class="glass-card p-4 space-y-1"><h2 class="section-title mb-1">Contact log</h2>
        <div v-for="i in d.interactions" :key="i.id" class="text-xs py-1.5 border-b border-white/[0.04]"><span class="text-gray-500">{{ String(i.created_at).slice(0, 16) }}</span> <span class="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 mx-1">{{ i.channel }}</span><span class="text-gray-200">{{ i.summary }}</span><span v-if="i.outcome" class="text-emerald-400"> — {{ i.outcome }}</span><span class="text-gray-600"> · {{ i.via_agent ? 'assistant' : i.by_user }}</span></div>
        <p v-if="!d.interactions.length" class="text-xs text-gray-600">No contact recorded yet.</p></div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute(), { success, error: toastError } = useToast()
const segments = ['Trader / Store', 'Bakery', 'Food manufacturer', 'Hotel / Institution', 'Other business', 'Unclassified']
const { data: d, pending, error, refresh } = await useFetch<any>(`/api/crm/customers/${route.params.id}`)
const c = computed(() => d.value.customer)
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const tiles = computed(() => { const x = c.value; return [
  { l: '12-month sales', v: '৳' + n0(x.value_12m), s: `${x.orders_12m} orders${x.gap_days ? ` · every ~${x.gap_days} days` : ''}` },
  { l: 'Last order', v: x.days_since_last != null ? `${x.days_since_last} d ago` : '—', s: x.last_order ? String(x.last_order).slice(0, 10) : 'never' },
  { l: 'Balance / limit', v: `৳${n0(x.balance)}`, s: x.credit_limit >= 1000 ? `limit ৳${n0(x.credit_limit)}${x.over_limit ? ' — OVER' : ''}` : 'no real limit set' },
  { l: 'Pays in', v: x.pay_days != null ? `${x.pay_days} days` : '—', s: x.overdue60 > 0 ? `৳${n0(x.overdue60)} older than 60 d` : 'nothing older than 60 days' }] })
const f = reactive({ channel: 'call', outcome: '', summary: '', follow_up_date: '', promise_amount: null as number | null })
const busy = ref(false)
async function log() {
  busy.value = true
  try { await $fetch('/api/crm/interactions', { method: 'POST', body: { party_type: 'customer', party_id: c.value.id, ...f, promise_amount: f.promise_amount || undefined, follow_up_date: f.follow_up_date || undefined } }); success('Saved'); Object.assign(f, { outcome: '', summary: '', follow_up_date: '', promise_amount: null }); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
async function setProfile(body: any) { try { await $fetch(`/api/crm/customers/${c.value.id}`, { method: 'PATCH', body }); success('Profile updated'); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } }
async function doneTask(t: any) { const outcome = prompt(`What happened? (optional) — ${t.title}`) ?? ''; try { await $fetch(`/api/crm/tasks/${t.id}`, { method: 'PATCH', body: { status: 'done', outcome } }); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } }
</script>
