<template>
  <div class="space-y-6">
    <UiPageHeader title="Customers" subtitle="Credit & POS customers — outstanding balances & limits"
                  :breadcrumb="['Customers']">
      <template #actions>
        <NuxtLink v-if="perms.canDo('customers', 'list', 'create')" to="/customers/create" class="btn-gold text-xs">+ Add Customer</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Customers"   :value="String(stats.total_customers ?? 0)"
               trend="registered" trend-up icon="users" color="blue" />
      <KpiCard label="Credit Customers"  :value="String(stats.credit_customers ?? 0)"
               trend="Active credit lines" trend-up icon="money" color="gold" />
      <KpiCard label="Total Outstanding" :value="fmtLakh(stats.total_outstanding)"
               trend="current balance" icon="chart" color="orange" />
      <KpiCard label="Blacklisted"       :value="String(stats.blacklisted ?? 0)"
               trend="Monitor" :trend-up="false" icon="users" color="red" />
    </div>

    <!-- Type filter -->
    <div class="flex gap-2">
      <button v-for="f in typeFilters" :key="f.value"
        @click="typeFilter = f.value; page = 1; refresh()"
        :class="['px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
          typeFilter === f.value
            ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
            : 'text-gray-500 border-white/[0.07] hover:text-gray-300']">
        {{ f.label }}
      </button>
    </div>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search by name, business, phone…" />
      <button @click="search='';typeFilter='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> customers
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <UiDataTable v-else
      :columns="cols"
      :rows="rows"
      :per-page="perPage"
      exportable
      search-placeholder=""
      @row-click="r => navigateTo(`/customers/${r.id}`)"
    >
      <template #cell-customer_type="{ value }">
        <UiStatusBadge :status="value" />
      </template>
      <template #cell-credit_limit="{ value }">
        <span class="font-mono text-xs text-gray-300">
          {{ Number(value) > 0 ? '৳' + Number(value).toLocaleString() : 'N/A' }}
        </span>
      </template>
      <template #cell-current_balance="{ value }">
        <span :class="['font-semibold font-mono text-xs', Number(value) > 0 ? 'text-red-400' : 'text-gray-500']">
          ৳{{ Number(value).toLocaleString() }}
        </span>
      </template>
      <template #cell-status="{ value }">
        <UiStatusBadge :status="value" />
      </template>
      <template #actions="{ row }">
        <div class="flex gap-1.5">
          <NuxtLink :to="`/customers/${row.id}`" class="btn-ghost text-xs py-1 px-2.5">View</NuxtLink>
          <button v-if="isAdminUser && perms.canDo('customers', 'list', 'delete')"
            @click.stop="confirmDelete(row)" :disabled="deletingId === row.id"
            class="btn-ghost text-xs py-1 px-2.5 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
            {{ deletingId === row.id ? '…' : 'Delete' }}
          </button>
        </div>
      </template>
    </UiDataTable>

    <!-- Pagination -->
    <div v-if="(data?.total ?? 0) > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil((data?.total ?? 0) / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1 px-3" :class="page<=1 ? 'opacity-40':''">← Prev</button>
        <button :disabled="page >= Math.ceil((data?.total??0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1 px-3">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const search     = ref('')
const typeFilter = ref('')
const page       = ref(1)
const perPage    = 30

const typeFilters = [
  { value: '',       label: 'All' },
  { value: 'credit', label: 'Credit' },
  { value: 'pos',    label: 'POS' },
]

const { data, pending, error, refresh } = await useFetch('/api/customers', {
  query: computed(() => ({
    search: search.value,
    type:   typeFilter.value,
    page:   page.value,
    per:    perPage,
  })),
})

const rows  = computed(() => (data.value?.customers ?? []) as any[])
const stats = computed(() => (data.value?.stats     ?? {}) as any)

function fmtLakh(val: any): string {
  const n = Number(val ?? 0)
  if (n >= 10_000_000) return '৳' + (n / 10_000_000).toFixed(1) + 'Cr'
  if (n >= 100_000)    return '৳' + (n / 100_000).toFixed(1) + 'L'
  return '৳' + n.toLocaleString()
}

const deletingId = ref<number | null>(null)

async function confirmDelete(row: any) {
  const label = row.business_name ? `${row.name} (${row.business_name})` : row.name
  if (!confirm(`Delete "${label}"? All their orders, payments, and ledger history are archived to the Recycle Bin and can be restored. Blocked if they have an outstanding balance.`)) return
  deletingId.value = row.id
  try {
    await $fetch(`/api/customers/${row.id}`, { method: 'DELETE' })
    success(`${label} deleted — recoverable from Recycle Bin`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete customer')
  } finally {
    deletingId.value = null
  }
}

const cols = [
  { key: 'name',            label: 'Name',         sortable: true },
  { key: 'business_name',   label: 'Business',     sortable: true },
  { key: 'phone_number',    label: 'Phone' },
  { key: 'customer_type',   label: 'Type' },
  { key: 'credit_limit',    label: 'Credit Limit' },
  { key: 'current_balance', label: 'Outstanding',  sortable: true },
  { key: 'status',          label: 'Status' },
]
</script>
