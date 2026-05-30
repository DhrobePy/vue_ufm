<template>
  <div class="space-y-6">
    <UiPageHeader title="Trip Summary Report" :breadcrumb="['Fleet','Reports','Trip Summary']">
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
      <button @click="load" class="btn-gold text-xs">Apply Filter</button>
      <button @click="resetDates" class="btn-secondary text-xs">This Month</button>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Trips</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">{{ summary.total_trips }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Revenue</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">৳{{ fmt(summary.revenue) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Expenses</p>
        <p class="text-2xl font-bold text-red-400 mt-1">৳{{ fmt(summary.total_expense) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Net (Revenue − Expenses)</p>
        <p class="text-2xl font-bold mt-1" :class="summary.net >= 0 ? 'text-blue-400' : 'text-red-400'">৳{{ fmt(summary.net) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- By Driver -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Revenue by Driver</h3>
        <div v-if="!byDriver.length" class="text-center py-6 text-gray-600 text-sm">No trip data for this period</div>
        <div v-else class="space-y-3">
          <div v-for="d in byDriver" :key="d.driver_name" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {{ d.driver_name?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between mb-1">
                <span class="text-xs text-gray-300 truncate">{{ d.driver_name }}</span>
                <span class="text-xs font-bold text-emerald-400 shrink-0 ml-2">৳{{ fmt(d.revenue) }}</span>
              </div>
              <div class="w-full bg-white/[0.05] rounded-full h-1.5">
                <div class="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  :style="{ width: (Number(d.revenue) / maxDriverRevenue * 100) + '%' }" />
              </div>
              <p class="text-[10px] text-gray-600 mt-0.5">{{ d.trips }} trips · ৳{{ fmt(d.expenses) }} expenses</p>
            </div>
          </div>
        </div>
      </div>

      <!-- By Vehicle -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Revenue by Vehicle</h3>
        <div v-if="!byVehicle.length" class="text-center py-6 text-gray-600 text-sm">No trip data for this period</div>
        <div v-else class="space-y-3">
          <div v-for="v in byVehicle" :key="v.registration_no" class="flex items-center gap-3">
            <p class="font-mono text-xs font-bold text-gold-400/80 w-28 shrink-0">{{ v.registration_no }}</p>
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-xs text-gray-500">{{ v.trips }} trips</span>
                <span class="text-xs font-bold text-emerald-400">৳{{ fmt(v.revenue) }}</span>
              </div>
              <div class="w-full bg-white/[0.05] rounded-full h-1.5">
                <div class="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                  :style="{ width: (Number(v.revenue) / maxVehicleRevenue * 100) + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trip Detail Table -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-4">All Trips <span class="text-gray-500 font-normal text-xs normal-case">({{ trips.length }} trips)</span></h3>
      <div v-if="!trips.length" class="text-center py-8 text-gray-600 text-sm">No trips found for this period</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.07]">
              <th class="pb-2 text-left text-gray-500">Trip No</th>
              <th class="pb-2 text-left text-gray-500">Date</th>
              <th class="pb-2 text-left text-gray-500">Route</th>
              <th class="pb-2 text-left text-gray-500">Vehicle</th>
              <th class="pb-2 text-left text-gray-500">Driver</th>
              <th class="pb-2 text-right text-gray-500">Charge ৳</th>
              <th class="pb-2 text-right text-gray-500">Expenses ৳</th>
              <th class="pb-2 text-right text-gray-500">Net ৳</th>
              <th class="pb-2 text-left text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in trips" :key="t.id" class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer" @click="$router.push(`/fleet/trips/${t.id}`)">
              <td class="py-2 font-mono font-bold text-gold-400/80">{{ t.trip_number }}</td>
              <td class="py-2 text-gray-400">{{ t.trip_date }}</td>
              <td class="py-2 text-gray-400 max-w-[120px] truncate">{{ t.origin }} → {{ t.destination }}</td>
              <td class="py-2 font-mono text-gray-300">{{ t.vehicle_no }}</td>
              <td class="py-2 text-gray-300">{{ t.driver_name }}</td>
              <td class="py-2 text-right text-emerald-400 font-medium">{{ fmt(t.trip_charge) }}</td>
              <td class="py-2 text-right text-red-400">{{ fmt(t.total_expense) }}</td>
              <td class="py-2 text-right font-bold" :class="(Number(t.trip_charge)-Number(t.total_expense)) >= 0 ? 'text-blue-400' : 'text-red-400'">
                {{ fmt(Number(t.trip_charge) - Number(t.total_expense)) }}
              </td>
              <td class="py-2"><UiStatusBadge :status="t.trip_status" /></td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-white/[0.07]">
              <td colspan="5" class="pt-3 text-right text-gray-500 text-xs">Totals</td>
              <td class="pt-3 text-right font-bold text-emerald-400">৳{{ fmt(summary.revenue) }}</td>
              <td class="pt-3 text-right font-bold text-red-400">৳{{ fmt(summary.total_expense) }}</td>
              <td class="pt-3 text-right font-bold" :class="summary.net >= 0 ? 'text-blue-400' : 'text-red-400'">৳{{ fmt(summary.net) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const now  = new Date()
const from = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))
const to   = ref(now.toISOString().slice(0, 10))

const url = computed(() => `/api/fleet/reports/trips?from=${from.value}&to=${to.value}`)
const { data, refresh } = await useFetch(url)

const trips     = computed(() => (data.value as any)?.trips     ?? [])
const byDriver  = computed(() => (data.value as any)?.byDriver  ?? [])
const byVehicle = computed(() => (data.value as any)?.byVehicle ?? [])
const summary   = computed(() => (data.value as any)?.summary   ?? { total_trips: 0, revenue: 0, total_expense: 0, net: 0 })

const maxDriverRevenue  = computed(() => Math.max(...byDriver.value.map((d: any) => Number(d.revenue || 0)), 1))
const maxVehicleRevenue = computed(() => Math.max(...byVehicle.value.map((v: any) => Number(v.revenue || 0)), 1))

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }

function resetDates() {
  const now = new Date()
  from.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  to.value   = now.toISOString().slice(0, 10)
  load()
}

function load() { refresh() }

watch(url, () => refresh())
</script>
