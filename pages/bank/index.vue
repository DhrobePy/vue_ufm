<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank" subtitle="Maker-checker bank transactions · transfers · statements" :breadcrumb="['Bank']">
      <template #actions>
        <NuxtLink to="/bank/accounts" class="btn-ghost text-xs">Accounts</NuxtLink>
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
          <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Withdrawals Today</p>
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
            <NuxtLink :to="`/bank/statement?account=${acc.id}`" class="btn-ghost text-[11px] py-1 px-2.5">Statement</NuxtLink>
          </div>
        </div>
      </div>

      <!-- GL Account quick-access -->
      <div v-if="glAccounts.length" class="glass-card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-300">📒 GL Account Statements</h3>
          <NuxtLink to="/bank/statement" class="text-xs text-blue-400/70 hover:text-blue-300">Open Statement →</NuxtLink>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink v-for="acc in glAccounts" :key="acc.id"
            :to="`/bank/statement?account=${acc.id}`"
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
                   hover:bg-white/[0.08] transition-all text-xs group">
            <span class="text-base">🏦</span>
            <div>
              <p class="font-semibold text-gray-200 group-hover:text-white">{{ acc.bank_name }}</p>
              <p class="text-gray-600 font-mono text-[10px]">{{ acc.account_name }}</p>
            </div>
            <span class="ml-2 text-blue-400/50 group-hover:text-blue-400 text-[11px]">→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- ── Pending Transactions ────────────────────────────────────────── -->
      <div v-if="pendingRows.length" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Pending Transactions</h2>
          <span class="text-xs text-yellow-400 font-medium">⚠ Awaiting approval</span>
        </div>
        <div class="space-y-2">
          <div v-for="row in pendingRows" :key="row.id"
               class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-yellow-500/10 hover:bg-white/[0.05] transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <span :class="['w-2 h-2 rounded-full flex-shrink-0', row.entry_type==='credit' ? 'bg-emerald-400' : 'bg-red-400']" />
              <div class="min-w-0">
                <p class="font-mono text-xs text-gold-400/80 font-medium">{{ row.transaction_number }}</p>
                <p class="text-xs text-gray-500 truncate">{{ row.bank_name }} · {{ row.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0 ml-3">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold font-mono" :class="row.entry_type==='credit' ? 'text-emerald-400' : 'text-red-400'">
                  {{ row.entry_type==='credit' ? '+' : '-' }}৳{{ Number(row.amount).toLocaleString() }}
                </p>
                <p class="text-[10px] text-gray-600">{{ row.transaction_date }}</p>
              </div>
              <div class="flex gap-1.5">
                <button @click="openDrawer(row.id)" class="btn-ghost text-xs py-1 px-2">View</button>
                <button @click="doAction(row.id, 'approve')" :disabled="acting===row.id" class="btn-gold text-xs py-1 px-2.5">
                  {{ acting===row.id ? '…' : 'Approve' }}
                </button>
                <button @click="doReject(row)" :disabled="acting===row.id"
                  class="btn-ghost text-xs py-1 px-2.5 border-red-500/20 text-red-400 hover:bg-red-500/10">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── All Transactions ───────────────────────────────────────────── -->
      <div class="glass-card p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="section-title">All Transactions</h2>
          <div class="flex items-center gap-2">
            <button v-if="isAdmin" @click="bulkMode = !bulkMode"
              :class="['btn-ghost text-xs py-1 px-2.5', bulkMode ? 'border-amber-500/40 text-amber-400' : '']">
              {{ bulkMode ? '✕ Cancel Select' : '☑ Select' }}
            </button>
            <span v-if="bulkMode && selectedIds.size > 0"
              class="text-xs text-amber-400 font-medium">{{ selectedIds.size }} selected</span>
          </div>
        </div>

        <!-- Bulk action bar -->
        <div v-if="bulkMode && selectedIds.size > 0"
          class="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
          <span class="text-xs text-amber-300 font-semibold">{{ selectedIds.size }} selected</span>
          <button @click="bulkAction('unpost')" :disabled="!!bulkBusy"
            class="btn-ghost text-xs py-1 px-3 text-yellow-400 hover:border-yellow-500/30">
            {{ bulkBusy === 'unpost' ? '…' : '↩ Bulk Unpost' }}
          </button>
          <button v-if="isSuperadmin" @click="bulkAction('delete')" :disabled="!!bulkBusy"
            class="btn-ghost text-xs py-1 px-3 text-red-400 hover:border-red-500/30">
            {{ bulkBusy === 'delete' ? '…' : '🗑 Bulk Delete' }}
          </button>
          <button @click="selectedIds.clear(); selectedIds = new Set()" class="ml-auto btn-ghost text-xs py-1 px-2.5">Clear</button>
        </div>

        <!-- Filter bar -->
        <div class="flex flex-wrap gap-2 items-center">
          <select v-model="txFilters.account" class="field-input text-xs py-1.5 min-w-[180px]">
            <option value="">All Accounts</option>
            <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.bank_name }} — {{ a.account_name }}</option>
          </select>
          <input v-model="txFilters.from" type="date" class="field-input text-xs py-1.5" />
          <input v-model="txFilters.to"   type="date" class="field-input text-xs py-1.5" />
          <select v-model="txFilters.status" class="field-input text-xs py-1.5">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="unposted">Unposted</option>
          </select>
          <select v-model="txFilters.type" class="field-input text-xs py-1.5">
            <option value="">All Types</option>
            <option value="credit">Credit (In)</option>
            <option value="debit">Debit (Out)</option>
          </select>
          <button @click="applyTxFilters" class="btn-gold text-xs py-1.5 px-4">Apply</button>
          <button @click="resetTxFilters" class="btn-ghost text-xs py-1.5">Reset</button>
        </div>

        <div v-if="txPending" class="text-center text-xs text-gray-500 py-6">Loading…</div>
        <div v-else-if="txError" class="text-center text-red-400 text-sm py-4">⚠ {{ (txError as any)?.message }}</div>
        <template v-else>
          <div v-if="!txData?.transactions?.length" class="text-center text-gray-600 text-xs py-8">No transactions found</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-xs min-w-[640px]">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th v-if="bulkMode" class="pb-2 px-2 w-8">
                    <input type="checkbox" @change="toggleAll" class="accent-amber-500" />
                  </th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Txn #</th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Type</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Amount</th>
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
                  <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
                  <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="tx in txData.transactions" :key="tx.id"
                  :class="['hover:bg-white/[0.02] transition-colors', selectedIds.has(tx.id) ? 'bg-amber-500/[0.04]' : '']">
                  <td v-if="bulkMode" class="py-2.5 px-2">
                    <input type="checkbox" :checked="selectedIds.has(tx.id)"
                      @change="toggleSelect(tx.id)" class="accent-amber-500" />
                  </td>
                  <td class="py-2.5 px-3 font-mono text-gold-400/80 font-medium whitespace-nowrap">{{ tx.transaction_number }}</td>
                  <td class="py-2.5 px-3 text-gray-500 whitespace-nowrap">{{ tx.transaction_date }}</td>
                  <td class="py-2.5 px-3 text-gray-400 whitespace-nowrap">{{ tx.bank_name }}</td>
                  <td class="py-2.5 px-3">
                    <span :class="['px-2 py-0.5 rounded text-[10px] font-semibold', tx.entry_type==='credit'
                      ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400']">
                      {{ tx.entry_type }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-semibold"
                    :class="tx.entry_type==='credit' ? 'text-emerald-400' : 'text-red-400'">
                    ৳{{ Number(tx.amount).toLocaleString() }}
                  </td>
                  <td class="py-2.5 px-3 text-gray-400 max-w-[200px] truncate">{{ tx.description }}</td>
                  <td class="py-2.5 px-3 text-center">
                    <UiStatusBadge :status="tx.status" />
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="flex gap-1 justify-center flex-wrap">
                      <button @click="openDrawer(tx.id)" class="btn-ghost text-[10px] py-0.5 px-2">View</button>
                      <button v-if="isAdmin && tx.status==='pending'" @click="doAction(tx.id,'approve')" :disabled="acting===tx.id"
                        class="btn-gold text-[10px] py-0.5 px-2">{{ acting===tx.id ? '…' : 'Approve' }}</button>
                      <button @click="printReceipt(tx)" class="btn-ghost text-[10px] py-0.5 px-2">🖨</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="(txData?.total ?? 0) > txPerPage" class="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>{{ txData?.total }} total · Page {{ txPage }}</span>
            <div class="flex gap-2">
              <button :disabled="txPage<=1" @click="txPage--;fetchTx()" class="btn-ghost text-xs py-1 px-3" :class="txPage<=1?'opacity-40':''">← Prev</button>
              <button :disabled="txPage>=Math.ceil((txData?.total??0)/txPerPage)" @click="txPage++;fetchTx()" class="btn-ghost text-xs py-1 px-3">Next →</button>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- ── Transaction Detail Drawer ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawerOpen" class="fixed inset-0 z-50 flex">
          <div class="flex-1 bg-black/50 backdrop-blur-sm" @click="drawerOpen=false" />
          <div class="w-full max-w-md bg-[#111] border-l border-white/[0.08] overflow-y-auto flex flex-col">
            <div class="sticky top-0 bg-[#111] border-b border-white/[0.06] p-4 flex items-center justify-between z-10">
              <h3 class="text-sm font-bold text-gray-100">Transaction Detail</h3>
              <button @click="drawerOpen=false" class="text-gray-500 hover:text-gray-200 text-xl">✕</button>
            </div>

            <div v-if="drawerLoading" class="flex-1 flex items-center justify-center text-xs text-gray-500">Loading…</div>
            <template v-else-if="drawerTx">
              <div class="p-5 space-y-5 flex-1">
                <!-- Amount hero -->
                <div class="text-center py-4 border-b border-white/[0.06]">
                  <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{{ drawerTx.entry_type === 'credit' ? '↓ Deposit' : '↑ Withdrawal' }}</p>
                  <p class="text-3xl font-bold font-mono" :class="drawerTx.entry_type==='credit' ? 'text-emerald-400' : 'text-red-400'">
                    ৳{{ Number(drawerTx.amount).toLocaleString() }}
                  </p>
                  <div class="mt-2 flex justify-center gap-2">
                    <UiStatusBadge :status="drawerTx.status" />
                  </div>
                </div>

                <!-- Fields -->
                <div class="space-y-3 text-xs">
                  <div v-for="[label, val] in drawerFields" :key="label" class="flex justify-between gap-4">
                    <span class="text-gray-600 shrink-0">{{ label }}</span>
                    <span class="text-gray-200 text-right font-medium break-words">{{ val || '—' }}</span>
                  </div>
                </div>

                <!-- Special note -->
                <div v-if="drawerTx.special_note" class="p-3 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20">
                  <p class="text-[10px] text-yellow-500 font-semibold uppercase tracking-wider mb-1">Special Note</p>
                  <p class="text-xs text-yellow-300">{{ drawerTx.special_note }}</p>
                </div>

                <!-- Actions -->
                <div class="space-y-2 border-t border-white/[0.06] pt-4">
                  <div class="flex gap-2 flex-wrap">
                    <button v-if="isAdmin && drawerTx.status==='pending'" @click="doAction(drawerTx.id,'approve')" :disabled="acting===drawerTx.id" class="btn-gold text-xs flex-1">
                      {{ acting===drawerTx.id ? '…' : '✓ Approve' }}
                    </button>
                    <button v-if="isAdmin && drawerTx.status==='pending'" @click="doReject(drawerTx)" :disabled="acting===drawerTx.id"
                      class="btn-ghost text-xs flex-1 text-red-400 border-red-500/20 hover:bg-red-500/10">
                      ✕ Reject
                    </button>
                  </div>
                  <div class="flex gap-2 flex-wrap">
                    <NuxtLink :to="`/bank/transaction/create?edit=${drawerTx.id}`"
                      class="btn-ghost text-xs flex-1 justify-center">✏ Edit</NuxtLink>
                    <button @click="printReceipt(drawerTx)" class="btn-ghost text-xs flex-1">🖨 Receipt</button>
                  </div>
                  <button v-if="isAdmin && drawerTx.status !== 'unposted'" @click="doUnpost(drawerTx.id)" :disabled="acting===drawerTx.id"
                    class="btn-ghost text-xs w-full text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10">
                    {{ acting===drawerTx.id ? '…' : '↩ Unpost Transaction' }}
                  </button>
                  <button v-if="isSuperadmin" @click="doHardDelete(drawerTx)"
                    class="btn-ghost text-xs w-full text-red-500 border-red-600/20 hover:bg-red-500/10">
                    🗑 Permanently Delete
                  </button>
                </div>

                <!-- Audit Trail -->
                <div v-if="drawerAudit.length" class="space-y-3 border-t border-white/[0.06] pt-4">
                  <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Audit Trail</h4>
                  <div v-for="log in drawerAudit" :key="log.id" class="flex gap-3 text-xs">
                    <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      :class="log.action==='approved' ? 'bg-emerald-400' : log.action==='rejected'||log.action==='deleted' ? 'bg-red-400' : 'bg-gray-400'" />
                    <div>
                      <p class="text-gray-300 capitalize font-medium">{{ log.action }}</p>
                      <p class="text-gray-600">{{ log.user_name || 'System' }} · {{ String(log.created_at).slice(0,16) }}</p>
                      <p v-if="log.notes" class="text-gray-500 mt-0.5 italic">{{ log.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reject reason modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="rejectModal.open" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <h3 class="font-bold text-gray-100">Reject Transaction</h3>
            <p class="text-xs text-gray-500">{{ rejectModal.txNumber }}</p>
            <textarea v-model="rejectModal.reason" rows="3" class="input-glass w-full resize-none text-xs"
              placeholder="Reason for rejection (optional)…" />
            <div class="flex gap-3">
              <button @click="confirmReject" :disabled="acting===rejectModal.txId"
                class="btn-gold text-xs flex-1 bg-red-600/80 border-red-500/30 hover:bg-red-600">
                {{ acting===rejectModal.txId ? '…' : 'Confirm Reject' }}
              </button>
              <button @click="rejectModal.open=false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#0ea5e9']

const { user: sessionUser } = useUserSession()
const isAdmin      = computed(() => ['admin','superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))
const isSuperadmin = computed(() => (sessionUser.value?.role ?? '').toLowerCase() === 'superadmin')

// ── Dashboard data ────────────────────────────────────────────────────────────
const { data, pending, error, refresh } = await useFetch('/api/bank/dashboard')
const accounts    = computed(() => (data.value?.accounts    ?? []) as any[])
const stats       = computed(() => (data.value?.stats       ?? {}) as any)
const pendingRows = computed(() => (data.value?.pendingTxns ?? []) as any[])

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

// ── Approve / Reject ──────────────────────────────────────────────────────────
const acting = ref<number | null>(null)

async function doAction(id: number, action: 'approve' | 'reject', notes?: string) {
  acting.value = id
  try {
    await $fetch(`/api/bank/transactions/${id}`, { method: 'PATCH', body: { action, notes } })
    success(`Transaction ${action}d ✓`)
    await refresh()
    fetchTx()
    if (drawerTx.value?.id === id) await loadDrawer(id)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? `Failed to ${action}`)
  } finally { acting.value = null }
}

const rejectModal = reactive({ open: false, txId: 0, txNumber: '', reason: '' })

function doReject(tx: any) {
  Object.assign(rejectModal, { open: true, txId: tx.id, txNumber: tx.transaction_number, reason: '' })
}
async function confirmReject() {
  await doAction(rejectModal.txId, 'reject', rejectModal.reason || undefined)
  rejectModal.open = false
}

async function doUnpost(id: number) {
  if (!confirm('Unpost this transaction? The balance will no longer reflect it.')) return
  acting.value = id
  try {
    await $fetch(`/api/bank/transactions/${id}`, { method: 'PATCH', body: { action: 'unpost' } })
    success('Transaction unposted')
    await refresh(); fetchTx()
    if (drawerTx.value?.id === id) await loadDrawer(id)
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed to unpost') }
  finally { acting.value = null }
}

async function doHardDelete(tx: any) {
  if (!confirm(`Permanently delete ${tx.transaction_number}?\n\nThis CANNOT be undone.`)) return
  try {
    await $fetch(`/api/bank/transactions/${tx.id}`, { method: 'DELETE' })
    success('Transaction permanently deleted')
    drawerOpen.value = false
    await refresh(); fetchTx()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed to delete') }
}

// ── All Transactions ──────────────────────────────────────────────────────────
const today    = new Date().toISOString().slice(0, 10)
const weekAgo  = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10)

const txFilters = reactive({ account: '', from: weekAgo, to: today, status: '', type: '' })
const appliedTxFilters = reactive({ ...txFilters })
const txPage   = ref(1)
const txPerPage = 25

const txQuery = computed(() => ({
  account: appliedTxFilters.account || undefined,
  from:    appliedTxFilters.from    || undefined,
  to:      appliedTxFilters.to      || undefined,
  status:  appliedTxFilters.status  || undefined,
  type:    appliedTxFilters.type    || undefined,
  page:    txPage.value,
  per:     txPerPage,
}))

const { data: txData, pending: txPending, error: txError, refresh: fetchTx } = await useFetch(
  '/api/bank/transactions', { query: txQuery },
)

function applyTxFilters() { Object.assign(appliedTxFilters, txFilters); txPage.value = 1; fetchTx() }
function resetTxFilters()  { Object.assign(txFilters, { account: '', from: weekAgo, to: today, status: '', type: '' }); applyTxFilters() }

// ── Bulk select ───────────────────────────────────────────────────────────────
const bulkMode   = ref(false)
let selectedIds  = ref(new Set<number>())
const bulkBusy   = ref<string | null>(null)

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = s
}
function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selectedIds.value = checked ? new Set((txData.value?.transactions ?? []).map((t: any) => t.id)) : new Set()
}

async function bulkAction(action: 'unpost' | 'delete') {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  const verb = action === 'delete' ? 'permanently delete' : 'unpost'
  if (!confirm(`${verb.charAt(0).toUpperCase() + verb.slice(1)} ${ids.length} transaction(s)?`)) return
  bulkBusy.value = action
  try {
    const res = await $fetch('/api/bank/transactions/bulk', { method: 'POST', body: { ids, action } }) as any
    success(`${res.affected} transaction(s) ${action}ed`)
    selectedIds.value = new Set(); bulkMode.value = false
    await refresh(); fetchTx()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Bulk action failed') }
  finally { bulkBusy.value = null }
}

// ── Drawer ────────────────────────────────────────────────────────────────────
const drawerOpen    = ref(false)
const drawerLoading = ref(false)
const drawerTx      = ref<any>(null)
const drawerAudit   = ref<any[]>([])

const drawerFields = computed(() => {
  const t = drawerTx.value
  if (!t) return []
  return [
    ['Transaction #', t.transaction_number],
    ['Date',          t.transaction_date],
    ['Account',       `${t.bank_name} — ${t.account_name}`],
    ['Account No.',   t.account_number],
    ['Type',          t.entry_type?.toUpperCase()],
    ['Reference',     t.reference_number],
    ['Cheque #',      t.cheque_number],
    ['Payee / Payer', t.payee_payer_name],
    ['Description',   t.description],
    ['Submitted by',  t.created_by_name],
  ].filter(([, v]) => v)
})

async function loadDrawer(id: number) {
  drawerLoading.value = true
  try {
    const res = await $fetch(`/api/bank/transactions/${id}`) as any
    drawerTx.value    = res.transaction
    drawerAudit.value = res.auditLog ?? []
  } catch (e: any) { toastError('Failed to load transaction') }
  finally { drawerLoading.value = false }
}

async function openDrawer(id: number) {
  drawerTx.value = null; drawerAudit.value = []
  drawerOpen.value = true
  await loadDrawer(id)
}

// ── Print receipt ─────────────────────────────────────────────────────────────
function printReceipt(tx: any) {
  const w = window.open('', '_blank', 'width=420,height=600')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt ${tx.transaction_number || ''}</title>
  <style>body{font-family:monospace;padding:24px;max-width:380px;margin:0 auto}
  h2{text-align:center;font-size:15px;margin:0 0 4px}
  .sub{text-align:center;font-size:11px;color:#666;margin-bottom:16px}
  .row{display:flex;justify-content:space-between;margin:6px 0;font-size:12px;gap:8px}
  .row span:first-child{color:#777;flex-shrink:0}
  .row b{text-align:right}
  .divider{border:none;border-top:1px dashed #bbb;margin:12px 0}
  .amount{font-size:26px;font-weight:bold;text-align:center;margin:12px 0;padding:10px;background:#f9f9f9;border-radius:8px}
  .footer{text-align:center;font-size:10px;color:#999;margin-top:16px}
  @media print{.no-print{display:none}}</style></head>
  <body>
  <h2>BANK TRANSACTION RECEIPT</h2>
  <p class="sub">Ujjal Flour Mills</p>
  <hr class="divider">
  <div class="row"><span>Txn #</span><b>${tx.transaction_number || '—'}</b></div>
  <div class="row"><span>Date</span><b>${tx.transaction_date || '—'}</b></div>
  <div class="row"><span>Account</span><b>${tx.bank_name || ''} — ${tx.account_name || ''}</b></div>
  <div class="row"><span>Type</span><b>${(tx.entry_type || '').toUpperCase()}</b></div>
  <hr class="divider">
  <div class="amount">${tx.entry_type === 'credit' ? '▼ Deposit' : '▲ Withdrawal'}<br>৳${Number(tx.amount || 0).toLocaleString()}</div>
  <hr class="divider">
  <div class="row"><span>Reference</span><b>${tx.reference_number || '—'}</b></div>
  <div class="row"><span>Cheque #</span><b>${tx.cheque_number || '—'}</b></div>
  <div class="row"><span>Payee/Payer</span><b>${tx.payee_payer_name || '—'}</b></div>
  <div class="row"><span>Description</span><b style="text-align:right">${tx.description || '—'}</b></div>
  <div class="row"><span>Status</span><b>${(tx.status || '').toUpperCase()}</b></div>
  <p class="footer">Printed: ${new Date().toLocaleString()}</p>
  <div class="no-print" style="text-align:center;margin-top:16px">
    <button onclick="window.print()" style="padding:8px 20px;cursor:pointer">🖨 Print</button>
  </div>
  </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}
</script>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active > div:last-child, .drawer-leave-active > div:last-child { transition: transform 0.2s ease; }
.drawer-enter-from > div:last-child, .drawer-leave-to > div:last-child { transform: translateX(100%); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
