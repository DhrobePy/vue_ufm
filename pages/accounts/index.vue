<template>
  <div class="space-y-6">
    <UiPageHeader title="Accounts" subtitle="Chart of accounts · journal · vouchers · statements" :breadcrumb="['Accounts']">
      <template #actions><NuxtLink to="/accounts/journal/create" class="btn-gold text-xs">+ New Entry</NuxtLink></template>
    </UiPageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Assets"      :value="`৳${fmtCr(stats.total_assets)}`"      trend="Balance sheet" trend-up  icon="bank"  color="teal" />
      <KpiCard label="Total Liabilities" :value="`৳${fmtCr(stats.total_liabilities)}`" trend="Balance sheet" :trend-up="false" icon="money" color="orange" />
      <KpiCard label="Net Equity"        :value="`৳${fmtCr(stats.net_equity)}`"        trend="Owner's equity" trend-up icon="chart" color="gold" />
      <KpiCard label="Journal Entries"   :value="stats.journal_entries ?? 0"             trend="This month"   trend-up  icon="book"  color="blue" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Recent Journal Entries</h2>
        <UiDataTable :columns="jCols" :rows="recentEntries" :per-page="6" search-placeholder="Search…">
          <template #cell-id="{ value }"><span class="font-mono text-xs text-gold-400/80">JE-{{ value }}</span></template>
          <template #cell-debit_total="{ value }"><span class="text-red-400 font-mono text-xs font-semibold">৳{{ Number(value).toLocaleString() }}</span></template>
          <template #cell-credit_total="{ value }"><span class="text-emerald-400 font-mono text-xs font-semibold">৳{{ Number(value).toLocaleString() }}</span></template>
        </UiDataTable>
      </div>

      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Account Summary</h2>
        <div class="space-y-2">
          <div v-for="(balance, group) in accountSummary" :key="group"
               class="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full" :style="`background:${groupColor(group)}`" />
              <span class="text-sm text-gray-300">{{ group }}</span>
            </div>
            <span class="font-bold font-mono text-sm" :style="`color:${groupColor(group)}`">
              ৳{{ Number(Math.abs(balance)).toLocaleString() }}
            </span>
          </div>
          <p v-if="!Object.keys(accountSummary).length" class="text-xs text-gray-600 text-center py-4">No data</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const jCols = [
  { key: 'id',           label: 'Ref #',       sortable: true },
  { key: 'date',         label: 'Date',         sortable: true },
  { key: 'description',  label: 'Description' },
  { key: 'debit_total',  label: 'Debit' },
  { key: 'credit_total', label: 'Credit' },
]

const GROUP_COLORS: Record<string, string> = {
  Asset:     '#10b981',
  Liability: '#ef4444',
  Equity:    '#8b5cf6',
  Revenue:   '#f59e0b',
  Expense:   '#f97316',
}
const groupColor = (g: string) => GROUP_COLORS[g] ?? '#6b7280'

const { data } = await useFetch('/api/accounts/dashboard')

const stats         = computed(() => (data.value as any)?.stats         ?? {})
const recentEntries = computed(() => (data.value as any)?.recentEntries ?? [])
const accountSummary = computed(() => (data.value as any)?.accountSummary ?? {})

function fmtCr(v: any) {
  const n = Number(v ?? 0)
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`
  return n.toLocaleString()
}
</script>
