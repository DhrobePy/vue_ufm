<template>
  <div class="space-y-6">
    <UiPageHeader title="Sales Report" subtitle="Cash & POS sales · daily summary · branch breakdown" :breadcrumb="['Sales']">
      <template #actions>
        <button @click="exportCsv" class="btn-ghost text-xs">📊 Export</button>
      </template>
    </UiPageHeader>

    <!-- Date filters -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex gap-2">
          <button v-for="r in dateRanges" :key="r"
            @click="setRange(r)"
            :class="['px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
              dateRange === r
                ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
                : 'text-gray-500 border-white/[0.07] hover:text-gray-300']">
            {{ r }}
          </button>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <input type="date" v-model="fromDate" class="field-input text-xs py-1.5 w-36" @change="refresh()" />
          <span>—</span>
          <input type="date" v-model="toDate"   class="field-input text-xs py-1.5 w-36" @change="refresh()" />
        </div>
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- KPI row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Sales"  :value="'৳' + fmtLakh(stats.total_sales ?? 0)"  trend="period total" trend-up icon="chart"    color="gold" />
        <KpiCard label="Cash / Card"  :value="'৳' + fmtLakh(stats.cash_sales ?? 0)"   trend="direct sales" trend-up icon="register" color="teal" />
        <KpiCard label="Transactions" :value="String(stats.transaction_count ?? 0)"    trend="receipts"     trend-up icon="receipt"  color="blue" />
        <KpiCard label="Avg Daily"    :value="'৳' + fmtLakh(stats.avg_daily ?? 0)"    trend="per day"      trend-up icon="money"    color="purple" />
      </div>

      <!-- Chart + breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Daily bar chart -->
        <div class="lg:col-span-2 glass-card p-5">
          <h2 class="section-title mb-4">Daily Sales Trend</h2>
          <div v-if="dailyBars.length" class="flex items-end gap-1.5 h-40">
            <div v-for="(bar, i) in dailyBars" :key="i"
                 class="flex-1 rounded-t-lg transition-all duration-300 cursor-pointer hover:opacity-80 relative group"
                 :style="`height:${Math.max(bar.pct, 4)}%;background:rgba(245,158,11,${0.2 + bar.pct/200})`">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                ৳{{ (bar.value / 1000).toFixed(0) }}K
              </div>
            </div>
          </div>
          <div v-else class="h-40 flex items-center justify-center text-xs text-gray-600">No data for this period</div>
          <div v-if="dailyBars.length" class="flex gap-1.5 mt-2">
            <div v-for="(bar, i) in dailyBars" :key="i" class="flex-1 text-center text-[9px] text-gray-700">
              {{ bar.label }}
            </div>
          </div>
        </div>

        <!-- Product breakdown -->
        <div class="glass-card p-5">
          <h2 class="section-title mb-4">By Product</h2>
          <div class="space-y-3">
            <div v-for="p in productBreakdown" :key="p.name" class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-gray-400 truncate pr-2">{{ p.name }}</span>
                <span class="text-gray-300 font-mono shrink-0">৳{{ (p.amount / 1000).toFixed(0) }}K</span>
              </div>
              <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div class="h-full rounded-full" :style="`width:${p.pct}%;background:rgba(245,158,11,0.5)`" />
              </div>
            </div>
            <div v-if="!productBreakdown.length" class="text-xs text-center text-gray-600 py-4">No data</div>
          </div>
        </div>
      </div>

      <!-- Transactions table -->
      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Sales Transactions</h2>
        <UiDataTable :columns="cols" :rows="rows" :per-page="15" exportable search-placeholder="Search transactions…">
          <template #cell-receipt_number="{ value }">
            <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
          </template>
          <template #cell-total_amount="{ value }">
            <span class="font-mono text-xs font-bold text-emerald-400">৳{{ Number(value).toLocaleString() }}</span>
          </template>
          <template #cell-payment_method="{ value }">
            <span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] capitalize">
              {{ String(value).replace('_', ' ') }}
            </span>
          </template>
        </UiDataTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const today     = new Date().toISOString().slice(0, 10)
const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)

const dateRanges = ['Today', 'This Week', 'This Month', 'Custom']
const dateRange  = ref('This Week')
const fromDate   = ref(weekStart)
const toDate     = ref(today)

function setRange(r: string) {
  dateRange.value = r
  const now = new Date()
  if (r === 'Today') {
    fromDate.value = today
    toDate.value   = today
  } else if (r === 'This Week') {
    fromDate.value = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)
    toDate.value   = today
  } else if (r === 'This Month') {
    fromDate.value = today.slice(0, 7) + '-01'
    toDate.value   = today
  }
  refresh()
}

const { data, pending, error, refresh } = await useFetch('/api/sales/dashboard', {
  query: computed(() => ({
    from: fromDate.value,
    to:   toDate.value,
  })),
})

const stats           = computed(() => (data.value?.stats            ?? {}) as any)
const rows            = computed(() => (data.value?.transactions     ?? []) as any[])
const dailyBars       = computed(() => (data.value?.dailyBars        ?? []) as any[])
const productBreakdown = computed(() => (data.value?.productBreakdown ?? []) as any[])

function fmtLakh(n: number) {
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(2) + 'Cr'
  if (n >= 100_000)    return (n / 100_000).toFixed(1) + 'L'
  if (n >= 1_000)      return (n / 1_000).toFixed(0) + 'K'
  return n.toLocaleString()
}

const cols = [
  { key: 'receipt_number', label: 'Receipt #',   sortable: true },
  { key: 'sale_date',      label: 'Date',         sortable: true },
  { key: 'customer_name',  label: 'Customer',     sortable: true },
  { key: 'product_name',   label: 'Product' },
  { key: 'quantity',       label: 'Qty' },
  { key: 'total_amount',   label: 'Amount',       sortable: true },
  { key: 'payment_method', label: 'Payment' },
  { key: 'cashier_name',   label: 'Cashier' },
]

function exportCsv() {
  const r = rows.value
  if (!r.length) return
  const headers = ['Receipt #', 'Date', 'Customer', 'Product', 'Qty', 'Amount', 'Payment', 'Cashier']
  const lines = r.map((s: any) => [
    s.receipt_number,
    String(s.sale_date).slice(0, 19),
    s.customer_name,
    s.product_name,
    s.quantity,
    s.total_amount,
    s.payment_method,
    s.cashier_name,
  ].join(','))
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'sales-report.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
