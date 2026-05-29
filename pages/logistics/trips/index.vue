<template>
  <div class="space-y-6">
    <UiPageHeader title="Trips" :breadcrumb="['Logistics','Trips']">
      <template #actions><NuxtLink to="/logistics/trips/create" class="btn-gold text-xs">+ Create Trip</NuxtLink></template>
    </UiPageHeader>

    <!-- KPI row -->
    <div class="grid grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Trips</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-blue-400">{{ stats.active ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">In Progress</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-amber-400">{{ stats.scheduled ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Scheduled</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ stats.completed_today ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Completed Today</p>
      </div>
    </div>

    <UiDataTable :columns="cols" :rows="trips" :per-page="12" exportable search-placeholder="Search trips…">
      <template #cell-status="{ value }"><UiStatusBadge :status="value?.toLowerCase().replace(' ', '_')" /></template>
      <template #cell-weight_mt="{ value }"><span class="text-xs text-gray-300">{{ value }} MT</span></template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const cols = [
  { key: 'id',         label: 'Trip #',   sortable: true },
  { key: 'date',       label: 'Date',     sortable: true },
  { key: 'vehicle',    label: 'Vehicle',  sortable: true },
  { key: 'driver',     label: 'Driver' },
  { key: 'total_orders', label: 'Orders' },
  { key: 'weight_mt',  label: 'Weight' },
  { key: 'status',     label: 'Status' },
]

const { data } = await useFetch('/api/logistics/trips')

const trips = computed(() => (data.value as any)?.trips ?? [])
const stats = computed(() => (data.value as any)?.stats ?? {})
</script>
