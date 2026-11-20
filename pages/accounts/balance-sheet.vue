<template>
  <div class="space-y-4">
    <div class="no-print"><HubTabs hub="statements" /></div>
    <ReportFrame title="Balance Sheet" subtitle="Assets, liabilities and equity from the general ledger" :period="`as of ${asOf}${compare ? ' · compared with ' + compare : ''}`" filename="balance-sheet" :sheets="sheets">
      <template #filters>
        <div class="glass-card p-4 flex flex-wrap items-center gap-2">
          <label class="text-xs text-gray-500">As of</label><input v-model="asOf" type="date" class="field-input text-xs py-1.5 w-36" />
          <label class="flex items-center gap-1.5 text-xs text-gray-400 ml-2"><input v-model="showCompare" type="checkbox" /> Compare with</label>
          <input v-if="showCompare" v-model="compareDate" type="date" class="field-input text-xs py-1.5 w-36" />
        </div>
      </template>
      <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <template v-else-if="data">
        <div v-for="s in data.sections" :key="s.key">
          <h2 class="text-sm font-bold text-gray-200 mt-3 mb-1">{{ s.label }}</h2>
          <ReportTable :cols="cols" :rows="s.rows" :totals="s.rows.length > 0" />
        </div>
        <div class="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><p class="text-[10px] uppercase tracking-wider text-gray-500">Total assets</p><p class="font-mono font-bold text-gray-100">৳{{ n0(data.assets.total) }}<span v-if="data.compare" class="text-gray-500 text-xs"> · ৳{{ n0(data.assets.compare) }}</span></p></div>
          <div><p class="text-[10px] uppercase tracking-wider text-gray-500">Liabilities + equity</p><p class="font-mono font-bold text-gray-100">৳{{ n0(data.liabilitiesEquity.total) }}<span v-if="data.compare" class="text-gray-500 text-xs"> · ৳{{ n0(data.liabilitiesEquity.compare) }}</span></p></div>
          <div><p class="text-[10px] uppercase tracking-wider text-gray-500">Difference</p>
            <p class="font-mono font-bold" :class="Math.abs(diff) < 1 ? 'text-emerald-400' : 'text-red-400'">৳{{ n0(diff) }} {{ Math.abs(diff) < 1 ? '— balanced' : '— does not balance' }}</p></div>
        </div>
      </template>
    </ReportFrame>
  </div>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const asOf = ref(today), showCompare = ref(false), compareDate = ref(today.slice(0, 4) + '-06-30')
const compare = computed(() => showCompare.value ? compareDate.value : '')
const { data, pending } = await useFetch<any>('/api/accounts/balance-sheet', { query: computed(() => ({ as_of: asOf.value, compare: compare.value || undefined })), watch: [asOf, showCompare, compareDate] })
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const diff = computed(() => Number(data.value?.assets.total ?? 0) - Number(data.value?.liabilitiesEquity.total ?? 0))
const cols = computed<ReportCol[]>(() => [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Account' }, { key: 'amount', label: `${asOf.value} ৳`, fmt: 'money', sum: true },
  ...(compare.value ? [{ key: 'compare', label: `${compare.value} ৳`, fmt: 'money' as const, sum: true }] : [])])
const sheets = computed(() => (data.value?.sections ?? []).map((s: any) => ({ name: s.label, cols: cols.value, rows: s.rows, totals: true })))
</script>
