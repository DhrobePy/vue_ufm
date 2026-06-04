<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank Account Statement"
                  subtitle="Complete passbook — every GL-posted transaction with running balance"
                  :breadcrumb="['Bank', 'Statement']">
      <template #actions>
        <button @click="printStatement" class="btn-ghost text-xs">🖨 Print</button>
        <button @click="exportCsv"      class="btn-gold  text-xs">⬇ Export CSV</button>
      </template>
    </UiPageHeader>

    <!-- ── Filter bar ────────────────────────────────────────────────────────── -->
    <div class="glass-card p-4 flex flex-wrap gap-3 items-center">

      <select v-model="filters.account" class="field-input text-xs py-1.5 min-w-[260px]">
        <option value="">— Select Bank Account —</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">
          {{ a.bank_name }} — {{ a.account_name }}
          <template v-if="a.account_number"> ({{ a.account_number }})</template>
        </option>
      </select>

      <input v-model="filters.from" type="date" class="field-input text-xs py-1.5" />
      <span class="text-gray-600">→</span>
      <input v-model="filters.to"   type="date" class="field-input text-xs py-1.5" />

      <select v-model="filters.type" class="field-input text-xs py-1.5">
        <option value="">All Transactions</option>
        <option value="credit">Credits (Money In)</option>
        <option value="debit">Debits (Money Out)</option>
      </select>

      <button @click="applyFilters"  class="btn-gold  text-xs py-1.5 px-4">Apply</button>
      <button @click="resetFilters"  class="btn-ghost text-xs py-1.5">Reset</button>
    </div>

    <!-- ── No account placeholder ───────────────────────────────────────────── -->
    <div v-if="!applied.account"
         class="glass-card p-14 text-center text-gray-500 text-sm space-y-2">
      <div class="text-4xl">🏦</div>
      <p>Select a bank account above to view its complete statement</p>
      <p class="text-xs text-gray-600">All GL-posted transactions with running balance</p>
    </div>

    <!-- ── Loading / Error ──────────────────────────────────────────────────── -->
    <div v-else-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">
      ⚠ {{ fetchError.message }}
    </div>

    <!-- ── Statement body ───────────────────────────────────────────────────── -->
    <template v-else>

      <!-- ── Opening balance not configured warning ──────────────────────────── -->
      <div v-if="!data?.opening_balance_configured"
           class="glass-card border border-yellow-500/20 bg-yellow-500/[0.04] p-4 flex items-start gap-3">
        <span class="text-yellow-400 text-lg mt-0.5">⚠</span>
        <div class="flex-1 text-xs">
          <p class="text-yellow-300 font-semibold mb-0.5">Opening balance not configured for this account</p>
          <p class="text-yellow-400/70">
            Balances shown are net GL movement within this period only (starting from ৳0).
            To see accurate running balances, set the opening balance — the real-world bank balance
            at the point when GL tracking began for this account.
          </p>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">
            {{ data?.opening_balance_configured ? 'Opening Balance' : 'Opening Balance' }}
          </p>
          <p class="text-xl font-bold" :class="openingBalance >= 0 ? 'text-gray-100' : 'text-red-400'">
            ৳{{ openingBalance.toLocaleString() }}
          </p>
          <p class="text-[10px] mt-0.5"
             :class="data?.opening_balance_configured ? 'text-gray-600' : 'text-yellow-600'">
            {{ data?.opening_balance_configured
                ? `as of ${applied.from || 'account start'}`
                : '⚠ not configured — set to calibrate' }}
          </p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Credits (In)</p>
          <p class="text-xl font-bold text-emerald-400">৳{{ totalCredits.toLocaleString() }}</p>
          <p class="text-[10px] text-gray-600 mt-0.5">money received</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Debits (Out)</p>
          <p class="text-xl font-bold text-red-400">৳{{ totalDebits.toLocaleString() }}</p>
          <p class="text-[10px] text-gray-600 mt-0.5">money paid out</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Closing Balance</p>
          <p class="text-xl font-bold" :class="closingBalance >= 0 ? 'text-gold-400' : 'text-red-400'">
            ৳{{ closingBalance.toLocaleString() }}
          </p>
          <p class="text-[10px] mt-0.5"
             :class="data?.opening_balance_configured ? 'text-gray-600' : 'text-yellow-600'">
            {{ data?.opening_balance_configured
                ? `as of ${applied.to || 'today'}`
                : '⚠ net movement only' }}
          </p>
        </div>
      </div>

      <!-- Statement table -->
      <div id="statement-print" class="glass-card p-5">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="section-title">{{ accountLabel }}</h3>
            <p v-if="data?.bankAccount?.account_number" class="text-xs text-gray-500 mt-0.5">
              Account No: {{ data.bankAccount.account_number }}
            </p>
          </div>
          <div class="text-right text-xs text-gray-500 space-y-0.5">
            <p>{{ applied.from || 'All dates' }} → {{ applied.to || 'present' }}</p>
            <p class="font-mono">{{ filteredTxns.length }} entries</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs min-w-[680px]">
            <thead>
              <tr class="border-b border-white/[0.08]">
                <th class="pb-2.5 px-3 text-left   text-gray-600 font-semibold uppercase tracking-wider w-[100px]">Date</th>
                <th class="pb-2.5 px-3 text-left   text-gray-600 font-semibold uppercase tracking-wider">Description</th>
                <th class="pb-2.5 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider w-[90px]">Source</th>
                <th class="pb-2.5 px-3 text-left   text-gray-600 font-semibold uppercase tracking-wider w-[72px]">Ref</th>
                <th class="pb-2.5 px-3 text-right  text-red-400/70 font-semibold uppercase tracking-wider w-[120px]">Debit (Out)</th>
                <th class="pb-2.5 px-3 text-right  text-emerald-400/70 font-semibold uppercase tracking-wider w-[120px]">Credit (In)</th>
                <th class="pb-2.5 px-3 text-right  text-gray-400/70 font-semibold uppercase tracking-wider w-[130px]">Balance</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-white/[0.03]">

              <!-- Opening balance row — top (chronologically first) -->
              <tr class="bg-blue-500/[0.04] border-b border-blue-500/10">
                <td class="py-2 px-3 text-blue-400/60 font-mono text-[11px] whitespace-nowrap">
                  {{ applied.from || 'Account Start' }}
                </td>
                <td colspan="4" class="py-2 px-3 text-blue-400/70 font-medium">
                  ◆ Opening Balance
                </td>
                <td class="py-2 px-3" />
                <td class="py-2 px-3 text-right font-bold text-blue-300 font-mono">
                  ৳{{ openingBalance.toLocaleString() }}
                </td>
              </tr>

              <!-- No transactions -->
              <tr v-if="!filteredTxns.length">
                <td colspan="7" class="py-10 text-center text-gray-600">
                  No GL transactions found for this period
                </td>
              </tr>

              <!-- Transaction rows — oldest first (chronological passbook order) -->
              <tr v-for="tx in filteredTxns" :key="tx.id"
                  class="hover:bg-white/[0.025] transition-colors"
                  :class="tx.is_reversed ? 'opacity-40' : ''">

                <td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">
                  {{ String(tx.transaction_date).slice(0, 10) }}
                </td>

                <td class="py-2.5 px-3 text-gray-300 max-w-[300px]">
                  <span class="leading-snug">{{ tx.description }}</span>
                  <span v-if="tx.line_description"
                        class="text-gray-600 text-[10px] block leading-tight mt-0.5">
                    {{ tx.line_description }}
                  </span>
                  <span v-if="tx.is_reversed"
                        class="text-orange-400/60 text-[10px] block mt-0.5">⟲ Reversed — cancelled by paired entry</span>
                </td>

                <td class="py-2.5 px-3 text-center">
                  <span :class="['px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap', sourceColor(tx.source)]">
                    {{ sourceLabel(tx.source) }}
                  </span>
                </td>

                <td class="py-2.5 px-3 font-mono text-[11px]">
                  <NuxtLink to="/accounts/journal"
                            class="text-blue-400/60 hover:text-blue-300 transition-colors">
                    JE-{{ tx.journal_entry_id }}
                  </NuxtLink>
                </td>

                <!-- Debit (Out) — show even for reversed entries so the pair is visible -->
                <td class="py-2.5 px-3 text-right font-mono">
                  <span v-if="tx.debit_out > 0"
                        :class="tx.is_reversed ? 'text-red-400/30 line-through' : 'text-red-400'">
                    ৳{{ Number(tx.debit_out).toLocaleString() }}
                  </span>
                  <span v-else class="text-gray-700">—</span>
                </td>

                <!-- Credit (In) — show even for reversed entries -->
                <td class="py-2.5 px-3 text-right font-mono">
                  <span v-if="tx.credit_in > 0"
                        :class="tx.is_reversed ? 'text-emerald-400/30 line-through' : 'text-emerald-400'">
                    ৳{{ Number(tx.credit_in).toLocaleString() }}
                  </span>
                  <span v-else class="text-gray-700">—</span>
                </td>

                <!-- Balance after this entry -->
                <td class="py-2.5 px-3 text-right font-mono font-semibold"
                    :class="Number(tx.balance) >= 0 ? 'text-gray-200' : 'text-red-400'">
                  ৳{{ Number(tx.balance).toLocaleString() }}
                </td>
              </tr>

              <!-- Closing balance row — bottom (chronologically last) -->
              <tr class="bg-gold-500/[0.04] border-t border-gold-500/10">
                <td class="py-2 px-3 text-gold-400/60 font-mono text-[11px] whitespace-nowrap">
                  {{ applied.to || today }}
                </td>
                <td colspan="4" class="py-2 px-3 text-gold-400/70 font-medium">
                  ✦ Closing Balance
                </td>
                <td class="py-2 px-3" />
                <td class="py-2 px-3 text-right font-bold text-gold-300 font-mono">
                  ৳{{ closingBalance.toLocaleString() }}
                </td>
              </tr>

            </tbody>

            <!-- Totals footer -->
            <tfoot v-if="filteredTxns.length" class="border-t-2 border-white/10">
              <tr>
                <td colspan="4" class="pt-3 pb-1 px-3 text-gray-600 font-semibold text-[10px] uppercase tracking-wider">
                  Period Totals
                </td>
                <td class="pt-3 pb-1 px-3 text-right font-bold text-red-400 font-mono">
                  ৳{{ totalDebits.toLocaleString() }}
                </td>
                <td class="pt-3 pb-1 px-3 text-right font-bold text-emerald-400 font-mono">
                  ৳{{ totalCredits.toLocaleString() }}
                </td>
                <td class="pt-3 pb-1 px-3 text-right font-semibold font-mono"
                    :class="netMovement >= 0 ? 'text-emerald-400' : 'text-red-400'">
                  {{ netMovement >= 0 ? '+' : '' }}৳{{ Math.abs(netMovement).toLocaleString() }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Limit note -->
        <p v-if="(data?.transactions ?? []).length >= 2000"
           class="mt-3 text-center text-[11px] text-yellow-500/70">
          ⚠ Showing first 2000 entries — narrow the date range to see more
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const today      = new Date().toISOString().slice(0, 10)
const monthStart = today.slice(0, 7) + '-01'

// ── Filter state ─────────────────────────────────────────────────────────────
const filters = reactive({
  account: '' as any,
  from:    monthStart,
  to:      today,
  type:    '',
})

// Applied = what the current fetch is based on (set on Apply click)
const applied = reactive({ ...filters })

function applyFilters() {
  Object.assign(applied, filters)
  refresh()
}
function resetFilters() {
  Object.assign(filters,  { account: '', from: monthStart, to: today, type: '' })
  Object.assign(applied, filters)
  refresh()
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
const apiQuery = computed(() => ({
  account: applied.account || undefined,
  from:    applied.from    || undefined,
  to:      applied.to      || undefined,
}))

const { data, pending, error: fetchError, refresh } = await useFetch('/api/bank/unified-ledger', {
  query: apiQuery,
})

// Account list — always returned by the endpoint (even on no-account initial load)
const accounts = computed(() => (data.value?.accounts ?? []) as any[])

// ── Derived data ──────────────────────────────────────────────────────────────
const openingBalance = computed(() => Number(data.value?.opening_balance ?? 0))
const closingBalance = computed(() => Number(data.value?.closing_balance ?? 0))
const totalCredits   = computed(() => Number(data.value?.totalCredits    ?? 0))
const totalDebits    = computed(() => Number(data.value?.totalDebits     ?? 0))
const netMovement    = computed(() => totalCredits.value - totalDebits.value)

// Client-side type filter (avoids round-trip)
const filteredTxns = computed(() => {
  const all = (data.value?.transactions ?? []) as any[]
  if (applied.type === 'credit') return all.filter(t => Number(t.credit_in) > 0)
  if (applied.type === 'debit')  return all.filter(t => Number(t.debit_out) > 0)
  return all
})

const accountLabel = computed(() => {
  const a = data.value?.bankAccount
  return a ? `${a.bank_name} — ${a.account_name}` : 'Bank Statement'
})

// ── Source badge helpers ──────────────────────────────────────────────────────
function sourceLabel(s: string) {
  const map: Record<string, string> = {
    CustomerPayment:         'Payment',
    ExpenseVoucher:          'Expense',
    CreditOrderDelivery:     'Delivery',
    BankTransfer:            'Transfer',
    Manual:                  'Manual',
    GeneralTransaction:      'General',
    ManualReversal:          'Reversal',
    purchase_payment_adnan:  'Purchase',
    PurchasePayment:         'Purchase',
    SalesCashPayment:        'Sales',
  }
  if (map[s]) return map[s]
  // Fallback: convert CamelCase or snake_case to readable label
  if (!s) return 'Entry'
  return s.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/\s+/g, ' ').trim()
}
function sourceColor(s: string) {
  const map: Record<string, string> = {
    CustomerPayment:         'bg-emerald-500/10 text-emerald-400',
    ExpenseVoucher:          'bg-orange-500/10  text-orange-400',
    CreditOrderDelivery:     'bg-blue-500/10    text-blue-400',
    BankTransfer:            'bg-purple-500/10  text-purple-400',
    ManualReversal:          'bg-red-500/10     text-red-400',
    Manual:                  'bg-gray-500/10    text-gray-400',
    GeneralTransaction:      'bg-gray-500/10    text-gray-400',
    purchase_payment_adnan:  'bg-amber-500/10   text-amber-400',
    PurchasePayment:         'bg-amber-500/10   text-amber-400',
    SalesCashPayment:        'bg-emerald-500/10 text-emerald-400',
  }
  return map[s] ?? 'bg-gray-500/10 text-gray-400'
}

// ── Print ─────────────────────────────────────────────────────────────────────
function printStatement() { window.print() }

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCsv() {
  const ba   = data.value?.bankAccount
  const name = ba ? `${ba.bank_name}-${ba.account_name}` : 'bank-statement'

  const headers = ['Date', 'Description', 'Source', 'JE Ref', 'Debit Out', 'Credit In', 'Balance', 'Reversed']
  const csvRows: string[] = []

  // Opening balance
  csvRows.push([
    applied.from || '', '"Opening Balance"', '', '', '', '', openingBalance.value, '',
  ].join(','))

  // filteredTxns is already oldest-first (chronological)
  const chrono = filteredTxns.value
  for (const tx of chrono) {
    csvRows.push([
      String(tx.transaction_date).slice(0, 10),
      `"${String(tx.description ?? '').replace(/"/g, '""')}"`,
      tx.source ?? '',
      `JE-${tx.journal_entry_id}`,
      Number(tx.debit_out)  > 0 ? tx.debit_out  : '',
      Number(tx.credit_in) > 0 ? tx.credit_in : '',
      tx.balance,
      tx.is_reversed ? 'YES' : '',
    ].join(','))
  }

  // Closing balance
  csvRows.push([
    applied.to || today, '"Closing Balance"', '', '',
    totalDebits.value, totalCredits.value, closingBalance.value, '',
  ].join(','))

  const csv  = [headers.join(','), ...csvRows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${name.replace(/[^a-z0-9]/gi, '-')}-${applied.from ?? today}-${applied.to ?? today}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
