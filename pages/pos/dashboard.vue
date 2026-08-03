<template>
  <div class="space-y-6">
    <UiPageHeader title="POS Dashboard" subtitle="Month-to-date summary across the counter" :breadcrumb="['POS', 'Dashboard']">
      <template #actions>
        <NuxtLink to="/pos" class="btn-gold text-xs py-2">🖥️ Open Terminal</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pendingApprovals > 0" class="rounded-xl p-3 text-xs text-orange-300 flex items-center justify-between"
         style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);">
      <span>⏳ {{ pendingApprovals }} POS exit release(s) awaiting approval</span>
      <NuxtLink to="/pos/pending-approvals" class="underline">Review →</NuxtLink>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Orders</p><p class="text-lg font-bold text-gray-200 mt-1">{{ mtd.order_count ?? 0 }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Revenue</p><p class="text-lg font-bold text-gold-400 mt-1">৳{{ Number(mtd.revenue ?? 0).toLocaleString() }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Cash</p><p class="text-lg font-bold text-emerald-400 mt-1">৳{{ Number(mtd.cash_total ?? 0).toLocaleString() }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Credit</p><p class="text-lg font-bold text-orange-400 mt-1">৳{{ Number(mtd.credit_total ?? 0).toLocaleString() }}</p></div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Today's Orders</p><p class="text-lg font-bold text-gray-200 mt-1">{{ today.order_count ?? 0 }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Today's Revenue</p><p class="text-lg font-bold text-gold-400 mt-1">৳{{ Number(today.revenue ?? 0).toLocaleString() }}</p></div>
    </div>

    <div class="flex flex-wrap gap-3">
      <NuxtLink to="/pos/today" class="btn-ghost text-xs">Today's Orders</NuxtLink>
      <NuxtLink to="/pos/reports" class="btn-ghost text-xs">Reports</NuxtLink>
      <NuxtLink to="/pos/eod" class="btn-ghost text-xs">End of Day</NuxtLink>
      <NuxtLink to="/pos/pending-approvals" class="btn-ghost text-xs">Pending Approvals</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { data } = await useFetch('/api/pos/dashboard')
const mtd   = computed<any>(() => (data.value as any)?.mtd ?? {})
const today = computed<any>(() => (data.value as any)?.today ?? {})
const pendingApprovals = computed<number>(() => (data.value as any)?.pending_approvals ?? 0)
</script>
