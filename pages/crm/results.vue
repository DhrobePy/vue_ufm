<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="CRM — Results" subtitle="Are the calls, promises and prospect work paying off?" :breadcrumb="['CRM', 'Results']" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else-if="o">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="k in tiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono text-gray-100">{{ k.v }}</p><p class="text-[10px] text-gray-600">{{ k.s }}</p></div>
      </div>
      <p v-if="!o.contacts.total_180d" class="glass-card p-4 text-xs text-amber-300/90">No calls, visits or messages have been logged yet, so there is nothing to measure. Each time someone contacts a customer and logs it (Log a contact, or Message on a customer card), this page starts counting how many ordered or paid within 14 days.</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass-card p-4 space-y-1"><h2 class="section-title">Contacts → orders and payments <span class="text-gray-600 font-normal">(within 14 days, last 180 days)</span></h2>
          <p class="text-[11px] text-gray-500">For comparison, {{ o.contacts.baseline_order_rate ?? '—' }}% of all buying customers ordered in the last 14 days anyway — a contact is only worth credit for what it adds above that.</p>
          <table class="w-full text-xs mt-2"><thead><tr class="text-[10px] uppercase text-gray-500"><th class="py-1 text-left">By channel</th><th class="text-right">Contacts</th><th class="text-right">Ordered</th><th class="text-right">Paid</th></tr></thead>
            <tbody><tr v-for="g in o.contacts.by_channel" :key="g.key" class="border-t border-white/[0.04]"><td class="py-1 text-gray-300">{{ g.key }}</td><td class="text-right">{{ g.contacts }}</td><td class="text-right">{{ g.order_rate ?? '—' }}%</td><td class="text-right">{{ g.pay_rate ?? '—' }}%</td></tr></tbody></table>
          <table class="w-full text-xs mt-3"><thead><tr class="text-[10px] uppercase text-gray-500"><th class="py-1 text-left">By state when contacted</th><th class="text-right">Contacts</th><th class="text-right">Ordered</th><th class="text-right">Paid</th></tr></thead>
            <tbody><tr v-for="g in o.contacts.by_label" :key="g.key" class="border-t border-white/[0.04]"><td class="py-1 text-gray-300">{{ g.key }}</td><td class="text-right">{{ g.contacts }}</td><td class="text-right">{{ g.order_rate ?? '—' }}%</td><td class="text-right">{{ g.pay_rate ?? '—' }}%</td></tr></tbody></table>
          <p class="text-[10px] text-gray-600">Only contacts at least 14 days old are counted, so every one has had the full 14 days.</p>
        </div>
        <div class="glass-card p-4 space-y-1"><h2 class="section-title">Promises to pay</h2>
          <p class="text-xs text-gray-400">A promise counts as kept when at least 80% of the amount arrived by the promised date + 3 days.</p>
          <div v-for="p in o.promises.recent" :key="p.customer_id + p.due" class="flex items-center gap-2 text-xs py-1 border-b border-white/[0.04]"><span :class="p.kept ? 'text-emerald-400' : 'text-red-400'">{{ p.kept ? '✓' : '✗' }}</span><NuxtLink :to="`/crm/customers/${p.customer_id}`" class="text-gold-400 hover:underline flex-1">{{ p.name }}</NuxtLink><span class="text-gray-500">due {{ p.due }}</span><span class="font-mono">৳{{ n0(p.paid) }} / {{ n0(p.amount) }}</span></div>
          <p v-if="!o.promises.recent.length" class="text-xs text-gray-600">No promise has reached its due date yet. Log one with “promised ৳” on a customer card.</p>
          <h2 class="section-title pt-3">Tasks</h2>
          <p class="text-xs text-gray-300">{{ o.tasks.done }} done<template v-if="o.tasks.on_time_rate != null"> ({{ o.tasks.on_time_rate }}% on time)</template> · {{ o.tasks.open }} open · <span :class="o.tasks.overdue ? 'text-red-400' : ''">{{ o.tasks.overdue }} overdue</span></p>
        </div>
      </div>

      <div class="glass-card p-4 space-y-2"><h2 class="section-title">New customers (prospects)</h2>
        <p class="text-xs text-gray-300">{{ o.prospects.total }} prospects · {{ o.prospects.won }} won · {{ o.prospects.lost }} lost<template v-if="o.prospects.win_rate != null"> · win rate {{ o.prospects.win_rate }}%</template><template v-if="o.prospects.median_days_to_first_order != null"> · typical {{ o.prospects.median_days_to_first_order }} days from first listing to first order</template></p>
        <p v-if="o.prospects.avg_fit_won != null && o.prospects.avg_fit_lost != null" class="text-xs" :class="o.prospects.avg_fit_won > o.prospects.avg_fit_lost ? 'text-emerald-400' : 'text-amber-300'">Average fit score: won {{ o.prospects.avg_fit_won }} vs lost {{ o.prospects.avg_fit_lost }} — {{ o.prospects.avg_fit_won > o.prospects.avg_fit_lost ? 'a higher score has gone with winning, as it should' : 'the score is not separating winners yet; treat it with caution' }}.</p>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div><p class="text-[10px] uppercase text-gray-500 mb-1">By source</p><div v-for="g in o.prospects.by_source" :key="g.key" class="flex border-t border-white/[0.04] py-1"><span class="flex-1 text-gray-300">{{ g.key }}</span><span class="text-gray-500">{{ g.n }} · {{ g.win_rate ?? '—' }}% won</span></div></div>
          <div><p class="text-[10px] uppercase text-gray-500 mb-1">By business type</p><div v-for="g in o.prospects.by_segment" :key="g.key" class="flex border-t border-white/[0.04] py-1"><span class="flex-1 text-gray-300">{{ g.key }}</span><span class="text-gray-500">{{ g.n }} · {{ g.win_rate ?? '—' }}% won</span></div></div>
          <div><p class="text-[10px] uppercase text-gray-500 mb-1">Why we lost</p><div v-for="g in o.prospects.lost_reasons" :key="g.reason" class="flex border-t border-white/[0.04] py-1"><span class="flex-1 text-gray-300">{{ g.reason }}</span><span class="text-gray-500">{{ g.n }}</span></div><p v-if="!o.prospects.lost_reasons.length" class="text-gray-600">None recorded yet.</p></div>
        </div>
      </div>

      <div v-if="o.messages.available" class="glass-card p-4"><h2 class="section-title">Messages (last 30 days)</h2>
        <p class="text-xs text-gray-300">{{ o.messages.sent_30d }} sent · {{ o.messages.failed_30d }} failed · {{ o.messages.replies_30d }} replies<template v-if="o.messages.reply_rate != null"> ({{ o.messages.reply_rate }}% of sent)</template> · {{ o.messages.opted_out }} numbers on the do-not-contact list</p></div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { data: o, pending } = await useFetch<any>('/api/crm/outcomes', { lazy: true })
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const tiles = computed(() => { const x = o.value; if (!x) return []; return [
  { l: 'Contacts that led to an order', v: x.contacts.order_rate != null ? x.contacts.order_rate + '%' : '—', s: `${x.contacts.ordered_14d} of ${x.contacts.matured} within 14 days` },
  { l: 'Contacts that led to a payment', v: x.contacts.pay_rate != null ? x.contacts.pay_rate + '%' : '—', s: `${x.contacts.paid_14d} of ${x.contacts.matured}` },
  { l: 'Promises kept', v: x.promises.kept_rate != null ? x.promises.kept_rate + '%' : '—', s: `${x.promises.kept} of ${x.promises.due_checked} due` },
  { l: 'Prospect win rate', v: x.prospects.win_rate != null ? x.prospects.win_rate + '%' : '—', s: `${x.prospects.won} won, ${x.prospects.lost} lost` }] })
</script>
