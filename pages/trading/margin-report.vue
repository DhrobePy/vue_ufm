<template>
  <div class="space-y-6">
    <UiPageHeader title="Trading Margin Report" subtitle="Revenue / COGS / margin per commodity"
                  :breadcrumb="['Trading', 'Margin Report']" />

    <div class="glass-card p-4 flex flex-wrap items-end gap-3">
      <div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase">From</label>
        <input v-model="filters.date_from" type="date" class="input-glass text-xs py-1.5" /></div>
      <div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase">To</label>
        <input v-model="filters.date_to" type="date" class="input-glass text-xs py-1.5" /></div>
      <button @click="refresh()" class="btn-gold text-xs py-2">Apply</button>
      <span class="flex-1" />
      <button @click="exportCsv" class="btn-ghost text-xs py-2">⬇ CSV</button>
    </div>

    <div class="glass-card p-5">
      <h3 class="section-title mb-3">By Commodity <span class="text-gray-600 text-xs font-normal">{{ period.from }} → {{ period.to }}</span></h3>
      <table class="w-full text-xs">
        <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
          <th class="text-left py-2 pr-3">Commodity</th><th class="text-right pr-3">Sales</th>
          <th class="text-right pr-3">Qty</th><th class="text-right pr-3">Revenue</th>
          <th class="text-right pr-3">COGS</th><th class="text-right pr-3">Margin</th><th class="text-right">Margin %</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in byCommodity" :key="r.commodity_id" class="border-b border-white/[0.03]">
            <td class="py-2 pr-3 text-gray-200">{{ r.commodity_name }}</td>
            <td class="pr-3 text-right text-gray-400">{{ r.sales_count }}</td>
            <td class="pr-3 text-right font-mono text-gray-400">{{ Number(r.qty).toLocaleString() }} {{ r.unit }}</td>
            <td class="pr-3 text-right font-mono text-gold-400">৳{{ Number(r.revenue).toLocaleString() }}</td>
            <td class="pr-3 text-right font-mono text-gray-300">৳{{ Number(r.cogs).toLocaleString() }}</td>
            <td :class="['pr-3 text-right font-mono font-bold', r.margin >= 0 ? 'text-emerald-400' : 'text-red-400']">৳{{ Number(r.margin).toLocaleString() }}</td>
            <td :class="['text-right font-mono', r.margin >= 0 ? 'text-emerald-400' : 'text-red-400']">{{ r.margin_pct }}%</td>
          </tr>
          <tr v-if="!byCommodity.length"><td colspan="7" class="py-6 text-center text-gray-600">No sales in this period.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Sale Detail</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Sale #</th><th class="text-left pr-3">Date</th><th class="text-left pr-3">Customer</th>
            <th class="text-left pr-3">Commodity</th><th class="text-right pr-3">Qty</th>
            <th class="text-right pr-3">Revenue</th><th class="text-right pr-3">COGS</th><th class="text-right">Margin</th>
          </tr></thead>
          <tbody>
            <tr v-for="s in salesDetail" :key="s.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3"><NuxtLink :to="`/trading/sales/${s.id}`" class="font-mono text-gold-400 hover:underline">{{ s.sale_number }}</NuxtLink></td>
              <td class="pr-3 text-gray-400">{{ String(s.sale_date).slice(0, 10) }}</td>
              <td class="pr-3 text-gray-200">{{ s.customer_name }}</td>
              <td class="pr-3 text-gray-400">{{ s.commodity_name }}{{ s.origin ? ` (${s.origin})` : '' }}</td>
              <td class="pr-3 text-right font-mono text-gray-400">{{ Number(s.quantity).toLocaleString() }}</td>
              <td class="pr-3 text-right font-mono text-gold-400">৳{{ Number(s.total_amount).toLocaleString() }}</td>
              <td class="pr-3 text-right font-mono text-gray-300">৳{{ Number(s.cogs_amount).toLocaleString() }}</td>
              <td class="text-right font-mono text-emerald-400">৳{{ (Number(s.total_amount) - Number(s.cogs_amount)).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const filters = reactive({ date_from: '', date_to: '' })
const { data, refresh } = await useFetch('/api/trading/margin-report', {
  query: computed(() => ({
    ...(filters.date_from ? { date_from: filters.date_from } : {}),
    ...(filters.date_to ? { date_to: filters.date_to } : {}),
  })),
})
const period      = computed<any>(() => (data.value as any)?.period ?? {})
const byCommodity = computed<any[]>(() => (data.value as any)?.by_commodity ?? [])
const salesDetail = computed<any[]>(() => (data.value as any)?.sales ?? [])

function exportCsv() {
  const rows = [
    ['Sale #', 'Date', 'Customer', 'Commodity', 'Origin', 'Qty', 'Unit', 'Unit Price', 'Revenue', 'COGS', 'Margin'],
    ...salesDetail.value.map((s: any) => [
      s.sale_number, String(s.sale_date).slice(0, 10), s.customer_name, s.commodity_name, s.origin ?? '',
      s.quantity, s.unit, s.unit_price, s.total_amount, s.cogs_amount,
      Number(s.total_amount) - Number(s.cogs_amount),
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `trading-margin-${period.value.from}-${period.value.to}.csv`
  a.click()
}
</script>
