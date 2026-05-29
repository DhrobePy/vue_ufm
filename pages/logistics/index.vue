<template>
  <div class="space-y-6">
    <UiPageHeader title="Logistics" subtitle="Fleet management · drivers · trips · fuel · maintenance" :breadcrumb="['Logistics']">
      <template #actions><NuxtLink to="/logistics/trips/create" class="btn-gold text-xs">+ New Trip</NuxtLink></template>
    </UiPageHeader>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Active Vehicles"  :value="String(vehicles.filter(v=>v.status==='Active').length)"       :trend="`${allVehicles.length} total`"  trend-up  icon="truck"   color="orange" />
      <KpiCard label="In Maintenance"   :value="String(vehicles.filter(v=>v.status==='Maintenance').length)"   trend="Awaiting service"       :trend-up="false"  icon="list"   color="red" />
      <KpiCard label="Drivers Assigned" :value="String(allVehicles.filter((v:any)=>v.driver_name).length)"    trend="with drivers"           trend-up  icon="users"   color="teal" />
      <KpiCard label="Total Fleet"      :value="String(allVehicles.length)"                                    trend="vehicles"               trend-up  icon="truck"  color="gold" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Vehicle status -->
      <div class="lg:col-span-2 glass-card p-5">
        <h2 class="section-title mb-4">Fleet Status</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="v in vehicles" :key="v.id" class="glass-card p-3 text-center space-y-1.5">
            <div class="text-2xl">🚛</div>
            <p class="text-xs font-bold text-gray-200">{{ v.number }}</p>
            <UiStatusBadge :status="v.status === 'Active' ? 'active' : v.status === 'Maintenance' ? 'in_maintenance' : 'inactive'" />
            <p class="text-[10px] text-gray-600">{{ v.driver || 'No driver' }}</p>
          </div>
        </div>
      </div>
      <!-- Today's trips -->
      <div class="glass-card p-5">
        <h2 class="section-title mb-3">Today's Trips</h2>
        <div class="space-y-2.5">
          <div v-for="trip in todayTrips" :key="trip.id" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
            <div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" :style="`background:${tripColor(trip.status)}`" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-200 truncate">{{ trip.vehicle }} → {{ trip.destination }}</p>
              <p class="text-[11px] text-gray-600">{{ trip.driver }} · {{ trip.time }}</p>
            </div>
            <UiStatusBadge :status="trip.status" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: vData } = await useFetch('/api/logistics/vehicles')

const allVehicles = computed(() => (vData.value?.vehicles ?? []) as any[])

const vehicles = computed(() =>
  allVehicles.value.map((v: any) => ({
    id:     v.id,
    number: v.vehicle_number,
    status: v.status, // Already 'Active' | 'Maintenance' | 'Inactive'
    driver: v.driver_name ?? '',
  }))
)

// Today's trips — no trips table yet, so we derive from dispatched credit orders
const todayTrips: any[] = []

function tripColor(s: string) {
  return ({ completed:'#10b981', delivered:'#14b8a6', approved:'#3b82f6', pending:'#eab308', in_production:'#3b82f6', dispatched:'#14b8a6' } as any)[s] ?? '#6b7280'
}
</script>
