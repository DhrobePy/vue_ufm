<template>
  <div class="space-y-6">
    <UiPageHeader title="Fuel Efficiency Report" :breadcrumb="['Fleet','Fuel','Efficiency']">
      <template #actions>
        <NuxtLink to="/fleet/fuel" class="btn-secondary text-xs">← Fuel Logs</NuxtLink>
        <NuxtLink to="/fleet/fuel/create" class="btn-gold text-xs">+ Log Fuel</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Fleet-wide KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Vehicles Fuelled</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">{{ fleetStats.vehicles_fuelled || 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Fuel (L)</p>
        <p class="text-2xl font-bold text-blue-400 mt-1">{{ fmt(fleetStats.total_liters) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Cost</p>
        <p class="text-2xl font-bold text-amber-400 mt-1">৳{{ fmt(fleetStats.total_cost) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Fleet Avg Mileage</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">
          {{ fleetStats.avg_mileage ? Number(fleetStats.avg_mileage).toFixed(2) : '—' }}
          <span class="text-xs text-gray-500 font-normal">km/L</span>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Per-Vehicle Efficiency Table -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Per-Vehicle Efficiency</h3>
        <div v-if="!vehicleSummary.length" class="text-center py-6 text-gray-600 text-sm">No fuel data recorded yet</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Vehicle</th>
              <th class="pb-2 text-right text-gray-500">Fills</th>
              <th class="pb-2 text-right text-gray-500">Total (L)</th>
              <th class="pb-2 text-right text-gray-500">Cost</th>
              <th class="pb-2 text-right text-gray-500">Avg km/L</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vehicleSummary" :key="v.vehicle_id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
              <td class="py-2">
                <p class="font-mono font-bold text-gold-400/80">{{ v.registration_no }}</p>
                <p class="text-[10px] text-gray-500">{{ v.vehicle_type }} · {{ v.make }} {{ v.model }}</p>
              </td>
              <td class="py-2 text-right text-gray-400">{{ v.fill_count }}</td>
              <td class="py-2 text-right text-gray-300">{{ Number(v.total_liters || 0).toFixed(1) }}</td>
              <td class="py-2 text-right text-amber-400">৳{{ fmt(v.total_cost) }}</td>
              <td class="py-2 text-right">
                <span v-if="v.avg_mileage" class="font-bold"
                  :class="Number(v.avg_mileage) >= 8 ? 'text-emerald-400' : Number(v.avg_mileage) >= 5 ? 'text-amber-400' : 'text-red-400'">
                  {{ Number(v.avg_mileage).toFixed(2) }}
                </span>
                <span v-else class="text-gray-600">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top Consumers (Last 90 Days) -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Top Fuel Consumers <span class="text-xs text-gray-500 normal-case font-normal">(Last 90 days)</span></h3>
        <div v-if="!topConsumers.length" class="text-center py-6 text-gray-600 text-sm">No recent fuel data</div>
        <div v-else class="space-y-3">
          <div v-for="(v, i) in topConsumers" :key="v.registration_no" class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              :class="i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-500/10 text-orange-400'">
              {{ i + 1 }}
            </div>
            <div class="flex-1">
              <p class="text-xs font-mono font-bold text-gold-400/80">{{ v.registration_no }}</p>
              <p class="text-[10px] text-gray-500">{{ v.vehicle_type }} · {{ v.fill_count }} fills</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-blue-400">{{ Number(v.total_liters || 0).toFixed(1) }} L</p>
              <p class="text-[10px] text-amber-400">৳{{ fmt(v.total_cost) }}</p>
            </div>
            <!-- Bar -->
            <div class="w-20 bg-white/[0.05] rounded-full h-1.5">
              <div class="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                :style="{ width: (Number(v.total_liters) / Number(topConsumers[0]?.total_liters || 1) * 100) + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Trend -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-4">Monthly Fuel Cost Trend <span class="text-xs text-gray-500 normal-case font-normal">(Last 12 months)</span></h3>
      <div v-if="!monthlyTrend.length" class="text-center py-6 text-gray-600 text-sm">No monthly data available</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Month</th>
              <th class="pb-2 text-right text-gray-500">Fill-ups</th>
              <th class="pb-2 text-right text-gray-500">Liters</th>
              <th class="pb-2 text-right text-gray-500">Cost (৳)</th>
              <th class="pb-2 text-left text-gray-500 pl-4">Cost Bar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monthlyTrend" :key="m.month" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300 font-medium">{{ formatMonth(m.month) }}</td>
              <td class="py-2 text-right text-gray-400">{{ m.fill_count }}</td>
              <td class="py-2 text-right text-blue-400">{{ Number(m.total_liters || 0).toFixed(1) }}</td>
              <td class="py-2 text-right text-amber-400 font-medium">৳{{ fmt(m.total_cost) }}</td>
              <td class="py-2 pl-4">
                <div class="w-full bg-white/[0.05] rounded-full h-2">
                  <div class="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                    :style="{ width: (Number(m.total_cost) / maxMonthlyCost * 100) + '%' }" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Efficiency Legend -->
    <div class="glass-card p-4">
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mileage Rating Guide</h4>
      <div class="flex gap-6 flex-wrap text-xs">
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> <span class="text-emerald-400">≥ 8 km/L</span> <span class="text-gray-500">— Excellent</span></div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-400 inline-block" /> <span class="text-amber-400">5–8 km/L</span> <span class="text-gray-500">— Average</span></div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-400 inline-block" /> <span class="text-red-400">&lt; 5 km/L</span> <span class="text-gray-500">— Poor / Needs Attention</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data } = await useFetch('/api/fleet/fuel/efficiency')

const vehicleSummary = computed(() => (data.value as any)?.vehicleSummary ?? [])
const monthlyTrend   = computed(() => (data.value as any)?.monthlyTrend   ?? [])
const topConsumers   = computed(() => (data.value as any)?.topConsumers   ?? [])
const fleetStats     = computed(() => (data.value as any)?.fleetStats     ?? {})

const maxMonthlyCost = computed(() =>
  Math.max(...monthlyTrend.value.map((m: any) => Number(m.total_cost || 0)), 1)
)

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }
function formatMonth(m: string) {
  if (!m) return '—'
  const [y, mo] = m.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[Number(mo) - 1]} ${y}`
}
</script>
