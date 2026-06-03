<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank Statement" subtitle="View and export transaction history per account"
                  :breadcrumb="['Bank', 'Statement']">
      <template #actions>
        <button @click="printStatement" class="btn-ghost text-xs">🖨 Print</button>
        <button @click="exportCsv" class="btn-gold text-xs">⬇ Export CSV</button>
      </template>
    </UiPageHeader>

    <!-- Source toggle + Account selector + filters -->
    <div class="glass-card p-4 flex flex-wrap gap-3 items-center">

      <!-- Source tabs: Bank Module ↔ GL Ledger -->
      <div class="flex rounded-xl overflow-hidden border border-white/[0.08]">
        <button @click="setSource('bank')"
          :class="['px-3 py-1.5 text-xs font-semibold transition-all',
            source === 'bank' ? 'bg-gold-500/15 text-gold-300' : 'text-gray-500 hover:text-gray-300']">
          🏦 Bank Module
        </button>
        <button @click="setSource('gl')"
          :class="['px-3 py-1.5 text-xs font-semibold transition-all border-l border-white/[0.08]',
            source === 'gl' ? 'bg-blue-500/15 text-blue-300' : 'text-gray-500 hover:text-gray-300']">
          📒 GL Ledger
        </button>
      </div>

      <!-- Account selector changes based on source -->
      <select v-model="filters.account" class="field-input text-xs py-1.5 min-w-[240px]" @change="applyFilters">
        <option value="">— {{ source === 'bank' ? 'All Bank Accounts' : 'Select GL Account' }} —</option>
        <template v-if="source === 'bank'">
          <option v-for="a in bankModuleAccounts" :key="a.id" :value="a.id">
            {{ a.bank_name }} — {{ a.account_name }}
          </option>
        </template>
        <template v-else>
          <option v-for="a in glBankAccounts" :key="a.id" :value="a.id">
            {{ a.bank_name }} — {{ a.account_name }} ({{ a.account_number }})
          </option>
        </template>
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

    <!-- GL source info pill -->
    <div v-if="source === 'gl'" class="text-xs text-blue-400/70 px-1 -mt-2">
      📒 Showing all journal-entry lines posted to this account's GL ledger — includes expense payments, customer advance receipts, transfers, and manual entries.
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <template v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Opening Balance</p>
          <p class="text-xl font-bold text-gray-100">
            ৳{{ Number(selectedAccountBalance).toLocaleString() }}
          </p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Credits (In)</p>
          <p class="text-xl font-bold text-emerald-400">৳{{ Number(txData?.totalCredits || 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Debits (Out)</p>
          <p class="text-xl font-bold text-red-400">৳{{ Number(txData?.totalDebits || 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Net Movement</p>
          <p class="text-xl font-bold text-gold-400">
            ৳{{ (Number(txData?.totalCredits || 0) - Number(txData?.totalDebits || 0)).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Statement table -->
      <div id="statement-print" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="section-title">{{ accountLabel }}</h3>
            <p v-if="accountSubtitle" class="text-xs text-gray-500 mt-0.5">{{ accountSubtitle }}</p>
          </div>
          <div class="text-right text-xs text-gray-500">
            <p>{{ appliedFilters.from || 'All dates' }} → {{ appliedFilters.to || 'present' }}</p>
            <p class="font-mono">{{ (txData?.total || 0) }} entries</p>
          </div>
        </div>

        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Ref / JE</th>
              <th v-if="source === 'gl'" class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Source</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit (In)</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit (Out)</th>
              <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-if="!transactions.length">
              <td :colspan="source === 'gl' ? 7 : 6" class="py-6 text-center text-gray-600">No transactions found</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.id"
                class="hover:bg-white/[0.02]"
                :class="tx.is_reversed ? 'opacity-40' : ''">
              <td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">{{ String(tx.transaction_date).slice(0, 10) }}</td>
              <td class="py-2.5 px-3 text-gray-300">
                {{ tx.description }}
                <span v-if="tx.line_description && tx.line_description !== tx.description"
                      class="text-gray-600 text-[10px] block">{{ tx.line_description }}</span>
              </td>
              <td class="py-2.5 px-3 font-mono text-[11px]">
                <template v-if="source === 'gl'">
                  <NuxtLink to="/accounts/journal" class="text-blue-400 hover:text-blue-300 transition-colors">
                    JE-{{ tx.journal_entry_id }}
                  </NuxtLink>
                </template>
                <template v-else>
                  <span class="text-gray-600">{{ tx.reference_number || '—' }}</span>
                </template>
              </td>
              <td v-if="source === 'gl'" class="py-2.5 px-3 text-[11px]">
                <span :class="sourceColor(tx.source)" class="px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {{ sourceLabel(tx.source) }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-right text-emerald-400 font-mono">
                {{ tx.entry_type === 'credit' ? `৳${Number(tx.amount).toLocaleString()}` : '—' }}
              </td>
              <td class="py-2.5 px-3 text-right text-red-400 font-mono">
                {{ tx.entry_type === 'debit' ? `৳${Number(tx.amount).toLocaleString()}` : '—' }}
              </td>
              <td class="py-2.5 px-3 text-center">
                <UiStatusBadge :status="tx.status" />
              </td>
            </tr>
          </tbody>
          <tfoot v-if="transactions.length" class="border-t-2 border-white/10">
            <tr>
              <td :colspan="source === 'gl' ? 4 : 4" class="pt-3 px-3 text-gray-600 font-semibold">Totals</td>
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

const route   = useRoute()
const page    = ref(1)
const perPage = 50

const today      = new Date().toISOString().slice(0, 10)
const monthStart = today.slice(0, 7) + '-01'

// ── Source: 'bank' = bank_transactions table, 'gl' = journal transaction_lines ──
const source = ref<'bank' | 'gl'>('bank')

function setSource(s: 'bank' | 'gl') {
  source.value = s
  filters.account = ''
  Object.assign(appliedFilters, { account: '', from: monthStart, to: today, type: '' })
  Object.assign(filters, appliedFilters)
  page.value = 1
}

// Applied filters
const appliedFilters = reactive({
  account: route.query.account ? Number(route.query.account) : ('' as any),
  from:    monthStart,
  to:      today,
  type:    '',
})
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

// ── Account lists ────────────────────────────────────────────────────────────
// Bank module accounts (bank_tx_accounts)
const { data: acctData } = await useFetch('/api/bank/dashboard')
const bankModuleAccounts = computed(() => (acctData.value?.accounts ?? []) as any[])

// GL-linked bank accounts (bank_accounts with chart_of_account_id)
const { data: glAcctData } = await useFetch('/api/bank-accounts')
const glBankAccounts = computed(() =>
  ((glAcctData.value?.accounts ?? []) as any[]).filter((a: any) => a.chart_of_account_id),
)

// Selected account metadata for display
const selectedBankAccount = computed(() =>
  appliedFilters.account
    ? bankModuleAccounts.value.find((a: any) => a.id === Number(appliedFilters.account)) ?? null
    : null,
)
const selectedGlAccount = computed(() =>
  appliedFilters.account
    ? glBankAccounts.value.find((a: any) => a.id === Number(appliedFilters.account)) ?? null
    : null,
)
const selectedAccountBalance = computed(() => {
  if (source.value === 'bank') return selectedBankAccount.value?.balance ?? 0
  return 0 // GL doesn't have a running balance concept here
})
const accountLabel = computed(() => {
  if (source.value === 'bank') {
    const a = selectedBankAccount.value
    return a ? `${a.bank_name} — ${a.account_name}` : 'All Bank Accounts'
  }
  const a = selectedGlAccount.value
  return a ? `${a.bank_name} — ${a.account_name}` : 'GL Ledger — Select an account'
})
const accountSubtitle = computed(() => {
  if (source.value === 'bank') return selectedBankAccount.value?.account_number ?? ''
  const a = selectedGlAccount.value
  return a ? `A/C: ${a.account_number}` : ''
})

// ── Fetch transactions (switches endpoint based on source) ───────────────────
const apiUrl = computed(() =>
  source.value === 'gl' ? '/api/bank/gl-ledger' : '/api/bank/transactions',
)
const apiQuery = computed(() => ({
  account: appliedFilters.account || undefined,
  from:    appliedFilters.from    || undefined,
  to:      appliedFilters.to      || undefined,
  type:    appliedFilters.type    || undefined,
  page:    page.value,
  per:     perPage,
}))

const { data: txData, pending, error: fetchError, refresh } = await useFetch(apiUrl, {
  query: apiQuery,
})

const transactions = computed(() => (txData.value?.transactions ?? []) as any[])

// ── Source badge helpers ─────────────────────────────────────────────────────
function sourceLabel(s: string) {
  const map: Record<string, string> = {
    ExpenseVoucher:   'Expense',
    CustomerPayment:  'Payment',
    GeneralTransaction: 'General',
    ManualReversal:   'Reversal',
  }
  return map[s] ?? s ?? 'Journal'
}
function sourceColor(s: string) {
  const map: Record<string, string> = {
    ExpenseVoucher:   'bg-orange-500/10 text-orange-400',
    CustomerPayment:  'bg-emerald-500/10 text-emerald-400',
    ManualReversal:   'bg-red-500/10 text-red-400',
    GeneralTransaction: 'bg-gray-500/10 text-gray-400',
  }
  return map[s] ?? 'bg-gray-500/10 text-gray-400'
}

// ── Export ───────────────────────────────────────────────────────────────────
function printStatement() { window.print() }

function exportCsv() {
  const rows = transactions.value
  if (!rows.length) return
  const headers = ['Date', 'Description', 'Reference', 'Source', 'Credit', 'Debit', 'Status']
  const lines = rows.map((tx: any) => [
    String(tx.transaction_date).slice(0, 10),
    `"${(tx.description ?? '').replace(/"/g, '""')}"`,
    tx.reference_number || (tx.journal_entry_id ? `JE-${tx.journal_entry_id}` : ''),
    tx.source ?? tx.bank_name ?? '',
    tx.entry_type === 'credit' ? tx.amount : '',
    tx.entry_type === 'debit'  ? tx.amount : '',
    tx.status,
  ].join(','))
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bank-statement-${source.value}-${today}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
