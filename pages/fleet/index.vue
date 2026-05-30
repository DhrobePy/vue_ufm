<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Fleet Operations"
      subtitle="Real-time fleet dashboard · vehicles · drivers · trips"
      :breadcrumb="['Fleet']"
    >
      <template #actions>
        <NuxtLink to="/fleet/trips/create" class="btn-gold text-xs">+ New Trip</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Active Vehicles"
        :value="String(stats.vehicles?.available ?? 0)"
        :trend="`${stats.vehicles?.total ?? 0} total fleet`"
        trend-up icon="truck" color="teal"
      />
      <KpiCard
        label="Trips in Transit"
        :value="String(stats.trips?.ongoing ?? 0)"
        :trend="`${stats.trips?.today ?? 0} today`"
        trend-up icon="list" color="blue"
      />
      <KpiCard
        label="Completed Today"
        :value="String(stats.trips?.completed_today ?? 0)"
        :trend="`৳${fmtK(stats.trips?.revenue_today)} revenue`"
        trend-up icon="check" color="gold"
      />
      <KpiCard
        label="Pending Settlements"
        :value="String(stats.trips?.unreported ?? 0)"
        :trend="stats.maintenance?.pending > 0 ? `${stats.maintenance.pending} maintenance pending` : 'All clear'"
        :trend-up="!(stats.trips?.unreported > 0)"
        icon="money" color="orange"
      />
    </div>

    <!-- Second row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-emerald-400">{{ stats.vehicles?.busy ?? 0 }}</div>
        <div class="text-xs text-gray-500 mt-1">Vehicles On Trip</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-red-400">{{ stats.vehicles?.repair ?? 0 }}</div>
        <div class="text-xs text-gray-500 mt-1">In Maintenance</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-blue-400">{{ stats.drivers?.active ?? 0 }}</div>
        <div class="text-xs text-gray-500 mt-1">Active Drivers</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-amber-400">৳{{ fmtK(stats.fuel?.this_month_cost) }}</div>
        <div class="text-xs text-gray-500 mt-1">Fuel This Month</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Active Trips -->
      <div class="lg:col-span-2 glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Active & Today's Trips</h2>
          <NuxtLink to="/fleet/trips" class="text-xs text-gold-400/80 hover:text-gold-400">View all →</NuxtLink>
        </div>
        <div class="space-y-2">
          <div v-if="!activeTrips.length" class="text-center py-6 text-gray-600 text-sm">No active trips today</div>
          <div
            v-for="t in activeTrips"
            :key="t.id"
            class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
            @click="$router.push(`/fleet/trips/${t.id}`)"
          >
            <div class="w-2 h-2 rounded-full shrink-0" :class="tripDot(t.trip_status)" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gold-400/80 font-mono">{{ t.trip_number }}</span>
                <UiStatusBadge :status="t.trip_status" />
              </div>
              <p class="text-xs text-gray-400 truncate mt-0.5">
                {{ t.origin || '—' }} → {{ t.destination || '—' }}
              </p>
              <p class="text-[11px] text-gray-600">{{ t.vehicle_no }} · {{ t.driver_name }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-medium text-gray-300">৳{{ fmt(t.trip_charge) }}</p>
              <p class="text-[10px] text-gray-600">{{ t.trip_date }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="space-y-4">
        <!-- Fleet Status -->
        <div class="glass-card p-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fleet Status</h3>
          <div class="space-y-2">
            <div v-for="item in fleetStatus" :key="item.label" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="item.dot" />
                <span class="text-xs text-gray-400">{{ item.label }}</span>
              </div>
              <span class="text-xs font-bold text-gray-200">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div class="glass-card p-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Critical Alerts</h3>
          <div v-if="!alerts.length" class="text-center py-3 text-gray-600 text-xs">No critical alerts</div>
          <div v-for="a in alerts.slice(0,5)" :key="a.title" class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-2">
            <p class="text-xs font-medium text-red-300">{{ a.title }}</p>
            <p class="text-[10px] text-red-400/70 mt-0.5">Expires: {{ a.due_date }} ({{ a.days_remaining }}d)</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass-card p-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div class="space-y-2">
            <NuxtLink to="/fleet/trips/create"        class="btn-gold w-full text-xs text-center block py-2">+ Create Trip</NuxtLink>
            <NuxtLink to="/fleet/vehicles"            class="btn-secondary w-full text-xs text-center block py-2">View Vehicles</NuxtLink>
            <NuxtLink to="/fleet/maintenance/create"  class="btn-secondary w-full text-xs text-center block py-2">Log Maintenance</NuxtLink>
            <NuxtLink to="/fleet/fuel/create"         class="btn-secondary w-full text-xs text-center block py-2">Log Fuel</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance pending -->
    <div v-if="recentMaintenance.length" class="glass-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title">Ongoing Maintenance</h2>
        <NuxtLink to="/fleet/maintenance" class="text-xs text-gold-400/80 hover:text-gold-400">View all →</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500 font-medium">Request #</th>
              <th class="pb-2 text-left text-gray-500 font-medium">Vehicle</th>
              <th class="pb-2 text-left text-gray-500 font-medium">Type</th>
              <th class="pb-2 text-left text-gray-500 font-medium">Station</th>
              <th class="pb-2 text-left text-gray-500 font-medium">Status</th>
              <th class="pb-2 text-right text-gray-500 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in recentMaintenance" :key="m.id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
              <td class="py-2 font-mono text-gold-400/80">{{ m.request_no }}</td>
              <td class="py-2 text-gray-300">{{ m.vehicle_no }}</td>
              <td class="py-2"><span class="badge" :class="m.repair_type === 'preventive' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'">{{ m.repair_type }}</span></td>
              <td class="py-2 text-gray-400">{{ m.station_supplier || '—' }}</td>
              <td class="py-2"><UiStatusBadge :status="m.status" /></td>
              <td class="py-2 text-right text-gray-300">৳{{ fmt(m.total_cost) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, refresh } = await useFetch('/api/fleet/dashboard')

const stats            = computed(() => (data.value as any) ?? {})
const activeTrips      = computed(() => (data.value as any)?.active_trips       ?? [])
const recentMaintenance = computed(() => (data.value as any)?.recent_maintenance ?? [])
const alerts           = computed(() => (data.value as any)?.alerts             ?? [])

const fleetStatus = computed(() => {
  const v = stats.value?.vehicles ?? {}
  return [
    { label: 'Available',  value: v.available ?? 0, dot: 'bg-emerald-500' },
    { label: 'On Trip',    value: v.busy      ?? 0, dot: 'bg-blue-500'    },
    { label: 'In Repair',  value: v.repair    ?? 0, dot: 'bg-red-500'     },
    { label: 'Inactive',   value: v.inactive  ?? 0, dot: 'bg-gray-600'    },
  ]
})

function fmt(n: any) {
  return Number(n || 0).toLocaleString('en-BD')
}
function fmtK(n: any) {
  const v = Number(n || 0)
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return v.toLocaleString('en-BD')
}
function tripDot(s: string) {
  return {
    'in_progress': 'bg-blue-400',
    'scheduled':   'bg-amber-400',
    'completed':   'bg-emerald-400',
    'cancelled':   'bg-red-400',
    'closed':      'bg-gray-500',
  }[s] ?? 'bg-gray-500'
}

// Refresh every 60s
onMounted(() => { setInterval(refresh, 60_000) })
</script>
