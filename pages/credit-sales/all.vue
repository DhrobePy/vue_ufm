<template>
  <div class="space-y-6">
    <UiPageHeader title="All Sales" subtitle="Complete credit order history" :breadcrumb="['Credit Sales','All Sales']">
      <template #actions>
        <NuxtLink to="/credit-sales/create" class="btn-gold text-xs">+ New Order</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Status filter chips -->
    <div class="flex items-center gap-2 flex-wrap">
      <button v-for="f in statusFilters" :key="f.value"
        @click="activeFilter = f.value; page = 1; refresh()"
        :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border',
                 activeFilter === f.value
                   ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
                   : 'text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]']">
        {{ f.label }}
        <span v-if="f.count !== undefined" class="ml-1 opacity-60">{{ f.count }}</span>
      </button>
    </div>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search order #, customer…" @keydown.enter="page = 1; refresh()" />
      <select v-model="priorityFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()">
        <option value="">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
      </select>
      <button @click="search='';priorityFilter='';activeFilter='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto flex items-center gap-3 text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> orders
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="glass-card p-8 flex items-center justify-center">
      <div class="skeleton h-4 w-48 rounded" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">
      ⚠ Failed to load orders — {{ error.message }}
    </div>

    <UiDataTable v-else
      :columns="cols"
      :rows="rows"
      exportable
      :per-page="perPage"
      :external-total="data?.total ?? 0"
      search-placeholder=""
      @row-click="r => navigateTo(`/credit-sales/${r.id}`)"
    >
      <template #cell-order_number="{ value }">
        <span class="font-mono text-xs text-gold-400/90 font-semibold">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <UiStatusBadge :status="value" />
      </template>
      <template #cell-total_amount="{ value }">
        <span class="font-semibold text-gray-200 font-mono text-xs">৳{{ Number(value).toLocaleString() }}</span>
      </template>
      <template #cell-balance_due="{ value }">
        <span class="font-mono text-xs" :class="Number(value) > 0 ? 'text-red-400' : 'text-emerald-400'">
          ৳{{ Number(value).toLocaleString() }}
        </span>
      </template>
      <template #cell-priority="{ value }">
        <span :class="['text-xs font-medium',
          value === 'urgent' ? 'text-red-400' :
          value === 'high'   ? 'text-orange-400' : 'text-gray-500']">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <NuxtLink :to="`/credit-sales/${row.id}`" class="btn-ghost text-xs py-1 px-2.5">View</NuxtLink>
      </template>
    </UiDataTable>

    <!-- Pagination -->
    <div v-if="(data?.total ?? 0) > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil((data?.total ?? 0) / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1 px-3" :class="page<=1 ? 'opacity-40' : ''">← Prev</button>
        <button :disabled="page >= Math.ceil((data?.total ?? 0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1 px-3">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search        = ref('')
const activeFilter  = ref('')
const priorityFilter = ref('')
const page          = ref(1)
const perPage       = 20

const { data, pending, error, refresh } = await useFetch('/api/credit-sales', {
  query: computed(() => ({
    search: search.value,
    status: activeFilter.value,
    page:   page.value,
    per:    perPage,
  })),
})

const rows = computed(() => (data.value?.orders ?? []).map((o: any) => ({
  ...o,
  customer: o.customer_name,
  date:     o.order_date,
})))

const statusFilters = [
  { value: '',                 label: 'All' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'escalated',        label: 'Escalated' },
  { value: 'approved',         label: 'Approved' },
  { value: 'in_production',    label: 'In Production' },
  { value: 'ready_to_ship',    label: 'Ready to Ship' },
  { value: 'dispatched',       label: 'Dispatched' },
  { value: 'delivered',        label: 'Delivered' },
  { value: 'completed',        label: 'Completed' },
  { value: 'cancelled',        label: 'Cancelled' },
]

const cols = [
  { key: 'order_number', label: 'Order #',  sortable: true },
  { key: 'customer',     label: 'Customer', sortable: true },
  { key: 'order_date',   label: 'Date',     sortable: true },
  { key: 'total_amount', label: 'Total',    sortable: true },
  { key: 'balance_due',  label: 'Balance' },
  { key: 'priority',     label: 'Priority' },
  { key: 'status',       label: 'Status' },
]
</script>
