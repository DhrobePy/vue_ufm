<template>
  <div class="space-y-6">

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading customer…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader
        :title="c.name"
        :subtitle="`${c.customer_type || 'Customer'} · ${c.city || c.branch_name || '—'}`"
        :breadcrumb="['Customers', c.name]"
      >
        <template #actions>
          <NuxtLink :to="`/customers/${route.params.id}/edit`" class="btn-ghost text-xs">Edit</NuxtLink>
          <NuxtLink to="/credit-sales/create" class="btn-gold text-xs">+ New Order</NuxtLink>
        </template>
      </UiPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile sidebar -->
        <div class="space-y-5">
          <div class="glass-card p-5 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shrink-0"
                   style="background:linear-gradient(135deg,#f59e0b,#d97706)">{{ (c.name || '?')[0] }}</div>
              <div class="min-w-0">
                <h2 class="font-semibold text-gray-100 leading-tight">{{ c.name }}</h2>
                <p v-if="c.business_name" class="text-xs text-gray-500 mt-0.5">{{ c.business_name }}</p>
                <UiStatusBadge :status="c.status" />
              </div>
            </div>
            <div class="space-y-2.5 text-xs">
              <div class="flex gap-2">
                <span class="text-gray-600 w-24 shrink-0">Type</span>
                <UiStatusBadge :status="c.customer_type || 'credit'" />
              </div>
              <div class="flex gap-2">
                <span class="text-gray-600 w-24 shrink-0">Phone</span>
                <span class="text-gray-300">{{ c.phone_number || c.mobile || '—' }}</span>
              </div>
              <div v-if="c.email" class="flex gap-2">
                <span class="text-gray-600 w-24 shrink-0">Email</span>
                <span class="text-gray-300 truncate">{{ c.email }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-gray-600 w-24 shrink-0">City</span>
                <span class="text-gray-300">{{ c.city || '—' }}</span>
              </div>
              <div v-if="c.address" class="flex gap-2">
                <span class="text-gray-600 w-24 shrink-0">Address</span>
                <span class="text-gray-400 leading-relaxed">{{ c.address }}</span>
              </div>
              <div v-if="c.created_at" class="flex gap-2">
                <span class="text-gray-600 w-24 shrink-0">Customer Since</span>
                <span class="text-gray-400">{{ String(c.created_at).slice(0, 10) }}</span>
              </div>
            </div>
          </div>

          <!-- Credit summary (credit customers only) -->
          <div v-if="c.customer_type === 'credit'" class="glass-card p-5 space-y-3">
            <h3 class="section-title">Credit Summary</h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-600">Limit</span>
                <span class="font-semibold text-gray-200">৳{{ Number(c.credit_limit || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Outstanding</span>
                <span class="font-bold text-red-400">৳{{ Number(c.current_balance || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Available</span>
                <span class="font-semibold text-emerald-400">৳{{ available.toLocaleString() }}</span>
              </div>
              <div v-if="c.payment_terms" class="flex justify-between">
                <span class="text-gray-600">Terms</span>
                <span class="text-gray-300">{{ c.payment_terms }} days</span>
              </div>
            </div>
            <div class="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="`width:${creditPct}%;background:${creditPct > 80 ? '#ef4444' : '#10b981'}`" />
            </div>
            <p class="text-[10px] text-right text-gray-600">{{ creditPct }}% utilised</p>
          </div>
        </div>

        <!-- Main content -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Recent orders -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="section-title">Recent Orders</h3>
              <NuxtLink to="/credit-sales/all" class="text-xs text-gold-400 hover:text-gold-300">All →</NuxtLink>
            </div>
            <UiDataTable :columns="orderCols" :rows="recentOrders" :per-page="5" search-placeholder="">
              <template #cell-order_number="{ value }">
                <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
              </template>
              <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
              <template #cell-total_amount="{ value }">
                <span class="font-mono text-xs font-bold text-gray-200">৳{{ Number(value).toLocaleString() }}</span>
              </template>
              <template #actions="{ row }">
                <NuxtLink :to="`/credit-sales/${row.id}`" class="btn-ghost text-xs py-1 px-2">View</NuxtLink>
              </template>
            </UiDataTable>
          </div>

          <!-- Recent payments ledger -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="section-title">Recent Payments</h3>
              <NuxtLink to="/credit-sales/payments" class="text-xs text-gold-400 hover:text-gold-300">All payments →</NuxtLink>
            </div>
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Method</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Amount</th>
                  <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="pmt in recentPayments" :key="pmt.id" class="hover:bg-white/[0.02]">
                  <td class="py-2.5 px-3 text-gray-500 font-mono">{{ pmt.payment_date }}</td>
                  <td class="py-2.5 px-3 text-gray-400 font-mono text-[11px]">{{ pmt.reference_number || '—' }}</td>
                  <td class="py-2.5 px-3 text-gray-400">{{ pmt.payment_method || '—' }}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-emerald-400">৳{{ Number(pmt.amount).toLocaleString() }}</td>
                  <td class="py-2.5 px-3 text-center"><UiStatusBadge :status="pmt.allocation_status || 'cleared'" /></td>
                </tr>
                <tr v-if="!recentPayments.length">
                  <td colspan="5" class="py-6 text-center text-gray-600 text-xs">No payments recorded</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()

const { data, pending, error } = await useFetch(
  () => `/api/customers/${route.params.id}`,
)

const c              = computed(() => (data.value?.customer      ?? {}) as any)
const recentOrders   = computed(() => (data.value?.recentOrders  ?? []) as any[])
const recentPayments = computed(() => (data.value?.recentPayments ?? []) as any[])

const creditPct = computed(() => {
  const limit   = Number(c.value.credit_limit   ?? 0)
  const balance = Number(c.value.current_balance ?? 0)
  if (!limit) return 0
  return Math.min(100, Math.round((balance / limit) * 100))
})

const available = computed(() =>
  Math.max(0, Number(c.value.credit_limit ?? 0) - Number(c.value.current_balance ?? 0))
)

const orderCols = [
  { key: 'order_number', label: 'Order #',  sortable: true },
  { key: 'order_date',   label: 'Date',     sortable: true },
  { key: 'total_amount', label: 'Amount',   sortable: true },
  { key: 'status',       label: 'Status' },
]
</script>
