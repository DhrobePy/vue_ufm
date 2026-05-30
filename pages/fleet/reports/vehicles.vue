<template>
  <div class="space-y-6">
    <UiPageHeader title="Vehicle Utilisation Report" :breadcrumb="['Fleet','Reports','Vehicle Utilisation']">
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
      <button @click="resetDates" class="btn-secondary text-xs">This Month</button>
      <span class="text-xs text-gray-500 self-center">Period: {{ days }} days</span>
    </div>

    <!-- Fleet summary KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Vehicles</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">{{ vehicles.length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Active (has trips)</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">{{ vehicles.filter((v:any) => v.total_trips > 0).length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Revenue</p>
        <p class="text-2xl font-bold text-blue-400 mt-1">৳{{ fmt(totalRevenue) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Fuel Cost</p>
        <p class="text-2xl font-bold text-amber-400 mt-1">৳{{ fmt(totalFuel) }}</p>
      </div>
    </div>

    <!-- Per-vehicle table -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-4">Vehicle-by-Vehicle Breakdown</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.07]">
              <th class="pb-2 text-left text-gray-500">Vehicle</th>
              <th class="pb-2 text-left text-gray-500">Type</th>
              <th class="pb-2 text-center text-gray-500">Status</th>
              <th class="pb-2 text-right text-gray-500">Trips</th>
              <th class="pb-2 text-right text-gray-500">Completed</th>
              <th class="pb-2 text-right text-gray-500">Revenue ৳</th>
              <th class="pb-2 text-right text-gray-500">Fuel Cost ৳</th>
              <th class="pb-2 text-right text-gray-500">Maint Cost ৳</th>
              <th class="pb-2 text-right text-gray-500">Utilisation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vehicles" :key="v.id" class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer" @click="$router.push(`/fleet/vehicles/${v.id}`)">
              <td class="py-2">
                <p class="font-mono font-bold text-gold-400/80">{{ v.registration_no }}</p>
                <p class="text-[10px] text-gray-500">{{ v.make }} {{ v.model }}</p>
              </td>
              <td class="py-2 text-gray-400">{{ v.vehicle_type }}</td>
              <td class="py-2 text-center"><UiStatusBadge :status="v.status" /></td>
              <td class="py-2 text-right text-gray-300">{{ v.total_trips }}</td>
              <td class="py-2 text-right text-emerald-400">{{ v.completed_trips }}</td>
              <td class="py-2 text-right text-emerald-400 font-medium">{{ fmt(v.revenue) }}</td>
              <td class="py-2 text-right text-amber-400">{{ fmt(v.fuel_cost) }}</td>
              <td class="py-2 text-right text-orange-400">{{ fmt(v.maint_cost) }}</td>
              <td class="py-2 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="w-16 bg-white/[0.05] rounded-full h-1.5">
                    <div class="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                      :style="{ width: Math.min(100, Number(v.total_trips) / Math.max(days / 7, 1) * 100) + '%' }" />
                  </div>
                  <span class="text-gray-400 w-8 text-right">{{ v.total_trips > 0 ? Math.min(100, Math.round(Number(v.total_trips) / Math.max(days / 7, 1) * 100)) + '%' : '—' }}</span>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-white/[0.07]">
              <td colspan="5" class="pt-3 text-right text-gray-500">Totals</td>
              <td class="pt-3 text-right font-bold text-emerald-400">৳{{ fmt(totalRevenue) }}</td>
              <td class="pt-3 text-right font-bold text-amber-400">৳{{ fmt(totalFuel) }}</td>
              <td class="pt-3 text-right font-bold text-orange-400">৳{{ fmt(totalMaint) }}</td>
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

const url = computed(() => `/api/fleet/reports/vehicles?from=${from.value}&to=${to.value}`)
const { data, refresh } = await useFetch(url)

const vehicles = computed(() => (data.value as any)?.vehicles ?? [])
const days     = computed(() => (data.value as any)?.days     ?? 1)

const totalRevenue = computed(() => vehicles.value.reduce((s: number, v: any) => s + Number(v.revenue || 0), 0))
const totalFuel    = computed(() => vehicles.value.reduce((s: number, v: any) => s + Number(v.fuel_cost || 0), 0))
const totalMaint   = computed(() => vehicles.value.reduce((s: number, v: any) => s + Number(v.maint_cost || 0), 0))

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
