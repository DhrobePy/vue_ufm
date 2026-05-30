<template>
  <div class="space-y-6">
    <UiPageHeader title="Maintenance" :breadcrumb="['Fleet','Maintenance']">
      <template #actions>
        <NuxtLink to="/fleet/maintenance/create" class="btn-gold text-xs">+ Log Maintenance</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Requests</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-amber-400">{{ stats.pending ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Pending</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-blue-400">{{ stats.in_progress ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">In Progress</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gold-400">৳{{ fmtK(stats.this_month_cost) }}</p>
        <p class="text-xs text-gray-500 mt-1">This Month Cost</p>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2">
      <button v-for="s in statuses" :key="s.v" @click="statusFilter = s.v"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        :class="statusFilter === s.v ? 'bg-gold-500/20 text-gold-400' : 'bg-white/[0.04] text-gray-500 hover:text-gray-300'">
        {{ s.l }}
      </button>
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Request #</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Vehicle</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Station / Supplier</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id" class="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer" @click="$router.push(`/fleet/maintenance/${r.id}`)">
            <td class="px-4 py-3 font-mono font-bold text-gold-400/80">{{ r.request_no }}</td>
            <td class="px-4 py-3 text-gray-400">{{ r.request_date }}</td>
            <td class="px-4 py-3 font-mono text-gray-300">{{ r.vehicle_no }}</td>
            <td class="px-4 py-3">
              <span class="badge text-[10px]" :class="r.repair_type === 'preventive' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'">{{ r.repair_type }}</span>
            </td>
            <td class="px-4 py-3 text-gray-400">{{ r.station_supplier || '—' }}</td>
            <td class="px-4 py-3"><UiStatusBadge :status="r.status" /></td>
            <td class="px-4 py-3 text-right font-medium text-gray-200">৳{{ Number(r.total_cost || 0).toLocaleString() }}</td>
          </tr>
          <tr v-if="!requests.length">
            <td colspan="7" class="px-4 py-12 text-center text-gray-600">No maintenance records found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const statusFilter = ref('')
const statuses = [
  { v: '', l: 'All' },
  { v: 'pending', l: 'Pending' },
  { v: 'in_progress', l: 'In Progress' },
  { v: 'completed', l: 'Completed' },
  { v: 'cancelled', l: 'Cancelled' },
]

const { data } = await useFetch('/api/fleet/maintenance', {
  query: computed(() => ({ status: statusFilter.value })),
  watch: [statusFilter],
})

const requests = computed(() => (data.value as any)?.requests ?? [])
const stats    = computed(() => (data.value as any)?.stats    ?? {})

function fmtK(n: any) {
  const v = Number(n || 0)
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return v.toLocaleString()
}
</script>
