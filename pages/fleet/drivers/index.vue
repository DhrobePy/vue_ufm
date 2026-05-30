<template>
  <div class="space-y-6">
    <UiPageHeader title="Drivers" :breadcrumb="['Fleet','Drivers']">
      <template #actions>
        <NuxtLink to="/fleet/drivers/create" class="btn-gold text-xs">+ Add Driver</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI -->
    <div class="grid grid-cols-3 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Total Drivers</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ stats.active ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1">Active</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-red-400">{{ (stats.inactive ?? 0) + (stats.suspended ?? 0) }}</p>
        <p class="text-xs text-gray-500 mt-1">Inactive / Suspended</p>
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input v-model="search" type="text" placeholder="Search by name, mobile, NID…" class="form-input pl-9" />
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Name</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Mobile</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">NID</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Joining Date</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Assigned Vehicle</th>
            <th class="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
            <th class="px-4 py-3 text-center text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in drivers"
            :key="d.id"
            class="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors"
            @click="$router.push(`/fleet/drivers/${d.id}`)"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {{ d.full_name?.charAt(0) }}
                </div>
                <span class="font-medium text-gray-200">{{ d.full_name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-400">{{ d.mobile || '—' }}</td>
            <td class="px-4 py-3 font-mono text-gray-400">{{ d.nid || '—' }}</td>
            <td class="px-4 py-3 text-gray-400">{{ d.joining_date || '—' }}</td>
            <td class="px-4 py-3 font-mono text-gold-400/70">{{ d.vehicle_no || '—' }}</td>
            <td class="px-4 py-3"><UiStatusBadge :status="d.status" /></td>
            <td class="px-4 py-3 text-center" @click.stop>
              <NuxtLink :to="`/fleet/drivers/${d.id}/edit`" class="text-xs text-gray-500 hover:text-gray-300">Edit</NuxtLink>
            </td>
          </tr>
          <tr v-if="!drivers.length">
            <td colspan="7" class="px-4 py-12 text-center text-gray-600">No drivers found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search = ref('')
const { data } = await useFetch('/api/fleet/drivers', {
  query: computed(() => ({ search: search.value })),
  watch: [search],
})

const drivers = computed(() => (data.value as any)?.drivers ?? [])
const stats   = computed(() => (data.value as any)?.stats   ?? {})
</script>
