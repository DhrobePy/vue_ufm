<template>
  <div class="space-y-6">
    <UiPageHeader title="Today's POS Sales" subtitle="All counter transactions for today"
                  :breadcrumb="['POS', `Today's Sales`]">
      <template #actions>
        <NuxtLink to="/pos" class="btn-gold text-xs">🛒 Open POS</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Transactions</p>
        <p class="text-2xl font-bold text-gray-100">{{ stats.total_orders ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Revenue</p>
        <p class="text-2xl font-bold text-gold-400">৳{{ Number(stats.total_revenue ?? 0).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Cash</p>
        <p class="text-2xl font-bold text-emerald-400">৳{{ Number(stats.cash_total ?? 0).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Other Methods</p>
        <p class="text-2xl font-bold text-blue-400">৳{{ Number(stats.mobile_total ?? 0).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Transactions table -->
    <div class="glass-card p-5">
      <UiDataTable :columns="cols" :rows="orders" :per-page="15" search-placeholder="Search transactions…">
        <template #cell-order_number="{ value }">
          <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
        </template>
        <template #cell-total_amount="{ value }">
          <span class="font-mono text-xs font-bold text-gray-200">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-payment_method="{ value }">
          <span class="text-xs text-gray-400">{{ value }}</span>
        </template>
        <template #cell-order_status="{ value }">
          <UiStatusBadge :status="value?.toLowerCase()" />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-1.5">
            <button class="btn-ghost text-xs py-1 px-2">View</button>
            <button class="btn-ghost text-xs py-1 px-2">🖨</button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const cols = [
  { key: 'order_number',   label: 'Receipt #',  sortable: true },
  { key: 'order_date',     label: 'Time',        sortable: true },
  { key: 'customer_name',  label: 'Customer' },
  { key: 'item_count',     label: 'Items' },
  { key: 'payment_method', label: 'Method' },
  { key: 'total_amount',   label: 'Amount',      sortable: true },
  { key: 'order_status',   label: 'Status' },
]

const { data, pending } = await useFetch('/api/pos/today')

const orders = computed(() => (data.value as any)?.orders ?? [])
const stats  = computed(() => (data.value as any)?.stats  ?? {})
</script>
