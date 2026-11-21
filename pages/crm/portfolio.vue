<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <ReportFrame title="Customer Portfolio Assessment" subtitle="Who your customers are, how healthy each relationship is, and where to act" :period="today" filename="customer-portfolio" :sheets="sheets">
      <template #filters>
        <div class="glass-card p-4 flex flex-wrap items-center gap-2">
          <button v-for="l in labelList" :key="l" class="px-3 py-1.5 rounded-xl text-xs border transition-all" :class="label === l ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07] hover:text-gray-300'" @click="label = label === l ? '' : l">{{ l }} <span class="text-gray-600">{{ d?.summary.labels[l] ?? 0 }}</span></button>
          <select v-model="segment" class="field-input text-xs py-1.5 w-44"><option value="">All business types</option><option v-for="s in d?.summary.segments ?? []" :key="s.key" :value="s.key">{{ s.key }}</option></select>
          <select v-model="district" class="field-input text-xs py-1.5 w-40"><option value="">All districts</option><option v-for="s in d?.summary.districts ?? []" :key="s.key" :value="s.key">{{ s.key }}</option></select>
          <input v-model="search" type="search" placeholder="Name, area…" class="field-input text-xs py-1.5 w-44" />
        </div>
      </template>
      <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <template v-else-if="d">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="k in tiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono text-gray-100">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
        </div>
        <div v-if="d.summary.data_gaps" class="no-print glass-card p-3 text-xs text-amber-300/90">
          Data gaps that weaken the assessment: {{ d.summary.data_gaps.no_address }} customers have no address · {{ d.summary.data_gaps.buyers_without_branch }} buyers have orders with no branch · business type is a guess for {{ d.summary.data_gaps.segment_unconfirmed }} customers (open a customer card to confirm) ·
          {{ d.summary.credit.no_limit_owing }} customers owe money but have no real credit limit set.
        </div>
        <section v-for="s in sections" :key="s.title" class="space-y-1"><h2 class="text-sm font-bold text-gray-200 mt-3">{{ s.title }}</h2><ReportTable :cols="s.cols" :rows="s.rows" :totals="s.totals" /></section>

        <h2 class="text-sm font-bold text-gray-200 mt-4">Customers <span class="text-gray-600 font-normal">({{ d.customers.length }} shown, most urgent first)</span></h2>
        <div class="glass-card overflow-x-auto">
          <table class="w-full text-xs">
            <thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-left">Health</th><th class="px-3 py-2 text-left">Type · district</th><th class="px-3 py-2 text-right">12-mo ৳</th><th class="px-3 py-2 text-right">Owes ৳</th><th class="px-3 py-2 text-right">Last order</th><th class="px-3 py-2 text-left">Why / next step</th></tr></thead>
            <tbody>
              <tr v-for="c in d.customers" :key="c.id" class="border-b border-white/[0.04] align-top">
                <td class="px-3 py-2"><NuxtLink :to="`/crm/customers/${c.id}`" class="text-gold-400 hover:underline">{{ c.name }}</NuxtLink></td>
                <td class="px-3 py-2"><CrmLabel :label="c.label" /></td>
                <td class="px-3 py-2 text-gray-400">{{ c.segment }} · {{ c.district }}</td>
                <td class="px-3 py-2 text-right font-mono">{{ n0(c.value_12m) }}</td><td class="px-3 py-2 text-right font-mono">{{ n0(Math.max(0, c.balance)) }}</td>
                <td class="px-3 py-2 text-right text-gray-500">{{ c.days_since_last != null ? c.days_since_last + ' d ago' : '—' }}</td>
                <td class="px-3 py-2 text-gray-400 max-w-[28rem]">{{ c.reasons.join(' · ') }}<div v-if="c.suggestions[0]" class="text-gray-200">→ {{ c.suggestions[0] }}</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </ReportFrame>
  </div>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const labelList = ['Risky', 'Slipping', 'Dormant', 'Growing', 'Loyal', 'Steady', 'Never bought']
const label = ref(''), segment = ref(''), district = ref(''), search = ref('')
const { data: d, pending } = await useFetch<any>('/api/crm/portfolio', { query: computed(() => ({ label: label.value || undefined, segment: segment.value || undefined, district: district.value || undefined, search: search.value || undefined })), watch: [label, segment, district, search] })
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const crore = (v: number) => `৳${(v / 1e7).toFixed(2)} crore`
const tiles = computed(() => { const s = d.value?.summary; if (!s) return []; return [
  { l: 'Buying customers (12 mo)', v: String(s.buyers), s: `${s.customers} active in total · ${crore(s.value_12m)} sales` },
  { l: 'Concentration', v: `${s.concentration.top10.toFixed(0)}% in top 10`, s: `top 1 ${s.concentration.top1.toFixed(1)}% · top 5 ${s.concentration.top5.toFixed(0)}% · top 20 ${s.concentration.top20.toFixed(0)}%` },
  { l: 'Owed to us', v: crore(s.credit.owed), s: `${s.credit.owing_count} customers owe` },
  { l: 'Over credit limit', v: String(s.credit.over_limit), s: `${crore(s.credit.over_limit_amount)} above limits (real limits only)` }] })
const T = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const rollCols = (first: string): ReportCol[] => [T('key', first), T('customers', 'Customers', { fmt: 'qty', sum: true }), T('buyers', 'Buying', { fmt: 'qty', sum: true }), T('value_12m', '12-mo sales ৳', { fmt: 'money', sum: true }), T('share', 'Share %', { fmt: 'qty' }), T('avg_pay_days', 'Avg days to pay', { fmt: 'qty' }), T('owing', 'Owed ৳', { fmt: 'money', sum: true }), T('over_limit', 'Over limit', { fmt: 'qty', sum: true })]
const sections = computed(() => { const s = d.value?.summary; if (!s) return []; return [
  { title: 'By business type', cols: rollCols('Business type'), rows: s.segments, totals: true },
  { title: 'By district', cols: rollCols('District'), rows: s.districts, totals: true },
  { title: 'By branch', cols: rollCols('Branch'), rows: s.branches, totals: true },
  { title: 'By product (12 months)', cols: [T('product', 'Product'), T('customers', 'Customers', { fmt: 'qty' }), T('qty', 'Bags / units', { fmt: 'qty', sum: true }), T('value', 'Sales ৳', { fmt: 'money', sum: true }), T('share', 'Share %', { fmt: 'qty' })], rows: s.products, totals: true }] })
const sheets = computed(() => [...sections.value.map(s => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows, totals: s.totals })),
  { name: 'Customers', cols: [T('name', 'Customer'), T('label', 'Health'), T('segment', 'Type'), T('district', 'District'), T('branch', 'Branch'), T('value_12m', '12-mo ৳', { fmt: 'money', sum: true }), T('balance', 'Balance ৳', { fmt: 'money', sum: true }), T('credit_limit', 'Limit ৳', { fmt: 'money' }), T('days_since_last', 'Days since order', { fmt: 'qty' }), T('pay_days', 'Days to pay', { fmt: 'qty' })], rows: d.value?.customers ?? [], totals: false }])
</script>
