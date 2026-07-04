<template>
  <div class="space-y-6">
    <UiPageHeader title="Customer Ledger" subtitle="Running debit · credit · balance per customer" :breadcrumb="['Credit Sales','Customer Ledger']" />

    <!-- Filters -->
    <div class="flex gap-3 flex-wrap">
      <select v-model="selectedCustomerId" class="input-glass w-64">
        <option value="">All Customers</option>
        <option v-for="c in customerList" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <input type="date" v-model="dateFrom" class="input-glass w-40" />
      <input type="date" v-model="dateTo"   class="input-glass w-40" />
      <button @click="applyFilter" class="btn-ghost text-xs">Filter</button>
      <button v-if="perms.canDo('credit_sales', 'ledger', 'export')" @click="exportLedger" class="btn-gold text-xs">Export</button>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-4">
        <div class="glass-card p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Total Debit</p>
          <p class="text-xl font-bold text-red-400">৳{{ Number(totalDebit).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Total Credit</p>
          <p class="text-xl font-bold text-emerald-400">৳{{ Number(totalCredit).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Balance (Due)</p>
          <p class="text-xl font-bold text-gold-400">৳{{ Number(balance).toLocaleString() }}</p>
        </div>
      </div>

      <UiDataTable :columns="cols" :rows="ledger" :per-page="15" exportable search-placeholder="Search transactions…">
        <template #cell-date="{ value }"><span class="text-gray-300 text-xs whitespace-nowrap">{{ fmtDate(value) }}</span></template>
        <template #cell-debit="{ value }"><span class="text-red-400 font-mono text-xs">{{ Number(value) > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-credit="{ value }"><span class="text-emerald-400 font-mono text-xs">{{ Number(value) > 0 ? '৳'+Number(value).toLocaleString() : '—' }}</span></template>
        <template #cell-balance="{ value }"><span class="font-bold text-gold-400 font-mono text-xs">৳{{ Number(value).toLocaleString() }}</span></template>
      </UiDataTable>
    </template>
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
definePageMeta({ layout: 'default' })

const selectedCustomerId = ref('')
const dateFrom = ref('')
const dateTo   = ref('')

// Applied filter state — only changes when "Filter" is clicked
const appliedCustomerId = ref('')
const appliedFrom       = ref('')
const appliedTo         = ref('')

const queryParams = computed(() => ({
  customer_id: appliedCustomerId.value || undefined,
  date_from:   appliedFrom.value       || undefined,
  date_to:     appliedTo.value         || undefined,
}))

const { data, pending, error, refresh } = await useFetch('/api/credit-sales/ledger', {
  query: queryParams,
})

const ledger       = computed(() => (data.value?.ledger      ?? []) as any[])
const customerList = computed(() => (data.value?.customers   ?? []) as any[])
const totalDebit   = computed(() =>  data.value?.totalDebit  ?? 0)
const totalCredit  = computed(() =>  data.value?.totalCredit ?? 0)
const balance      = computed(() =>  data.value?.balance     ?? 0)

// transaction_date is a plain DATE column with no time-of-day. mysql2 hands
// it back as midnight-UTC ("2026-07-04T00:00:00.000Z"), which the DataTable's
// fallback rendered raw. Read the Y-M-D digits directly — no Date/timezone
// conversion — so the calendar day never shifts for any viewer.
function fmtDate(v: string | null): string {
  if (!v) return '—'
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return String(v)
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function applyFilter() {
  appliedCustomerId.value = selectedCustomerId.value
  appliedFrom.value       = dateFrom.value
  appliedTo.value         = dateTo.value
  refresh()
}

function exportLedger() {
  // Trigger CSV export via browser download — basic implementation
  const rows = ledger.value.map((r: any) =>
    [fmtDate(r.date), r.type, r.ref, r.description, r.debit, r.credit, r.balance].join(',')
  )
  const csv  = ['Date,Type,Reference,Description,Debit,Credit,Balance', ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'ledger.csv'; a.click()
  URL.revokeObjectURL(url)
}

const cols = [
  { key: 'date',        label: 'Date',        sortable: true },
  { key: 'type',        label: 'Type',        sortable: true },
  { key: 'ref',         label: 'Reference' },
  { key: 'description', label: 'Description' },
  { key: 'debit',       label: 'Debit (৳)' },
  { key: 'credit',      label: 'Credit (৳)' },
  { key: 'balance',     label: 'Balance (৳)', sortable: true },
]
</script>
