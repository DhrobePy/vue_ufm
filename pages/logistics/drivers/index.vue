<template>
  <div class="space-y-6">
    <UiPageHeader title="Drivers" :breadcrumb="['Logistics','Drivers']">
      <template #actions><NuxtLink to="/logistics/drivers/create" class="btn-gold text-xs">+ Add Driver</NuxtLink></template>
    </UiPageHeader>

    <!-- KPI row -->
    <div class="grid grid-cols-3 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gold-400">{{ stats.total }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Drivers</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ stats.active }}</p>
        <p class="text-xs text-gray-500 mt-1">Active</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-amber-400">{{ stats.on_leave }}</p>
        <p class="text-xs text-gray-500 mt-1">On Leave</p>
      </div>
    </div>

    <UiDataTable :columns="cols" :rows="rows" :per-page="10" exportable search-placeholder="Search drivers…">
      <template #cell-driver_name="{ value }"><span class="font-medium text-gray-200">{{ value }}</span></template>
      <template #cell-status="{ value }"><UiStatusBadge :status="value?.toLowerCase()" /></template>
      <template #cell-license_expiry_date="{ value }">
        <span :class="['text-xs', value && new Date(value) < new Date() ? 'text-red-400 font-bold' : 'text-gray-400']">
          {{ value ?? '—' }}
        </span>
      </template>
      <template #cell-rating="{ value }">
        <span class="flex items-center gap-1 text-xs">⭐ <span class="text-gray-300 font-medium">{{ value ?? '—' }}</span></span>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const cols = [
  { key: 'driver_name',         label: 'Name',           sortable: true },
  { key: 'phone_number',        label: 'Phone' },
  { key: 'license_type',        label: 'License Type' },
  { key: 'license_expiry_date', label: 'License Expiry' },
  { key: 'assigned_vehicle',    label: 'Assigned Vehicle' },
  { key: 'total_trips',         label: 'Total Trips',    sortable: true },
  { key: 'rating',              label: 'Rating',         sortable: true },
  { key: 'status',              label: 'Status' },
]

const { data, pending } = await useFetch('/api/logistics/drivers')

const rows  = computed(() => (data.value as any)?.drivers ?? [])
const stats = computed(() => (data.value as any)?.stats ?? { total: 0, active: 0, on_leave: 0 })
</script>
