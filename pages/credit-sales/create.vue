<template>
  <div class="space-y-6 max-w-4xl">
    <UiPageHeader title="Create Credit Order" subtitle="Fill in customer, line items, discount and advance" :breadcrumb="['Credit Sales','Create Order']" />

    <!-- Step indicator -->
    <div class="flex items-center gap-0">
      <div v-for="(step, i) in steps" :key="i" class="flex items-center">
        <div :class="['flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
                      currentStep === i ? 'bg-gold-500/15 border border-gold-500/25' : 'opacity-40']">
          <div :class="['w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                        currentStep > i ? 'bg-gold-500 text-black' : currentStep === i ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'bg-white/[0.06] text-gray-600']">
            <svg v-if="currentStep > i" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span :class="['text-xs font-medium', currentStep === i ? 'text-gold-300' : 'text-gray-500']">{{ step }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="w-8 h-px bg-white/[0.08]" />
      </div>
    </div>

    <!-- Step 1: Customer -->
    <div v-if="currentStep === 0" class="glass-card p-6 space-y-5 animate-slide-up">
      <h3 class="section-title">Customer Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer *</label>
          <select v-model="form.customerId" class="input-glass">
            <option value="">Select customer…</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }} · {{ c.business }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date *</label>
          <input v-model="form.orderDate" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Required Date</label>
          <input v-model="form.requiredDate" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label>
          <select v-model="form.branchId" class="input-glass">
            <option value="">Select branch…</option>
            <option value="1">Sirajgonj</option>
            <option value="2">Demra</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
          <select v-model="form.priority" class="input-glass">
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</label>
          <textarea v-model="form.shippingAddress" rows="2" class="input-glass resize-none" placeholder="Delivery address…" />
        </div>
      </div>
      <!-- Credit info banner -->
      <div v-if="form.customerId && selectedCustomer" class="flex items-center gap-3 p-3.5 rounded-xl" style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.15);">
        <svg class="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="flex-1 flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <span class="text-gray-400">Credit Limit: <strong class="text-gray-200">৳{{ Number(selectedCustomer.credit_limit || 0).toLocaleString() }}</strong></span>
          <span class="text-gray-400">Outstanding: <strong class="text-orange-300">৳{{ Number(selectedCustomer.current_balance || 0).toLocaleString() }}</strong></span>
          <span class="text-gray-400">Available: <strong :class="creditAvailable > 0 ? 'text-emerald-300' : 'text-red-400'">৳{{ creditAvailable.toLocaleString() }}</strong></span>
          <span class="text-gray-400">Utilisation: <strong :class="creditUtilPct > 80 ? 'text-red-400' : 'text-orange-300'">{{ creditUtilPct }}%</strong></span>
        </div>
      </div>
    </div>

    <!-- Step 2: Line items -->
    <div v-if="currentStep === 1" class="glass-card p-6 space-y-5 animate-slide-up">
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
          <div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.06] pt-1.5 mt-1.5"><span>Total</span><span class="text-gold-400">৳{{ (subtotal - totalDiscount).toLocaleString() }}</span></div>
        </div>
      </div>
    </div>

    <!-- Step 3: Summary -->
    <div v-if="currentStep === 2" class="glass-card p-6 space-y-5 animate-slide-up">
      <h3 class="section-title">Payment & Notes</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advance Paid</label>
          <input v-model.number="form.advancePaid" type="number" class="input-glass" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Discount</label>
          <input v-model.number="form.overallDiscount" type="number" class="input-glass" placeholder="0" />
        </div>
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Instructions</label>
          <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Any special instructions for this order…" />
        </div>
      </div>
      <!-- Order summary -->
      <div class="rounded-xl p-4 space-y-2" style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12);">
        <div class="flex justify-between text-xs text-gray-500"><span>Order Total</span><span class="text-gray-300 font-medium">৳{{ (subtotal - totalDiscount).toLocaleString() }}</span></div>
        <div class="flex justify-between text-xs text-gray-500"><span>Advance</span><span class="text-emerald-400 font-medium">-৳{{ (form.advancePaid || 0).toLocaleString() }}</span></div>
        <div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.08] pt-2 mt-1"><span>Balance Due</span><span class="text-gold-400">৳{{ Math.max(0, subtotal - totalDiscount - (form.advancePaid || 0)).toLocaleString() }}</span></div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <button v-if="currentStep > 0" @click="currentStep--" class="btn-ghost">← Back</button>
      <div v-else />
      <div class="flex gap-3">
        <NuxtLink to="/credit-sales" class="btn-ghost">Cancel</NuxtLink>
        <button v-if="currentStep < steps.length - 1" @click="currentStep++" class="btn-gold">Continue →</button>
        <button v-else @click="submitOrder" class="btn-gold" :disabled="submitting">
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          {{ submitting ? 'Submitting…' : 'Submit Order' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const currentStep = ref(0)
const steps = ['Customer', 'Line Items', 'Summary']
const submitting = ref(false)

const form = reactive({
  customerId: '', orderDate: new Date().toISOString().split('T')[0],
  requiredDate: '', branchId: '', priority: 'normal',
  shippingAddress: '', advancePaid: 0, overallDiscount: 0, notes: '',
  items: [{ variantId: '', productId: '', quantity: 1, unitPrice: 0, discount: 0 }],
})

// Load customers and products from real API in parallel
const [{ data: custData }, { data: prodData }] = await Promise.all([
  useFetch('/api/customers', { query: { per: 200 } }),
  useFetch('/api/products'),
])

const customers = computed(() =>
  (custData.value?.customers ?? []).map((c: any) => ({
    id: String(c.id),
    name: c.name,
    business: c.business_name || c.customer_type || '',
    credit_limit:     c.credit_limit,
    current_balance:  c.current_balance,
  }))
)

const selectedCustomer = computed(() =>
  customers.value.find(c => c.id === form.customerId) ?? null
)

const creditAvailable = computed(() => {
  if (!selectedCustomer.value) return 0
  return Math.max(0, Number(selectedCustomer.value.credit_limit || 0) - Number(selectedCustomer.value.current_balance || 0))
})

const creditUtilPct = computed(() => {
  if (!selectedCustomer.value) return 0
  const limit   = Number(selectedCustomer.value.credit_limit   || 0)
  const balance = Number(selectedCustomer.value.current_balance || 0)
  if (!limit) return 0
  return Math.min(100, Math.round((balance / limit) * 100))
})

// Flatten product variants for the line-item dropdown
const variants = computed(() => {
  const list: Array<{ id: string; name: string; productId: string; price: number | null }> = []
  for (const p of (prodData.value?.products ?? []) as any[]) {
    for (const v of p.variants ?? []) {
      list.push({
        id: String(v.id),
        name: `${p.base_name} — ${v.weight_variant}`,
        productId: String(p.id),
        price: v.unit_price ? Number(v.unit_price) : null,
      })
    }
  }
  return list
})

// Auto-fill unit price when variant is chosen
function onVariantChange(item: any) {
  const match = variants.value.find(v => v.id === item.variantId)
  if (match) {
    item.productId = match.productId
    if (match.price) item.unitPrice = match.price
  }
}

const subtotal     = computed(() => form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
const totalDiscount = computed(() => form.items.reduce((s, i) => s + (i.discount || 0), 0) + (form.overallDiscount || 0))

function addItem() { form.items.push({ variantId: '', productId: '', quantity: 1, unitPrice: 0, discount: 0 }) }

// ── Auto-save draft to localStorage every 30s ────
const DRAFT_KEY = 'erp_order_draft'
let draftTimer: ReturnType<typeof setInterval>
onMounted(() => {
  const saved = localStorage.getItem(DRAFT_KEY)
  if (saved) { try { Object.assign(form, JSON.parse(saved)) } catch {} }
  draftTimer = setInterval(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)) }, 30_000)
})
onUnmounted(() => clearInterval(draftTimer))

async function submitOrder() {
  submitting.value = true
  try {
    const result = await $fetch('/api/credit-sales', {
      method: 'POST',
      body: {
        customer_id:      Number(form.customerId),
        branch_id:        form.branchId ? Number(form.branchId) : null,
        order_date:       form.orderDate,
        required_date:    form.requiredDate || null,
        priority:         form.priority,
        delivery_address: form.shippingAddress || null,
        special_notes:    form.notes || null,
        amount_paid:      form.advancePaid || 0,
        items: form.items
          .filter(i => i.variantId)
          .map(i => ({
            product_id:      i.productId ? Number(i.productId) : null,
            variant_id:      Number(i.variantId),
            qty_bags:        i.quantity,
            unit_price:      i.unitPrice,
            discount_amount: i.discount || 0,
          })),
      },
    }) as any
    localStorage.removeItem(DRAFT_KEY)
    success(`Order ${result.order_number} created ✓`)
    navigateTo(`/credit-sales/${result.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to create order')
  } finally {
    submitting.value = false
  }
}
</script>
