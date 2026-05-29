<template>
  <div class="space-y-6">
    <UiPageHeader title="Financial Statements" subtitle="Profit & Loss, Balance Sheet and Trial Balance"
                  :breadcrumb="['Accounts', 'Statement']">
      <template #actions>
        <button @click="printStatement" class="btn-ghost text-xs">🖨 Print</button>
        <button class="btn-gold text-xs">⬇ Export</button>
      </template>
    </UiPageHeader>

    <!-- Statement type tabs -->
    <div class="flex gap-2 flex-wrap">
      <button v-for="t in statementTypes" :key="t.id"
        @click="activeType = t.id"
        :class="['text-sm px-4 py-2 rounded-xl border transition-all',
          activeType === t.id
            ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
            : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200']">
        {{ t.label }}
      </button>
      <div class="ml-auto flex items-center gap-2">
        <select v-model="period" class="input-glass text-xs py-1.5 w-auto">
          <option value="may26">May 2026</option>
          <option value="apr26">April 2026</option>
          <option value="q1fy26">Q1 FY 2025-26</option>
          <option value="fy26">Full FY 2025-26</option>
        </select>
      </div>
    </div>

    <!-- Profit & Loss -->
    <div v-if="activeType === 'pl'" id="statement-print" class="glass-card p-6">
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-100">Profit & Loss Statement</h2>
        <p class="text-xs text-gray-500 mt-1">Ujjal Flour Mills Company · For the period ending 31 May 2026</p>
      </div>

      <div class="max-w-lg mx-auto space-y-6">
        <!-- Revenue -->
        <div>
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Revenue</h3>
          <div v-for="item in plData.revenue" :key="item.name" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">৳{{ item.amount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-white/[0.06] mt-1">
            <span class="font-bold text-gray-200">Total Revenue</span>
            <span class="font-bold font-mono text-emerald-400">৳{{ plData.totalRevenue.toLocaleString() }}</span>
          </div>
        </div>

        <!-- COGS -->
        <div>
          <h3 class="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Cost of Goods Sold</h3>
          <div v-for="item in plData.cogs" :key="item.name" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">৳{{ item.amount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-white/[0.06] mt-1">
            <span class="font-bold text-gray-200">Gross Profit</span>
            <span class="font-bold font-mono text-gold-400">৳{{ plData.grossProfit.toLocaleString() }}</span>
          </div>
          <p class="text-right text-xs text-gray-600">Margin: {{ plData.totalRevenue ? Math.round(plData.grossProfit/plData.totalRevenue*100) : 0 }}%</p>
        </div>

        <!-- Operating expenses -->
        <div>
          <h3 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Operating Expenses</h3>
          <div v-for="item in plData.opex" :key="item.name" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">৳{{ item.amount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-white/[0.06] mt-1">
            <span class="font-bold text-gray-200">Operating Profit (EBIT)</span>
            <span class="font-bold font-mono text-emerald-400">৳{{ plData.ebit.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Finance costs -->
        <div>
          <div v-for="item in plData.finance" :key="item.name" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">(৳{{ item.amount.toLocaleString() }})</span>
          </div>
        </div>

        <!-- Net profit -->
        <div class="border-t-2 border-gold-500/30 pt-4">
          <div class="flex justify-between">
            <span class="text-lg font-bold text-gray-100">Net Profit</span>
            <span class="text-xl font-bold font-mono text-gold-400">৳{{ plData.netProfit.toLocaleString() }}</span>
          </div>
          <p class="text-right text-xs text-gray-500 mt-1">Net margin: {{ plData.totalRevenue ? Math.round(plData.netProfit/plData.totalRevenue*100) : 0 }}%</p>
        </div>
      </div>
    </div>

    <!-- Balance Sheet -->
    <div v-if="activeType === 'bs'" class="glass-card p-6">
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-100">Balance Sheet</h2>
        <p class="text-xs text-gray-500 mt-1">Ujjal Flour Mills Company · As at 31 May 2026</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Assets -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Assets</h3>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Assets</p>
            <div v-for="item in bsData.currentAssets" :key="item.name" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ item.amount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold">
              <span class="text-gray-300">Total Current Assets</span>
              <span class="font-mono text-emerald-400">{{ bsData.totalCurrentAssets.toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Fixed Assets</p>
            <div v-for="item in bsData.fixedAssets" :key="item.name" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ item.amount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold">
              <span class="text-gray-300">Total Fixed Assets</span>
              <span class="font-mono text-emerald-400">{{ bsData.totalFixedAssets.toLocaleString() }}</span>
            </div>
          </div>
          <div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold">
            <span class="text-gray-100">Total Assets</span>
            <span class="font-mono text-gold-400">{{ bsData.totalAssets.toLocaleString() }}</span>
          </div>
        </div>
        <!-- Liabilities + Equity -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-red-400 uppercase tracking-wider">Liabilities & Equity</h3>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Liabilities</p>
            <div v-for="item in bsData.currentLiabilities" :key="item.name" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Long-term Liabilities</p>
            <div v-for="item in bsData.longTermLiabilities" :key="item.name" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Equity</p>
            <div v-for="item in bsData.equity" :key="item.name" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
          <div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold">
            <span class="text-gray-100">Total Liabilities & Equity</span>
            <span class="font-mono text-gold-400">{{ bsData.totalAssets.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Trial Balance -->
    <div v-if="activeType === 'trial'" class="glass-card p-6">
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-100">Trial Balance</h2>
        <p class="text-xs text-gray-500 mt-1">Ujjal Flour Mills Company · As at 31 May 2026</p>
      </div>
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Code</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="row in trialBalance" :key="row.code" class="hover:bg-white/[0.02]">
            <td class="py-2 px-3 font-mono text-gray-600">{{ row.code }}</td>
            <td class="py-2 px-3 text-gray-300">{{ row.name }}</td>
            <td class="py-2 px-3 text-right font-mono text-red-400">{{ row.debit ? row.debit.toLocaleString() : '' }}</td>
            <td class="py-2 px-3 text-right font-mono text-emerald-400">{{ row.credit ? row.credit.toLocaleString() : '' }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t-2 border-white/10">
          <tr>
            <td colspan="2" class="pt-3 px-3 font-bold text-gray-200">Totals</td>
            <td class="pt-3 px-3 text-right font-bold font-mono text-red-400">{{ trialBalance.reduce((s, r) => s + (r.debit||0), 0).toLocaleString() }}</td>
            <td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400">{{ trialBalance.reduce((s, r) => s + (r.credit||0), 0).toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { printElement } = usePrint()

const activeType = ref('pl')
const period     = ref('may26')

const statementTypes = [
  { id: 'pl',    label: 'Profit & Loss' },
  { id: 'bs',    label: 'Balance Sheet' },
  { id: 'trial', label: 'Trial Balance' },
]

// Reactive fetch — re-runs when period changes
const { data, refresh } = await useFetch(
  () => `/api/accounts/statements?period=${period.value}`,
)
watch(period, () => refresh())

const plData = computed(() => {
  const pl = (data.value as any)?.pl
  return pl ?? {
    revenue: [], totalRevenue: 0,
    cogs: [], grossProfit: 0,
    opex: [], ebit: 0,
    finance: [], netProfit: 0,
  }
})

const bsData = computed(() => {
  const bs = (data.value as any)?.bs
  return bs ?? {
    currentAssets: [], totalCurrentAssets: 0,
    fixedAssets: [], totalFixedAssets: 0,
    totalAssets: 0,
    currentLiabilities: [], longTermLiabilities: [], equity: [],
  }
})

const trialBalance = computed(() => (data.value as any)?.trialBalance ?? [])

function printStatement() {
  printElement('statement-print', 'Financial Statement — Ujjal FMC')
}
</script>
