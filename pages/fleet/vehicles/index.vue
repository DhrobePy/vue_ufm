<template>
  <div class="space-y-6">
    <UiPageHeader title="Vehicles" :breadcrumb="['Fleet','Vehicles']">
      <template #actions>
        <NuxtLink to="/fleet/vehicles/create" class="btn-gold text-xs">+ Add Vehicle</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter === '' ? 'ring-1 ring-gold-400/40' : ''" @click="setFilter('')">
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">All Vehicles</p>
      </div>
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter === 'available' ? 'ring-1 ring-emerald-400/40' : ''" @click="setFilter('available')">
        <p class="text-2xl font-bold text-emerald-400">{{ stats.available ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Available</p>
      </div>
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter === 'busy' ? 'ring-1 ring-blue-400/40' : ''" @click="setFilter('busy')">
        <p class="text-2xl font-bold text-blue-400">{{ stats.busy ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">On Trip</p>
      </div>
      <div class="glass-card p-4 text-center cursor-pointer" :class="activeFilter === 'repair' ? 'ring-1 ring-red-400/40' : ''" @click="setFilter('repair')">
        <p class="text-2xl font-bold text-red-400">{{ stats.repair ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">In Repair</p>
      </div>
    </div>

    <!-- Search -->
    <div class="flex gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="search" type="text" placeholder="Search registration, make, model…" class="form-input pl-9" />
      </div>
    </div>

    <!-- Vehicles Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="v in filtered"
        :key="v.id"
        class="glass-card p-4 cursor-pointer hover:ring-1 hover:ring-white/[0.12] transition-all"
        @click="selected = v.id; showDetail = true"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-mono text-sm font-bold text-gold-400/90">{{ v.registration_no }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ v.make }} {{ v.model }}</p>
          </div>
          <UiStatusBadge :status="v.status" />
        </div>

        <!-- Type badge -->
        <div class="flex gap-2 mb-3">
          <span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">{{ v.vehicle_type }}</span>
          <span class="badge bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">{{ v.ownership_type }}</span>
          <span class="badge bg-gray-500/10 text-gray-400 border-gray-500/20 text-[10px]">{{ v.fuel_type }}</span>
        </div>

        <!-- Info -->
        <div class="space-y-1.5 text-[11px]">
          <div class="flex justify-between">
            <span class="text-gray-600">Capacity</span>
            <span class="text-gray-300">{{ v.weight_capacity_kg ? (v.weight_capacity_kg / 1000).toFixed(1) + ' MT' : '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Odometer</span>
            <span class="text-gray-300">{{ v.current_odometer ? v.current_odometer.toLocaleString() + ' km' : '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Driver</span>
            <span class="text-gray-300 truncate max-w-[100px]">{{ v.driver_name || '—' }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <NuxtLink :to="`/fleet/vehicles/${v.id}`" class="flex-1 text-center text-[10px] text-gold-400/80 hover:text-gold-400 py-1" @click.stop>View Detail</NuxtLink>
          <NuxtLink :to="`/fleet/vehicles/${v.id}/edit`" class="flex-1 text-center text-[10px] text-gray-500 hover:text-gray-300 py-1" @click.stop>Edit</NuxtLink>
        </div>
      </div>

      <div v-if="!filtered.length" class="col-span-full text-center py-12 text-gray-600">
        No vehicles found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const activeFilter = ref('')
const search       = ref('')
const selected     = ref<number | null>(null)
const showDetail   = ref(false)

const { data, refresh } = await useFetch('/api/fleet/vehicles', {
  query: computed(() => ({ status: activeFilter.value, search: search.value })),
  watch: [activeFilter, search],
})

const vehicles = computed(() => (data.value as any)?.vehicles ?? [])
const stats    = computed(() => (data.value as any)?.stats    ?? {})

const filtered = computed(() => vehicles.value)

function setFilter(f: string) {
  activeFilter.value = activeFilter.value === f ? '' : f
}
</script>
