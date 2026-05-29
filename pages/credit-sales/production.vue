<template>
  <div class="space-y-6">
    <UiPageHeader title="Production Queue" subtitle="Manage flour production for approved orders" :breadcrumb="['Credit Sales','Production']" />

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">In Production</p>
          <p class="text-2xl font-bold text-blue-400">{{ stats.in_production ?? orders.length }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Ready Today</p>
          <p class="text-2xl font-bold text-emerald-400">{{ stats.ready_today ?? 0 }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Weight</p>
          <p class="text-2xl font-bold text-gold-400">{{ ((stats.total_weight_kg ?? 0) / 1000).toFixed(1) }}MT</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Urgent Orders</p>
          <p class="text-2xl font-bold text-red-400">{{ urgentCount }}</p>
        </div>
      </div>

      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Active Production Orders</h2>
        <UiDataTable :columns="cols" :rows="tableRows" :per-page="15" search-placeholder="Search…">
          <template #cell-orderNo="{ value }"><span class="font-mono text-xs text-gold-400/80">{{ value }}</span></template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-priority="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-progress="{ value }">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full bg-white/[0.06]"><div class="h-full rounded-full bg-blue-400" :style="`width:${value}%`"/></div>
              <span class="text-xs text-gray-400 w-8">{{ value }}%</span>
            </div>
          </template>
          <template #actions="{ row }">
            <button class="btn-gold text-xs py-1 px-2.5" @click="markReady(row)" :disabled="acting === row.id">
              {{ acting === row.id ? '…' : 'Mark Ready' }}
            </button>
          </template>
        </UiDataTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, pending, error, refresh } = await useFetch('/api/credit-sales/production-queue')

const orders = computed(() => (data.value?.orders ?? []) as any[])
const stats  = computed(() => (data.value?.stats  ?? {}) as any)

const urgentCount = computed(() => orders.value.filter(o => o.priority === 'urgent').length)

const tableRows = computed(() => orders.value.map(o => ({
  id:       o.id,
  orderNo:  o.orderNo,
  customer: o.customer,
  product:  o.items?.map((i: any) => i.product).filter(Boolean).join(', ') || '—',
  qty:      o.items?.reduce((s: number, i: any) => s + Number(i.qty || 0), 0).toFixed(0) + ' bags',
  progress: o.progress ?? 0,
  priority: o.priority,
  status:   o.status,
})))

const cols = [
  { key: 'orderNo',  label: 'Order #',  sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'product',  label: 'Product' },
  { key: 'qty',      label: 'Qty' },
  { key: 'progress', label: 'Progress' },
  { key: 'priority', label: 'Priority' },
  { key: 'status',   label: 'Status' },
]

const acting = ref<number | null>(null)

async function markReady(row: any) {
  acting.value = row.id
  try {
    await $fetch(`/api/credit-sales/${row.id}/workflow`, {
      method: 'POST',
      body: { to_status: 'ready_to_ship', comments: 'Production complete — ready to ship' },
    })
    success(`Order ${row.orderNo} marked as ready to ship`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update order status')
  } finally {
    acting.value = null
  }
}
</script>
