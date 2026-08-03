<template>
  <div class="h-screen flex gap-0 -mx-6 -my-6 overflow-hidden">

    <!-- Left: Product grid -->
    <div class="flex-1 flex flex-col min-w-0 bg-surface-400 border-r border-white/[0.06]">
      <!-- Search bar -->
      <div class="p-4 border-b border-white/[0.06]">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input v-model="search" class="input-glass pl-10 text-sm" placeholder="Search by product name or SKU…" />
        </div>
      </div>
      <!-- Categories -->
      <div class="flex gap-2 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
        <button v-for="cat in categories" :key="cat"
          @click="activeCategory = cat"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150',
                   activeCategory === cat
                     ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25'
                     : 'text-gray-500 border border-white/[0.07] hover:text-gray-300']">
          {{ cat }}
        </button>
      </div>
      <!-- Grid -->
      <div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
        <template v-if="pending">
          <div v-for="i in skeletonCount" :key="i" class="glass-card p-4 h-32 animate-pulse" />
        </template>
        <template v-else>
          <button
            v-for="p in filteredProducts" :key="p.id"
            @click="addToCart(p)"
            class="glass-card-hover p-4 text-left space-y-2 group active:scale-[0.97] transition-transform duration-100"
          >
            <div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg mb-2">🌾</div>
            <p class="text-xs font-semibold text-gray-200 leading-tight group-hover:text-white transition-colors">
              {{ p.base_name }} {{ p.weight_variant }}
            </p>
            <p class="text-[10px] text-gray-600 font-mono">{{ p.sku }}</p>
            <p class="text-sm font-bold text-gold-400">৳{{ Number(p.price).toLocaleString() }}</p>
          </button>
          <div v-if="!filteredProducts.length" class="col-span-full py-12 text-center">
            <p class="text-3xl mb-2">🔍</p>
            <p class="text-sm text-gray-600">No products found</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Right: Cart -->
    <div class="w-80 xl:w-96 flex flex-col shrink-0 overflow-y-auto no-scrollbar" style="background: rgba(20,16,10,0.9); backdrop-filter: blur(16px);">
      <div class="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h2 class="font-display font-bold text-white">Cart</h2>
          <p class="text-xs text-gray-500">{{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }}</p>
        </div>
        <button @click="cart = []" class="text-xs text-gray-600 hover:text-red-400 transition-colors">Clear all</button>
      </div>

      <!-- Customer select + walk-in quick-capture -->
      <div class="px-3 pt-3 pb-2 border-b border-white/[0.04] space-y-1.5">
        <select v-model="selectedCustomer" class="input-glass text-xs py-2">
          <option :value="null">Walk-in / Counter Customer</option>
          <option v-for="c in posCustomers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <template v-if="selectedCustomer === null">
          <div class="grid grid-cols-2 gap-1.5">
            <input v-model="walkInName" type="text" placeholder="Name (optional)" class="input-glass text-xs py-1.5 px-2" />
            <input v-model="walkInPhone" type="tel" placeholder="Phone (optional)" class="input-glass text-xs py-1.5 px-2" />
          </div>
          <label v-if="walkInName.trim()" class="flex items-center gap-1.5 text-[11px] text-gray-500 cursor-pointer select-none">
            <input type="checkbox" v-model="saveWalkIn" class="accent-gold-500 rounded" />
            Save as POS customer for future
          </label>
        </template>
      </div>

      <!-- Cart items -->
      <div class="p-3 space-y-2">
        <div v-if="!cart.length" class="py-12 text-center">
          <p class="text-3xl mb-3">🛒</p>
          <p class="text-sm text-gray-600">Cart is empty</p>
          <p class="text-xs text-gray-700 mt-1">Click products to add them</p>
        </div>
        <div v-for="item in cart" :key="item.id" class="glass-card p-3 flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-gray-200 leading-tight truncate">{{ item.name }}</p>
            <p class="text-[11px] text-gold-400 font-bold mt-0.5">৳{{ Number(item.price).toLocaleString() }}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button @click="item.qty = Math.max(1, item.qty - 1)" class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center">−</button>
            <span class="w-6 text-center text-xs font-bold text-gray-200">{{ item.qty }}</span>
            <button @click="item.qty++" class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center">+</button>
          </div>
          <button @click="removeFromCart(item.id)" class="text-gray-700 hover:text-red-400 transition-colors ml-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Totals + payment -->
      <div class="p-4 border-t border-white/[0.06] space-y-3">
        <div class="flex justify-between text-xs text-gray-500">
          <span>Subtotal</span>
          <span class="text-gray-300 font-medium">৳{{ subtotal.toLocaleString() }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>Discount</span>
          <div class="flex items-center gap-2">
            <span class="text-gray-600">৳</span>
            <input v-model.number="discount" type="number" min="0" :max="subtotal"
              class="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40" />
          </div>
        </div>
        <div class="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-2">
          <span class="text-gray-200">Total</span>
          <span class="text-gold-400 text-base">৳{{ total.toLocaleString() }}</span>
        </div>

        <!-- Split cash + credit -->
        <label class="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer select-none">
          <input type="checkbox" v-model="splitPayment" class="accent-gold-500 rounded" />
          Split payment (part cash, part on credit)
        </label>
        <div v-if="splitPayment" class="space-y-2 rounded-xl p-2.5" style="background:rgba(255,255,255,0.03)">
          <div class="flex items-center justify-between gap-2 text-xs">
            <span class="text-gray-500 w-16">Paid now</span>
            <input v-model.number="cashAmount" type="number" min="0" :max="total" class="input-glass text-xs py-1 flex-1 text-right font-mono" />
          </div>
          <div class="flex items-center justify-between gap-2 text-xs">
            <span class="text-gray-500 w-16">On credit</span>
            <span class="font-mono text-orange-400 flex-1 text-right">৳{{ creditAmount.toLocaleString() }}</span>
          </div>
          <p v-if="!selectedCustomer" class="text-[10px] text-red-400">A customer must be selected for any credit portion.</p>
        </div>

        <!-- Payment method (for the "paid now" portion) -->
        <div class="grid grid-cols-3 gap-1.5">
          <button v-for="m in paymentMethods" :key="m"
            @click="paymentMethod = m"
            :class="['py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 border',
                     paymentMethod === m ? 'bg-gold-500/15 border-gold-500/30 text-gold-400' : 'border-white/[0.07] text-gray-500 hover:text-gray-300']">
            {{ m }}
          </button>
        </div>
        <div v-if="paymentMethod === 'Cash' && payingNow > 0" class="space-y-1">
          <label class="text-[10px] text-gray-600 uppercase">Cash Box</label>
          <select v-model="cashAccountId" class="input-glass text-xs py-1.5">
            <option value="">Select…</option>
            <option v-for="a in cashAccounts" :key="a.id" :value="a.id">{{ a.account_name }}{{ a.branch_name ? ` — ${a.branch_name}` : '' }}</option>
          </select>
        </div>
        <div v-else-if="payingNow > 0" class="space-y-1">
          <label class="text-[10px] text-gray-600 uppercase">Bank/Gateway Account</label>
          <select v-model="bankAccountId" class="input-glass text-xs py-1.5">
            <option value="">Select…</option>
            <option v-for="a in bankAccounts" :key="a.id" :value="a.id">{{ a.bank_name }} — {{ a.account_number }}</option>
          </select>
        </div>

        <button
          :disabled="!canComplete || completing"
          @click="completeSale"
          class="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          {{ completing ? 'Processing…' : `Complete Sale · ৳${total.toLocaleString()}` }}
        </button>
      </div>
    </div>

    <!-- Success modal -->
    <PosSuccessModal
      v-model="successModal"
      :receipt-no="lastReceiptNo" :total="lastTotal" :subtotal="lastSubtotal" :discount="lastDiscount"
      :cash-amount="lastCashAmount" :credit-amount="lastCreditAmount" :payment-method="lastPaymentMethod"
      :customer-name="lastCustomerName" :exit-status="lastExitStatus" :items="lastItems" :verify-url="lastVerifyUrl"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { error, success: successToast } = useToast()

const skeletonCount = 8
const search           = ref('')
const activeCategory   = ref('All')
const discount         = ref(0)
const paymentMethod    = ref('Cash')
const selectedCustomer = ref<number | null>(null)
const walkInName  = ref('')
const walkInPhone = ref('')
const saveWalkIn  = ref(false)

const splitPayment = ref(false)
const cashAmount   = ref(0)
const cashAccountId = ref<number | ''>('')
const bankAccountId = ref<number | ''>('')

const successModal      = ref(false)
const completing        = ref(false)
const lastReceiptNo      = ref('')
const lastTotal           = ref(0)
const lastSubtotal        = ref(0)
const lastDiscount        = ref(0)
const lastCashAmount      = ref(0)
const lastCreditAmount    = ref(0)
const lastPaymentMethod   = ref('')
const lastCustomerName    = ref('')
const lastExitStatus      = ref('cleared')
const lastItems            = ref<Array<{ name: string; qty: number; price: number }>>([])
const lastVerifyUrl       = ref('')

const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'bKash', 'Nagad']

const { data: productData, pending } = await useFetch('/api/pos/products')
const allProducts = computed(() => (productData.value as any)?.products ?? [])
const categories  = computed(() => (productData.value as any)?.categories ?? ['All'])

const { data: custData, refresh: refreshCustomers } = await useFetch('/api/customers', { query: { type: 'POS', per: 200 } })
const posCustomers = computed(() => (custData.value as any)?.customers ?? [])

const { data: cashData }  = await useFetch('/api/lookup/cash-accounts')
const { data: bankData }  = await useFetch('/api/lookup/bank-accounts')
const cashAccounts = computed(() => (cashData.value as any)?.accounts ?? [])
const bankAccounts = computed(() => (bankData.value as any)?.accounts ?? [])

const filteredProducts = computed(() => allProducts.value.filter((p: any) =>
  (activeCategory.value === 'All' || p.category === activeCategory.value) &&
  (`${p.base_name} ${p.weight_variant ?? ''}`.toLowerCase().includes(search.value.toLowerCase()) ||
   p.sku.toLowerCase().includes(search.value.toLowerCase()))
))

const cart = ref<Array<{ id: number; variantId: number; name: string; price: number; qty: number }>>([])

function addToCart(p: any) {
  const existing = cart.value.find(i => i.id === p.id)
  if (existing) existing.qty++
  else cart.value.push({ id: p.id, variantId: p.id, name: `${p.base_name} ${p.weight_variant ?? ''}`.trim(), price: Number(p.price), qty: 1 })
}
function removeFromCart(id: number) { cart.value = cart.value.filter(i => i.id !== id) }

const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))
const total    = computed(() => Math.max(0, subtotal.value - (discount.value || 0)))

// When split is off, the whole total is "paid now". When on, cashAmount is user-entered.
const payingNow    = computed(() => splitPayment.value ? Math.min(Math.max(0, cashAmount.value || 0), total.value) : total.value)
const creditAmount = computed(() => Math.max(0, total.value - payingNow.value))

const canComplete = computed(() => {
  if (!cart.value.length) return false
  if (creditAmount.value > 0.005 && !selectedCustomer.value) return false
  if (payingNow.value > 0.005) {
    if (paymentMethod.value === 'Cash' && !cashAccountId.value) return false
    if (paymentMethod.value !== 'Cash' && !bankAccountId.value) return false
  }
  return true
})

async function completeSale() {
  if (!canComplete.value || completing.value) return
  completing.value = true
  try {
    let customerId   = selectedCustomer.value
    let customerName = posCustomers.value.find((c: any) => c.id === customerId)?.name ?? ''

    if (!customerId && walkInName.value.trim()) {
      customerName = walkInName.value.trim()
      if (saveWalkIn.value || creditAmount.value > 0.005) {
        const newCust = await $fetch('/api/customers', {
          method: 'POST',
          body: { name: customerName, phone_number: walkInPhone.value.trim() || null, customer_type: 'POS' },
        }) as any
        customerId = newCust.id
        await refreshCustomers()
      }
    }

    const result = await $fetch('/api/pos/complete', {
      method: 'POST',
      body: {
        customer_id: customerId,
        items: cart.value.map(i => ({ variant_id: i.variantId, quantity: i.qty, unit_price: i.price })),
        discount: discount.value,
        payment_method: paymentMethod.value,
        cash_amount: payingNow.value,
        credit_amount: creditAmount.value,
        cash_account_id: paymentMethod.value === 'Cash' ? (cashAccountId.value || null) : null,
        bank_account_id: paymentMethod.value !== 'Cash' ? (bankAccountId.value || null) : null,
      },
    }) as any

    if (result.queued) {
      // Over the customer's POS credit limit — no order was created, this
      // is queued for admin approval. Do NOT show a receipt/success modal.
      successToast(result.message ?? 'Sale exceeds credit limit — queued for admin approval.')
      cart.value = []
      discount.value = 0
      selectedCustomer.value = null
      walkInName.value  = ''
      walkInPhone.value = ''
      saveWalkIn.value  = false
      splitPayment.value = false
      cashAmount.value = 0
      cashAccountId.value = ''
      bankAccountId.value = ''
      return
    }

    lastReceiptNo.value    = result.order_number
    lastTotal.value        = result.total
    lastSubtotal.value     = subtotal.value
    lastDiscount.value     = discount.value || 0
    lastCashAmount.value   = result.cash_amount
    lastCreditAmount.value = result.credit_amount
    lastPaymentMethod.value = paymentMethod.value
    lastCustomerName.value  = customerName
    lastExitStatus.value    = result.exit_status
    lastItems.value         = cart.value.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
    lastVerifyUrl.value     = result.verify_url ?? ''
    successModal.value      = true

    cart.value = []
    discount.value = 0
    selectedCustomer.value = null
    walkInName.value  = ''
    walkInPhone.value = ''
    saveWalkIn.value  = false
    splitPayment.value = false
    cashAmount.value = 0
    cashAccountId.value = ''
    bankAccountId.value = ''
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to complete sale')
  } finally {
    completing.value = false
  }
}
</script>
