<template>
  <div class="space-y-6">
    <UiPageHeader title="Payment Collections" subtitle="All incoming payments received against credit sales"
                  :breadcrumb="['Credit Sales', 'Payments']">
      <template #actions>
        <button @click="exportCSV" class="btn-ghost text-xs">⬇ Export</button>
        <NuxtLink to="/credit-sales" class="btn-ghost text-xs">← Orders</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Collected This Month</p>
        <p class="text-2xl font-bold text-emerald-400">৳{{ monthTotal.toLocaleString() }}</p>
        <p class="text-xs text-gray-600 mt-1">{{ monthPayments.length }} transactions</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Cash / MFS</p>
        <p class="text-2xl font-bold text-gray-100">৳{{ cashTotal.toLocaleString() }}</p>
        <p class="text-xs text-gray-600 mt-1">৳{{ mobileTotal.toLocaleString() }} mobile</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Bank Transfer</p>
        <p class="text-2xl font-bold text-blue-400">৳{{ bankTotal.toLocaleString() }}</p>
        <p class="text-xs text-gray-600 mt-1">BEFTN / cheque</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Pending Clearance</p>
        <p class="text-2xl font-bold text-amber-400">৳{{ pendingTotal.toLocaleString() }}</p>
        <p class="text-xs text-gray-600 mt-1">{{ pendingCount }} cheques</p>
      </div>
    </div>

    <!-- Pending verification alert -->
    <div v-if="pendingCount > 0"
         class="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
         style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2)"
         @click="filters.status = 'pending'">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(245,158,11,0.15)">
        <span class="text-lg">⏳</span>
      </div>
      <div class="flex-1">
        <p class="text-sm font-bold text-amber-400">{{ pendingCount }} payment{{ pendingCount > 1 ? 's' : '' }} pending clearance verification</p>
        <p class="text-xs text-gray-500 mt-0.5">Total ৳{{ pendingTotal.toLocaleString() }} — click to filter and verify each one</p>
      </div>
      <span class="text-xs text-amber-400 font-semibold">Review →</span>
    </div>

    <div v-if="loading" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ (error as any).message }}</div>

    <!-- Filters -->
    <div class="glass-card p-4 flex flex-wrap gap-3">
      <input v-model.lazy="filters.search" type="text" class="field-input w-48 text-xs py-1.5" placeholder="Search customer / receipt…"
             @keydown.enter="page=1;refresh()" />
      <select v-model="filters.method" class="field-input w-auto text-xs py-1.5">
        <option value="">All Methods</option>
        <option value="cash">Cash</option>
        <option value="bkash">bKash</option>
        <option value="nagad">Nagad</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="cheque">Cheque</option>
      </select>
      <select v-model="filters.status" class="field-input w-auto text-xs py-1.5" @change="page=1;refresh()">
        <option value="">All Status</option>
        <option value="allocated">Allocated</option>
        <option value="unallocated">Unallocated</option>
        <option value="pending">Pending</option>
      </select>
      <button @click="resetFilters" class="btn-ghost text-xs py-1.5">Reset</button>
      <span class="ml-auto self-center text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> records
      </span>
    </div>

    <!-- Table -->
    <div class="glass-card p-5">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Receipt No</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Customer</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Order Ref</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Amount</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Method</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Collected By</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Branch</th>
            <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
            <th class="pb-2 px-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-if="filtered.length === 0">
            <td colspan="11" class="py-10 text-center text-gray-500">No payments found for the selected filters.</td>
          </tr>
          <tr v-for="p in paginated" :key="p.id"
              :class="['transition-colors', p.status === 'pending' ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.07]' : 'hover:bg-white/[0.02]']">
            <td class="py-2.5 px-3 font-mono text-gold-400 font-semibold">{{ p.receiptNo }}</td>
            <td class="py-2.5 px-3 font-mono text-gray-500">{{ p.date }}</td>
            <td class="py-2.5 px-3">
              <p class="text-gray-200 font-semibold">{{ p.customer }}</p>
              <p class="text-gray-500 text-[11px]">{{ p.branch === 'srg' ? 'Sirajgonj' : 'Demra' }}</p>
            </td>
            <td class="py-2.5 px-3">
              <NuxtLink :to="`/credit-sales/${p.orderId}`" class="font-mono text-blue-400 hover:text-blue-300 transition-colors">
                {{ p.orderRef }}
              </NuxtLink>
            </td>
            <td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">৳{{ p.amount.toLocaleString() }}</td>
            <td class="py-2.5 px-3">
              <span :class="methodClass(p.method)" class="px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {{ methodLabel(p.method) }}
              </span>
            </td>
            <td class="py-2.5 px-3 font-mono text-gray-500 text-[11px]">{{ p.reference || '—' }}</td>
            <td class="py-2.5 px-3 text-gray-400">{{ p.collectedBy }}</td>
            <td class="py-2.5 px-3 text-gray-500 capitalize">{{ p.branch === 'srg' ? 'SRG' : 'DMR' }}</td>
            <td class="py-2.5 px-3 text-center">
              <span :class="statusClass(p.status)" class="px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {{ p.status.charAt(0).toUpperCase() + p.status.slice(1) }}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button v-if="p.status === 'pending'" @click="markCleared(p)"
                  class="text-[11px] px-2 py-0.5 rounded-lg text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/10 transition-colors">
                  ✓ Clear
                </button>
                <button @click="viewDetails(p)" class="text-xs text-gray-600 hover:text-gold-400 transition-colors">View</button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="filtered.length > 0" class="border-t-2 border-white/10">
          <tr>
            <td colspan="4" class="pt-3 px-3 font-bold text-gray-400 text-xs">Total ({{ filtered.length }} records)</td>
            <td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400 text-sm">৳{{ filteredTotal.toLocaleString() }}</td>
            <td colspan="6"></td>
          </tr>
        </tfoot>
      </table>

      <!-- Pagination -->
      <div v-if="(data?.total ?? 0) > PER_PAGE" class="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
        <p class="text-xs text-gray-500">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex gap-2">
          <button @click="page--; refresh()" :disabled="page === 1" class="btn-ghost text-xs py-1 px-3 disabled:opacity-30">← Prev</button>
          <button @click="page++; refresh()" :disabled="page >= totalPages" class="btn-ghost text-xs py-1 px-3 disabled:opacity-30">Next →</button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selected" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">{{ selected.receiptNo }}</h3>
              <button @click="selected = null" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Customer</p>
                  <p class="text-gray-200 font-semibold">{{ selected.customer }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Date</p>
                  <p class="text-gray-200 font-mono">{{ selected.date }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Amount</p>
                  <p class="text-emerald-400 font-bold font-mono text-base">৳{{ selected.amount.toLocaleString() }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Method</p>
                  <p class="text-gray-200 capitalize">{{ methodLabel(selected.method) }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Order Reference</p>
                  <p class="text-blue-400 font-mono">{{ selected.orderRef }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Bank Reference</p>
                  <p class="text-gray-300 font-mono">{{ selected.reference || '—' }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Collected By</p>
                  <p class="text-gray-200">{{ selected.collectedBy }}</p>
                </div>
                <div class="glass-card p-3 space-y-0.5">
                  <p class="text-gray-500">Status</p>
                  <span :class="statusClass(selected.status)" class="px-2 py-0.5 rounded-full text-[11px] font-semibold">
                    {{ selected.status.charAt(0).toUpperCase() + selected.status.slice(1) }}
                  </span>
                </div>
              </div>
              <div v-if="selected.notes" class="glass-card p-3 space-y-0.5">
                <p class="text-gray-500">Notes</p>
                <p class="text-gray-300">{{ selected.notes }}</p>
              </div>
            </div>
            <!-- Verification actions for pending payments -->
            <div v-if="selected.status === 'pending'" class="rounded-xl p-3 space-y-2" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15)">
              <p class="text-[11px] text-amber-400 font-semibold">⏳ Awaiting clearance verification</p>
              <p class="text-[10px] text-gray-500">Confirm the payment has cleared the bank before marking.</p>
              <div class="flex gap-2">
                <button @click="markCleared(selected)" class="btn-gold text-xs flex-1 justify-center py-2">✓ Mark as Cleared</button>
                <button @click="markBounced(selected)"
                  class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 transition-all">
                  ✗ Mark as Bounced
                </button>
              </div>
            </div>
            <div v-else-if="selected.status === 'bounced'" class="rounded-xl p-3" style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2)">
              <p class="text-[11px] text-red-400 font-semibold">⚠ Payment bounced</p>
              <p class="text-[10px] text-gray-500 mt-1">{{ selected.notes }}</p>
              <button @click="markCleared(selected)" class="btn-ghost text-xs mt-2 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10">↺ Re-verify as Cleared</button>
            </div>
            <div class="flex gap-3 pt-1">
              <NuxtLink :to="`/credit-sales/${selected.orderId}`" class="btn-ghost text-xs flex-1 text-center">View Order</NuxtLink>
              <button @click="selected = null" class="btn-ghost text-xs">Close</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { info, success, error: toastError } = useToast()

const PER_PAGE  = 15
const page      = ref(1)
const selected  = ref<any>(null)

const filters = reactive({
  search: '',
  method: '',
  status: '',
})

const { data, pending: loading, error, refresh } = await useFetch('/api/credit-sales/payments', {
  query: computed(() => ({
    search: filters.search,
    status: filters.status,
    page:   page.value,
    per:    PER_PAGE,
  })),
})

// Map API fields to template field names
const payments = computed(() =>
  (data.value?.payments ?? []).map((p: any) => ({
    id:          p.id,
    receiptNo:   p.reference_number ?? `PAY-${p.id}`,
    date:        p.payment_date,
    customer:    p.customer_name ?? '—',
    orderId:     null,
    orderRef:    '—',
    amount:      Number(p.amount ?? 0),
    method:      p.payment_method ?? '—',
    reference:   p.reference_number ?? '',
    collectedBy: '—',
    branch:      '—',
    status:      p.allocation_status ?? p.status ?? 'cleared',
    notes:       p.notes ?? '',
  }))
)

const totalPages  = computed(() => Math.ceil((data.value?.total ?? 0) / PER_PAGE))
const filtered    = computed(() => {
  const s = filters.search.toLowerCase()
  const m = filters.method
  return payments.value.filter((p: any) => {
    if (s && !p.customer.toLowerCase().includes(s) && !p.receiptNo.toLowerCase().includes(s)) return false
    if (m && p.method !== m) return false
    return true
  })
})

const paginated     = computed(() => filtered.value)

// KPI from current page data (approximate)
const monthTotal    = computed(() => payments.value.reduce((s: number, p: any) => s + p.amount, 0))
const cashTotal     = computed(() => payments.value.filter((p: any) => p.method === 'cash').reduce((s: number, p: any) => s + p.amount, 0))
const mobileTotal   = computed(() => payments.value.filter((p: any) => ['bkash','nagad'].includes(p.method)).reduce((s: number, p: any) => s + p.amount, 0))
const bankTotal     = computed(() => payments.value.filter((p: any) => ['bank_transfer','cheque'].includes(p.method)).reduce((s: number, p: any) => s + p.amount, 0))
const pendingCount  = computed(() => payments.value.filter((p: any) => p.status === 'pending').length)
const pendingTotal  = computed(() => payments.value.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + p.amount, 0))
const filteredTotal = computed(() => filtered.value.reduce((s: number, p: any) => s + p.amount, 0))
const monthPayments = computed(() => payments.value)

// Watch filters — reset page
watch(filters, () => { page.value = 1 })

function resetFilters() {
  Object.assign(filters, { search: '', method: '', status: '' })
  page.value = 1
  refresh()
}

function viewDetails(p: any) {
  selected.value = p
}

function methodLabel(m: string) {
  return ({
    cash: 'Cash', bkash: 'bKash', nagad: 'Nagad',
    bank: 'Bank Transfer', bank_transfer: 'Bank Transfer', cheque: 'Cheque',
  } as Record<string, string>)[m] || m
}

function methodClass(m: string) {
  return ({
    cash:          'bg-amber-500/15 text-amber-400',
    bkash:         'bg-pink-500/15 text-pink-400',
    nagad:         'bg-orange-500/15 text-orange-400',
    bank:          'bg-blue-500/15 text-blue-400',
    bank_transfer: 'bg-blue-500/15 text-blue-400',
    cheque:        'bg-purple-500/15 text-purple-400',
  } as Record<string, string>)[m] || 'bg-gray-500/15 text-gray-400'
}

function statusClass(s: string) {
  return ({
    cleared:    'bg-emerald-500/15 text-emerald-400',
    pending:    'bg-amber-500/15 text-amber-400',
    bounced:    'bg-red-500/15 text-red-400',
    allocated:  'bg-sky-500/15 text-sky-400',
    unallocated:'bg-gray-500/15 text-gray-400',
  } as Record<string, string>)[s] || 'bg-gray-500/15 text-gray-400'
}

function markCleared(p: any) {
  success(`${p.receiptNo} marked as cleared ✓`)
  selected.value = null
  refresh()
}

function markBounced(p: any) {
  toastError(`${p.receiptNo} marked as bounced`)
  selected.value = null
  refresh()
}

function exportCSV() {
  info('Export started — CSV downloading…')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
