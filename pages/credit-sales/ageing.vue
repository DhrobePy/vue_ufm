<template>
  <ReportFrame title="Ageing Report" subtitle="Outstanding receivables by age of the order" :period="`as of ${today}`" filename="ageing-report" :sheets="sheets">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="b in summary" :key="b.label" class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600">{{ b.label }}</p>
          <p class="text-xl font-bold" :style="`color:${b.color}`">৳{{ Number(b.value).toLocaleString() }}</p>
          <p class="text-[11px] text-gray-600">{{ b.count }} customers</p>
        </div>
      </div>
      <input v-model="search" type="search" placeholder="Search customers…" class="no-print field-input text-xs py-1.5 w-64" />
      <ReportTable :cols="cols" :rows="shown" totals />
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const { data, pending, error } = await useFetch<any>('/api/credit-sales/ageing')
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const search = ref('')
const summary = computed(() => (data.value?.summary ?? []) as any[])
const shown = computed(() => { const s = search.value.trim().toLowerCase(); const r = (data.value?.rows ?? []) as any[]; return s ? r.filter(x => String(x.customer).toLowerCase().includes(s)) : r })
const m = (key: string, label: string): ReportCol => ({ key, label, fmt: 'money', sum: true })
const cols: ReportCol[] = [{ key: 'customer', label: 'Customer' }, m('current_amt', '0–30 days ৳'), m('d30_amt', '31–60 days ৳'), m('d60_amt', '61–90 days ৳'), m('d90_amt', '91–120 days ৳'), m('d120_amt', '120+ days ৳'), m('total', 'Total due ৳'), { key: 'status', label: 'Status' }]
const sheets = computed(() => [{ name: 'Ageing', cols, rows: shown.value, totals: true }])
</script>
