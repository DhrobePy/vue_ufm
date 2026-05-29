<template>
  <div class="space-y-6">
    <UiPageHeader title="Debit Vouchers" subtitle="Payment vouchers authorised for disbursement"
                  :breadcrumb="['Accounts', 'Voucher']">
      <template #actions>
        <NuxtLink to="/accounts/voucher/create" class="btn-gold text-xs">+ New Voucher</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Today's Vouchers</p>
        <p class="text-2xl font-bold text-gray-100">{{ stats.today_count ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Today's Total</p>
        <p class="text-2xl font-bold text-red-400">৳{{ Number(stats.today_total ?? 0).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Pending Approval</p>
        <p class="text-2xl font-bold text-yellow-400">{{ stats.pending_count ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">This Month Total</p>
        <p class="text-2xl font-bold text-gray-200">৳{{ Number(stats.month_total ?? 0).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap gap-3">
      <input v-model.lazy="search" type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search voucher #, payee…" />
      <select v-model="statusFilter" class="input-glass w-auto text-xs py-1.5">
        <option value="">All Status</option>
        <option value="draft">Draft / Pending</option>
        <option value="approved">Approved</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button @click="search='';statusFilter=''" class="btn-ghost text-xs py-1.5">Reset</button>
    </div>

    <div class="glass-card p-5">
      <div v-if="pending" class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading vouchers…</div>
      <UiDataTable v-else :columns="cols" :rows="vouchers" :per-page="15" search-placeholder="">
        <template #cell-voucher_number="{ value }">
          <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
        </template>
        <template #cell-amount="{ value }">
          <span class="font-mono text-xs font-bold text-red-400">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-1.5">
            <button class="btn-ghost text-xs py-1 px-2">View</button>
            <button class="btn-ghost text-xs py-1 px-2">Print</button>
          </div>
        </template>
      </UiDataTable>
    </div>

    <!-- Pagination -->
    <div v-if="total > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil(total / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--" class="btn-ghost text-xs py-1 px-3" :class="page<=1?'opacity-40':''">← Prev</button>
        <button :disabled="page >= Math.ceil(total/perPage)" @click="page++" class="btn-ghost text-xs py-1 px-3">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search       = ref('')
const statusFilter = ref('')
const page         = ref(1)
const perPage      = 20

const cols = [
  { key: 'voucher_number', label: 'Voucher #',  sortable: true },
  { key: 'date',           label: 'Date',        sortable: true },
  { key: 'paid_to',        label: 'Pay To',      sortable: true },
  { key: 'purpose',        label: 'Purpose' },
  { key: 'payment_account', label: 'Method' },
  { key: 'amount',         label: 'Amount',      sortable: true },
  { key: 'status',         label: 'Status' },
]

const { data, pending } = await useFetch('/api/accounts/vouchers', {
  query: computed(() => ({
    search: search.value,
    status: statusFilter.value,
    page:   page.value,
    per:    perPage,
  })),
})

const vouchers = computed(() => (data.value as any)?.vouchers ?? [])
const stats    = computed(() => (data.value as any)?.stats    ?? {})
const total    = computed(() => (data.value as any)?.total    ?? 0)
</script>
