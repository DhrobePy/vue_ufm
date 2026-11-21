<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="CRM — Today" subtitle="Who to call, what's due, and which prospects are going cold" :breadcrumb="['CRM', 'Today']" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else-if="d">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Open tasks</p><p class="text-xl font-bold text-gray-100">{{ d.counts.open_tasks }}</p></div>
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Overdue</p><p class="text-xl font-bold" :class="d.counts.overdue ? 'text-red-400' : 'text-emerald-400'">{{ d.counts.overdue }}</p></div>
        <div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Customers needing a call</p><p class="text-xl font-bold text-amber-400">{{ d.calls.length }}</p></div>
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
        <h2 class="section-title">Customers who most need a conversation</h2>
        <div v-for="c in d.calls" :key="c.id" class="py-2 border-b border-white/[0.05] text-xs space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <CrmLabel :label="c.label" /><NuxtLink :to="`/crm/customers/${c.id}`" class="font-semibold text-gold-400 hover:underline">{{ c.name }}</NuxtLink>
            <span class="text-gray-500">{{ c.segment }} · {{ c.district }}</span><span class="ml-auto text-gray-500">12-mo ৳{{ n0(c.value_12m) }} · owes ৳{{ n0(Math.max(0, c.balance)) }}</span>
          </div>
          <p class="text-gray-400">{{ c.reasons.join(' · ') }}</p>
          <p class="text-gray-200">→ {{ c.suggestions[0] }}</p>
          <div class="flex gap-2"><NuxtLink :to="`/crm/customers/${c.id}`" class="btn-ghost text-[11px] px-2.5 py-1">Open card</NuxtLink><span v-if="c.has_open_task" class="text-[11px] text-emerald-400 self-center">task already open</span></div>
        </div>
        <p v-if="!d.calls.length" class="text-xs text-gray-600 py-2">No customer is flagged right now.</p>
      </div>

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
const pipelineOpen = computed(() => (d.value?.pipeline ?? []).filter((x: any) => !['won', 'lost'].includes(x.stage)).reduce((t: number, x: any) => t + Number(x.n), 0))
async function done(t: any) {
  const outcome = (prompt(`What happened? (optional) — ${t.title}`) ?? '')
  try { await $fetch(`/api/crm/tasks/${t.id}`, { method: 'PATCH', body: { status: 'done', outcome } }); success('Task done'); await refresh() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') }
}
</script>
