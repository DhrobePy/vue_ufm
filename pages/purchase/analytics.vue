<template>
  <ReportFrame title="Purchase Analytics" subtitle="Orders, deliveries, payments, supplier performance and procurement by origin" :period="`${from} to ${to} · ${scope === 'open' ? 'open orders' : 'all orders'}`" filename="purchase-analytics" :sheets="sheets">
    <template #filters>
      <div class="glass-card p-4 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <button v-for="p in presets" :key="p.l" class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200" @click="from = p.from; to = p.to">{{ p.l }}</button>
          <input v-model="from" type="date" class="field-input text-xs py-1.5 w-36" /><span class="text-xs text-gray-600">to</span><input v-model="to" type="date" class="field-input text-xs py-1.5 w-36" />
          <select v-model="scope" class="field-input text-xs py-1.5 w-44"><option value="open">Open orders only</option><option value="all">All orders</option></select>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="origin" class="field-input text-xs py-1.5 w-40"><option value="">All origins</option><option v-for="o in data?.origins_list ?? []" :key="o" :value="o">{{ o }}</option></select>
          <select v-model="supplier" class="field-input text-xs py-1.5 w-56"><option value="">All suppliers</option><option v-for="s in data?.suppliers_list ?? []" :key="s.id" :value="s.id">{{ s.name }}</option></select>
          <select v-model="delivery" class="field-input text-xs py-1.5 w-40"><option value="">Any delivery status</option><option v-for="d in ['pending','partial','completed','over_received','closed']" :key="d" :value="d">{{ d }}</option></select>
          <span class="text-[11px] text-gray-600">Origin / supplier / delivery filters apply to the origin table and PO detail.</span>
        </div>
      </div>
    </template>
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="data">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="k in kpiTiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono text-gray-100">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
      </div>
      <section v-for="s in sections" :key="s.title" class="space-y-1">
        <h2 class="text-sm font-bold text-gray-200 mt-3">{{ s.title }} <span class="text-gray-600 font-normal">({{ s.rows.length }})</span></h2>
        <ReportTable :cols="s.cols" :rows="s.rows" :totals="s.totals" />
      </section>
      <p class="no-print text-[11px] text-gray-600">Payable = what the supplier billed (expected quantity × PO price) + posted adjustments − paid. Legacy's AI commentary and forecasts are not carried over.</p>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const dhaka = (ms = 0) => new Date(Date.now() + 6 * 3600_000 + ms).toISOString().slice(0, 10)
const t0 = dhaka()
const presets = [{ l: 'Today', from: t0, to: t0 }, { l: 'Last 7 days', from: dhaka(-6 * 86400_000), to: t0 }, { l: 'Last 30 days', from: dhaka(-29 * 86400_000), to: t0 }, { l: 'Last 90 days', from: dhaka(-89 * 86400_000), to: t0 }, { l: 'This month', from: t0.slice(0, 8) + '01', to: t0 }, { l: 'This year', from: t0.slice(0, 4) + '-01-01', to: t0 }]
const from = ref(dhaka(-29 * 86400_000)), to = ref(t0), scope = ref('open'), origin = ref(''), supplier = ref(''), delivery = ref('')
const { data, pending, error } = await useFetch<any>('/api/purchase/analytics', { query: computed(() => ({ date_from: from.value, date_to: to.value, scope: scope.value, origin: origin.value || undefined, supplier_id: supplier.value || undefined, delivery_status: delivery.value || undefined })), watch: [from, to, scope, origin, supplier, delivery] })
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const kpiTiles = computed(() => { const k = data.value?.kpis; if (!k) return []; return [
  { l: 'Purchase orders', v: String(k.orders), s: `${k.suppliers} suppliers · ${k.completion_pct.toFixed(0)}% completed` },
  { l: 'Order value', v: '৳' + n0(k.order_value), s: `avg ৳${k.avg_price.toFixed(2)}/kg` },
  { l: 'Ordered / received', v: `${n0(k.ordered_kg)} / ${n0(k.received_kg)} kg`, s: `${k.fulfillment_pct.toFixed(1)}% delivered` },
  { l: 'Received value', v: '৳' + n0(k.received_value), s: 'priced as recorded on each GRN' },
  { l: 'Paid to suppliers', v: '৳' + n0(k.paid), s: `${k.payment_pct.toFixed(1)}% of received value` },
  { l: 'Outstanding payable', v: '৳' + n0(k.outstanding), s: 'billed + adjustments − paid' }] })
const T = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const kg = (k: string, l: string): ReportCol => T(k, l, { fmt: 'qty', sum: true }), mo = (k: string, l: string, sum = true): ReportCol => T(k, l, { fmt: 'money', sum })
const sections = computed(() => { const x = data.value; if (!x) return []; return [
  { title: 'Supplier performance (top 25 by value)', cols: [T('supplier', 'Supplier'), T('orders', 'POs', { fmt: 'qty', sum: true }), mo('value', 'Value ৳'), kg('ordered_kg', 'Ordered kg'), kg('received_kg', 'Received kg'), mo('outstanding', 'Payable ৳'), mo('avg_price', 'Avg ৳/kg', false), T('avg_delivery_days', 'Avg days to deliver', { fmt: 'qty' }), T('avg_variance_pct', 'Avg weight variance %', { fmt: 'qty' })], rows: x.suppliers, totals: true },
  { title: 'Procurement by origin', cols: [T('origin', 'Origin'), T('pos', 'POs', { fmt: 'qty', sum: true }), kg('ordered_kg', 'Ordered kg'), kg('received_kg', 'Received kg'), kg('pending_kg', 'Pending kg'), mo('value', 'Value ৳'), mo('paid', 'Paid ৳'), mo('payable', 'Payable ৳'), mo('avg_price', 'Avg ৳/kg', false)], rows: x.origins, totals: true },
  { title: 'Receipts by unloading point and origin (GRN date in range)', cols: [T('branch', 'Unloading point'), T('origin', 'Origin'), T('grns', 'GRNs', { fmt: 'qty', sum: true }), kg('expected_kg', 'Expected kg'), kg('received_kg', 'Received kg'), mo('value', 'Value ৳')], rows: x.receipts, totals: true },
  { title: 'Purchase orders — detail', cols: [T('po', 'PO #'), T('date', 'Date'), T('supplier', 'Supplier'), T('origin', 'Origin'), kg('ordered_kg', 'Ordered kg'), mo('rate', '৳/kg', false), mo('value', 'Value ৳'), kg('received_kg', 'Received kg'), kg('pending_kg', 'Pending kg'), mo('paid', 'Paid ৳'), mo('adjustments', 'Adjustments ৳'), mo('payable', 'Payable ৳'), T('delivery', 'Delivery'), T('payment', 'Payment')], rows: x.detail, totals: true },
] })
const sheets = computed(() => sections.value.map(s => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows, totals: s.totals })))
</script>
