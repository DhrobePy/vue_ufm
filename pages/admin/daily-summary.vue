<template>
  <ReportFrame title="Daily Financial Summary" subtitle="Cash position, collections, dispatches, purchases, payments and expenses for a day or period" :period="period" :filename="`daily-summary_${from}_to_${to}`" :sheets="sheets">
    <template #filters>
      <div class="glass-card p-4 flex flex-wrap items-center gap-2">
        <button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200" @click="from = to = today">Today</button>
        <button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200" @click="from = to = yesterday">Yesterday</button>
        <button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200" @click="from = today.slice(0, 8) + '01'; to = today">This month</button>
        <input v-model="from" type="date" class="field-input text-xs py-1.5 w-36" /><span class="text-xs text-gray-600">to</span><input v-model="to" type="date" class="field-input text-xs py-1.5 w-36" />
      </div>
    </template>
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="k in kpis" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p>
          <p class="text-lg font-bold font-mono" :class="k.cls ?? 'text-gray-100'">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
      </div>
      <section v-for="s in sections" :key="s.title" class="space-y-1">
        <h2 class="text-sm font-bold text-gray-200 mt-2">{{ s.title }} <span class="text-gray-600 font-normal">({{ s.rows.length }})</span></h2>
        <ReportTable :cols="s.cols" :rows="s.rows" :totals="s.totals" />
      </section>
      <p class="no-print text-[11px] text-gray-600">Bank and petty-cash balances are computed from the general ledger as of now. Collections exclude reversed receipts; expenses count approved vouchers only. Net flow = collections − supplier payments − expenses.</p>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const yesterday = new Date(Date.now() + 6 * 3600_000 - 86400_000).toISOString().slice(0, 10)
const from = ref(today), to = ref(today)
const { data: d, pending, error } = await useFetch<any>('/api/admin/daily-summary', { query: computed(() => ({ date_from: from.value, date_to: to.value })), watch: [from, to] })
const period = computed(() => from.value === to.value ? from.value : `${from.value} to ${to.value}`)
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')

const kpis = computed(() => { const t = d.value?.totals; if (!t) return []; return [
  { l: 'Collected', v: '৳' + n0(t.collTotal), s: `${t.collCount} receipts · advance ৳${n0(t.collAdvance)}` },
  { l: 'Dispatched', v: '৳' + n0(t.dispatchValue), s: `${t.dispatchCount} orders` },
  { l: 'Paid to suppliers', v: '৳' + n0(t.paidTotal), s: `goods received ৳${n0(t.grnValue)}` },
  { l: 'Expenses', v: '৳' + n0(t.expTotal), s: 'approved vouchers' },
  { l: 'Net flow', v: '৳' + n0(t.net), s: `in ৳${n0(t.inflow)} · out ৳${n0(t.outflow)}`, cls: t.net < 0 ? 'text-red-400' : 'text-emerald-400' },
  { l: 'Receivables', v: '৳' + n0(d.value.position.receivables), s: 'outstanding on orders' },
  { l: 'Bank balance', v: '৳' + n0(d.value.position.banks.reduce((a: number, b: any) => a + b.balance, 0)), s: `${d.value.position.banks.length} accounts (ledger)` },
  { l: 'Cash in hand', v: '৳' + n0(d.value.position.petty.reduce((a: number, b: any) => a + b.balance, 0)), s: `${d.value.position.petty.length} petty-cash accounts` }] })

const T = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const amt = (label = 'Amount ৳') => T('amount', label, { fmt: 'money', sum: true })
const sections = computed(() => { const x = d.value; if (!x) return []; return [
  { title: 'Bank accounts', cols: [T('account_name', 'Account'), T('bank_name', 'Bank'), T('balance', 'Balance ৳', { fmt: 'money', sum: true })], rows: x.position.banks, totals: true },
  { title: 'Cash / petty-cash accounts', cols: [T('account_name', 'Account'), T('balance', 'Balance ৳', { fmt: 'money', sum: true })], rows: x.position.petty, totals: true },
  { title: 'Collections', cols: [T('date', 'Date'), T('payment_number', 'Receipt'), T('customer', 'Customer'), T('type', 'Type'), T('method', 'Method'), T('account', 'Paid into'), amt()], rows: x.collections, totals: true },
  { title: 'Orders dispatched', cols: [T('date', 'Shipped'), T('order_number', 'Order #'), T('customer', 'Customer'), T('truck', 'Truck'), T('status', 'Status'), amt('Order value ৳')], rows: x.dispatches, totals: true },
  { title: 'Purchase orders placed', cols: [T('date', 'Date'), T('po_number', 'PO #'), T('supplier', 'Supplier'), T('qty_kg', 'Qty kg', { fmt: 'qty', sum: true }), T('rate', 'Rate ৳/kg', { fmt: 'qty' }), amt('Value ৳')], rows: x.purchases, totals: true },
  { title: 'Goods received', cols: [T('date', 'Date'), T('grn_number', 'GRN'), T('supplier', 'Supplier'), T('qty_kg', 'Qty kg', { fmt: 'qty', sum: true }), T('rate', 'Rate ৳/kg', { fmt: 'qty' }), amt('Value ৳')], rows: x.grns, totals: true },
  { title: 'Paid to suppliers', cols: [T('date', 'Date'), T('payment_number', 'Voucher'), T('supplier', 'Supplier'), T('method', 'Method'), amt()], rows: x.supplierPaid, totals: true },
  { title: 'Expenses by category', cols: [T('category', 'Category'), T('vouchers', 'Vouchers', { fmt: 'qty', sum: true }), amt()], rows: x.expenseByCategory, totals: true },
  { title: 'Expense vouchers', cols: [T('date', 'Date'), T('voucher_number', 'Voucher'), T('category', 'Category'), T('handled_by', 'Handled by'), T('method', 'Method'), amt()], rows: x.expenses, totals: true },
] })
const sheets = computed(() => sections.value.map(s => ({ name: s.title, cols: s.cols, rows: s.rows, totals: s.totals })))
</script>
