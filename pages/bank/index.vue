<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank" subtitle="Maker-checker bank transactions · transfers · statements" :breadcrumb="['Bank']">
      <template #actions>
        <NuxtLink to="/bank/transfer" class="btn-ghost text-xs">Transfer</NuxtLink>
        <NuxtLink to="/bank/transaction/create" class="btn-gold text-xs">+ New Transaction</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Balance</p>
          <p class="text-2xl font-bold text-teal-400">৳{{ fmtLakh(stats.total_balance ?? 0) }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Pending Approval</p>
          <p class="text-2xl font-bold text-yellow-400">{{ stats.pending_count ?? 0 }}</p>
          <p class="text-xs text-gray-600">৳{{ fmtLakh(stats.pending_amount ?? 0) }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Deposits Today</p>
          <p class="text-2xl font-bold text-emerald-400">৳{{ fmtLakh(stats.deposits_today ?? 0) }}</p>
        </div>
        <div class="glass-card p-4 text-center space-y-1">
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Withdrawals</p>
          <p class="text-2xl font-bold text-orange-400">৳{{ fmtLakh(stats.withdrawals_today ?? 0) }}</p>
        </div>
      </div>

      <!-- Account cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(acc, i) in accounts" :key="acc.id"
             class="glass-card-hover p-5 space-y-3 relative overflow-hidden">
          <div class="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
               :style="`background:radial-gradient(circle,${COLORS[i % COLORS.length]},transparent)`" />
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">{{ acc.bank_name }}</p>
              <p class="text-sm font-semibold text-gray-200">{{ acc.account_name }}</p>
            </div>
            <UiStatusBadge :status="acc.status" />
          </div>
          <p class="text-xs text-gray-600 font-mono">{{ acc.account_number }}</p>
          <p class="text-2xl font-bold" :style="`color:${COLORS[i % COLORS.length]}`">
            ৳{{ Number(acc.balance || 0).toLocaleString() }}
          </p>
          <div class="flex gap-2 pt-1">
            <NuxtLink to="/bank/transaction/create" class="btn-ghost text-[11px] py-1 px-2.5 flex-1 justify-center">+ Transaction</NuxtLink>
          </div>
        </div>
      </div>

      <!-- ── GL Account Statements quick-access ───────────────────────────── -->
      <div v-if="glAccounts.length" class="glass-card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-300">📒 GL Account Statements</h3>
          <NuxtLink to="/bank/statement" class="text-xs text-blue-400/70 hover:text-blue-300">Open Statement →</NuxtLink>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="acc in glAccounts" :key="acc.id"
            :to="`/bank/statement?account=${acc.id}`"
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
                   hover:bg-white/[0.08] hover:border-white/[0.12] transition-all text-xs group">
            <span class="text-base">🏦</span>
            <div>
              <p class="font-semibold text-gray-200 group-hover:text-white transition-colors">{{ acc.bank_name }}</p>
              <p class="text-gray-600 font-mono text-[10px]">{{ acc.account_name }}</p>
            </div>
            <span class="ml-2 text-blue-400/50 group-hover:text-blue-400 transition-colors text-[11px]">→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Pending transactions -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Pending Transactions</h2>
          <span class="text-xs text-yellow-400 font-medium">Awaiting approval</span>
        </div>
        <UiDataTable :columns="cols" :rows="pendingRows" :per-page="8" search-placeholder="Search transactions…">
          <template #cell-transaction_number="{ value }">
            <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
          </template>
          <template #cell-amount="{ value }">
            <span class="font-semibold font-mono text-xs text-gray-200">৳{{ Number(value).toLocaleString() }}</span>
          </template>
          <template #cell-entry_type="{ value }">
            <span :class="['badge text-[10px]', value==='credit'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20']">
              {{ value }}
            </span>
          </template>
          <template #actions="{ row }">
            <div class="flex gap-1.5">
              <button @click="doAction(row, 'approve')"
                      :disabled="acting === row.id"
                      class="btn-gold text-xs py-1 px-2.5">
                {{ acting === row.id ? '…' : 'Approve' }}
              </button>
              <button @click="doAction(row, 'reject')"
                      :disabled="acting === row.id"
                      class="btn-ghost text-xs py-1 px-2.5 border-red-500/20 text-red-400 hover:bg-red-500/10">
                Reject
              </button>
            </div>
          </template>
        </UiDataTable>
        <div v-if="!pendingRows.length" class="text-xs text-center text-gray-600 py-4">No pending transactions</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#0ea5e9']

const { data, pending, error, refresh } = await useFetch('/api/bank/dashboard')

const accounts    = computed(() => (data.value?.accounts    ?? []) as any[])
const stats       = computed(() => (data.value?.stats       ?? {}) as any)
const pendingRows = computed(() => (data.value?.pendingTxns ?? []) as any[])

// GL-linked bank accounts — for the unified statement routing
const { data: glAcctData } = await useFetch('/api/bank-accounts')
const glAccounts = computed(() =>
  ((glAcctData.value as any)?.accounts ?? []).filter((a: any) => a.chart_of_account_id),
)

function fmtLakh(n: number) {
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(2) + 'Cr'
  if (n >= 100_000)    return (n / 100_000).toFixed(1) + 'L'
  if (n >= 1_000)      return (n / 1_000).toFixed(0) + 'K'
  return n.toLocaleString()
}

const acting = ref<number | null>(null)

async function doAction(row: any, action: 'approve' | 'reject') {
  acting.value = row.id
  try {
    await $fetch(`/api/bank/transactions/${row.id}`, {
      method: 'PATCH',
      body: { action },
    })
    success(`Transaction ${action}d ✓`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? `Failed to ${action} transaction`)
  } finally {
    acting.value = null
  }
}

const cols = [
  { key: 'transaction_number', label: 'Txn #',    sortable: true },
  { key: 'transaction_date',   label: 'Date',      sortable: true },
  { key: 'bank_name',          label: 'Account',   sortable: true },
  { key: 'entry_type',   label: 'Type' },
  { key: 'amount',             label: 'Amount',    sortable: true },
  { key: 'description',        label: 'Description' },
]
</script>
