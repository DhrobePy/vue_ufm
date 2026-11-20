<template>
  <ReportFrame title="Cashflow Dashboard" subtitle="Money in, money out, receivables, payables and sales — this month against last month" :period="d?.month ?? ''" filename="cashflow" :sheets="sheets">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="k in kpis" :key="k.l" class="glass-card p-3">
          <p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p>
          <p class="text-lg font-bold font-mono" :class="k.cls ?? 'text-gray-100'">{{ k.v }}</p>
          <p class="text-[10px] text-gray-600">{{ k.s }}</p>
        </div>
      </div>

      <div class="glass-card p-4">
        <h2 class="text-sm font-bold text-gray-200 mb-3">Daily flow — last 30 days <span class="text-gray-600 font-normal">(green = in, red = out)</span></h2>
        <div class="flex items-end gap-1 h-36">
          <div v-for="x in d.daily" :key="x.date" class="flex-1 flex items-end gap-px group relative" :title="`${x.date}: in ৳${n0(x.inflow)} · out ৳${n0(x.outflow)}`">
            <div class="flex-1 rounded-t bg-emerald-500/70" :style="`height:${pct(x.inflow)}%`" />
            <div class="flex-1 rounded-t bg-red-500/70" :style="`height:${pct(x.outflow)}%`" />
          </div>
        </div>
        <div class="flex justify-between text-[10px] text-gray-600 mt-1"><span>{{ d.daily[0].date }}</span><span>{{ d.daily[29].date }}</span></div>
      </div>

      <section v-for="s in sections" :key="s.title" class="space-y-1">
        <h2 class="text-sm font-bold text-gray-200 mt-2">{{ s.title }}</h2>
        <ReportTable :cols="s.cols" :rows="s.rows" :totals="s.totals" />
      </section>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const { data: d, pending, error } = await useFetch<any>('/api/admin/cashflow')
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const trendPct = (a: number, b: number) => b ? `${a >= b ? '▲' : '▼'} ${Math.abs(((a - b) / b) * 100).toFixed(0)}% vs last month` : 'no last-month figure'
const max = computed(() => Math.max(1, ...(d.value?.daily ?? []).flatMap((x: any) => [x.inflow, x.outflow])))
const pct = (v: number) => Math.max(v > 0 ? 3 : 0, (v / max.value) * 100)

const kpis = computed(() => { const x = d.value; if (!x) return []; return [
  { l: 'Money in — this month', v: '৳' + n0(x.inflow.month), s: `${x.inflow.count} receipts · today ৳${n0(x.inflow.today)} · ${trendPct(x.inflow.month, x.inflow.prev)}`, cls: 'text-emerald-400' },
  { l: 'Paid to suppliers', v: '৳' + n0(x.supplier.month), s: `today ৳${n0(x.supplier.today)} · ${trendPct(x.supplier.month, x.supplier.prev)}` },
  { l: 'Expenses (approved)', v: '৳' + n0(x.expense.month), s: `today ৳${n0(x.expense.today)} · ${trendPct(x.expense.month, x.expense.prev)}` },
  { l: 'Net cash flow', v: '৳' + n0(x.net.month), s: `last month ৳${n0(x.net.prev)}`, cls: x.net.month < 0 ? 'text-red-400' : 'text-emerald-400' },
  { l: 'Receivables', v: '৳' + n0(x.receivables), s: 'owed by credit customers' },
  { l: 'Supplier payables', v: '৳' + n0(x.payables), s: `${x.openPo.n} open POs worth ৳${n0(x.openPo.v)}` },
  { l: 'Sales this month', v: '৳' + n0(x.sales.month), s: `${trendPct(x.sales.month, x.sales.prev)} · ${x.pendingSales.n} orders in progress (৳${n0(x.pendingSales.v)})` },
  { l: 'Raw material received', v: n0(x.rm.month_kg) + ' kg', s: `today ${n0(x.rm.today_kg)} kg · ${trendPct(x.rm.month_kg, x.rm.prev_kg)}` }] })

const T = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const sections = computed(() => { const x = d.value; if (!x) return []; return [
  { title: 'Six-month trend', cols: [T('month', 'Month'), T('sales', 'Sales ৳', { fmt: 'money', sum: true }), T('inflow', 'Money in ৳', { fmt: 'money', sum: true }), T('outflow', 'Money out ৳', { fmt: 'money', sum: true }), T('rm_kg', 'Raw material kg', { fmt: 'money', sum: true })], rows: x.trend, totals: true },
  { title: 'Latest receipts', cols: [T('date', 'Date'), T('ref', 'Receipt'), T('party', 'Customer'), T('method', 'Method'), T('amount', 'Amount ৳', { fmt: 'money', sum: true })], rows: x.recentIn, totals: false },
  { title: 'Latest supplier payments', cols: [T('date', 'Date'), T('ref', 'Voucher'), T('party', 'Supplier'), T('method', 'Method'), T('amount', 'Amount ৳', { fmt: 'money', sum: true })], rows: x.recentOut, totals: false },
  { title: 'Latest goods received', cols: [T('date', 'Date'), T('ref', 'GRN'), T('party', 'Supplier'), T('qty_kg', 'Kg', { fmt: 'money', sum: true }), T('amount', 'Value ৳', { fmt: 'money', sum: true })], rows: x.recentGrn, totals: false },
] })
const sheets = computed(() => [
  { name: 'Summary', cols: [T('l', 'Measure'), T('v', 'Value'), T('s', 'Detail')], rows: kpis.value, totals: false },
  { name: 'Daily flow', cols: [T('date', 'Date'), T('inflow', 'In ৳', { fmt: 'money', sum: true }), T('outflow', 'Out ৳', { fmt: 'money', sum: true }), T('net', 'Net ৳', { fmt: 'money', sum: true })], rows: d.value?.daily ?? [], totals: true },
  ...sections.value.map(s => ({ name: s.title, cols: s.cols, rows: s.rows, totals: s.totals }))])
</script>
