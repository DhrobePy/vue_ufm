<template>
  <div class="space-y-6">
    <UiPageHeader title="All Sales" subtitle="Complete credit order history" :breadcrumb="['Credit Sales','All Sales']">
      <template #actions>
        <NuxtLink v-if="perms.canDo('credit_sales', 'all', 'create')" to="/credit-sales/create" class="btn-gold text-xs">+ New Order</NuxtLink>
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
      <label class="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
        <input v-model="heldOnly" type="checkbox" class="accent-amber-500" />
        ⚠ Held only <span v-if="heldCount" class="text-amber-400 font-semibold">({{ heldCount }})</span>
      </label>
      <button @click="search='';priorityFilter='';activeFilter='';heldOnly=false;page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
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
      <template #cell-hold="{ row }">
        <div v-if="row.production_hold_active || row.dispatch_hold" class="flex flex-col gap-0.5 min-w-[140px]">
          <span v-if="row.production_hold_active"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit
                       bg-red-500/12 text-red-400 border border-red-500/25">
            ⛔ Production Hold
          </span>
          <span v-if="row.dispatch_hold && !row.dispatch_cleared"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit"
                :class="row.condition_met
                  ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'
                  : 'bg-amber-500/12 text-amber-400 border border-amber-500/25'">
            {{ row.condition_met ? '✓ Condition Met' : '🚫 Payment Hold' }}
          </span>
          <span v-else-if="row.dispatch_hold && row.dispatch_cleared"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit
                       bg-sky-500/12 text-sky-400 border border-sky-500/25">
            🟢 Cleared
          </span>
          <span v-if="row.dispatch_hold" class="text-[10px] text-gray-600 pl-0.5">{{ conditionLabel(row) }}</span>
        </div>
        <span v-else class="text-gray-700 text-xs">—</span>
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
const perms = usePermissions()
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

const heldOnly = ref(false)

const allRows = computed(() => (data.value?.orders ?? []).map((o: any) => ({
  ...o,
  customer: o.customer_name,
  date:     o.order_date,
})))

const rows = computed(() =>
  heldOnly.value
    ? allRows.value.filter((r: any) => r.production_hold_active || r.dispatch_hold)
    : allRows.value,
)

const heldCount = computed(() =>
  allRows.value.filter((r: any) => r.production_hold_active || r.dispatch_hold).length)

function conditionLabel(row: any): string {
  const amt = row.condition_amount != null ? ` ৳${Number(row.condition_amount).toLocaleString()}` : ''
  const map: Record<string, string> = {
    manual:                 'Manual clearance by accounts',
    outstanding_below:      `Old dues below${amt}`,
    outstanding_after_ship: Number(row.condition_amount) === 0 ? 'Pay everything first' : `Dues after ship ≤${amt}`,
    amount_received:        `Receive${amt} on this order`,
  }
  return map[row.condition_type] ?? 'Dispatch hold'
}

const statusFilters = [
  { value: '',                 label: 'All' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'escalated',        label: 'Escalated' },
  { value: 'approved',         label: 'Approved' },
  { value: 'in_production',    label: 'In Production' },
  { value: 'ready_to_ship',    label: 'Ready to Ship' },
  { value: 'goods_on_board',   label: 'Goods on Board' },
  { value: 'shipped',          label: 'Shipped' },
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
  { key: 'hold',         label: 'Hold / Condition' },
]
</script>
