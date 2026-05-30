<template>
  <div class="space-y-6">
    <UiPageHeader title="Fuel Logs" :breadcrumb="['Fleet','Fuel']">
      <template #actions>
        <NuxtLink to="/fleet/fuel/create" class="btn-gold text-xs">+ Log Fuel</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gray-100">{{ stats.total_logs ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Fill-ups</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-blue-400">{{ Number(stats.this_month_liters ?? 0).toFixed(0) }} L</p>
        <p class="text-xs text-gray-500 mt-1">This Month (Litres)</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gold-400">৳{{ fmtK(stats.this_month_cost) }}</p>
        <p class="text-xs text-gray-500 mt-1">This Month Cost</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">৳{{ fmtK(stats.total_cost) }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Cost</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="search" type="text" placeholder="Search vehicle, station, receipt…" class="form-input pl-9" />
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="px-4 py-3 text-left text-gray-500">Date</th>
            <th class="px-4 py-3 text-left text-gray-500">Vehicle</th>
            <th class="px-4 py-3 text-left text-gray-500">Driver</th>
            <th class="px-4 py-3 text-left text-gray-500">Fuel Type</th>
            <th class="px-4 py-3 text-right text-gray-500">Qty (L)</th>
            <th class="px-4 py-3 text-right text-gray-500">Rate ৳/L</th>
            <th class="px-4 py-3 text-right text-gray-500">Amount ৳</th>
            <th class="px-4 py-3 text-right text-gray-500">Odometer</th>
            <th class="px-4 py-3 text-right text-gray-500">Mileage</th>
            <th class="px-4 py-3 text-left text-gray-500">Station</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
            <td class="px-4 py-3 text-gray-400">{{ l.fuel_date }}</td>
            <td class="px-4 py-3 font-mono text-gold-400/80">{{ l.vehicle_no }}</td>
            <td class="px-4 py-3 text-gray-400">{{ l.driver_name || '—' }}</td>
            <td class="px-4 py-3"><span class="badge bg-blue-500/10 text-blue-400 text-[10px]">{{ l.fuel_type }}</span></td>
            <td class="px-4 py-3 text-right text-gray-300">{{ Number(l.quantity_liters).toFixed(2) }}</td>
            <td class="px-4 py-3 text-right text-gray-400">{{ l.price_per_liter ? '৳' + Number(l.price_per_liter).toFixed(2) : '—' }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-200">৳{{ Number(l.total_amount || 0).toLocaleString() }}</td>
            <td class="px-4 py-3 text-right text-gray-400">{{ l.odometer_reading ? l.odometer_reading.toLocaleString() + ' km' : '—' }}</td>
            <td class="px-4 py-3 text-right text-emerald-400/80">
              {{ calcMileage(l) }}
            </td>
            <td class="px-4 py-3 text-gray-400">{{ l.station_name || '—' }}</td>
          </tr>
          <tr v-if="!logs.length">
            <td colspan="10" class="px-4 py-12 text-center text-gray-600">No fuel logs found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search = ref('')
const { data } = await useFetch('/api/fleet/fuel', {
  query: computed(() => ({ search: search.value })),
  watch: [search],
})

const logs  = computed(() => (data.value as any)?.logs  ?? [])
const stats = computed(() => (data.value as any)?.stats ?? {})

function calcMileage(l: any) {
  if (!l.odometer_reading || !l.previous_odometer || !l.quantity_liters) return '—'
  const km  = l.odometer_reading - l.previous_odometer
  const lit = Number(l.quantity_liters)
  if (km <= 0 || lit <= 0) return '—'
  return (km / lit).toFixed(2) + ' km/L'
}

function fmtK(n: any) {
  const v = Number(n || 0)
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return v.toLocaleString()
}
</script>
