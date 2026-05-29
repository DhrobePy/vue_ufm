<template>
  <div class="space-y-6">
    <UiPageHeader title="Ageing Report" subtitle="Outstanding receivables by age bucket" :breadcrumb="['Credit Sales','Ageing Report']">
      <template #actions><button class="btn-gold text-xs">Export PDF</button></template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Ageing buckets -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="b in summary" :key="b.label" class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600">{{ b.label }}</p>
          <p class="text-xl font-bold" :style="`color:${b.color}`">৳{{ Number(b.value).toLocaleString() }}</p>
          <p class="text-[11px] text-gray-600">{{ b.count }} customers</p>
        </div>
      </div>

      <UiDataTable :columns="cols" :rows="rows" :per-page="12" exportable search-placeholder="Search customers…">
        <template #cell-current_amt="{ value }"><span class="font-mono text-xs text-emerald-400">{{ value > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-d30_amt="{ value }"><span class="font-mono text-xs text-yellow-400">{{ value > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-d60_amt="{ value }"><span class="font-mono text-xs text-orange-400">{{ value > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-d90_amt="{ value }"><span class="font-mono text-xs text-red-400">{{ value > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-d120_amt="{ value }"><span class="font-mono text-xs text-red-600 font-bold">{{ value > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-total="{ value }"><span class="font-bold text-gold-400 font-mono text-xs">৳{{ Number(value).toLocaleString() }}</span></template>
        <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
      </UiDataTable>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, pending, error } = await useFetch('/api/credit-sales/ageing')

const summary = computed(() => (data.value?.summary ?? []) as any[])
const rows    = computed(() => (data.value?.rows    ?? []) as any[])

const cols = [
  { key: 'customer',    label: 'Customer',     sortable: true },
  { key: 'current_amt', label: '0–30 Days' },
  { key: 'd30_amt',     label: '31–60 Days' },
  { key: 'd60_amt',     label: '61–90 Days' },
  { key: 'd90_amt',     label: '91–120 Days' },
  { key: 'd120_amt',    label: '120+ Days' },
  { key: 'total',       label: 'Total Due',    sortable: true },
  { key: 'status',      label: 'Status' },
]
</script>
