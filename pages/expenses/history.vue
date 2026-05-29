<template>
  <div class="space-y-6">
    <UiPageHeader title="Expense History" subtitle="All submitted expenses across all branches"
                  :breadcrumb="['Expenses', 'History']">
      <template #actions>
        <NuxtLink to="/expenses/create" class="btn-gold text-xs">+ New Expense</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-48"
             placeholder="Search voucher #, person…" />
      <select v-model="statusFilter" class="field-input w-auto text-xs py-1.5" @change="page=1;refresh()">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button @click="search='';statusFilter='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto flex items-center gap-2">
        <span class="text-xs text-gray-500">
          Total: <span class="font-bold text-gray-200">৳{{ totalAmount.toLocaleString() }}</span>
        </span>
      </div>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Expenses</p>
        <p class="text-xl font-bold text-gray-100">৳{{ totalAmount.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Approved</p>
        <p class="text-xl font-bold text-emerald-400">৳{{ approvedAmount.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Pending</p>
        <p class="text-xl font-bold text-yellow-400">{{ pendingCount }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Records</p>
        <p class="text-xl font-bold text-gray-200">{{ data?.total ?? 0 }}</p>
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="glass-card p-5">
      <UiDataTable :columns="cols" :rows="rows" :per-page="perPage" search-placeholder="">
        <template #cell-voucher_number="{ value }">
          <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
        </template>
        <template #cell-total_amount="{ value }">
          <span class="font-mono text-xs font-bold text-gray-200">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <NuxtLink :to="`/expenses/${row.id}`" class="btn-ghost text-xs py-1 px-2">View</NuxtLink>
        </template>
      </UiDataTable>
    </div>

    <!-- Pagination -->
    <div v-if="(data?.total ?? 0) > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil((data?.total ?? 0) / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1 px-3" :class="page<=1?'opacity-40':''">← Prev</button>
        <button :disabled="page >= Math.ceil((data?.total??0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1 px-3">Next →</button>
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

const { data, pending, error, refresh } = await useFetch('/api/expenses', {
  query: computed(() => ({
    search: search.value,
    status: statusFilter.value,
    page:   page.value,
    per:    perPage,
  })),
})

const rows = computed(() => (data.value?.expenses ?? []).map((e: any) => ({
  ...e,
  category: e.category_name,
  submittedBy: e.created_by_name,
})))

const totalAmount    = computed(() => rows.value.reduce((s: number, e: any) => s + Number(e.total_amount), 0))
const approvedAmount = computed(() => rows.value.filter((e: any) => e.status === 'approved').reduce((s: number, e: any) => s + Number(e.total_amount), 0))
const pendingCount   = computed(() => rows.value.filter((e: any) => e.status === 'pending').length)

const cols = [
  { key: 'voucher_number',   label: 'Expense #',    sortable: true },
  { key: 'expense_date',     label: 'Date',         sortable: true },
  { key: 'category',         label: 'Category',     sortable: true },
  { key: 'total_amount',     label: 'Amount',       sortable: true },
  { key: 'handled_by_person', label: 'Handled By' },
  { key: 'payment_method',   label: 'Method' },
  { key: 'status',           label: 'Status' },
]
</script>
