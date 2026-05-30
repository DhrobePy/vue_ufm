<template>
  <div class="space-y-6">
    <UiPageHeader title="Monthly P&L Report" :breadcrumb="['Fleet','Reports','Monthly P&L']">
      <template #actions>
        <NuxtLink to="/fleet/reports" class="btn-secondary text-xs">← Reports</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Year selector -->
    <div class="glass-card p-4 flex flex-wrap gap-4 items-end">
      <div>
        <label class="form-label">Year</label>
        <select v-model="year" class="form-input w-32" @change="load">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <button @click="load" class="btn-gold text-xs">Apply</button>
    </div>

    <!-- Annual KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Annual Revenue</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">৳{{ fmt(totals.revenue) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Total Costs</p>
        <p class="text-2xl font-bold text-red-400 mt-1">৳{{ fmt(totals.total_cost) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Net Profit / Loss</p>
        <p class="text-2xl font-bold mt-1" :class="totals.profit >= 0 ? 'text-blue-400' : 'text-red-400'">৳{{ fmt(totals.profit) }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Profit Margin</p>
        <p class="text-2xl font-bold mt-1" :class="margin >= 0 ? 'text-teal-400' : 'text-red-400'">
          {{ totals.revenue > 0 ? margin.toFixed(1) + '%' : '—' }}
        </p>
      </div>
    </div>

    <!-- Cost breakdown KPIs -->
    <div class="grid grid-cols-3 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Trip Expenses</p>
        <p class="text-xl font-bold text-orange-400 mt-1">৳{{ fmt(totals.trip_expenses) }}</p>
        <p class="text-[10px] text-gray-600 mt-1">{{ totals.revenue > 0 ? ((totals.trip_expenses/totals.revenue)*100).toFixed(1) : 0 }}% of revenue</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Fuel Cost</p>
        <p class="text-xl font-bold text-amber-400 mt-1">৳{{ fmt(totals.fuel_cost) }}</p>
        <p class="text-[10px] text-gray-600 mt-1">{{ totals.revenue > 0 ? ((totals.fuel_cost/totals.revenue)*100).toFixed(1) : 0 }}% of revenue</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500">Maintenance Cost</p>
        <p class="text-xl font-bold text-red-400 mt-1">৳{{ fmt(totals.maint_cost) }}</p>
        <p class="text-[10px] text-gray-600 mt-1">{{ totals.revenue > 0 ? ((totals.maint_cost/totals.revenue)*100).toFixed(1) : 0 }}% of revenue</p>
      </div>
    </div>

    <!-- Monthly P&L Table -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-4">Month-by-Month Breakdown — {{ year }}</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.07]">
              <th class="pb-2 text-left text-gray-500">Month</th>
              <th class="pb-2 text-right text-gray-500">Revenue ৳</th>
              <th class="pb-2 text-right text-gray-500">Trip Exp ৳</th>
              <th class="pb-2 text-right text-gray-500">Fuel ৳</th>
              <th class="pb-2 text-right text-gray-500">Maint ৳</th>
              <th class="pb-2 text-right text-gray-500">Total Cost ৳</th>
              <th class="pb-2 text-right text-gray-500">Profit ৳</th>
              <th class="pb-2 text-left text-gray-500 pl-4">Visual</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.month"
              class="border-b border-white/[0.03]"
              :class="r.revenue === 0 && r.total_cost === 0 ? 'opacity-30' : ''">
              <td class="py-2 text-gray-300 font-medium">{{ formatMonth(r.month) }}</td>
              <td class="py-2 text-right text-emerald-400 font-medium">{{ r.revenue > 0 ? fmt(r.revenue) : '—' }}</td>
              <td class="py-2 text-right text-orange-400">{{ r.trip_expenses > 0 ? fmt(r.trip_expenses) : '—' }}</td>
              <td class="py-2 text-right text-amber-400">{{ r.fuel_cost > 0 ? fmt(r.fuel_cost) : '—' }}</td>
              <td class="py-2 text-right text-red-400">{{ r.maint_cost > 0 ? fmt(r.maint_cost) : '—' }}</td>
              <td class="py-2 text-right text-gray-300">{{ r.total_cost > 0 ? fmt(r.total_cost) : '—' }}</td>
              <td class="py-2 text-right font-bold"
                :class="r.profit > 0 ? 'text-blue-400' : r.profit < 0 ? 'text-red-400' : 'text-gray-600'">
                {{ r.revenue > 0 || r.total_cost > 0 ? (r.profit >= 0 ? '' : '−') + fmt(Math.abs(r.profit)) : '—' }}
              </td>
              <td class="py-2 pl-4">
                <div class="flex gap-1 items-center h-4" v-if="r.revenue > 0 || r.total_cost > 0">
                  <!-- Revenue bar -->
                  <div class="h-3 rounded-sm bg-emerald-500/60" :style="{ width: (Number(r.revenue) / maxBar * 80) + 'px' }" :title="`Revenue: ৳${fmt(r.revenue)}`" />
                  <!-- Cost bar -->
                  <div class="h-3 rounded-sm bg-red-500/60" :style="{ width: (Number(r.total_cost) / maxBar * 80) + 'px' }" :title="`Cost: ৳${fmt(r.total_cost)}`" />
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-white/[0.10]">
              <td class="pt-3 font-bold text-gray-200">Annual Total</td>
              <td class="pt-3 text-right font-bold text-emerald-400">৳{{ fmt(totals.revenue) }}</td>
              <td class="pt-3 text-right font-bold text-orange-400">৳{{ fmt(totals.trip_expenses) }}</td>
              <td class="pt-3 text-right font-bold text-amber-400">৳{{ fmt(totals.fuel_cost) }}</td>
              <td class="pt-3 text-right font-bold text-red-400">৳{{ fmt(totals.maint_cost) }}</td>
              <td class="pt-3 text-right font-bold text-gray-200">৳{{ fmt(totals.total_cost) }}</td>
              <td class="pt-3 text-right font-bold text-xl" :class="totals.profit >= 0 ? 'text-blue-400' : 'text-red-400'">
                ৳{{ fmt(totals.profit) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Legend -->
    <div class="glass-card p-4 flex gap-6 text-xs flex-wrap">
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-emerald-500/60 inline-block" /> Revenue</div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-orange-500/60 inline-block" /> Trip Expenses</div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-amber-500/60 inline-block" /> Fuel Cost</div>
      <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-red-500/60 inline-block" /> Maintenance Cost</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const year = ref(new Date().getFullYear())

const url = computed(() => `/api/fleet/reports/pnl?year=${year.value}`)
const { data, refresh } = await useFetch(url)

const rows   = computed(() => (data.value as any)?.rows   ?? [])
const totals = computed(() => (data.value as any)?.totals ?? { revenue: 0, trip_expenses: 0, fuel_cost: 0, maint_cost: 0, total_cost: 0, profit: 0 })
const years  = computed(() => (data.value as any)?.years  ?? [new Date().getFullYear()])

const margin    = computed(() => totals.value.revenue > 0 ? (totals.value.profit / totals.value.revenue) * 100 : 0)
const maxBar    = computed(() => Math.max(...rows.value.map((r: any) => Math.max(Number(r.revenue), Number(r.total_cost))), 1))

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }
function formatMonth(m: string) {
  const [, mo] = m.split('-')
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][Number(mo)-1]
}
function load() { refresh() }
watch(url, () => refresh())
</script>
