<template>
  <div class="space-y-6 max-w-4xl">
    <UiPageHeader title="Backdated Order Entry" subtitle="Admin-only — records a sale that already happened, straight to delivered with a historical ledger date"
                  :breadcrumb="['Credit Sales', 'Backdated Entry']" />

    <div class="rounded-xl p-3 text-xs text-amber-300 leading-snug" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);">
      ⚠ This skips approval, production and dispatch entirely. The order is created directly as <strong>delivered</strong> and the invoice posts to the ledger + journal on the transaction date you set below — not today. Use this only to record sales the system missed, not for new orders.
    </div>

    <div class="glass-card p-6 space-y-5">
      <h3 class="section-title">Sale Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2 space-y-1.5 relative" ref="customerComboRef">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer *</label>
          <div class="relative">
            <input
              v-model="customerQuery"
              type="text"
              class="input-glass w-full pr-8"
              placeholder="Search customer by name or business…"
              autocomplete="off"
              @focus="onCustomerFocus"
              @input="onCustomerInput"
            />
            <button v-if="form.customerId" type="button" @click="clearCustomer"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div v-if="customerDropdownOpen && filteredCustomers.length"
            class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl max-h-56 overflow-y-auto py-1.5"
            style="background:rgba(18,18,20,0.98);border:1px solid rgba(255,255,255,0.10);box-shadow:0 16px 40px rgba(0,0,0,0.65);backdrop-filter:blur(20px)">
            <button
              v-for="c in filteredCustomers" :key="c.id"
              type="button"
              class="w-full text-left px-4 py-2.5 hover:bg-white/[0.07] transition-colors"
              @mousedown.prevent="selectCustomer(c)">
              <span class="text-sm text-gray-100 font-medium">{{ c.name }}</span>
              <span v-if="c.business" class="text-xs text-gray-500 ml-2">{{ c.business }}</span>
            </button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Date * (backdated)</label>
          <input v-model="form.transactionDate" type="date" :max="todayStr" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label>
          <select v-model="form.branchId" class="input-glass">
            <option value="">Select branch…</option>
            <option v-for="b in orderBranches" :key="b.id" :value="String(b.id)">
              {{ b.branch_type === 'factory' ? '🏭' : '📍' }} {{ b.name }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</label>
          <textarea v-model="form.shippingAddress" rows="2" class="input-glass resize-none" placeholder="Optional…" />
        </div>
      </div>
    </div>

    <div class="glass-card p-6 space-y-5">
      <div class="flex items-center justify-between">
        <h3 class="section-title">Line Items</h3>
        <button @click="addItem" class="btn-ghost text-xs py-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Item
        </button>
      </div>
      <div class="space-y-3">
        <div v-for="(item, idx) in form.items" :key="idx"
             class="grid grid-cols-12 gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div class="col-span-4 space-y-1">
            <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Product Variant</label>
            <select v-model="item.variantId" class="input-glass text-xs py-2" @change="onVariantChange(item)">
              <option value="">Select…</option>
              <option v-for="v in variants" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
          </div>
          <div class="col-span-2 space-y-1">
            <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Qty</label>
            <input v-model.number="item.quantity" type="number" min="1" class="input-glass text-xs py-2" />
          </div>
          <div class="col-span-2 space-y-1">
            <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Unit Price</label>
            <input v-model.number="item.unitPrice" type="number" class="input-glass text-xs py-2" />
          </div>
          <div class="col-span-2 space-y-1">
            <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Discount</label>
            <input v-model.number="item.discount" type="number" class="input-glass text-xs py-2" />
          </div>
          <div class="col-span-1 space-y-1">
            <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Total</label>
            <p class="text-xs font-semibold text-gold-400 pt-2.5">৳{{ ((item.quantity * item.unitPrice) - item.discount).toLocaleString() }}</p>
          </div>
          <div class="col-span-1 flex items-end justify-center pb-1">
            <button @click="form.items.splice(idx,1)" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <div v-if="!form.items.length" class="py-8 text-center text-sm text-gray-600">No items added yet. Click "Add Item" to start.</div>
      </div>
      <div class="flex justify-end pt-2 border-t border-white/[0.06]">
        <div class="space-y-1.5 min-w-[220px]">
          <div class="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span class="text-gray-300">৳{{ subtotal.toLocaleString() }}</span></div>
          <div class="flex justify-between text-xs text-gray-500"><span>Total Discount</span><span class="text-red-400">-৳{{ totalDiscount.toLocaleString() }}</span></div>
          <div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.06] pt-1.5 mt-1.5"><span>Total</span><span class="text-gold-400">৳{{ orderTotal.toLocaleString() }}</span></div>
        </div>
      </div>
    </div>

    <div class="glass-card p-6 space-y-4">
      <h3 class="section-title">Already Collected (optional)</h3>
      <p class="text-xs text-gray-500">If money was already received at the time of this sale, record it here so the ledger balance is correct. Leave at ৳0 if the full amount is still outstanding.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Already Paid (৳)</label>
          <input v-model.number="form.amountPaid" type="number" min="0" :max="orderTotal" class="input-glass" placeholder="0" />
        </div>
      </div>

      <template v-if="(form.amountPaid || 0) > 0">
        <div class="rounded-xl p-4 space-y-4" style="background:rgba(16,185,129,0.04);border:1px solid rgba(16,185,129,0.15)">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method *</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="m in paymentMethods" :key="m.value" type="button"
                @click="form.paymentMethod = m.value; form.bankAccountId = ''; form.cashAccountId = ''"
                :class="['px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                  form.paymentMethod === m.value
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'border-white/10 text-gray-500 hover:border-white/20']">
                {{ m.icon }} {{ m.label }}
              </button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template v-if="form.paymentMethod === 'Cash'">
              <div class="md:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Petty Cash Account *</label>
                <UiSearchSelect v-model="form.cashAccountId" :options="cashAccountOptions" placeholder="Type cash box / account name…" />
              </div>
            </template>
            <template v-if="['Bank Transfer','Cheque','Card','Mobile Banking'].includes(form.paymentMethod)">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account *</label>
                <UiSearchSelect v-model="form.bankAccountId" :options="bankAccountOptions" placeholder="Type bank name or account number…" />
              </div>
              <template v-if="form.paymentMethod === 'Cheque'">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cheque Number</label>
                  <input v-model="form.chequeNumber" class="input-glass font-mono" placeholder="e.g. 001234" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cheque Date</label>
                  <input v-model="form.chequeDate" type="date" class="input-glass" />
                </div>
              </template>
            </template>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference / Receipt No.</label>
              <input v-model="form.reference" class="input-glass font-mono" placeholder="Optional" />
            </div>
          </div>
        </div>
      </template>

      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes / Reason</label>
        <textarea v-model="form.notes" rows="2" class="input-glass resize-none" placeholder="Why this is being entered late…" />
      </div>
    </div>

    <div class="flex items-center justify-end gap-3">
      <NuxtLink to="/credit-sales" class="btn-ghost">Cancel</NuxtLink>
      <button @click="submit" class="btn-gold" :disabled="!canSubmit || submitting">
        <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
        {{ submitting ? 'Recording…' : 'Record Backdated Sale' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))
if (!isAdminUser.value) {
  throw createError({ statusCode: 403, statusMessage: 'Backdated order entry is admin/superadmin only' })
}

const submitting = ref(false)
const todayStr = new Date().toISOString().slice(0, 10)

const { data: branchListData } = await useFetch('/api/branches')
const orderBranches = computed(() =>
  (((branchListData.value as any)?.branches ?? []) as any[])
    .filter(b => b.status === 'active' && b.branch_type !== 'office'))

const form = reactive({
  customerId: '', transactionDate: todayStr, branchId: '', shippingAddress: '',
  items: [{ variantId: '', productId: '', quantity: 1, unitPrice: 0, discount: 0 }],
  amountPaid: 0,
  paymentMethod: 'Cash' as string,
  bankAccountId: '' as string | number,
  cashAccountId: '' as string | number,
  reference: '', chequeNumber: '', chequeDate: '',
  notes: '',
})

const customerQuery        = ref('')
const customerDropdownOpen = ref(false)
const customerComboRef     = ref<HTMLElement | null>(null)

const paymentMethods = [
  { value: 'Cash',           icon: '💵', label: 'Cash' },
  { value: 'Bank Transfer',  icon: '🏦', label: 'Bank Transfer' },
  { value: 'Cheque',         icon: '📄', label: 'Cheque' },
  { value: 'Mobile Banking', icon: '📱', label: 'Mobile Banking' },
  { value: 'Card',           icon: '💳', label: 'Card' },
]

const [{ data: custData }, { data: bankData }, { data: pettyData }] = await Promise.all([
  useFetch('/api/customers', { query: { per: 500, simple: '1' } }),
  useFetch('/api/lookup/bank-accounts'),
  useFetch('/api/lookup/cash-accounts'),
])
const { data: prodData } = await useFetch('/api/products', {
  query: computed(() => form.branchId ? { branch_id: form.branchId } : {}),
})

const customers = computed(() =>
  (custData.value?.customers ?? []).map((c: any) => ({
    id: String(c.id), name: c.name, business: c.business_name || c.customer_type || '',
  })))
const bankAccountOptions = computed(() => ((bankData.value?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: `${a.bank_name} — AC: ${a.account_number}`, sub: a.branch_name || a.account_name || '',
})))
const cashAccountOptions = computed(() => ((pettyData.value?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: a.account_name, sub: a.branch_name || 'Head Office',
})))

const filteredCustomers = computed(() => {
  const q = customerQuery.value.toLowerCase().trim()
  if (!q) return customers.value.slice(0, 20)
  return customers.value.filter(c => c.name.toLowerCase().includes(q) || (c.business || '').toLowerCase().includes(q)).slice(0, 20)
})

function onCustomerFocus() {
  customerDropdownOpen.value = true
  if (form.customerId) customerQuery.value = ''
}
function onCustomerInput() { customerDropdownOpen.value = true; form.customerId = '' }
function selectCustomer(c: { id: string; name: string; business: string }) {
  form.customerId = c.id
  customerQuery.value = c.name + (c.business ? ' · ' + c.business : '')
  customerDropdownOpen.value = false
}
function clearCustomer() { form.customerId = ''; customerQuery.value = ''; customerDropdownOpen.value = true }

onMounted(() => {
  function handleClickOutside(e: MouseEvent) {
    if (customerComboRef.value && !customerComboRef.value.contains(e.target as Node)) {
      customerDropdownOpen.value = false
      if (form.customerId && !customerQuery.value) {
        const c = customers.value.find(x => x.id === form.customerId)
        if (c) customerQuery.value = c.name + (c.business ? ' · ' + c.business : '')
      }
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
})

const variants = computed(() => {
  const list: Array<{ id: string; name: string; productId: string; price: number | null }> = []
  for (const p of (prodData.value?.products ?? []) as any[]) {
    for (const v of p.variants ?? []) {
      const priceLabel = v.unit_price ? ` · ৳${Number(v.unit_price).toLocaleString()}` : ''
      const gradeLabel = v.grade ? ` [${v.grade}]` : ''
      list.push({ id: String(v.id), name: `${p.base_name} (${v.weight_variant})${gradeLabel}${priceLabel}`, productId: String(p.id), price: v.unit_price ? Number(v.unit_price) : null })
    }
  }
  return list
})

function onVariantChange(item: any) {
  const match = variants.value.find(v => v.id === item.variantId)
  if (match) { item.productId = match.productId; if (match.price) item.unitPrice = match.price }
}

function addItem() { form.items.push({ variantId: '', productId: '', quantity: 1, unitPrice: 0, discount: 0 }) }

const subtotal      = computed(() => form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
const totalDiscount  = computed(() => form.items.reduce((s, i) => s + (i.discount || 0), 0))
const orderTotal     = computed(() => subtotal.value - totalDiscount.value)

const canSubmit = computed(() =>
  !!form.customerId && !!form.transactionDate &&
  form.items.some(i => i.variantId) &&
  ((form.amountPaid || 0) === 0 ||
    (form.paymentMethod === 'Cash' ? !!form.cashAccountId : !!form.bankAccountId)))

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const result = await $fetch('/api/credit-sales/backdated', {
      method: 'POST',
      body: {
        customer_id:      Number(form.customerId),
        branch_id:        form.branchId ? Number(form.branchId) : null,
        transaction_date: form.transactionDate,
        delivery_address: form.shippingAddress || null,
        notes:            form.notes || null,
        items: form.items.filter(i => i.variantId).map(i => ({
          product_id:      i.productId ? Number(i.productId) : null,
          variant_id:      Number(i.variantId),
          qty_bags:        i.quantity,
          unit_price:      i.unitPrice,
          discount_amount: i.discount || 0,
        })),
        amount_paid:      form.amountPaid || 0,
        payment_method:   (form.amountPaid || 0) > 0 ? form.paymentMethod : undefined,
        bank_account_id:  form.bankAccountId || undefined,
        cash_account_id:  form.cashAccountId || undefined,
        reference_number: form.reference || undefined,
        cheque_number:    form.chequeNumber || undefined,
        cheque_date:      form.chequeDate || undefined,
      },
    }) as any
    success(`${result.order_number} recorded — ৳${result.total_amount.toLocaleString()} dated ${form.transactionDate} ✓`)
    navigateTo(`/credit-sales/${result.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record backdated entry')
  } finally {
    submitting.value = false
  }
}
</script>
