<template>
  <ReportFrame :title="meta.title" :subtitle="meta.subtitle" :period="period" :filename="filename" :sheets="sheets" :active-sheet="tabIndex">
    <template #filters>
      <div class="glass-card p-4 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <button v-for="p in presets" :key="p.label" class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200" @click="setRange(p.from, p.to)">{{ p.label }}</button>
          <input v-model="from" type="date" class="field-input text-xs py-1.5 w-36" />
          <span class="text-xs text-gray-600">to</span>
          <input v-model="to" type="date" class="field-input text-xs py-1.5 w-36" />
          <select v-model="branchId" class="field-input text-xs py-1.5 w-44"><option value="">All factories</option><option v-for="b in data?.branch_options ?? []" :key="b.id" :value="b.id">{{ b.name }}</option></select>
          <input v-model="product" type="search" placeholder="Product…" class="field-input text-xs py-1.5 w-36" />
        </div>
        <div v-if="mode === 'dispatch'" class="flex flex-wrap gap-2 text-xs">
          <label v-for="s in statusOpts" :key="s.v" class="flex items-center gap-1.5 text-gray-400"><input v-model="statuses" type="checkbox" :value="s.v" /> {{ s.l }}</label>
        </div>
      </div>
    </template>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="data">
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div v-for="k in kpis" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold text-gray-100 font-mono">{{ k.v }}</p></div>
      </div>

      <div class="no-print flex flex-wrap gap-1.5">
        <button v-for="(t, i) in tabs" :key="t.key" class="px-3 py-1.5 rounded-xl text-xs border transition-all"
                :class="tab === i ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07] hover:text-gray-300'" @click="tab = i">{{ t.label }} <span class="text-gray-600">({{ t.rows.length }})</span></button>
      </div>
      <p v-if="data.truncated" class="no-print text-xs text-amber-400">Showing the first 20,000 detail lines — narrow the dates for the full list. Totals above include every line.</p>

      <!-- on screen: the chosen tab; on paper: every table in turn -->
      <div v-for="(t, i) in tabs" :key="t.key" :class="i === tab ? '' : 'hidden print:block'">
        <h2 class="print-only text-sm font-bold mt-3 mb-1">{{ t.label }}</h2>
        <ReportTable :cols="t.cols" :rows="t.rows" :totals="t.totals" />
      </div>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol, ReportSheet } from '~/composables/useReportExport'
const props = defineProps<{ mode: 'sales' | 'dispatch' | 'product' }>()
const url = { sales: '/api/credit-sales/reports/sales', dispatch: '/api/production/dispatch-report', product: '/api/credit-sales/reports/product-sales' }[props.mode]
const META = {
  sales: { title: 'Sales Report', subtitle: 'Credit sales recognised when goods ship — shipped, on board and delivered orders' },
  dispatch: { title: 'Dispatch Report', subtitle: 'What left the factory, by date shipped — trucks, drivers, products' },
  product: { title: 'Product Sales Report', subtitle: 'Delivered orders only, by delivery date — a price change shows as a separate line' },
}
const meta = META[props.mode]
const dhaka = (d = new Date()) => new Date(d.getTime() + 6 * 3600_000).toISOString().slice(0, 10)
const t0 = dhaka(), monthStart = t0.slice(0, 8) + '01'
const lastM = (() => { const d = new Date(monthStart + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() - 1); const a = d.toISOString().slice(0, 10); const e = new Date(monthStart + 'T00:00:00Z'); e.setUTCDate(0); return [a, e.toISOString().slice(0, 10)] })()
const presets = [{ label: 'Today', from: t0, to: t0 }, { label: 'This month', from: monthStart, to: t0 }, { label: 'Last month', from: lastM[0], to: lastM[1] }, { label: 'This year', from: t0.slice(0, 4) + '-01-01', to: t0 }]
const from = ref(monthStart), to = ref(t0), branchId = ref(''), product = ref('')
const statuses = ref(['shipped', 'goods_on_board', 'delivered'])
const statusOpts = [{ v: 'shipped', l: 'Shipped' }, { v: 'goods_on_board', l: 'Goods on board' }, { v: 'delivered', l: 'Delivered' }]
const setRange = (a: string, b: string) => { from.value = a; to.value = b }

const { data, pending, error } = await useFetch<any>(url, {
  query: computed(() => ({ date_from: from.value, date_to: to.value, branch_id: branchId.value || undefined, product: product.value || undefined, status: props.mode === 'dispatch' ? statuses.value.join(',') : undefined })),
  watch: [from, to, branchId, statuses], debounce: 0,
})
// product text box: refetch when the user stops typing
let tm: any; watch(product, () => { clearTimeout(tm); tm = setTimeout(() => refreshNuxtData(), 400) })

const money: Partial<ReportCol> = { fmt: 'money', sum: true }, qty: Partial<ReportCol> = { fmt: 'qty', sum: true }
const C = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const valueCols = [C('orders', 'Orders', { fmt: 'qty' }), C('qty', 'Bags / Units', qty), C('gross', 'Gross ৳', money), C('discount', 'Discount ৳', money), C('net', 'Net ৳', money)]
const prodCols = [C('product', 'Product'), C('variant', 'Variant'), C('grade', 'Grade'), ...(props.mode === 'product' ? [C('price', 'Unit price ৳', { fmt: 'money' })] : []), ...valueCols]
const lineCols = [C('d', 'Date'), C('order_number', 'Order #'), C('customer', 'Customer'), C('branch', 'Factory'), ...(props.mode === 'dispatch' ? [C('truck', 'Truck #'), C('driver', 'Driver')] : []),
  C('product', 'Product'), C('variant', 'Variant'), C('qty', 'Qty', qty), C('price', 'Unit price ৳', { fmt: 'money' }), C('discount', 'Discount ৳', money), C('total', 'Line total ৳', money)]
const tabs = computed(() => {
  const d = data.value; if (!d) return []
  const t = [{ key: 'products', label: 'By product', cols: prodCols, rows: d.products, totals: true }]
  if (props.mode !== 'product') {
    t.push({ key: 'customers', label: 'By customer', cols: [C('customer', 'Customer'), ...valueCols], rows: d.customers, totals: true })
    t.push({ key: 'branches', label: 'By factory', cols: [C('branch', 'Factory'), ...valueCols], rows: d.branches, totals: true })
    t.push({ key: 'daily', label: 'By day', cols: [C('date', 'Date'), ...valueCols], rows: d.daily, totals: true })
  }
  t.push({ key: 'lines', label: 'Detail lines', cols: lineCols, rows: d.rows, totals: true })
  return t
})
const tab = ref(0); const tabIndex = computed(() => tab.value)
const sheets = computed<ReportSheet[]>(() => tabs.value.map(t => ({ name: t.label, cols: t.cols, rows: t.rows, totals: t.totals })))
const n0 = (v: number) => Math.round(v).toLocaleString('en-US')
const kpis = computed(() => { const s = data.value?.summary; return s ? [
  { l: 'Orders', v: n0(s.orders) }, { l: 'Customers', v: n0(s.customers) }, { l: 'Bags / units', v: n0(s.units) },
  { l: 'Gross ৳', v: n0(s.gross) }, { l: 'Discount ৳', v: n0(s.discount) }, { l: 'Net ৳', v: n0(s.net) }] : [] })
const period = computed(() => `${from.value} to ${to.value}`)
const filename = computed(() => `${props.mode}-report_${from.value}_to_${to.value}`)
</script>
