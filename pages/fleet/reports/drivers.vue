<template>
  <div class="space-y-6">
    <UiPageHeader title="Driver Performance Report" :breadcrumb="['Fleet','Reports','Driver Performance']">
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
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Active Drivers</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">{{ drivers.filter((d:any) => d.total_trips > 0).length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Trips</p>
        <p class="text-2xl font-bold text-blue-400 mt-1">{{ drivers.reduce((s:number,d:any)=>s+Number(d.total_trips),0) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Revenue</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">৳{{ fmt(drivers.reduce((s:number,d:any)=>s+Number(d.total_revenue||0),0)) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Completed Trips</p>
        <p class="text-2xl font-bold text-teal-400 mt-1">{{ drivers.reduce((s:number,d:any)=>s+Number(d.completed_trips),0) }}</p>
      </div>
    </div>

    <!-- Driver Table -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-4">Driver Breakdown</h3>
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="pb-2 text-left text-gray-500">Driver</th>
            <th class="pb-2 text-left text-gray-500">Status</th>
            <th class="pb-2 text-right text-gray-500">Trips</th>
            <th class="pb-2 text-right text-gray-500">Completed</th>
            <th class="pb-2 text-right text-gray-500">Cancelled</th>
            <th class="pb-2 text-right text-gray-500">Revenue ৳</th>
            <th class="pb-2 text-right text-gray-500">Expenses ৳</th>
            <th class="pb-2 text-right text-gray-500">Advances ৳</th>
            <th class="pb-2 text-right text-gray-500">Completion %</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in drivers" :key="d.id" class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer" @click="$router.push(`/fleet/drivers/${d.id}`)">
            <td class="py-2">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {{ d.full_name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-gray-200">{{ d.full_name }}</p>
                  <p class="text-[10px] text-gray-500">{{ d.mobile || '—' }}</p>
                </div>
              </div>
            </td>
            <td class="py-2"><UiStatusBadge :status="d.status" /></td>
            <td class="py-2 text-right text-gray-300">{{ d.total_trips }}</td>
            <td class="py-2 text-right text-emerald-400">{{ d.completed_trips }}</td>
            <td class="py-2 text-right text-red-400">{{ d.cancelled_trips }}</td>
            <td class="py-2 text-right font-medium text-emerald-400">{{ fmt(d.total_revenue) }}</td>
            <td class="py-2 text-right text-red-400">{{ fmt(d.total_expenses) }}</td>
            <td class="py-2 text-right text-amber-400">{{ fmt(d.total_advances) }}</td>
            <td class="py-2 text-right">
              <span v-if="d.total_trips > 0" class="font-medium"
                :class="completionRate(d) >= 80 ? 'text-emerald-400' : completionRate(d) >= 50 ? 'text-amber-400' : 'text-red-400'">
                {{ completionRate(d) }}%
              </span>
              <span v-else class="text-gray-600">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const now  = new Date()
const from = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10))
const to   = ref(now.toISOString().slice(0, 10))

const url = computed(() => `/api/fleet/reports/drivers?from=${from.value}&to=${to.value}`)
const { data, refresh } = await useFetch(url)

const drivers = computed(() => (data.value as any)?.drivers ?? [])

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }
function completionRate(d: any) {
  if (!Number(d.total_trips)) return 0
  return Math.round(Number(d.completed_trips) / Number(d.total_trips) * 100)
}
function resetDates() {
  const now = new Date()
  from.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  to.value   = now.toISOString().slice(0, 10)
  load()
}
function load() { refresh() }
watch(url, () => refresh())
</script>
