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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label>
            <input v-model="form.date" type="date" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label>
            <select v-model="form.method" class="input-glass">
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer / BEFTN</option>
              <option value="cheque">Cheque</option>
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

        <!-- Reference (for bank/cheque) -->
        <div v-if="form.method !== 'cash'" class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference / Cheque No. *</label>
          <input v-model="form.reference" type="text" class="input-glass font-mono" placeholder="BEFTN ref, cheque no., or TxID" />
        </div>

        <!-- Company bank account -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Bank Account *</label>
          <select v-model="form.bankAccountId" class="input-glass">
            <option value="">— Paid from —</option>
            <option v-for="ba in bankAccounts" :key="ba.id" :value="ba.id">
              {{ ba.bank_name }} — {{ ba.account_number }}
            </option>
          </select>
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
  useFetch('/api/bank-accounts'),
  useFetch('/api/purchase/payments', { query: { per: 5 } }),
])

const suppliers     = computed(() => (suppData.value as any)?.suppliers    ?? [])
const openPOs       = computed(() => (poData.value  as any)?.orders        ?? [])
const bankAccounts  = computed(() => (baData.value  as any)?.accounts      ?? [])
const recentPayments = computed(() => (pmtData.value as any)?.payments     ?? [])

const form = reactive({
  supplierId:    '' as number | string,
  poId:          '' as number | string,
  date:          new Date().toISOString().slice(0, 10),
  method:        'bank',
  amount:        null as number | null,
  reference:     '',
  bankAccountId: '' as number | string,
  notes:         '',
})

const saving = ref(false)

const selectedSupplier = computed(() => suppliers.value.find((s: any) => s.id === Number(form.supplierId)))
const filteredPOs      = computed(() => openPOs.value.filter((po: any) => {
  if (!form.supplierId) return true
  return po.supplier_id === Number(form.supplierId)
}))
const selectedPO = computed(() => openPOs.value.find((po: any) => po.id === Number(form.poId)))

const isValid = computed(() =>
  form.supplierId && form.poId && form.date && form.method && form.bankAccountId &&
  form.amount && form.amount > 0 &&
  (form.method === 'cash' || form.reference)
)

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
