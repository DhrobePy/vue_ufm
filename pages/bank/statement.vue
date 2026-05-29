<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank Statement" subtitle="View and export transaction history per account"
                  :breadcrumb="['Bank', 'Statement']">
      <template #actions>
        <button @click="printStatement" class="btn-ghost text-xs">🖨 Print</button>
        <button @click="exportCsv" class="btn-gold text-xs">⬇ Export CSV</button>
      </template>
    </UiPageHeader>

    <!-- Account selector + filter -->
    <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
      <select v-model="filters.account" class="field-input text-xs py-1.5 min-w-[220px]" @change="applyFilters">
        <option value="">— All Accounts —</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">
          {{ a.bank_name }} — {{ a.account_name }}
        </option>
      </select>
      <input v-model="filters.from" type="date" class="field-input text-xs py-1.5" @change="applyFilters" />
      <span class="text-gray-600">→</span>
      <input v-model="filters.to" type="date" class="field-input text-xs py-1.5" @change="applyFilters" />
      <select v-model="filters.type" class="field-input text-xs py-1.5" @change="applyFilters">
        <option value="">All Types</option>
        <option value="credit">Credits (In)</option>
        <option value="debit">Debits (Out)</option>
      </select>
      <button @click="resetFilters" class="btn-ghost text-xs py-1.5">Reset</button>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Account summary KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Opening Balance</p>
          <p class="text-xl font-bold text-gray-100">
            ৳{{ Number(selectedAccount?.balance || 0).toLocaleString() }}
          </p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Credits</p>
          <p class="text-xl font-bold text-emerald-400">৳{{ Number(txData?.totalCredits || 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Debits</p>
          <p class="text-xl font-bold text-red-400">৳{{ Number(txData?.totalDebits || 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Net</p>
          <p class="text-xl font-bold text-gold-400">
            ৳{{ (Number(txData?.totalCredits || 0) - Number(txData?.totalDebits || 0)).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Statement table -->
      <div id="statement-print" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="section-title">
              {{ selectedAccount ? `${selectedAccount.bank_name} — ${selectedAccount.account_name}` : 'All Accounts' }}
            </h3>
            <p v-if="selectedAccount" class="text-xs text-gray-500 mt-0.5">
              AC: {{ selectedAccount.account_number }}
            </p>
          </div>
          <div class="text-right text-xs text-gray-500">
            <p>{{ appliedFilters.from || 'All dates' }} — {{ appliedFilters.to || 'present' }}</p>
            <p class="font-mono">{{ (txData?.total || 0) }} transactions</p>
          </div>
        </div>

        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Ref. No.</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th>
              <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-if="!transactions.length">
              <td colspan="7" class="py-6 text-center text-gray-600">No transactions found</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-white/[0.02]">
              <td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">{{ String(tx.transaction_date).slice(0, 10) }}</td>
              <td class="py-2.5 px-3 text-gray-300">{{ tx.description }}</td>
              <td class="py-2.5 px-3 text-gray-600 font-mono text-[11px]">{{ tx.reference_number || '—' }}</td>
              <td class="py-2.5 px-3 text-gray-500 text-[11px] whitespace-nowrap">{{ tx.bank_name }}</td>
              <td class="py-2.5 px-3 text-right text-emerald-400 font-mono">
                {{ tx.entry_type === 'credit' ? `৳${Number(tx.amount).toLocaleString()}` : '—' }}
              </td>
              <td class="py-2.5 px-3 text-right text-red-400 font-mono">
                {{ tx.entry_type === 'debit' ? `৳${Number(tx.amount).toLocaleString()}` : '—' }}
              </td>
              <td class="py-2.5 px-3 text-center"><UiStatusBadge :status="tx.status" /></td>
            </tr>
          </tbody>
          <tfoot v-if="transactions.length" class="border-t-2 border-white/10">
            <tr>
              <td colspan="4" class="pt-3 px-3 text-gray-600 font-semibold">Totals</td>
              <td class="pt-3 px-3 text-right font-bold text-emerald-400 font-mono">
                ৳{{ Number(txData?.totalCredits || 0).toLocaleString() }}
              </td>
              <td class="pt-3 px-3 text-right font-bold text-red-400 font-mono">
                ৳{{ Number(txData?.totalDebits || 0).toLocaleString() }}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <!-- Pagination -->
        <div v-if="(txData?.total || 0) > perPage" class="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Page {{ page }} of {{ Math.ceil((txData?.total || 0) / perPage) }}</span>
          <div class="flex gap-2">
            <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1 px-3" :class="page<=1?'opacity-40':''">← Prev</button>
            <button :disabled="page >= Math.ceil((txData?.total||0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1 px-3">Next →</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route  = useRoute()
const page   = ref(1)
const perPage = 50

const today       = new Date().toISOString().slice(0, 10)
const monthStart  = today.slice(0, 7) + '-01'

// Applied filters (only change when user presses filter)
const appliedFilters = reactive({
  account: route.query.account ? Number(route.query.account) : ('' as any),
  from:    monthStart,
  to:      today,
  type:    '',
})

// Pending (editable) filters
const filters = reactive({ ...appliedFilters })

function applyFilters() {
  Object.assign(appliedFilters, filters)
  page.value = 1
  refresh()
}

function resetFilters() {
  Object.assign(filters, { account: '', from: monthStart, to: today, type: '' })
  applyFilters()
}

// Fetch accounts list
const { data: acctData } = await useFetch('/api/bank/dashboard')
const accounts = computed(() => (acctData.value?.accounts ?? []) as any[])

const selectedAccount = computed(() =>
  appliedFilters.account
    ? accounts.value.find((a: any) => a.id === Number(appliedFilters.account)) ?? null
    : null,
)

// Fetch transactions
const { data: txData, pending, error, refresh } = await useFetch('/api/bank/transactions', {
  query: computed(() => ({
    account: appliedFilters.account || undefined,
    from:    appliedFilters.from    || undefined,
    to:      appliedFilters.to      || undefined,
    type:    appliedFilters.type    || undefined,
    page:    page.value,
    per:     perPage,
  })),
})

const transactions = computed(() => (txData.value?.transactions ?? []) as any[])

function printStatement() {
  window.print()
}

function exportCsv() {
  const rows = transactions.value
  if (!rows.length) return
  const headers = ['Date', 'Description', 'Reference', 'Account', 'Credit', 'Debit', 'Status']
  const lines = rows.map((tx: any) => [
    String(tx.transaction_date).slice(0, 10),
    `"${tx.description}"`,
    tx.reference_number || '',
    tx.bank_name,
    tx.entry_type === 'credit' ? tx.amount : '',
    tx.entry_type === 'debit'  ? tx.amount : '',
    tx.status,
  ].join(','))
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bank-statement-${today}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
