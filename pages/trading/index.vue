<template>
  <div class="space-y-6">
    <UiPageHeader title="Commodity Trading" subtitle="Buy–sell commodity margin business — separate from flour production"
                  :breadcrumb="['Trading', 'Dashboard']" />

    <!-- Filters (synced to the URL — bookmarkable / shareable) -->
    <div class="glass-card p-4 flex flex-wrap items-end gap-3">
      <div class="space-y-1">
        <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">From</label>
        <input v-model="filters.date_from" type="date" class="input-glass text-xs py-1.5" />
      </div>
      <div class="space-y-1">
        <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">To</label>
        <input v-model="filters.date_to" type="date" class="input-glass text-xs py-1.5" />
      </div>
      <div class="space-y-1 min-w-[200px]">
        <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Customer</label>
        <UiSearchSelect v-model="filters.customer_id" :options="customerOptions" placeholder="All customers" />
      </div>
      <div class="space-y-1">
        <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Commodity</label>
        <select v-model="filters.commodity_id" class="input-glass text-xs py-1.5" @change="filters.origin = ''">
          <option value="">All commodities</option>
          <option v-for="c in commodities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Origin</label>
        <select v-model="filters.origin" class="input-glass text-xs py-1.5">
          <option value="">All origins</option>
          <option v-for="o in originOptionsForFilter" :key="o" :value="o">{{ o }}</option>
        </select>
      </div>
      <button @click="applyFilters" class="btn-gold text-xs py-2">Apply</button>
      <button v-if="hasActiveFilters" @click="clearFilters" class="btn-ghost text-xs py-2">Clear</button>
      <span class="flex-1" />
      <NuxtLink to="/trading/sales" class="btn-gold text-xs py-2">+ New Sale</NuxtLink>
    </div>

    <!-- Negative stock alert -->
    <div v-if="negativeStock.length" class="rounded-xl p-3 text-xs text-red-300" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);">
      ⚠ Negative stock (sold past on-hand with override):
      <span v-for="(r, i) in negativeStock" :key="i" class="font-mono ml-2">
        {{ r.commodity_name }}{{ r.origin ? ` (${r.origin})` : '' }}: {{ Number(r.qty_on_hand).toLocaleString() }} {{ r.unit }}
      </span>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      <div v-for="t in kpiTiles" :key="t.label" class="glass-card p-4">
        <p class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">{{ t.label }}</p>
        <p :class="['text-lg font-bold mt-1', t.color]">{{ t.value }}</p>
      </div>
    </div>

    <!-- Inventory snapshot -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Stock on Hand</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Commodity</th><th class="text-left pr-3">Branch</th>
            <th class="text-left pr-3">Origin</th><th class="text-right pr-3">Qty</th>
            <th class="text-right pr-3">Avg Cost</th><th class="text-right">Value</th>
          </tr></thead>
          <tbody>
            <tr v-for="(r, i) in inventory" :key="i" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3 text-gray-200">{{ r.commodity_name }}</td>
              <td class="pr-3 text-gray-400">{{ r.branch_name ?? '—' }}</td>
              <td class="pr-3 text-gray-400">{{ r.origin || '—' }}</td>
              <td :class="['pr-3 text-right font-mono', Number(r.qty_on_hand) < 0 ? 'text-red-400 font-bold' : 'text-gray-200']">
                {{ Number(r.qty_on_hand).toLocaleString() }} {{ r.unit }}
              </td>
              <td class="pr-3 text-right font-mono text-gray-400">৳{{ Number(r.weighted_avg_cost).toLocaleString() }}</td>
              <td class="text-right font-mono text-gray-200">৳{{ (Math.max(0, Number(r.qty_on_hand)) * Number(r.weighted_avg_cost)).toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</td>
            </tr>
            <tr v-if="!inventory.length"><td colspan="6" class="py-6 text-center text-gray-600">No commodity stock yet — record a GRN with a receiving branch on a commodity-tagged PO.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sale History (filtered) -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Sale History <span class="text-gray-600 font-normal text-xs">({{ saleHistory.length }} shown, max 200)</span></h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Sale #</th><th class="text-left pr-3">Date</th>
            <th class="text-left pr-3">Customer</th><th class="text-left pr-3">Commodity</th>
            <th class="text-right pr-3">Qty</th><th class="text-right pr-3">Total</th>
            <th class="text-right pr-3">Due</th><th class="text-left pr-3">Dispatch</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-for="s in saleHistory" :key="s.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3"><NuxtLink :to="`/trading/sales/${s.id}`" class="font-mono text-gold-400 hover:underline">{{ s.sale_number }}</NuxtLink></td>
              <td class="pr-3 text-gray-400">{{ String(s.sale_date).slice(0, 10) }}</td>
              <td class="pr-3 text-gray-200">{{ s.customer_name }}</td>
              <td class="pr-3 text-gray-400">{{ s.commodity_name }}{{ s.origin ? ` (${s.origin})` : '' }}</td>
              <td class="pr-3 text-right font-mono text-gray-300">{{ Number(s.quantity).toLocaleString() }} {{ s.unit }}</td>
              <td class="pr-3 text-right font-mono text-gray-200">৳{{ Number(s.total_amount).toLocaleString() }}</td>
              <td :class="['pr-3 text-right font-mono', Number(s.balance_due) > 0 ? 'text-orange-400' : 'text-emerald-400']">৳{{ Number(s.balance_due).toLocaleString() }}</td>
              <td class="pr-3 text-gray-500">{{ s.delivered_at ? '✅ Delivered' : s.gate_out_at ? '🚚 In transit' : '—' }}</td>
              <td class="text-right"><NuxtLink :to="`/trading/sales/${s.id}`" class="btn-ghost text-[10px] py-1">Open</NuxtLink></td>
            </tr>
            <tr v-if="!saleHistory.length"><td colspan="9" class="py-6 text-center text-gray-600">No sales match this filter.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent settlements -->
    <div v-if="settlements.length" class="glass-card p-5">
      <h3 class="section-title mb-3">Recent Partner Settlements</h3>
      <div class="space-y-1.5">
        <div v-for="s in settlements" :key="s.id" class="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.03]">
          <span class="font-mono text-gold-400">{{ s.settlement_number }}</span>
          <span class="text-gray-300">{{ s.partner_name }}</span>
          <span class="flex-1" />
          <span class="font-mono text-gray-200">৳{{ Number(s.amount).toLocaleString() }}</span>
          <span class="text-gray-600">{{ String(s.settlement_date).slice(0, 10) }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <NuxtLink to="/trading/sales" class="btn-ghost text-xs">Sales</NuxtLink>
      <NuxtLink to="/trading/partners" class="btn-ghost text-xs">Business Partners &amp; Settlement</NuxtLink>
      <NuxtLink to="/trading/margin-report" class="btn-ghost text-xs">Margin Report</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route  = useRoute()
const router = useRouter()

// Filters seed from the URL (bookmarkable / shareable) and stay reactive.
const q = route.query
const filters = reactive({
  date_from:   String(q.date_from ?? ''),
  date_to:     String(q.date_to ?? ''),
  customer_id: String(q.customer_id ?? '') as string | number,
  commodity_id: String(q.commodity_id ?? ''),
  origin:      String(q.origin ?? ''),
})

const queryParams = computed(() => ({
  ...(filters.date_from   ? { date_from: filters.date_from } : {}),
  ...(filters.date_to     ? { date_to: filters.date_to } : {}),
  ...(filters.customer_id ? { customer_id: String(filters.customer_id) } : {}),
  ...(filters.commodity_id ? { commodity_id: filters.commodity_id } : {}),
  ...(filters.origin      ? { origin: filters.origin } : {}),
}))

function applyFilters() {
  router.replace({ query: queryParams.value })
  refresh()
  refreshSales()
}
function clearFilters() {
  filters.date_from = ''; filters.date_to = ''
  filters.customer_id = ''; filters.commodity_id = ''; filters.origin = ''
  applyFilters()
}
const hasActiveFilters = computed(() =>
  !!(filters.date_from || filters.date_to || filters.customer_id || filters.commodity_id || filters.origin))

const [{ data }, { data: comData }, { data: custData }, { data: salesData }] = await Promise.all([
  useFetch('/api/trading/dashboard', { query: queryParams }),
  useFetch('/api/trading/commodities'),
  useFetch('/api/customers', { query: { per: 500, simple: '1' } }),
  useFetch('/api/trading/sales', { query: queryParams }),
])
const refresh = async () => { const r = await $fetch('/api/trading/dashboard', { query: queryParams.value }); data.value = r as any }
const refreshSales = async () => { const r = await $fetch('/api/trading/sales', { query: queryParams.value }); salesData.value = r as any }

const kpis          = computed<any>(() => (data.value as any)?.kpis ?? {})
const inventory     = computed<any[]>(() => (data.value as any)?.inventory ?? [])
const negativeStock = computed<any[]>(() => (data.value as any)?.negative_stock ?? [])
const settlements   = computed<any[]>(() => (data.value as any)?.settlements ?? [])
const saleHistory   = computed<any[]>(() => (salesData.value as any)?.sales ?? [])

const commodities = computed<any[]>(() => (comData.value as any)?.commodities ?? [])
const customerOptions = computed(() => ((custData.value as any)?.customers ?? []).map((c: any) => ({
  value: c.id, label: c.name, sub: c.business_name || '',
})))
const originOptionsForFilter = computed(() =>
  commodities.value.find(c => String(c.id) === filters.commodity_id)?.origins ?? [])

const kpiTiles = computed(() => [
  { label: 'Sales',        value: String(kpis.value.sales_count ?? 0),                                            color: 'text-gray-200' },
  { label: 'Revenue',      value: `৳${Number(kpis.value.revenue ?? 0).toLocaleString()}`,                          color: 'text-gold-400' },
  { label: 'COGS',         value: `৳${Number(kpis.value.cogs ?? 0).toLocaleString()}`,                             color: 'text-gray-300' },
  { label: 'Margin',       value: `৳${Number(kpis.value.margin ?? 0).toLocaleString()} (${kpis.value.margin_pct ?? 0}%)`, color: Number(kpis.value.margin ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
  { label: 'Collected',    value: `৳${Number(kpis.value.collected ?? 0).toLocaleString()}`,                        color: 'text-emerald-400' },
  { label: 'Outstanding',  value: `৳${Number(kpis.value.outstanding ?? 0).toLocaleString()}`,                      color: 'text-orange-400' },
  { label: 'Stock Value',  value: `৳${Number(kpis.value.inventory_value ?? 0).toLocaleString()}`,                  color: 'text-blue-300' },
])
</script>
