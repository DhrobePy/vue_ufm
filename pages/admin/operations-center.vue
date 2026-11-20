<template>
  <ReportFrame title="Operations Center" subtitle="Today's income and expense picture — orders, shipments, receipts, receivables, supplier payables and expenses" :period="d?.today ?? ''" filename="operations-center" :sheets="sheets">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <a v-for="k in kpis" :key="k.id" :href="`#${k.id}`" class="glass-card p-3 block hover:border-gold-500/30" :class="k.side === 'out' ? 'border-l-2 border-l-red-500/40' : 'border-l-2 border-l-emerald-500/40'">
          <p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p>
          <p class="text-lg font-bold font-mono text-gray-100">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p>
        </a>
      </div>
      <p class="no-print text-[11px] text-gray-600">Orders are changed on the order pages (so every approval and hold check still applies).</p>
      <section v-for="s in sections" :id="s.id" :key="s.id" class="space-y-1">
        <h2 class="text-sm font-bold text-gray-200 mt-3">{{ s.title }} <span class="text-gray-600 font-normal">({{ s.rows.length }})</span></h2>
        <ReportTable :cols="s.cols" :rows="s.rows" :totals="s.totals" />
      </section>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const { data: d, pending, error } = await useFetch<any>('/api/admin/operations-center')
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const kpis = computed(() => { const k = d.value?.kpis; if (!k) return []; return [
  { id: 'orders', l: 'New orders today', v: String(k.newOrders.n), s: `৳${n0(k.newOrders.v)}`, side: 'in' },
  { id: 'shipments', l: 'Due to ship today', v: String(k.shipments.n), s: `৳${n0(k.shipments.v)}`, side: 'in' },
  { id: 'products', l: 'Products on open orders', v: String(k.products.n), s: `${n0(k.products.qty)} bags/units`, side: 'in' },
  { id: 'receipts', l: 'Received today', v: '৳' + n0(k.paymentsIn.v), s: `${k.paymentsIn.n} receipts`, side: 'in' },
  { id: 'receivables', l: 'Receivables', v: '৳' + n0(k.receivables.v), s: `${k.receivables.n}+ customers owe`, side: 'in' },
  { id: 'payables', l: 'Supplier payables', v: '৳' + n0(k.payables.v), s: `${k.payables.n} POs`, side: 'out' },
  { id: 'advances', l: 'Supplier advances', v: '৳' + n0(k.advances.v), s: `${k.advances.n} POs overpaid`, side: 'out' },
  { id: 'supplierpaid', l: 'Paid to suppliers today', v: '৳' + n0(k.supplierPaid.v), s: `${k.supplierPaid.n} payments`, side: 'out' },
  { id: 'expenses', l: 'Expenses today', v: '৳' + n0(k.expenses.v), s: `${k.expenses.n} vouchers`, side: 'out' }] })

const T = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const money = (k: string, l: string, sum = true) => T(k, l, { fmt: 'money', sum })
const sections = computed(() => { const x = d.value; if (!x) return []; return [
  { id: 'orders', title: 'New credit orders today', cols: [T('order_number', 'Order #'), T('customer', 'Customer'), T('status', 'Status'), T('priority', 'Priority'), money('amount', 'Amount ৳'), money('advance', 'Advance ৳'), money('due', 'Due ৳')], rows: x.ordersToday, totals: true },
  { id: 'shipments', title: 'Scheduled to ship today', cols: [T('order_number', 'Order #'), T('customer', 'Customer'), T('status', 'Status'), T('priority', 'Priority'), money('amount', 'Amount ৳')], rows: x.shipments, totals: true },
  { id: 'products', title: 'Products under open orders', cols: [T('product', 'Product'), T('grade', 'Grade'), T('variant', 'Variant'), T('orders', 'Orders', { fmt: 'qty', sum: true }), T('ordered_qty', 'Ordered', { fmt: 'qty', sum: true }), T('stock', 'In stock', { fmt: 'qty' }), money('ordered_value', 'Value ৳')], rows: x.products, totals: true },
  { id: 'receipts', title: 'Payments received today', cols: [T('ref', 'Receipt'), T('customer', 'Customer'), T('method', 'Method'), T('type', 'Type'), T('paid_into', 'Paid into'), money('amount', 'Amount ৳')], rows: x.paymentsToday, totals: true },
  { id: 'receivables', title: 'Outstanding receivables (top 100)', cols: [T('customer', 'Customer'), T('phone', 'Phone'), money('credit_limit', 'Credit limit ৳', false), money('balance', 'Balance ৳')], rows: x.receivables, totals: true },
  { id: 'payables', title: 'Supplier payables — outstanding', cols: [T('po', 'PO #'), T('date', 'Date'), T('supplier', 'Supplier'), T('delivery', 'Delivery'), money('billed', 'Billed ৳'), money('paid', 'Paid ৳'), money('due', 'Due ৳')], rows: x.suppPayables, totals: true },
  { id: 'advances', title: 'Supplier advances — paid ahead of receipt', cols: [T('po', 'PO #'), T('date', 'Date'), T('supplier', 'Supplier'), T('delivery', 'Delivery'), money('billed', 'Billed ৳'), money('paid', 'Paid ৳'), money('advance', 'Advance ৳')], rows: x.suppAdvances, totals: true },
  { id: 'supplierpaid', title: 'Supplier payments today', cols: [T('ref', 'Voucher'), T('supplier', 'Supplier'), T('po', 'PO #'), T('method', 'Method'), T('type', 'Type'), money('amount', 'Amount ৳')], rows: x.suppPaidToday, totals: true },
  { id: 'expenses', title: 'Expenses today (approved)', cols: [T('ref', 'Voucher'), T('category', 'Category'), T('subcategory', 'Subcategory'), T('method', 'Method'), T('remarks', 'Remarks'), money('amount', 'Amount ৳')], rows: x.expensesToday, totals: true },
] })
const sheets = computed(() => sections.value.map(s => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows, totals: s.totals })))
</script>
