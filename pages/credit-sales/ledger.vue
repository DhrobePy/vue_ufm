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
      <button v-if="isAdmin && selectedCustomerId" @click="openAdjustModal"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors ml-auto">
        📝 Post Adjustment
      </button>
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
        <template #cell-link="{ row }">
          <NuxtLink v-if="linkFor(row)" :to="linkFor(row)!.href"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap">
            {{ linkFor(row)!.label }}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
          <span v-else class="text-gray-700 text-xs">—</span>
        </template>
      </UiDataTable>
    </template>

    <!-- Admin — Manual Ledger Adjustment (spec §2.10, memo-level, no JE) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="adjustModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="adjustModal = false">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-violet-500/20 p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">📝 Manual Ledger Adjustment</h3>
              <button @click="adjustModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <p class="text-xs text-gray-500">
              For <strong class="text-gray-300">{{ selectedCustomerName }}</strong>. Memo-level only — posts a ledger row and
              syncs the customer balance, but does <strong class="text-amber-400">not</strong> create a journal entry.
              Use for reconciliation, not routine transactions.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direction</label>
                <select v-model="adjustForm.direction" class="input-glass">
                  <option value="debit">Debit (increases due)</option>
                  <option value="credit">Credit (reduces due)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (৳)</label>
                <input v-model.number="adjustForm.amount" type="number" min="0" step="1" class="input-glass font-mono" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason *</label>
              <textarea v-model="adjustForm.reason" rows="2" class="input-glass resize-none" placeholder="Required — why is this adjustment needed?" />
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="submitAdjustment" :disabled="!canSubmitAdjustment || adjusting"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ adjusting ? 'Posting…' : 'Post Adjustment' }}
              </button>
              <button @click="adjustModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
definePageMeta({ layout: 'default' })
const { user } = useUserSession()
const { success, error: toastError } = useToast()

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()))

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

// ── Admin manual adjustment ────────────────────────────────────────────────
const selectedCustomerName = computed(() =>
  customerList.value.find((c: any) => String(c.id) === String(selectedCustomerId.value))?.name ?? '')

const adjustModal = ref(false)
const adjusting   = ref(false)
const adjustForm  = reactive({ direction: 'debit', amount: null as number | null, reason: '' })

function openAdjustModal() {
  Object.assign(adjustForm, { direction: 'debit', amount: null, reason: '' })
  adjustModal.value = true
}

const canSubmitAdjustment = computed(() =>
  Number(adjustForm.amount) > 0 && adjustForm.reason.trim().length > 0)

async function submitAdjustment() {
  adjusting.value = true
  try {
    await $fetch('/api/credit-sales/ledger/adjustment', {
      method: 'POST',
      body: {
        customer_id: Number(selectedCustomerId.value),
        direction:   adjustForm.direction,
        amount:      Number(adjustForm.amount),
        reason:      adjustForm.reason.trim(),
      },
    })
    success('Adjustment posted ✓')
    adjustModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to post adjustment')
  } finally {
    adjusting.value = false
  }
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
  { key: 'link',        label: 'View' },
]

// Direct link to the underlying record behind each ledger row — resolved
// from reference_type/reference_id (+ linked_order_id for returns/amendments,
// which are stored as their own id, not the order's).
function linkFor(row: any): { href: string; label: string } | null {
  switch (row.reference_type) {
    case 'credit_order':
      return { href: `/credit-sales/${row.reference_id}`, label: 'View Order' }
    case 'customer_payment':
      return { href: `/credit-sales/receipt/${row.reference_id}`, label: 'View Receipt' }
    case 'payment_reversal':
      return { href: `/credit-sales/receipt/${row.reference_id}`, label: 'View Original' }
    case 'credit_order_return':
      return row.linked_order_id ? { href: `/credit-sales/${row.linked_order_id}`, label: 'View Order' } : null
    case 'order_amendment':
      return row.linked_order_id ? { href: `/credit-sales/${row.linked_order_id}/amend`, label: 'View Amendment' } : null
    default:
      return null
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
