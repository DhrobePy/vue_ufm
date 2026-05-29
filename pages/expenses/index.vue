<template>
  <div class="space-y-6">
    <UiPageHeader title="Expenses" subtitle="Voucher creation · approval · categorisation" :breadcrumb="['Expenses']">
      <template #actions><NuxtLink to="/expenses/create" class="btn-gold text-xs">+ New Expense</NuxtLink></template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Pending Approval</p>
          <p class="text-2xl font-bold text-yellow-400">{{ stats.pending ?? 0 }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">This Month</p>
          <p class="text-2xl font-bold text-orange-400">৳{{ fmtLakh(stats.this_month_total ?? 0) }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Approved Today</p>
          <p class="text-2xl font-bold text-emerald-400">{{ stats.approved_today ?? 0 }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Top Category</p>
          <p class="text-xl font-bold text-blue-400 truncate">{{ stats.top_category ?? '—' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title">Pending Approval</h2>
            <NuxtLink to="/expenses/approve" class="text-xs text-gold-500 hover:text-gold-400 font-medium">View all →</NuxtLink>
          </div>
          <div class="space-y-2">
            <div v-for="e in pendingList" :key="e.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black shrink-0"
                   style="background:linear-gradient(135deg,#f59e0b,#d97706);">
                {{ (e.category_name || 'E')[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-200 truncate">{{ e.remarks || e.category_name }}</p>
                <p class="text-xs text-gray-500">{{ e.category_name }} · {{ String(e.expense_date).slice(0, 10) }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-bold text-gold-400">৳{{ Number(e.total_amount).toLocaleString() }}</p>
                <UiStatusBadge :status="e.status" />
              </div>
            </div>
            <div v-if="!pendingList.length" class="text-xs text-center text-gray-600 py-4">No pending expenses</div>
          </div>
        </div>

        <div class="glass-card p-5">
          <h2 class="section-title mb-4">Expense by Category</h2>
          <div class="space-y-3">
            <PaymentBar v-for="cat in categoryBreakdown" :key="cat.label" :label="cat.label" :pct="cat.pct" :value="cat.value" :color="cat.color" />
            <div v-if="!categoryBreakdown.length" class="text-xs text-center text-gray-600 py-4">No category data</div>
          </div>
        </div>
      </div>

      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Expense History</h2>
        <UiDataTable :columns="cols" :rows="tableRows" :per-page="10" exportable search-placeholder="Search expenses…">
          <template #cell-voucher_number="{ value }"><span class="font-mono text-xs text-gold-400/80">{{ value }}</span></template>
          <template #cell-total_amount="{ value }"><span class="font-semibold font-mono text-xs text-gray-200">৳{{ Number(value).toLocaleString() }}</span></template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #actions="{ row }">
            <NuxtLink :to="`/expenses/${row.id}`" class="btn-ghost text-xs py-1 px-2">View</NuxtLink>
          </template>
        </UiDataTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, pending, error } = await useFetch('/api/expenses/dashboard')

const stats            = computed(() => (data.value?.stats            ?? {}) as any)
const pendingList      = computed(() => (data.value?.pendingList      ?? []) as any[])
const categoryBreakdown = computed(() => (data.value?.categoryBreakdown ?? []) as any[])
const tableRows        = computed(() => (data.value?.expenses         ?? []) as any[])

function fmtLakh(n: number) {
  if (n >= 100_000) return (n / 100_000).toFixed(1) + 'L'
  if (n >= 1_000)   return (n / 1_000).toFixed(0) + 'K'
  return n.toLocaleString()
}

const cols = [
  { key: 'voucher_number', label: 'Voucher #',   sortable: true },
  { key: 'expense_date',   label: 'Date',         sortable: true },
  { key: 'category_name',  label: 'Category',     sortable: true },
  { key: 'remarks',        label: 'Description' },
  { key: 'total_amount',   label: 'Amount',       sortable: true },
  { key: 'payment_method', label: 'Method' },
  { key: 'status',         label: 'Status' },
]
</script>
