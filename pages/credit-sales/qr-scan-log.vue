<template>
  <div class="space-y-5">
    <UiPageHeader title="Delivery QR Scan Log" subtitle="Every gate/delivery QR scan attempt — flags a re-scan after an order is already delivered"
                  :breadcrumb="['Credit Sales', 'QR Scan Log']" />

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Scans</p>
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Re-scans (7d)</p>
        <p class="text-2xl font-bold text-red-400">{{ stats.reused_7d ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Re-scans (all time)</p>
        <p class="text-2xl font-bold text-amber-400">{{ stats.reused_total ?? 0 }}</p>
      </div>
    </div>

    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="input-glass w-52 text-xs" placeholder="Search order #…" />
      <input v-model="dateFrom" type="date" class="input-glass w-auto text-xs" />
      <span class="text-xs text-gray-600">to</span>
      <input v-model="dateTo" type="date" class="input-glass w-auto text-xs" />
      <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer ml-auto">
        <input v-model="reusedOnly" type="checkbox" class="accent-gold-500" />
        Re-scans only
      </label>
    </div>

    <div class="glass-card p-5">
      <UiDataTable :columns="cols" :rows="rows" :per-page="20" search-placeholder="">
        <template #cell-order_number="{ row }">
          <NuxtLink v-if="row.credit_order_id" :to="`/credit-sales/${row.credit_order_id}`" class="font-mono text-xs text-gold-400/80 hover:text-gold-300">
            {{ row.order_number }}
          </NuxtLink>
          <span v-else class="font-mono text-xs text-gray-500">{{ row.order_number }}</span>
        </template>
        <template #cell-stage="{ value }">
          <span class="text-xs text-gray-400">{{ value ?? '—' }}</span>
        </template>
        <template #cell-scanned_by_name="{ value }">
          <span class="text-xs text-gray-300">{{ value ?? '—' }}</span>
        </template>
        <template #cell-ip="{ value }">
          <span class="font-mono text-[11px] text-gray-600">{{ value ?? '—' }}</span>
        </template>
        <template #cell-scanned_at="{ value }">
          <span class="text-xs text-gray-500">{{ new Date(value).toLocaleString('en-GB') }}</span>
        </template>
        <template #cell-reused="{ value }">
          <span v-if="value" class="badge bg-red-500/15 text-red-400 text-[10px]">⚠ Re-scan</span>
          <span v-else class="badge bg-emerald-500/10 text-emerald-400 text-[10px]">First scan</span>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search     = ref('')
const dateFrom    = ref('')
const dateTo      = ref('')
const reusedOnly  = ref(false)
const route       = useRoute()
if (route.query.reused_only === '1') reusedOnly.value = true

const { data } = await useFetch('/api/credit-sales/qr-scan-log', {
  query: computed(() => ({
    search: search.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    reused_only: reusedOnly.value ? '1' : undefined,
  })),
})

const rows  = computed(() => (data.value as any)?.rows ?? [])
const stats = computed(() => (data.value as any)?.stats ?? {})

const cols = [
  { key: 'order_number',     label: 'Order #' },
  { key: 'stage',            label: 'Stage' },
  { key: 'scanned_by_name',  label: 'Scanned By' },
  { key: 'ip',               label: 'IP' },
  { key: 'scanned_at',       label: 'Scanned At', sortable: true },
  { key: 'reused',           label: 'Status' },
]
</script>
