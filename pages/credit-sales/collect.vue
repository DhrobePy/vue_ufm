<template>
  <div class="space-y-5">
    <UiPageHeader title="Collect Payment" subtitle="Record one payment against a customer and spread it across their orders"
                  :breadcrumb="['Credit Sales', 'Collect Payment']" />

    <!-- Step 1: customer -->
    <div class="glass-card p-5 space-y-3">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">1 · Customer</p>
      <div class="relative">
        <input v-model="customerSearch" type="text" class="input-glass w-full"
               placeholder="Search customer by name / phone…" @input="searchCustomers" />
        <div v-if="customerResults.length && !selectedCustomer"
             class="absolute z-20 mt-1 w-full rounded-xl bg-[#161616] border border-white/[0.1] max-h-64 overflow-y-auto shadow-2xl">
          <button v-for="c in customerResults" :key="c.id" @click="pickCustomer(c)"
                  class="w-full text-left px-4 py-2.5 hover:bg-white/[0.05] border-b border-white/[0.04] last:border-0">
            <p class="text-sm text-gray-200 font-medium">{{ c.name }}</p>
            <p class="text-[11px] text-gray-600">{{ c.business_name }} · {{ c.phone_number }}</p>
          </button>
        </div>
      </div>
      <div v-if="selectedCustomer" class="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-3">
        <div>
          <p class="text-sm font-bold text-gray-200">{{ selectedCustomer.name }}</p>
          <p class="text-[11px] text-gray-500">{{ selectedCustomer.phone_number }}</p>
        </div>
        <button @click="resetCustomer" class="text-xs text-gray-600 hover:text-red-400">✕ change</button>
      </div>
    </div>

    <template v-if="selectedCustomer">
      <!-- Step 2: amount + method -->
      <div class="glass-card p-5 space-y-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">2 · Payment</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Amount (৳) *</label>
            <input v-model.number="form.amount" type="number" min="0" step="1"
                   class="input-glass w-full text-lg font-bold text-gold-300 text-center" @input="autoAllocate" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Method *</label>
            <select v-model="form.method" class="input-glass w-full">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Mobile Banking">Mobile Banking</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Date</label>
            <input v-model="form.date" type="date" class="input-glass w-full" />
          </div>

          <div v-if="form.method === 'Cash'" class="space-y-1.5 sm:col-span-2">
            <label class="text-[11px] text-gray-500">Petty Cash Account *</label>
            <select v-model="form.cash_account_id" class="input-glass w-full">
              <option :value="null">— Select —</option>
              <option v-for="a in cashAccounts" :key="a.id" :value="a.id">
                {{ a.account_name }} ({{ a.branch_name }})
              </option>
            </select>
          </div>
          <div v-else class="space-y-1.5 sm:col-span-2">
            <label class="text-[11px] text-gray-500">Bank Account *</label>
            <select v-model="form.bank_account_id" class="input-glass w-full">
              <option :value="null">— Select —</option>
              <option v-for="a in bankAccounts" :key="a.id" :value="a.id">
                {{ a.bank_name }} — {{ a.account_name }} ({{ a.account_number }})
              </option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Reference / TrxID</label>
            <input v-model="form.reference" type="text" class="input-glass w-full font-mono" />
          </div>
          <div v-if="form.method === 'Cheque'" class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Cheque No.</label>
            <input v-model="form.cheque_number" type="text" class="input-glass w-full font-mono" />
          </div>
          <div v-if="form.method === 'Cheque'" class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Cheque Date</label>
            <input v-model="form.cheque_date" type="date" class="input-glass w-full" />
          </div>
          <div class="space-y-1.5 sm:col-span-3">
            <label class="text-[11px] text-gray-500">Notes</label>
            <input v-model="form.notes" type="text" class="input-glass w-full" />
          </div>
        </div>
      </div>

      <!-- Step 3: allocation -->
      <div class="glass-card p-0 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">3 · Allocate to Orders</p>
          <div class="flex items-center gap-3">
            <button @click="autoAllocate" class="text-[11px] text-sky-400 hover:text-sky-300">⚡ Auto (oldest first)</button>
            <button @click="clearAllocations" class="text-[11px] text-gray-600 hover:text-gray-400">Clear</button>
          </div>
        </div>

        <div v-if="!openOrders.length" class="py-10 text-center text-gray-600 text-xs italic">
          No open orders — the full amount will sit on account (advance)
        </div>
        <div v-else class="divide-y divide-white/[0.04]">
          <div v-for="o in openOrders" :key="o.id" class="px-5 py-3 flex items-center gap-4 flex-wrap">
            <div class="min-w-[150px]">
              <p class="text-xs font-bold text-gray-300">{{ o.order_number }}</p>
              <p class="text-[10px] text-gray-600">{{ String(o.order_date).slice(0, 10) }}</p>
            </div>
            <UiStatusBadge :status="o.status" />
            <span v-if="!o.is_dispatched"
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  title="Not dispatched yet — this allocation counts as an advance on the order">
              → advance
            </span>
            <div class="flex-1 text-right text-xs text-gray-500">
              Balance <span class="font-mono font-bold text-gold-400">৳{{ Number(o.balance_due).toLocaleString() }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-gray-600">৳</span>
              <input v-model.number="allocations[o.id]" type="number" min="0" :max="o.balance_due" step="1"
                     class="input-glass w-28 py-1.5 text-xs font-mono text-right" placeholder="0" />
            </div>
          </div>
        </div>

        <div class="px-5 py-3 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs">
          <span class="text-gray-500">
            Allocated <strong class="font-mono text-gray-300">৳{{ allocatedTotal.toLocaleString() }}</strong>
            of <strong class="font-mono text-gray-300">৳{{ Number(form.amount || 0).toLocaleString() }}</strong>
          </span>
          <span :class="remaining < 0 ? 'text-red-400 font-bold' : remaining > 0 ? 'text-amber-400' : 'text-emerald-400'">
            {{ remaining < 0 ? `Over-allocated by ৳${Math.abs(remaining).toLocaleString()}`
               : remaining > 0 ? `৳${remaining.toLocaleString()} stays on account`
               : 'Fully allocated ✓' }}
          </span>
        </div>
      </div>

      <!-- Submit -->
      <div class="glass-card p-5 flex items-center justify-end gap-3">
        <NuxtLink to="/credit-sales/payments" class="btn-ghost text-xs">Cancel</NuxtLink>
        <button @click="submit" :disabled="!canSubmit || saving"
                class="btn-gold text-sm px-8 py-2.5 disabled:opacity-50">
          {{ saving ? 'Recording…' : `✓ Record ৳${Number(form.amount || 0).toLocaleString()}` }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const router = useRouter()

// ── Accounts for the money leg ────────────────────────────────────────────────
const [{ data: bankData }, { data: cashData }] = await Promise.all([
  useFetch('/api/lookup/bank-accounts'),
  useFetch('/api/lookup/cash-accounts'),
])
const bankAccounts = computed(() => ((bankData.value as any)?.accounts ?? []) as any[])
const cashAccounts = computed(() => ((cashData.value as any)?.accounts ?? []) as any[])

// ── Customer picker ───────────────────────────────────────────────────────────
const customerSearch  = ref('')
const customerResults = ref<any[]>([])
const selectedCustomer = ref<any>(null)
let searchTimer: any = null

function searchCustomers() {
  clearTimeout(searchTimer)
  if (customerSearch.value.trim().length < 2) { customerResults.value = []; return }
  searchTimer = setTimeout(async () => {
    const res: any = await $fetch('/api/customers', { query: { search: customerSearch.value, per: 8 } })
    customerResults.value = res?.customers ?? res?.rows ?? []
  }, 250)
}

const openOrders = ref<any[]>([])
async function pickCustomer(c: any) {
  selectedCustomer.value = c
  customerResults.value = []
  customerSearch.value = c.name
  const res: any = await $fetch(`/api/customers/${c.id}/open-orders`)
  openOrders.value = res?.orders ?? []
  clearAllocations()
}
function resetCustomer() {
  selectedCustomer.value = null
  customerSearch.value = ''
  openOrders.value = []
  clearAllocations()
}

// ── Form ──────────────────────────────────────────────────────────────────────
const form = reactive({
  amount: null as number | null,
  method: 'Cash',
  date: new Date().toISOString().slice(0, 10),
  bank_account_id: null as number | null,
  cash_account_id: null as number | null,
  reference: '',
  cheque_number: '',
  cheque_date: '',
  notes: '',
})

// ── Allocation ────────────────────────────────────────────────────────────────
const allocations = reactive<Record<number, number | null>>({})
const allocatedTotal = computed(() =>
  Object.values(allocations).reduce((s: number, v) => s + (Number(v) || 0), 0))
const remaining = computed(() => Number(form.amount || 0) - allocatedTotal.value)

function clearAllocations() {
  for (const k of Object.keys(allocations)) delete allocations[Number(k)]
}

/** Oldest order first, fill each balance until the money runs out. */
function autoAllocate() {
  clearAllocations()
  let left = Number(form.amount || 0)
  for (const o of openOrders.value) {
    if (left <= 0) break
    const take = Math.min(left, Number(o.balance_due))
    if (take > 0) { allocations[o.id] = take; left -= take }
  }
}

const canSubmit = computed(() =>
  selectedCustomer.value &&
  Number(form.amount) > 0 &&
  remaining.value >= -0.005 &&
  (form.method === 'Cash' ? !!form.cash_account_id : !!form.bank_account_id))

const saving = ref(false)
async function submit() {
  saving.value = true
  try {
    const res: any = await $fetch(`/api/customers/${selectedCustomer.value.id}/collect-payment`, {
      method: 'POST',
      body: {
        amount: Number(form.amount),
        payment_method: form.method,
        payment_date: form.date,
        bank_account_id: form.bank_account_id,
        cash_account_id: form.cash_account_id,
        reference_number: form.reference || undefined,
        cheque_number: form.cheque_number || undefined,
        cheque_date: form.cheque_date || undefined,
        notes: form.notes || undefined,
        allocations: Object.entries(allocations)
          .filter(([, v]) => Number(v) > 0)
          .map(([order_id, amount]) => ({ order_id: Number(order_id), amount: Number(amount) })),
      },
    })
    success(`Payment ${res.payment_number} recorded ✓`)
    router.push(`/credit-sales/receipt/${res.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record payment')
  } finally {
    saving.value = false
  }
}
</script>
