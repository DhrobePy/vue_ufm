<template>
  <div class="space-y-6">
    <UiPageHeader title="Expense Vouchers" subtitle="Create, track and manage all expense vouchers"
                  :breadcrumb="['Expenses', 'Vouchers']">
      <template #actions>
        <NuxtLink to="/expenses/create" class="btn-gold text-xs">+ New Voucher</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- ── Stats Cards ─────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in statCards" :key="card.label"
           class="glass-card p-4 flex flex-col gap-1">
        <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold">{{ card.label }}</div>
        <div :class="['text-2xl font-black font-mono', card.color]">{{ card.value }}</div>
        <div v-if="card.sub" class="text-xs text-gray-600">{{ card.sub }}</div>
      </div>
    </div>

    <!-- ── Filter Bar ──────────────────────────────────────── -->
    <div class="glass-card p-4">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="space-y-1">
          <label class="text-xs text-gray-500 font-semibold uppercase tracking-wider">From</label>
          <input v-model="filters.dateFrom" type="date" class="input-glass text-xs" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-gray-500 font-semibold uppercase tracking-wider">To</label>
          <input v-model="filters.dateTo" type="date" class="input-glass text-xs" />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</label>
          <select v-model="filters.status" class="input-glass text-xs">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Branch</label>
          <select v-model="filters.branchId" class="input-glass text-xs">
            <option value="">All Branches</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Category</label>
          <select v-model="filters.categoryId" class="input-glass text-xs">
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Search</label>
          <input v-model="filters.search" type="search" class="input-glass text-xs" placeholder="Voucher # / remarks…" />
        </div>
      </div>
      <div class="mt-3 flex justify-end gap-2">
        <button @click="resetFilters" class="btn-ghost text-xs py-1.5 px-3">Reset</button>
        <button @click="applyFilters" class="btn-gold text-xs py-1.5 px-4">Apply Filters</button>
      </div>
    </div>

    <!-- ── Table ───────────────────────────────────────────── -->
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="glass-card p-5">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/5">
              <th class="th-cell">Voucher #</th>
              <th class="th-cell">Date</th>
              <th class="th-cell">Category</th>
              <th class="th-cell">Description</th>
              <th class="th-cell text-right">Amount</th>
              <th class="th-cell">Method</th>
              <th class="th-cell">Branch</th>
              <th class="th-cell">Status</th>
              <th class="th-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length">
              <td colspan="9" class="py-10 text-center text-gray-600">No expense vouchers found</td>
            </tr>
            <tr v-for="row in rows" :key="row.id"
                class="border-b border-white/4 hover:bg-white/2 transition-colors">
              <td class="td-cell font-mono text-gold-400/80">{{ row.voucher_number }}</td>
              <td class="td-cell text-gray-400">{{ String(row.expense_date).slice(0,10) }}</td>
              <td class="td-cell text-gray-300">{{ row.category_name }}</td>
              <td class="td-cell max-w-48 truncate text-gray-400" :title="row.remarks">{{ row.remarks }}</td>
              <td class="td-cell text-right font-mono font-bold text-red-400">৳{{ Number(row.total_amount).toLocaleString() }}</td>
              <td class="td-cell text-gray-500">{{ row.payment_method }}</td>
              <td class="td-cell text-gray-500">{{ row.branch_name ?? '—' }}</td>
              <td class="td-cell">
                <UiStatusBadge :status="row.status" />
              </td>
              <td class="td-cell">
                <div class="flex gap-1.5">
                  <NuxtLink :to="`/expenses/${row.id}`" class="btn-ghost text-xs py-1 px-2">View</NuxtLink>
                  <NuxtLink :to="`/expenses/${row.id}/voucher`" class="btn-ghost text-xs py-1 px-2">Print</NuxtLink>
                  <button v-if="row.status === 'pending'"
                    @click="confirmDelete(row)"
                    :disabled="deletingId === row.id"
                    class="text-xs py-1 px-2 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40">
                    {{ deletingId === row.id ? '…' : 'Del' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {{ rows.length }} of {{ total }} vouchers</span>
        <div class="flex gap-2">
          <button @click="page--" :disabled="page <= 1"
            class="btn-ghost text-xs py-1 px-3 disabled:opacity-30">← Prev</button>
          <span class="px-3 py-1 rounded-lg bg-white/5 font-semibold text-gray-300">{{ page }} / {{ totalPages }}</span>
          <button @click="page++" :disabled="page >= totalPages"
            class="btn-ghost text-xs py-1 px-3 disabled:opacity-30">Next →</button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4"
         style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);">
      <div class="glass-card max-w-sm w-full p-6 space-y-4" @click.stop>
        <h3 class="text-base font-bold text-red-400">Delete Expense Voucher</h3>
        <p class="text-sm text-gray-400">
          Delete <span class="font-mono text-white">{{ deleteTarget.voucher_number }}</span>?
          This action cannot be undone.
        </p>
        <p class="text-xs text-gray-500">
          Amount: <span class="font-bold text-red-400">৳{{ Number(deleteTarget.total_amount).toLocaleString() }}</span>
        </p>
        <div class="flex gap-3 justify-end">
          <button @click="deleteTarget = null" class="btn-ghost text-xs">Cancel</button>
          <button @click="doDelete" :disabled="deletingId === deleteTarget?.id"
            class="text-xs px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors disabled:opacity-50">
            {{ deletingId === deleteTarget?.id ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// ── Filters state ───────────────────────────────────────────────
const filters = reactive({
  dateFrom:   '',
  dateTo:     '',
  status:     '',
  branchId:   '' as string | number,
  categoryId: '' as string | number,
  search:     '',
})

const page    = ref(1)
const perPage = 25

// ── Active query (applied on button click) ───────────────────────
const activeFilters = ref({ ...filters })

const query = computed(() => ({
  page:        page.value,
  per:         perPage,
  search:      activeFilters.value.search    || undefined,
  status:      activeFilters.value.status    || undefined,
  branch_id:   activeFilters.value.branchId  || undefined,
  category_id: activeFilters.value.categoryId || undefined,
  date_from:   activeFilters.value.dateFrom  || undefined,
  date_to:     activeFilters.value.dateTo    || undefined,
}))

const { data, pending, error, refresh } = await useFetch('/api/expenses', { query })

const rows  = computed(() => (data.value?.expenses ?? []) as any[])
const total = computed(() => Number(data.value?.total ?? 0))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
const statsRaw = computed(() => data.value?.stats ?? {} as any)

// ── Stats cards ─────────────────────────────────────────────────
const statCards = computed(() => [
  {
    label: 'Total Vouchers',
    value: statsRaw.value.totalCount?.toLocaleString() ?? '0',
    color: 'text-gray-200',
    sub:   '',
  },
  {
    label: 'Pending',
    value: statsRaw.value.pendingCount?.toLocaleString() ?? '0',
    color: 'text-yellow-400',
    sub:   statsRaw.value.pendingAmount
           ? `৳${Number(statsRaw.value.pendingAmount).toLocaleString()}`
           : '',
  },
  {
    label: 'Approved',
    value: statsRaw.value.approvedCount?.toLocaleString() ?? '0',
    color: 'text-green-400',
    sub:   '',
  },
  {
    label: 'Approved Amount',
    value: '৳' + Number(statsRaw.value.approvedAmount ?? 0).toLocaleString(),
    color: 'text-gold-400',
    sub:   'Total approved spend',
  },
])

// ── Reference data ──────────────────────────────────────────────
const [{ data: branchData }, { data: catData }] = await Promise.all([
  useFetch('/api/branches'),
  useFetch('/api/expenses/categories', { query: { spend: false } }),
])
const branches   = computed(() => (branchData.value?.branches   ?? []) as any[])
const categories = computed(() => (catData.value?.categories    ?? []) as any[])

// ── Filter actions ───────────────────────────────────────────────
function applyFilters() {
  page.value = 1
  activeFilters.value = { ...filters }
}
function resetFilters() {
  Object.assign(filters, {
    dateFrom: '', dateTo: '', status: '',
    branchId: '', categoryId: '', search: '',
  })
  applyFilters()
}

watch(page, () => refresh())

// ── Delete ───────────────────────────────────────────────────────
const deleteTarget = ref<any>(null)
const deletingId   = ref<number | null>(null)

function confirmDelete(row: any) {
  deleteTarget.value = row
}

async function doDelete() {
  if (!deleteTarget.value) return
  deletingId.value = deleteTarget.value.id
  try {
    await $fetch(`/api/expenses/${deleteTarget.value.id}`, { method: 'DELETE' })
    success(`${deleteTarget.value.voucher_number} deleted`)
    deleteTarget.value = null
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Delete failed')
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.th-cell { @apply py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider; }
.td-cell { @apply py-2.5 px-3; }
</style>
