<template>
  <div class="space-y-6">
    <UiPageHeader title="Dispatch Queue" subtitle="Assign vehicles and dispatch ready orders" :breadcrumb="['Credit Sales','Dispatch']" />

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Ready to Dispatch</p>
          <p class="text-2xl font-bold text-orange-400">{{ stats.ready_count ?? orders.length }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Dispatched Today</p>
          <p class="text-2xl font-bold text-emerald-400">{{ stats.dispatched_today ?? 0 }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Load Today</p>
          <p class="text-2xl font-bold text-gold-400">{{ ((stats.dispatched_kg_today ?? 0) / 1000).toFixed(1) }}MT</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Urgent Orders</p>
          <p class="text-2xl font-bold text-red-400">{{ urgentCount }}</p>
        </div>
      </div>

      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Ready for Dispatch</h2>
        <UiDataTable :columns="cols" :rows="tableRows" :per-page="15" search-placeholder="Search orders…">
          <template #cell-order_number="{ value }"><span class="font-mono text-xs text-gold-400/80">{{ value }}</span></template>
          <template #cell-priority="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-weight="{ value }">
            <span class="font-mono text-xs text-gray-300">{{ value ? (Number(value)/1000).toFixed(2)+' MT' : '—' }}</span>
          </template>
          <template #actions="{ row }">
            <div class="flex items-center gap-2 justify-end">
              <span v-if="row.dispatch_hold"
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                    :class="row.gate_met
                      ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25'
                      : 'bg-amber-500/12 text-amber-400 border-amber-500/25'"
                    :title="row.gate_label">
                {{ row.gate_met ? (row.gate_auto ? '✓ auto-clears' : '✓ met — needs clearance') : '🚫 payment hold' }}
              </span>
              <NuxtLink v-if="row.dispatch_hold && !(row.gate_met && row.gate_auto)"
                        to="/credit-sales/payment-watch"
                        class="text-[10px] text-sky-400 hover:text-sky-300 underline shrink-0">watch</NuxtLink>
              <button v-if="perms.canDo('credit_sales', 'dispatch', 'mark_dispatched')"
                class="btn-gold text-xs py-1 px-2.5"
                :class="row.dispatch_hold && !(row.gate_met && row.gate_auto) ? 'opacity-40' : ''"
                @click="dispatch(row)" :disabled="acting === row.id">
                {{ acting === row.id ? '…' : 'Dispatch' }}
              </button>
            </div>
          </template>
        </UiDataTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, pending, error, refresh } = await useFetch('/api/credit-sales/dispatch')

const orders = computed(() => (data.value?.orders ?? []) as any[])
const stats  = computed(() => (data.value?.stats  ?? {}) as any)

const urgentCount = computed(() => orders.value.filter(o => o.priority === 'urgent').length)

const tableRows = computed(() => orders.value.map(o => ({
  id:           o.id,
  order_number: o.order_number,
  customer:     o.customer_name,
  address:      o.delivery_address || '—',
  weight:       o.total_weight_kg,
  priority:     o.priority,
  status:       o.status,
  dispatch_hold: !!o.dispatch_hold,
  gate_met:      !!o.gate_met,
  gate_auto:     !!o.gate_auto,
  gate_label:    o.dispatch_hold
    ? `${(o.gate_condition ?? 'manual').replace(/_/g, ' ')}${o.gate_amount ? ` ৳${Number(o.gate_amount).toLocaleString()}` : ''}`
    : '',
})))

const cols = [
  { key: 'order_number', label: 'Order #',  sortable: true },
  { key: 'customer',     label: 'Customer', sortable: true },
  { key: 'address',      label: 'Delivery Address' },
  { key: 'weight',       label: 'Weight' },
  { key: 'priority',     label: 'Priority' },
  { key: 'status',       label: 'Status' },
]

const acting = ref<number | null>(null)

async function dispatch(row: any) {
  acting.value = row.id
  try {
    await $fetch(`/api/credit-sales/${row.id}/workflow`, {
      method: 'POST',
      body: { to_status: 'dispatched', comments: 'Dispatched from dispatch queue' },
    })
    success(`Order ${row.order_number} dispatched`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to dispatch order')
  } finally {
    acting.value = null
  }
}
</script>
