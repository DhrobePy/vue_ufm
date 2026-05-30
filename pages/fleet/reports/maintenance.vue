<template>
  <div class="space-y-6">
    <UiPageHeader title="Maintenance Summary Report" :breadcrumb="['Fleet','Reports','Maintenance']">
      <template #actions>
        <NuxtLink to="/fleet/reports" class="btn-secondary text-xs">← Reports</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Date Filter -->
    <div class="glass-card p-4 flex flex-wrap gap-4 items-end">
      <div>
        <label class="form-label">From</label>
        <input v-model="from" type="date" class="form-input" />
      </div>
      <div>
        <label class="form-label">To</label>
        <input v-model="to" type="date" class="form-input" />
      </div>
      <button @click="load" class="btn-gold text-xs">Apply</button>
      <button @click="setYear" class="btn-secondary text-xs">This Year</button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Requests</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">{{ requests.length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Cost</p>
        <p class="text-2xl font-bold text-red-400 mt-1">৳{{ fmt(totalCost) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Corrective</p>
        <p class="text-2xl font-bold text-amber-400 mt-1">{{ requests.filter((r:any) => r.repair_type==='corrective').length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Preventive</p>
        <p class="text-2xl font-bold text-blue-400 mt-1">{{ requests.filter((r:any) => r.repair_type==='preventive').length }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- By Vehicle -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Cost by Vehicle</h3>
        <div v-if="!byVehicle.length" class="text-center py-6 text-gray-600 text-sm">No maintenance data for this period</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Vehicle</th>
              <th class="pb-2 text-right text-gray-500">Requests</th>
              <th class="pb-2 text-right text-gray-500">C / P</th>
              <th class="pb-2 text-right text-gray-500">Cost ৳</th>
              <th class="pb-2 text-left text-gray-500">Last Service</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in byVehicle" :key="v.registration_no" class="border-b border-white/[0.03]">
              <td class="py-2">
                <p class="font-mono font-bold text-gold-400/80">{{ v.registration_no }}</p>
                <p class="text-[10px] text-gray-500">{{ v.vehicle_type }}</p>
              </td>
              <td class="py-2 text-right text-gray-300">{{ v.total_requests }}</td>
              <td class="py-2 text-right text-gray-400">{{ v.corrective }} / {{ v.preventive }}</td>
              <td class="py-2 text-right font-bold text-red-400">৳{{ fmt(v.total_cost) }}</td>
              <td class="py-2 text-gray-400">{{ v.last_service || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Monthly -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Monthly Trend</h3>
        <div v-if="!monthly.length" class="text-center py-6 text-gray-600 text-sm">No data for this period</div>
        <div v-else class="space-y-2">
          <div v-for="m in monthly" :key="m.month" class="flex items-center gap-3 text-xs">
            <span class="w-16 text-gray-400 shrink-0">{{ formatMonth(m.month) }}</span>
            <div class="flex-1">
              <div class="w-full bg-white/[0.05] rounded-full h-2">
                <div class="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                  :style="{ width: (Number(m.total_cost) / maxMonthly * 100) + '%' }" />
              </div>
            </div>
            <span class="w-24 text-right text-orange-400 font-medium shrink-0">৳{{ fmt(m.total_cost) }}</span>
            <span class="w-10 text-right text-gray-500 shrink-0">{{ m.requests }}x</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Request List -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-4">All Maintenance Requests</h3>
      <div v-if="!requests.length" class="text-center py-6 text-gray-600 text-sm">No requests found for this period</div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="pb-2 text-left text-gray-500">Request No</th>
            <th class="pb-2 text-left text-gray-500">Date</th>
            <th class="pb-2 text-left text-gray-500">Vehicle</th>
            <th class="pb-2 text-left text-gray-500">Type</th>
            <th class="pb-2 text-left text-gray-500">Station</th>
            <th class="pb-2 text-right text-gray-500">Cost ৳</th>
            <th class="pb-2 text-left text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id" class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer" @click="$router.push(`/fleet/maintenance/${r.id}`)">
            <td class="py-2 font-mono font-bold text-gold-400/80">{{ r.request_no }}</td>
            <td class="py-2 text-gray-400">{{ r.request_date }}</td>
            <td class="py-2 font-mono text-gray-300">{{ r.vehicle_no }}</td>
            <td class="py-2">
              <span class="badge text-[10px]" :class="r.repair_type==='preventive' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'">{{ r.repair_type }}</span>
            </td>
            <td class="py-2 text-gray-400">{{ r.station_supplier || '—' }}</td>
            <td class="py-2 text-right font-medium text-red-400">৳{{ fmt(r.total_cost) }}</td>
            <td class="py-2"><UiStatusBadge :status="r.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const now  = new Date()
const from = ref(`${now.getFullYear()}-01-01`)
const to   = ref(now.toISOString().slice(0, 10))

const url = computed(() => `/api/fleet/reports/maintenance?from=${from.value}&to=${to.value}`)
const { data, refresh } = await useFetch(url)

const byVehicle = computed(() => (data.value as any)?.byVehicle ?? [])
const monthly   = computed(() => (data.value as any)?.monthly   ?? [])
const requests  = computed(() => (data.value as any)?.requests  ?? [])
const totalCost = computed(() => (data.value as any)?.totalCost ?? 0)

const maxMonthly = computed(() => Math.max(...monthly.value.map((m: any) => Number(m.total_cost || 0)), 1))

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }
function formatMonth(m: string) {
  const [y, mo] = m.split('-')
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mo)-1] + ' ' + y
}
function setYear() {
  from.value = `${new Date().getFullYear()}-01-01`
  to.value   = new Date().toISOString().slice(0, 10)
  load()
}
function load() { refresh() }
watch(url, () => refresh())
</script>
