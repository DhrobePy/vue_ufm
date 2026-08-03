<template>
  <div class="space-y-6">
    <UiPageHeader title="POS Reports" subtitle="Daily / weekly / monthly / custom-range sales" :breadcrumb="['POS', 'Reports']">
      <template #actions>
        <button @click="exportCsv" class="btn-ghost text-xs">⬇ CSV</button>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4 flex flex-wrap items-end gap-3">
      <div class="flex gap-2">
        <button v-for="r in ranges" :key="r.id" @click="range = r.id"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
            range === r.id ? 'bg-gold-500/15 border-gold-500/30 text-gold-400' : 'border-white/[0.07] text-gray-500 hover:text-gray-300']">
          {{ r.label }}
        </button>
      </div>
      <template v-if="range === 'custom'">
        <input v-model="dateFrom" type="date" class="input-glass text-xs py-1.5" />
        <input v-model="dateTo" type="date" class="input-glass text-xs py-1.5" />
      </template>
      <div class="space-y-1">
        <select v-model="branchId" class="input-glass text-xs py-1.5">
          <option value="">All Branches</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Orders</p><p class="text-lg font-bold text-gray-200 mt-1">{{ summary.order_count ?? 0 }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Revenue</p><p class="text-lg font-bold text-gold-400 mt-1">৳{{ Number(summary.total_revenue ?? 0).toLocaleString() }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Cash Collected</p><p class="text-lg font-bold text-emerald-400 mt-1">৳{{ Number(summary.cash_total ?? 0).toLocaleString() }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">On Credit</p><p class="text-lg font-bold text-orange-400 mt-1">৳{{ Number(summary.credit_total ?? 0).toLocaleString() }}</p></div>
    </div>

    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Orders</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Order #</th><th class="text-left pr-3">Date</th>
            <th class="text-left pr-3">Branch</th><th class="text-left pr-3">Customer</th>
            <th class="text-left pr-3">Method</th><th class="text-right pr-3">Total</th><th class="text-left pr-3">Status</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3"><NuxtLink :to="`/pos/${o.id}`" class="font-mono text-gold-400 hover:underline">{{ o.order_number }}</NuxtLink></td>
              <td class="pr-3 text-gray-400">{{ String(o.order_date).slice(0, 16).replace('T', ' ') }}</td>
              <td class="pr-3 text-gray-400">{{ o.branch_name }}</td>
              <td class="pr-3 text-gray-200">{{ o.customer_name }}</td>
              <td class="pr-3 text-gray-400">{{ o.payment_method }}</td>
              <td class="pr-3 text-right font-mono text-gray-200">৳{{ Number(o.total_amount).toLocaleString() }}</td>
              <td class="pr-3">
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold',
                  o.payment_status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : o.payment_status === 'Partial' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400']">
                  {{ o.payment_status }}
                </span>
              </td>
              <td class="text-right"><NuxtLink :to="`/pos/${o.id}`" class="btn-ghost text-[10px] py-1">Open</NuxtLink></td>
            </tr>
            <tr v-if="!orders.length"><td colspan="8" class="py-6 text-center text-gray-600">No orders in this period.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const range    = ref('daily')
const dateFrom = ref(new Date().toISOString().slice(0, 10))
const dateTo   = ref(new Date().toISOString().slice(0, 10))
const branchId = ref<string | number>('')

const ranges = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'Last 7 Days' },
  { id: 'monthly', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
]

const { data: branchData } = await useFetch('/api/branches')
const branches = computed<any[]>(() => (((branchData.value as any)?.branches ?? []) as any[]).filter(b => b.status === 'active'))

const { data } = await useFetch('/api/pos/reports', {
  query: computed(() => ({
    range: range.value,
    ...(range.value === 'custom' ? { date_from: dateFrom.value, date_to: dateTo.value } : {}),
    ...(branchId.value ? { branch_id: branchId.value } : {}),
  })),
})

const summary = computed<any>(() => (data.value as any)?.summary ?? {})
const orders  = computed<any[]>(() => (data.value as any)?.orders ?? [])

function exportCsv() {
  const rows: any[] = [
    ['Order #', 'Date', 'Branch', 'Customer', 'Method', 'Total', 'Cash', 'Credit', 'Status'],
    ...orders.value.map((o: any) => [o.order_number, String(o.order_date).slice(0, 19), o.branch_name, o.customer_name, o.payment_method, o.total_amount, o.cash_amount, o.credit_amount, o.payment_status]),
  ]
  const csv = rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `pos-report-${dateFrom.value}-${dateTo.value}.csv`
  a.click()
}
</script>
