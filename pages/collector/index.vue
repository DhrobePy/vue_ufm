<template>
  <div class="space-y-6">
    <UiPageHeader title="Collections" subtitle="Field payment collection · reconciliation · daily summary" :breadcrumb="['Collector']">
      <template #actions>
        <NuxtLink to="/credit-sales/collect" class="btn-gold text-xs">+ Record Collection</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Today's Collections" :value="fmtBDT(stats?.today_total ?? 0)"  trend="Collected today"    trend-up  icon="money"  color="gold" />
      <KpiCard label="Pending Accounts"    :value="String(schedule.length)"           trend="With balance due"  :trend-up="false" icon="users" color="orange" />
      <KpiCard label="Month Total"         :value="fmtBDT(stats?.month_total ?? 0)"  trend="This month"         trend-up  icon="chart"  color="teal" />
      <KpiCard label="Overdue Accounts"    :value="String(schedule.filter(v=>Number(v.outstanding)>100000).length)" trend="High balance"  :trend-up="false" icon="list"  color="red" />
    </div>

    <!-- Today's schedule -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Today's Collection Schedule</h2>
      <div class="space-y-2">
        <div v-if="!schedule.length" class="py-8 text-center text-xs text-gray-600">No outstanding accounts today</div>
        <div v-for="visit in schedule" :key="visit.id"
             class="flex items-center gap-4 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
          <!-- Status dot -->
          <div :class="['w-2 h-2 rounded-full shrink-0',
            visit.status === 'collected' ? 'bg-emerald-400' :
            visit.status === 'partial'   ? 'bg-yellow-400' :
            visit.status === 'skipped'   ? 'bg-red-400' : 'bg-gray-600']" />
          <div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p class="text-xs font-medium text-gray-200 truncate">{{ visit.customer }}</p>
              <p class="text-[11px] text-gray-600">{{ visit.area }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Outstanding</p>
              <p class="text-sm font-bold text-red-400">৳{{ visit.outstanding.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Collected</p>
              <p class="text-sm font-semibold" :class="visit.collected > 0 ? 'text-emerald-400' : 'text-gray-600'">
                {{ visit.collected > 0 ? `৳${visit.collected.toLocaleString()}` : '—' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Method</p>
              <p class="text-xs text-gray-400">{{ visit.method || '—' }}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <NuxtLink v-if="visit.status === 'pending'" :to="`/credit-sales/collect?customer=${visit.id}`" class="btn-gold text-xs py-1.5 px-3">
              Collect
            </NuxtLink>
            <NuxtLink v-else-if="visit.status === 'partial'" :to="`/credit-sales/collect?customer=${visit.id}`" class="btn-ghost text-xs py-1.5 px-3">Collect more</NuxtLink>
            <span v-else-if="visit.status === 'collected'"
              class="text-xs text-emerald-400 font-medium px-2">✓ Done</span>
            <span v-if="visit.status === 'partial'" class="text-xs text-yellow-400 font-medium px-2">Part-paid today</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent collections table -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Recent Collections</h2>
      <UiDataTable :columns="cols" :rows="recentCollections" :per-page="10" exportable search-placeholder="Search…">
        <template #cell-amount="{ value }">
          <span class="font-mono text-xs font-bold text-emerald-400">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-paymentMode="{ value }">
          <span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">{{ value }}</span>
        </template>
      </UiDataTable>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { data, refresh } = await useFetch('/api/collector/schedule')

const stats             = computed(() => (data.value?.stats ?? {}) as any)
const schedule          = computed(() => (data.value?.schedule ?? []) as any[])
const recentCollections = computed(() => (data.value?.recentCollections ?? []) as any[])

// Recording a collection goes through Credit Sales → Collect Payment (allocation, ledger, journal, cash/bank account) — see the links above.

function fmtBDT(n: number) {
  const v = Number(n)
  if (v >= 100000) return `৳${(v / 100000).toFixed(1)}L`
  if (v >= 1000)   return `৳${(v / 1000).toFixed(0)}K`
  return `৳${v.toLocaleString()}`
}

const cols = [
  { key: 'date',        label: 'Date',      sortable: true },
  { key: 'customer',    label: 'Customer',  sortable: true },
  { key: 'amount',      label: 'Amount',    sortable: true },
  { key: 'paymentMode', label: 'Method' },
  { key: 'reference',   label: 'Reference' },
  { key: 'collector',   label: 'Collector' },
]
</script>

