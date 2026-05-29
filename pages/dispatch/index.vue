<template>
  <div class="space-y-6">
    <UiPageHeader title="Dispatch" subtitle="Ready-to-ship orders · vehicle assignment · delivery tracking"
                  :breadcrumb="['Dispatch']">
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- KPI row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ready to Ship"   :value="String(stats.ready_count ?? 0)"       trend="Awaiting dispatch" :trend-up="false" icon="truck"  color="cyan" />
        <KpiCard label="Dispatched Today" :value="String(stats.dispatched_today ?? 0)"  trend="Confirmed"          trend-up         icon="check"  color="teal" />
        <KpiCard label="Total Weight"    :value="fmtMT(stats.dispatched_kg_today ?? 0)" trend="dispatched today"   trend-up         icon="list"   color="blue" />
        <KpiCard label="Vehicles Active" :value="String(activeVehicles.length)"         trend="available"          trend-up         icon="truck"  color="orange" />
      </div>

      <!-- Ready to dispatch -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Ready to Ship</h2>
          <span class="text-xs text-gray-600">{{ orders.length }} orders waiting</span>
        </div>
        <div class="space-y-3">
          <div v-if="!orders.length" class="py-8 text-center text-xs text-gray-600">
            No orders ready to ship
          </div>
          <div v-for="order in orders" :key="order.id"
               class="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <div class="sm:col-span-2">
              <p class="font-mono text-xs text-gold-400/90 font-semibold">{{ order.order_number }}</p>
              <p class="text-sm font-medium text-gray-200 mt-0.5">{{ order.customer_name }}</p>
              <p class="text-[11px] text-gray-600 mt-0.5">{{ order.delivery_address || order.branch_name || '—' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Weight</p>
              <p class="text-xs font-semibold text-gray-300">{{ fmtMT(order.total_weight_kg ?? 0) }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Priority</p>
              <span :class="['text-xs font-medium',
                order.priority === 'urgent' ? 'text-red-400' :
                order.priority === 'high'   ? 'text-orange-400' : 'text-gray-500']">
                {{ order.priority }}
              </span>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Vehicle</p>
              <select class="field-input text-xs py-1.5" v-model="assignedVehicle[order.id]">
                <option value="">Assign…</option>
                <option v-for="v in activeVehicles" :key="v.id" :value="v.id">
                  {{ v.vehicle_number }} ({{ v.capacity_mt }}MT)
                </option>
              </select>
            </div>
            <div class="flex gap-2">
              <button class="btn-gold text-xs py-1.5 px-3 flex-1 justify-center"
                      :disabled="!assignedVehicle[order.id] || acting === order.id"
                      @click="dispatch(order)">
                <svg v-if="acting === order.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {{ acting === order.id ? '…' : 'Dispatch' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// Load dispatch queue + vehicles in parallel
const [{ data, pending, error, refresh }, { data: vData }] = await Promise.all([
  useFetch('/api/credit-sales/dispatch'),
  useFetch('/api/logistics/vehicles'),
])

const orders  = computed(() => (data.value?.orders  ?? []) as any[])
const stats   = computed(() => (data.value?.stats   ?? {}) as any)
const vehicles = computed(() => (vData.value?.vehicles ?? []) as any[])
const activeVehicles = computed(() => vehicles.value.filter((v: any) => v.status === 'active'))

// Per-order vehicle assignment
const assignedVehicle = ref<Record<number, any>>({})
const acting          = ref<number | null>(null)

function fmtMT(kg: number): string {
  return (Number(kg) / 1000).toFixed(1) + ' MT'
}

async function dispatch(order: any) {
  if (!assignedVehicle.value[order.id]) return
  acting.value = order.id
  try {
    await $fetch(`/api/credit-sales/${order.id}/workflow`, {
      method: 'POST',
      body: { to_status: 'dispatched', comments: `Vehicle: ${assignedVehicle.value[order.id]}` },
    })
    success(`${order.order_number} dispatched ✓`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to dispatch order')
  } finally {
    acting.value = null
  }
}
</script>
