<template>
  <div class="space-y-6">
    <UiPageHeader title="Fleet Purchases" subtitle="Parts & supplies procurement" :breadcrumb="['Fleet','Purchases']">
      <template #actions>
        <NuxtLink to="/fleet/purchases/create" class="btn-gold text-xs">+ New Purchase</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 cursor-pointer" :class="activeFilter === 'all' ? 'ring-1 ring-gold-400/40' : ''" @click="activeFilter = 'all'">
        <p class="text-xs text-gray-500">Total POs</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">{{ stats.total || 0 }}</p>
        <p class="text-xs text-gray-600 mt-1">৳{{ fmt(stats.total_value) }}</p>
      </div>
      <div class="glass-card p-4 cursor-pointer" :class="activeFilter === 'pending' ? 'ring-1 ring-amber-400/40' : ''" @click="activeFilter = 'pending'">
        <p class="text-xs text-gray-500">Pending</p>
        <p class="text-2xl font-bold text-amber-400 mt-1">{{ stats.pending || 0 }}</p>
      </div>
      <div class="glass-card p-4 cursor-pointer" :class="activeFilter === 'approved' ? 'ring-1 ring-blue-400/40' : ''" @click="activeFilter = 'approved'">
        <p class="text-xs text-gray-500">Approved</p>
        <p class="text-2xl font-bold text-blue-400 mt-1">{{ stats.approved || 0 }}</p>
      </div>
      <div class="glass-card p-4 cursor-pointer" :class="activeFilter === 'received' ? 'ring-1 ring-emerald-400/40' : ''" @click="activeFilter = 'received'">
        <p class="text-xs text-gray-500">Received</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">{{ stats.received || 0 }}</p>
        <p class="text-xs text-gray-600 mt-1">৳{{ fmt(stats.total_paid) }} paid</p>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card overflow-hidden">
      <div v-if="!filteredPurchases.length" class="text-center py-12 text-gray-600 text-sm">
        No purchase orders found.
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.07]">
            <th class="px-4 py-3 text-left text-gray-500">PO Number</th>
            <th class="px-4 py-3 text-left text-gray-500">Date</th>
            <th class="px-4 py-3 text-left text-gray-500">Supplier</th>
            <th class="px-4 py-3 text-right text-gray-500">Items</th>
            <th class="px-4 py-3 text-right text-gray-500">Total ৳</th>
            <th class="px-4 py-3 text-right text-gray-500">Paid ৳</th>
            <th class="px-4 py-3 text-left text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="po in filteredPurchases" :key="po.id"
            class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer"
            @click="$router.push(`/fleet/purchases/${po.id}`)">
            <td class="px-4 py-3 font-mono font-bold text-gold-400/80">{{ po.po_number }}</td>
            <td class="px-4 py-3 text-gray-400">{{ po.purchase_date }}</td>
            <td class="px-4 py-3 text-gray-300">{{ po.supplier_name || '—' }}</td>
            <td class="px-4 py-3 text-right text-gray-400">{{ po.item_count }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-200">৳{{ fmt(po.total_amount) }}</td>
            <td class="px-4 py-3 text-right text-emerald-400">৳{{ fmt(po.paid_amount) }}</td>
            <td class="px-4 py-3">
              <UiStatusBadge :status="po.status" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const activeFilter = ref('all')

const { data } = await useFetch('/api/fleet/purchases')
const purchases = computed(() => (data.value as any)?.purchases ?? [])
const stats     = computed(() => (data.value as any)?.stats     ?? {})

const filteredPurchases = computed(() => {
  if (activeFilter.value === 'all') return purchases.value
  return (purchases.value as any[]).filter((p: any) => p.status === activeFilter.value)
})

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }
</script>
