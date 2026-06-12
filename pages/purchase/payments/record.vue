<template>
  <div class="space-y-6">
    <UiPageHeader title="Record Supplier Payment" subtitle="Record a payment made to a wheat supplier"
                  :breadcrumb="['Purchase', 'Payments', 'Record Payment']">
      <template #actions>
        <NuxtLink to="/purchase/payments" class="btn-ghost text-xs">← Payment History</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 space-y-5">
        <h3 class="section-title">Payment Details</h3>

        <!-- Supplier select -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supplier *</label>
          <select v-model="form.supplierId" class="input-glass" @change="form.poId = ''">
            <option value="">— Select supplier —</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.company_name }}</option>
          </select>
        </div>

        <!-- PO select (filtered by supplier) -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order *</label>
          <select v-model="form.poId" class="input-glass">
            <option value="">— Select PO —</option>
            <option v-for="po in filteredPOs" :key="po.id" :value="po.id">
              {{ po.po_number }} — ৳{{ Number(po.balance_payable ?? 0).toLocaleString() }} due
            </option>
          </select>
        </div>

        <!-- Payment type (when was it paid?) -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Type *</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button v-for="pt in paymentTypes" :key="pt.value"
              type="button"
              @click="form.payType = pt.value"
              :class="['px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center',
                form.payType === pt.value
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20']">
              <div>{{ pt.label }}</div>
              <div class="text-[10px] font-normal opacity-70 mt-0.5">{{ pt.hint }}</div>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label>
            <input v-model="form.date" type="date" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {{ form.payType === 'contra' ? 'Contra Method' : 'Payment Method *' }}
            </label>
            <select v-model="form.method" class="input-glass">
              <option v-if="form.payType === 'contra'" value="contra">Contra / Sales Offset</option>
              <template v-else>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer / BEFTN</option>
                <option value="cheque">Cheque</option>
                <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
              </template>
            </select>
          </div>
        </div>

        <!-- Amount -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (৳) *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
            <input v-model.number="form.amount" type="number" min="1" class="input-glass pl-8 font-mono text-lg font-bold" placeholder="0" />
          </div>
          <div class="flex gap-2 mt-2" v-if="selectedPO">
            <button @click="form.amount = Number(selectedPO.balance_payable)"
              class="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
              Full Outstanding ৳{{ Number(selectedPO.balance_payable ?? 0).toLocaleString() }}
            </button>
          </div>
        </div>

        <!-- Reference: sales invoice for contra; cheque/BEFTN ref for others -->
        <div v-if="form.payType === 'contra'" class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sales Invoice / Reference *</label>
          <input v-model="form.reference" type="text" class="input-glass font-mono"
            placeholder="Credit invoice no. or reference being offset…" />
          <p class="text-[11px] text-gray-500">Enter the sales invoice number that offsets this payment amount.</p>
        </div>
        <div v-else-if="form.method !== 'cash'" class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference / Cheque No. *</label>
          <input v-model="form.reference" type="text" class="input-glass font-mono" placeholder="BEFTN ref, cheque no., TxID, or bKash TrxID" />
        </div>

        <!-- Company bank account — hide for contra and cash -->
        <div v-if="form.payType !== 'contra' && form.method !== 'cash'" class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Bank Account *</label>
          <UiSearchSelect v-model="form.bankAccountId" :options="bankAccountOptions"
            placeholder="Type bank name or account number…" />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
          <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Remarks about this payment…" />
        </div>

        <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Recording…' : 'Record Payment' }}
          </button>
          <NuxtLink to="/purchase/payments" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <div v-if="selectedSupplier" class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Supplier Info</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Name</span><span class="text-gray-300">{{ selectedSupplier.company_name }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Outstanding</span><span class="font-bold text-red-400">৳{{ Number(selectedSupplier.current_balance ?? 0).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Credit Limit</span><span class="text-gray-300">৳{{ Number(selectedSupplier.credit_limit ?? 0).toLocaleString() }}</span></div>
          </div>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Recent Payments</h3>
          <div v-for="p in recentPayments" :key="p.id" class="py-2 border-b border-white/[0.04] last:border-0 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-300 font-semibold">৳{{ Number(p.amount_paid).toLocaleString() }}</span>
              <span class="text-gray-600">{{ p.payment_date }}</span>
            </div>
            <p class="text-gray-500 mt-0.5">{{ p.supplier_name }} · {{ p.payment_method }}</p>
          </div>
          <p v-if="!recentPayments.length" class="text-xs text-gray-600 text-center py-2">No recent payments</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

// Load suppliers, open POs, bank accounts, and recent payments in parallel
const [{ data: suppData }, { data: poData }, { data: baData }, { data: pmtData }] = await Promise.all([
  useFetch('/api/suppliers', { query: { per: 100 } }),
  useFetch('/api/purchase/orders/open'),
  useFetch('/api/lookup/bank-accounts'),
  useFetch('/api/purchase/payments', { query: { per: 5 } }),
])

const suppliers     = computed(() => (suppData.value as any)?.suppliers    ?? [])
const openPOs       = computed(() => (poData.value  as any)?.orders        ?? [])
const bankAccounts  = computed(() => (baData.value  as any)?.accounts      ?? [])

const bankAccountOptions = computed(() => (bankAccounts.value as any[]).map(a => ({
  value: a.id,
  label: `${a.bank_name} — AC: ${a.account_number}`,
  sub:   a.branch_name || a.account_name || '',
})))
const recentPayments = computed(() => (pmtData.value as any)?.payments     ?? [])

const paymentTypes = [
  { value: 'advance',          label: 'Advance',          hint: 'Before delivery' },
  { value: 'credit',           label: 'Credit',           hint: 'After delivery' },
  { value: 'against_delivery', label: 'Against Delivery', hint: 'Delivery expenses' },
  { value: 'contra',           label: 'Contra / Offset',  hint: 'Sales invoice set-off' },
]

const form = reactive({
  supplierId:    '' as number | string,
  poId:          '' as number | string,
  date:          new Date().toISOString().slice(0, 10),
  payType:       'credit',
  method:        'bank',
  amount:        null as number | null,
  reference:     '',
  bankAccountId: '' as number | string,
  notes:         '',
})

// When payType changes to contra, auto-set method; when leaving contra restore bank
watch(() => form.payType, (val) => {
  if (val === 'contra') form.method = 'contra'
  else if (form.method === 'contra') form.method = 'bank'
})

const saving = ref(false)

const selectedSupplier = computed(() => suppliers.value.find((s: any) => s.id === Number(form.supplierId)))
const filteredPOs      = computed(() => openPOs.value.filter((po: any) => {
  if (!form.supplierId) return true
  return po.supplier_id === Number(form.supplierId)
}))
const selectedPO = computed(() => openPOs.value.find((po: any) => po.id === Number(form.poId)))

const isValid = computed(() => {
  if (!form.supplierId || !form.poId || !form.date || !form.method) return false
  if (!form.amount || form.amount <= 0) return false
  // Contra: need reference (invoice no.), no bank account needed
  if (form.payType === 'contra') return !!form.reference
  // Cash/mobile: no bank account or ref needed
  if (form.method === 'cash' || form.method === 'mobile_banking') return true
  // Bank/cheque: need reference and bank account
  return !!form.reference && !!form.bankAccountId
})

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const result: any = await $fetch('/api/purchase/payments', {
      method: 'POST',
      body: {
        purchase_order_id: Number(form.poId),
        payment_date:      form.date,
        amount_paid:       form.amount,
        payment_method:    form.method,
        payment_type:      form.payType,
        bank_account_id:   form.bankAccountId ? Number(form.bankAccountId) : null,
        reference_number:  form.reference || null,
        remarks:           form.notes || null,
      },
    })
    success(`Payment ${result.voucher_number} recorded — ৳${(form.amount || 0).toLocaleString()}`)
    navigateTo('/purchase/payments')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to record payment')
  } finally {
    saving.value = false
  }
}
</script>
