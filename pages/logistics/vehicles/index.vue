<template>
  <div class="space-y-6">
    <UiPageHeader title="Vehicles" :breadcrumb="['Logistics','Vehicles']">
      <template #actions><NuxtLink to="/logistics/vehicles/create" class="btn-gold text-xs">+ Add Vehicle</NuxtLink></template>
    </UiPageHeader>
    <UiDataTable :columns="cols" :rows="vehicles" :per-page="10" exportable search-placeholder="Search vehicles…">
      <template #cell-number="{ value }"><span class="font-mono text-xs text-gold-400/80 font-bold">{{ value }}</span></template>
      <template #cell-status="{ value }"><UiStatusBadge :status="value==='Active'?'active':value==='Maintenance'?'in_maintenance':'inactive'" /></template>
      <template #cell-type="{ value }"><span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">{{ value }}</span></template>
    </UiDataTable>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'default' })
const cols = [
  { key:'number',      label:'Vehicle #',       sortable:true },
  { key:'type',        label:'Type' },
  { key:'category',    label:'Category',         sortable:true },
  { key:'capacity',    label:'Capacity' },
  { key:'driver',      label:'Assigned Driver' },
  { key:'status',      label:'Status' },
  { key:'nextService', label:'Next Service' },
]

const { data, pending, error } = await useFetch('/api/logistics/vehicles')

const vehicles = computed(() =>
  (data.value?.vehicles ?? []).map((v: any) => ({
    id:          v.id,
    number:      v.vehicle_number,
    type:        v.vehicle_type,           // 'Own' | 'Rented'
    category:    v.category,              // 'Truck' | 'Van' | 'Pickup' …
    capacity:    v.capacity_kg ? `${(v.capacity_kg / 1000).toFixed(1)} MT` : '—',
    driver:      v.driver_name || '—',
    status:      v.status,                // already 'Active' | 'Maintenance' | 'Inactive'
    nextService: v.next_service_due_date ? String(v.next_service_due_date).slice(0, 10) : '—',
  }))
)
</script>
