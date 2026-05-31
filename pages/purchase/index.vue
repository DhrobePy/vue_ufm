<template>
  <div class="space-y-6">
    <UiPageHeader title="Purchase" subtitle="Procure-to-pay · Wheat procurement management" :breadcrumb="['Purchase']">
      <template #actions>
        <NuxtLink to="/purchase/orders/create" class="btn-gold text-xs">+ New PO</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Active POs"     :value="stats.active_pos ?? 0"                              trend="pending/approved"         trend-up  icon="file"   color="orange" />
      <KpiCard label="GRNs Pending"   :value="stats.grns_pending ?? 0"                            trend="Needs receipt"     :trend-up="false" icon="check" color="yellow" />
      <KpiCard label="Total Payable"  :value="`৳${fmtCr(stats.total_payable)}`"                  trend="Outstanding balance" :trend-up="false" icon="money" color="red" />
      <KpiCard label="Wheat Received" :value="`${Number(stats.wheat_received_mt ?? 0).toFixed(1)} MT`" trend="All time"   trend-up  icon="box"    color="teal" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Recent Purchase Orders</h2>
          <NuxtLink to="/purchase/orders" class="text-xs text-gold-500 hover:text-gold-400 font-medium">View all →</NuxtLink>
        </div>
        <UiDataTable :columns="poCols" :rows="recentPOs" :per-page="8" search-placeholder="Search POs…">
          <template #cell-po_number="{ value }"><span class="font-mono text-xs text-gold-400/80">{{ value }}</span></template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-payment_status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-value="{ value }"><span class="font-mono text-xs text-gray-300">৳{{ Number(value).toLocaleString() }}</span></template>
        </UiDataTable>
      </div>

      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Top Suppliers</h2>
          <NuxtLink to="/purchase/suppliers" class="text-xs text-gold-500 hover:text-gold-400 font-medium">View all →</NuxtLink>
        </div>
        <div class="space-y-3">
          <div v-for="s in topSuppliers" :key="s.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
            <div class="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">{{ (s.name ?? '?')[0] }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-200 truncate">{{ s.name }}</p>
              <p class="text-xs text-gray-500">{{ s.type }} · {{ s.orders }} orders</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-gold-400">৳{{ fmtCr(s.amount) }}</p>
              <UiStatusBadge :status="s.status" />
            </div>
          </div>
          <p v-if="!topSuppliers.length" class="text-xs text-gray-600 text-center py-4">No suppliers yet</p>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Quick Links</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/purchase/orders" class="btn-ghost text-xs">📋 Purchase Orders</NuxtLink>
        <NuxtLink to="/purchase/grn" class="btn-ghost text-xs">📦 GRN List</NuxtLink>
        <NuxtLink to="/purchase/grn/variance" class="btn-ghost text-xs">📊 Variance Report</NuxtLink>
        <NuxtLink to="/purchase/payments" class="btn-ghost text-xs">💳 Payments</NuxtLink>
        <NuxtLink to="/purchase/adjustments" class="btn-ghost text-xs">⚖ Adjustment Notes</NuxtLink>
        <NuxtLink to="/purchase/suppliers" class="btn-ghost text-xs">🏭 Suppliers</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const poCols = [
  { key: 'po_number',     label: 'PO #',    sortable: true },
  { key: 'supplier_name', label: 'Supplier', sortable: true },
  { key: 'qty_mt',        label: 'Qty (MT)' },
  { key: 'value',         label: 'Value (৳)' },
  { key: 'status',        label: 'Status' },
  { key: 'payment_status', label: 'Payment' },
]

const { data } = await useFetch('/api/purchase/dashboard')

const stats       = computed(() => (data.value as any)?.stats      ?? {})
const recentPOs   = computed(() => (data.value as any)?.recentPOs  ?? [])
const topSuppliers = computed(() => (data.value as any)?.topSuppliers ?? [])

function fmtCr(v: any) {
  const n = Number(v ?? 0)
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`
  return n.toLocaleString()
}
</script>
