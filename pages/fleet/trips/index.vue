<template>
  <div class="space-y-6">
    <UiPageHeader title="Trip Console" :breadcrumb="['Fleet','Trips']">
      <template #actions>
        <NuxtLink to="/fleet/trips/create" class="btn-gold text-xs">+ Create Trip</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Consolidation Suggestions -->
    <div v-if="suggestions.length" class="glass-card p-4 border border-gold-400/20">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <h3 class="text-sm font-semibold text-gray-100">Consolidation Suggestions</h3>
        <span class="badge text-[10px] bg-gold-400/10 text-gold-400">{{ suggestions.length }}</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="s in suggestions"
          :key="`${s.trip_id_a}-${s.trip_id_b}`"
          class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03]"
        >
          <p class="text-xs text-gray-300 leading-relaxed">
            Trip <span class="font-mono font-bold text-gold-400/80">{{ s.trip_a.trip_number }}</span>
            ({{ routeLabel(s.trip_a) }}, {{ mt(s.trip_a.weight_kg) }}) and
            <span class="font-mono font-bold text-gold-400/80">{{ s.trip_b.trip_number }}</span>
            ({{ routeLabel(s.trip_b) }}, {{ mt(s.trip_b.weight_kg) }})
            share {{ s.match_on }} on {{ s.trip_date }} — could combine into
            <span class="text-gray-100 font-medium">{{ s.vehicle.registration_no }}</span>
            (capacity {{ mt(s.vehicle.weight_capacity_kg) }}). Save a trip.
          </p>
          <button
            class="btn-ghost text-[10px] shrink-0"
            :disabled="dismissing === suggKey(s)"
            @click="dismiss(s)"
          >{{ dismissing === suggKey(s) ? '…' : 'Dismiss' }}</button>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter==='all'?'ring-1 ring-white/20':''" @click="setFilter('all')">
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Trips</p>
      </div>
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter==='today'?'ring-1 ring-gold-400/40':''" @click="setFilter('today')">
        <p class="text-2xl font-bold text-gold-400">{{ stats.today ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Today</p>
      </div>
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter==='ongoing'?'ring-1 ring-blue-400/40':''" @click="setFilter('ongoing')">
        <p class="text-2xl font-bold text-blue-400">{{ stats.ongoing ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Ongoing</p>
      </div>
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter==='unreported'?'ring-1 ring-red-400/40':''" @click="setFilter('unreported')">
        <p class="text-2xl font-bold text-red-400">{{ stats.unreported ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Unreported</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex gap-3 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="search" type="text" placeholder="Search trip, vehicle, driver, route…" class="form-input pl-9" />
      </div>
      <input v-model="dateFilter" type="date" class="form-input w-auto" />
    </div>

    <!-- Trips Table -->
    <div class="glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.07]">
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Trip #</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Route</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Customer</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Vehicle</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Driver</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th class="px-4 py-3 text-left text-gray-500 font-medium">Report</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">Charge</th>
              <th class="px-4 py-3 text-center text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in trips"
              :key="t.id"
              class="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors"
              @click="$router.push(`/fleet/trips/${t.id}`)"
            >
              <td class="px-4 py-3 font-mono font-bold text-gold-400/80">{{ t.trip_number }}</td>
              <td class="px-4 py-3 text-gray-400">{{ t.trip_date }}</td>
              <td class="px-4 py-3 text-gray-300">
                <span class="truncate max-w-[140px] block">{{ t.origin || '—' }} → {{ t.destination || '—' }}</span>
              </td>
              <td class="px-4 py-3 text-gray-400 truncate max-w-[100px]">{{ t.customer_name || '—' }}</td>
              <td class="px-4 py-3 font-mono text-gray-300">{{ t.vehicle_no }}</td>
              <td class="px-4 py-3 text-gray-400">{{ t.driver_name }}</td>
              <td class="px-4 py-3"><UiStatusBadge :status="t.trip_status" /></td>
              <td class="px-4 py-3">
                <span class="badge text-[10px]" :class="t.report_status === 'reported' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'">
                  {{ t.report_status }}
                </span>
              </td>
              <td class="px-4 py-3 text-right text-gray-200 font-medium">৳{{ Number(t.trip_charge || 0).toLocaleString() }}</td>
              <td class="px-4 py-3 text-center" @click.stop>
                <div class="flex justify-center gap-1">
                  <button v-if="t.trip_status === 'scheduled'" @click="doAction(t.id, 'start')" class="px-2 py-1 rounded text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Start</button>
                  <button v-if="t.trip_status === 'in_progress'" @click="doAction(t.id, 'complete')" class="px-2 py-1 rounded text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Complete</button>
                  <button v-if="t.trip_status === 'completed' && t.report_status === 'unreported'" @click="doAction(t.id, 'report')" class="px-2 py-1 rounded text-[10px] bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">Report</button>
                </div>
              </td>
            </tr>
            <tr v-if="!trips.length">
              <td colspan="10" class="px-4 py-12 text-center text-gray-600">No trips found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const activeFilter = ref('all')
const search       = ref('')
const dateFilter   = ref('')

const { data, refresh } = await useFetch('/api/fleet/trips', {
  query: computed(() => ({
    status: activeFilter.value === 'all' ? '' : activeFilter.value,
    search: search.value,
    date:   dateFilter.value,
  })),
  watch: [activeFilter, search, dateFilter],
})

const trips = computed(() => (data.value as any)?.trips ?? [])
const stats = computed(() => (data.value as any)?.stats ?? {})

function setFilter(f: string) {
  activeFilter.value = f
}

// ── Consolidation suggestions ──────────────────────────────
const { data: suggData, refresh: refreshSuggestions } = await useFetch('/api/fleet/trips/consolidation-suggestions')
const suggestions = computed(() => (suggData.value as any)?.suggestions ?? [])
const dismissing = ref<string | null>(null)

function suggKey(s: any) {
  return `${s.trip_id_a}-${s.trip_id_b}`
}
function routeLabel(t: any) {
  return `${t.origin || '—'} → ${t.destination || '—'}`
}
function mt(kg: any) {
  const n = Number(kg) || 0
  return `${(n / 1000).toFixed(1)}MT`
}
async function dismiss(s: any) {
  dismissing.value = suggKey(s)
  try {
    await $fetch('/api/fleet/trips/consolidation-suggestions', {
      method: 'POST',
      body: { trip_id_a: s.trip_id_a, trip_id_b: s.trip_id_b },
    })
    await refreshSuggestions()
  } finally {
    dismissing.value = null
  }
}

async function doAction(tripId: number, action: string) {
  await $fetch(`/api/fleet/trips/${tripId}`, { method: 'PATCH', body: { action } })
  refresh()
}
</script>
