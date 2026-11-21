<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="CRM — Today" subtitle="Who to call, what's due, and which prospects are going cold" :breadcrumb="['CRM', 'Today']" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else-if="d">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Open tasks</p><p class="text-xl font-bold text-gray-100">{{ d.counts.open_tasks }}</p></div>
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Overdue</p><p class="text-xl font-bold" :class="d.counts.overdue ? 'text-red-400' : 'text-emerald-400'">{{ d.counts.overdue }}</p></div>
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Actions today</p><p class="text-xl font-bold text-amber-400">{{ d.next.total }}</p></div>
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Prospects in the pipeline</p><p class="text-xl font-bold text-gray-100">{{ pipelineOpen }}</p></div>
      </div>

      <div class="glass-card p-4 space-y-2">
        <h2 class="section-title">Tasks due (next 3 days and overdue)</h2>
        <div v-for="t in d.tasks" :key="t.id" class="flex flex-wrap items-center gap-2 py-1.5 border-b border-white/[0.05] text-xs">
          <span class="px-2 py-0.5 rounded bg-white/10 text-gray-300">{{ t.kind.replace('_', ' ') }}</span>
          <NuxtLink :to="t.party_type === 'prospect' ? `/crm/prospects/${t.party_id}` : `/crm/customers/${t.party_id}`" class="text-gold-400 hover:underline">{{ t.party_name }}</NuxtLink>
          <span class="text-gray-300 flex-1 min-w-[10rem]">{{ t.title }}<span v-if="t.created_by_agent" class="text-gray-600"> · by assistant</span></span>
          <span :class="Number(t.overdue) ? 'text-red-400' : 'text-gray-500'">{{ t.due_date ? String(t.due_date).slice(0, 10) : 'no date' }}</span>
          <button class="btn-gold text-[11px] px-2.5 py-1" @click="done(t)">Done</button>
        </div>
        <p v-if="!d.tasks.length" class="text-xs text-gray-600 py-2">Nothing due — good. Add follow-ups from a customer or prospect page.</p>
      </div>

      <div class="glass-card p-4 space-y-2">
        <div class="flex flex-wrap items-center gap-2"><h2 class="section-title">Do first — next best actions</h2>
          <span class="text-[11px] text-gray-500">{{ d.next.total }} in all<template v-if="d.next.recently_contacted"> · {{ d.next.recently_contacted }} left out because someone contacted them in the last 2 days</template></span>
          <div class="ml-auto flex flex-wrap gap-1"><button v-for="(l, k) in TYPES" :key="k" class="px-2 py-0.5 rounded-lg text-[10px] border" :class="only === k ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07]'" @click="only = only === k ? '' : String(k)">{{ l.icon }} {{ l.label }} {{ d.next.counts[k] ?? 0 }}</button></div></div>
        <div v-for="a in shown" :key="a.key" class="py-2 border-b border-white/[0.05] text-xs space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-white/10 text-gray-300" :title="TYPES[a.type].label">{{ TYPES[a.type].icon }} {{ TYPES[a.type].label }}</span>
            <NuxtLink :to="a.party_type === 'prospect' ? `/crm/prospects/${a.party_id}` : `/crm/customers/${a.party_id}`" class="font-semibold text-gold-400 hover:underline">{{ a.name }}</NuxtLink>
            <span class="text-gray-500">{{ a.segment }} · {{ a.district }}</span>
            <span class="ml-auto text-gray-500">{{ a.last_contact_days != null ? `last contacted ${a.last_contact_days} d ago` : 'never contacted' }}</span>
          </div>
          <p class="text-gray-100">{{ a.headline }}</p>
          <p class="text-gray-500">{{ a.why.join(' · ') }}</p>
          <div class="flex flex-wrap gap-2 items-center">
            <button class="btn-gold text-[11px] px-2.5 py-1" @click="compose(a)">Message</button>
            <NuxtLink :to="a.party_type === 'prospect' ? `/crm/prospects/${a.party_id}` : `/crm/customers/${a.party_id}`" class="btn-ghost text-[11px] px-2.5 py-1">Open card</NuxtLink>
            <button v-if="!a.open_task" class="btn-ghost text-[11px] px-2.5 py-1" @click="addTask(a)">+ Task for tomorrow</button><span v-else class="text-[11px] text-emerald-400">task already open</span>
          </div>
        </div>
        <p v-if="!shown.length" class="text-xs text-gray-600 py-2">Nothing flagged right now.</p>
      </div>
      <CrmComposer v-if="cm" :open="!!cm" :party-type="cm.party_type" :party-id="cm.party_id" :name="cm.name" :phone="cm.phone" :kind="cm.kind" @close="cm = null" @done="refresh()" />

      <div v-if="d.cold_prospects.length" class="glass-card p-4 space-y-2">
        <h2 class="section-title">Prospects going cold</h2>
        <div v-for="p in d.cold_prospects" :key="p.id" class="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.05]">
          <NuxtLink :to="`/crm/prospects/${p.id}`" class="text-gold-400 hover:underline">{{ p.name }}</NuxtLink><span class="text-gray-500">{{ p.stage }} · {{ p.segment ?? 'type unknown' }}</span><span class="ml-auto text-amber-400">{{ p.idle_days }} days with no contact</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { data: d, pending, refresh } = await useFetch<any>('/api/crm/today')
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const TYPES: Record<string, { icon: string; label: string }> = { collect: { icon: '💰', label: 'Collect' }, reorder: { icon: '🔁', label: 'Reorder' }, winback: { icon: '🛟', label: 'Win back' }, crosssell: { icon: '➕', label: 'Cross-sell' }, prospect: { icon: '🎯', label: 'Prospect' } }
const only = ref(''), cm = ref<any>(null)
const shown = computed(() => (d.value?.next.actions ?? []).filter((a: any) => !only.value || a.type === only.value))
const compose = (a: any) => { cm.value = { party_type: a.party_type, party_id: a.party_id, name: a.name, phone: a.phone, kind: a.type === 'prospect' ? undefined : a.type } }
async function addTask(a: any) {
  const due = new Date(Date.now() + 30 * 3600_000).toISOString().slice(0, 10)
  try { await $fetch('/api/crm/tasks', { method: 'POST', body: { party_type: a.party_type, party_id: a.party_id, title: a.headline, kind: a.type === 'collect' ? 'collect' : a.type === 'reorder' ? 'reorder' : 'follow_up', due_date: due } }); success('Task added'); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') }
}
const pipelineOpen = computed(() => (d.value?.pipeline ?? []).filter((x: any) => !['won', 'lost'].includes(x.stage)).reduce((t: number, x: any) => t + Number(x.n), 0))
async function done(t: any) {
  const outcome = (prompt(`What happened? (optional) — ${t.title}`) ?? '')
  try { await $fetch(`/api/crm/tasks/${t.id}`, { method: 'PATCH', body: { status: 'done', outcome } }); success('Task done'); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') }
}
</script>
