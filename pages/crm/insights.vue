<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="CRM — Insights" subtitle="Who is due to reorder, what else to sell them, and where sales are heading" :breadcrumb="['CRM', 'Insights']" />
    <div class="flex gap-2">
      <button v-for="t in TABS" :key="t.k" class="px-3 py-1.5 rounded-xl text-xs border transition-all" :class="tab === t.k ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07]'" @click="tab = t.k">{{ t.l }}</button>
    </div>

    <!-- Reorder radar -->
    <template v-if="tab === 'reorder'">
      <div v-if="rp" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <template v-else-if="re">
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <button v-for="s in STATUSES" :key="s.k" class="glass-card p-3 text-left" :class="status === s.k ? 'ring-1 ring-gold-500/40' : ''" @click="status = status === s.k ? '' : s.k">
            <p class="text-[10px] uppercase tracking-wider text-gray-500">{{ s.l }}</p><p class="text-xl font-bold" :class="s.c">{{ re.counts[s.k] ?? 0 }}</p></button>
        </div>
        <p class="text-xs text-gray-400">Based on each customer's own rhythm: the usual gap is the median days between their recent orders (at least 4 orders needed, never shorter than a week). “Slipping %” compares the silence so far with how much that customer's gaps normally vary — it is a rule of thumb, not a certainty. <b class="text-amber-300">{{ money(re.at_risk_value) }}</b> of yearly sales sits with customers at 50%+.</p>
        <div class="glass-card overflow-x-auto">
          <table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-left">Status</th><th class="px-3 py-2 text-right">Usual gap</th><th class="px-3 py-2 text-right">Silent</th><th class="px-3 py-2 text-left">Expected</th><th class="px-3 py-2 text-right">Typical order</th><th class="px-3 py-2 text-right">Slipping</th><th class="px-3 py-2 text-right">Yearly sales at risk</th><th></th></tr></thead>
            <tbody><tr v-for="r in rows" :key="r.id" class="border-b border-white/[0.04]">
              <td class="px-3 py-2"><NuxtLink :to="`/crm/customers/${r.id}`" class="text-gold-400 hover:underline">{{ r.name }}</NuxtLink><div class="text-[10px] text-gray-600">{{ r.segment }} · {{ r.district }}</div></td>
              <td class="px-3 py-2"><span class="px-2 py-0.5 rounded-full text-[10px]" :class="STATUSES.find(s => s.k === r.status)?.b">{{ STATUSES.find(s => s.k === r.status)?.l }}</span></td>
              <td class="px-3 py-2 text-right">{{ r.usual_gap }} d{{ r.regular ? '' : ' ~' }}</td><td class="px-3 py-2 text-right">{{ r.days_since }} d</td>
              <td class="px-3 py-2 text-gray-400">{{ r.expected_date }} <span class="text-gray-600">({{ r.days_to_expected >= 0 ? 'in ' + r.days_to_expected : -r.days_to_expected + ' late' }} d)</span></td>
              <td class="px-3 py-2 text-right font-mono">{{ n0(r.avg_order) }}</td>
              <td class="px-3 py-2 text-right font-mono" :class="r.churn_pct >= 60 ? 'text-red-400' : r.churn_pct >= 30 ? 'text-amber-300' : 'text-gray-400'">{{ r.churn_pct }}%</td>
              <td class="px-3 py-2 text-right font-mono">{{ n0(r.value_at_risk) }}</td>
              <td class="px-3 py-2 text-right"><button class="btn-ghost text-[11px] px-2 py-0.5" @click="cm = { party_id: r.id, name: r.name, phone: r.phone, kind: r.status === 'lapsing' ? 'winback' : 'reorder' }">Message</button></td></tr></tbody></table>
          <p v-if="!rows.length" class="p-4 text-xs text-gray-600">No customers in this group.</p>
        </div>
      </template>
    </template>

    <!-- Cross-sell -->
    <template v-if="tab === 'cross'">
      <div v-if="cp" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <template v-else-if="cs">
        <p class="text-xs text-gray-400">For each business type, products that at least a quarter of its customers buy. Customers of that type who buy none of it are the opportunity; the value is what their peers spend on it, scaled to the customer's size.</p>
        <div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Product</th><th class="px-3 py-2 text-left">Business type</th><th class="px-3 py-2 text-right">Peers buying</th><th class="px-3 py-2 text-right">Customers missing it</th><th class="px-3 py-2 text-right">Potential a month</th></tr></thead>
          <tbody><tr v-for="g in cs.gaps" :key="g.product + g.segment" class="border-b border-white/[0.04]"><td class="px-3 py-2 text-gray-200">{{ g.product }}</td><td class="px-3 py-2 text-gray-400">{{ g.segment }}</td><td class="px-3 py-2 text-right">{{ g.peers_buying_pct }}%</td><td class="px-3 py-2 text-right">{{ g.customers_missing }}</td><td class="px-3 py-2 text-right font-mono">{{ n0(g.est_monthly_total) }}</td></tr></tbody></table></div>
        <h2 class="text-sm font-bold text-gray-200">Best individual offers <span class="text-gray-600 font-normal">({{ cs.total }} in all)</span></h2>
        <div class="glass-card overflow-x-auto"><table class="w-full text-xs"><tbody>
          <tr v-for="s in cs.suggestions.slice(0, 40)" :key="s.customer_id + s.product" class="border-b border-white/[0.04]"><td class="px-3 py-2"><NuxtLink :to="`/crm/customers/${s.customer_id}`" class="text-gold-400 hover:underline">{{ s.name }}</NuxtLink><div class="text-[10px] text-gray-600">{{ s.segment }} · {{ s.district }}</div></td><td class="px-3 py-2 text-gray-200">{{ s.product }}</td><td class="px-3 py-2 text-gray-500">{{ s.peers_buying_pct }}% of {{ s.peers }} peers buy it</td><td class="px-3 py-2 text-right font-mono">≈ ৳{{ n0(s.est_monthly) }} / month</td></tr></tbody></table></div>
      </template>
    </template>

    <!-- Forecast -->
    <template v-if="tab === 'forecast'">
      <div v-if="fp" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <template v-else-if="fc">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="k in fcTiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono text-gray-100">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
        </div>
        <div class="glass-card p-4">
          <svg :viewBox="`0 0 ${W} ${H + 22}`" class="w-full" role="img" aria-label="Monthly sales and forecast">
            <g v-for="(b, i) in bars" :key="b.month">
              <rect :x="b.x" :y="b.y" :width="bw" :height="b.h" :fill="b.fc ? 'rgb(var(--accent) / .35)' : b.partial ? 'rgb(var(--accent) / .5)' : 'rgb(var(--accent))'" rx="3" />
              <line v-if="b.fc" :x1="b.x + bw / 2" :x2="b.x + bw / 2" :y1="b.yHigh" :y2="b.yLow" stroke="currentColor" stroke-width="1.5" class="text-gray-400" />
              <text :x="b.x + bw / 2" :y="H + 14" text-anchor="middle" font-size="9" class="fill-gray-500">{{ b.month.slice(2) }}</text>
              <text :x="b.x + bw / 2" :y="b.y - 4" text-anchor="middle" font-size="9" class="fill-gray-300">{{ b.label }}</text>
            </g>
          </svg>
          <p class="text-[11px] text-gray-500">Solid bars = recorded sales (the latest month is still in progress). Faded bars with a line = forecast and its likely range. Method: {{ fc.method }}. When the same method is run on past months it missed by about ±{{ fc.error_pct }}%<template v-if="fc.thin_history"> — there are only {{ fc.backtest_months }} months of history to check against, so treat the range as rough and it will tighten as months pass</template>. History starts {{ fc.history_from }}.</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="glass-card p-4 space-y-1"><h2 class="section-title">By business type (next month)</h2>
            <div v-for="s in fc.by_segment" :key="s.segment" class="flex text-xs py-1 border-b border-white/[0.04]"><span class="flex-1 text-gray-300">{{ s.segment }}</span><span class="text-gray-500 w-12 text-right">{{ s.share }}%</span><span class="font-mono w-28 text-right">{{ n0(s.expected_next_month) }}</span></div></div>
          <div class="glass-card p-4 space-y-1"><h2 class="section-title">Orders expected in the next 30 days <span class="text-gray-600 font-normal">({{ fc.orders_expected_30d.count }} customers · ৳{{ n0(fc.orders_expected_30d.value) }})</span></h2>
            <div class="max-h-72 overflow-y-auto"><div v-for="c in fc.orders_expected_30d.customers" :key="c.id" class="flex text-xs py-1 border-b border-white/[0.04]"><NuxtLink :to="`/crm/customers/${c.id}`" class="flex-1 text-gold-400 hover:underline">{{ c.name }}</NuxtLink><span class="text-gray-500 w-24">{{ c.expected_date }}</span><span class="font-mono w-24 text-right">{{ n0(c.avg_order) }}</span></div></div></div>
        </div>
      </template>
    </template>
    <CrmComposer v-if="cm" :open="!!cm" party-type="customer" :party-id="cm.party_id" :name="cm.name" :phone="cm.phone" :kind="cm.kind" @close="cm = null" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const TABS = [{ k: 'reorder', l: '🔁 Reorder radar' }, { k: 'cross', l: '➕ Cross-sell' }, { k: 'forecast', l: '📈 Forecast' }]
const STATUSES = [{ k: 'lapsing', l: 'Going quiet', c: 'text-red-400', b: 'bg-red-500/15 text-red-300' }, { k: 'late', l: 'Late', c: 'text-orange-400', b: 'bg-orange-500/15 text-orange-300' }, { k: 'due', l: 'Due now', c: 'text-amber-400', b: 'bg-amber-500/15 text-amber-300' }, { k: 'due_soon', l: 'Due soon', c: 'text-blue-400', b: 'bg-blue-500/15 text-blue-300' }, { k: 'on_track', l: 'On track', c: 'text-emerald-400', b: 'bg-emerald-500/15 text-emerald-300' }]
const tab = ref('reorder'), status = ref(''), cm = ref<any>(null)
const { data: re, pending: rp } = await useFetch<any>('/api/crm/reorder', { lazy: true })
const { data: cs, pending: cp } = await useFetch<any>('/api/crm/cross-sell', { lazy: true })
const { data: fc, pending: fp } = await useFetch<any>('/api/crm/forecast', { lazy: true })
const rows = computed(() => (re.value?.rows ?? []).filter((r: any) => !status.value || r.status === status.value))
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const money = (v: number) => '৳' + (v >= 1e7 ? (v / 1e7).toFixed(2) + ' cr' : v >= 1e5 ? (v / 1e5).toFixed(1) + ' lakh' : n0(v))
const W = 640, H = 170, bw = 28
const bars = computed(() => {
  if (!fc.value) return []
  const all = [...fc.value.months.map((m: any) => ({ ...m, fc: false })), ...fc.value.next.map((m: any) => ({ month: m.month, value: m.expected, low: m.low, high: m.high, fc: true }))]
  const max = Math.max(1, ...all.map((m: any) => m.high ?? m.value)), step = (W - 10) / all.length
  const y = (v: number) => H - (v / max) * (H - 18)
  return all.map((m: any, i: number) => ({ ...m, x: 5 + i * step + (step - bw) / 2, y: y(m.value), h: Math.max(1, H - y(m.value)), yHigh: y(m.high ?? m.value), yLow: y(m.low ?? m.value), label: m.value >= 1e6 ? (m.value / 1e6).toFixed(0) + 'M' : '' }))
})
const fcTiles = computed(() => { const f = fc.value; if (!f) return []; const n = f.next[0]; return [
  { l: 'This month so far', v: money(f.this_month.so_far), s: `day ${f.this_month.days_in} of ${f.this_month.days_total}` },
  { l: 'On pace for', v: money(f.this_month.pace), s: 'if the rest of the month matches the average so far' },
  { l: 'Next month (forecast)', v: money(n.expected), s: `likely ${money(n.low)} – ${money(n.high)}` },
  { l: 'Orders due in 30 days', v: money(f.orders_expected_30d.value), s: `${f.orders_expected_30d.count} regular customers` }] })
</script>
