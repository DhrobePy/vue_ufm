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
        <!-- Loading skeleton -->
        <template v-if="pending">
          <div v-for="i in 8" :key="i" class="glass-card p-4 h-32 animate-pulse" />
        </template>

        <template v-else>
          <button
            v-for="p in filteredProducts" :key="p.id"
            @click="addToCart(p)"
            :disabled="p.stock <= 0"
            class="glass-card-hover p-4 text-left space-y-2 group active:scale-[0.97] transition-transform duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg mb-2">🌾</div>
            <p class="text-xs font-semibold text-gray-200 leading-tight group-hover:text-white transition-colors">
              {{ p.base_name }} {{ p.weight_variant }}
            </p>
            <p class="text-[10px] text-gray-600 font-mono">{{ p.sku }}</p>
            <p class="text-sm font-bold text-gold-400">৳{{ Number(p.price).toLocaleString() }}</p>
            <p class="text-[10px]" :class="p.stock > 20 ? 'text-emerald-500' : p.stock > 5 ? 'text-orange-400' : 'text-red-400'">
              {{ p.stock }} in stock
            </p>
          </button>
          <div v-if="!filteredProducts.length" class="col-span-full py-12 text-center">
            <p class="text-3xl mb-2">🔍</p>
            <p class="text-sm text-gray-600">No products found</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Right: Cart -->
    <div class="w-80 xl:w-96 flex flex-col shrink-0" style="background: rgba(20,16,10,0.9); backdrop-filter: blur(16px);">
      <!-- Cart header -->
      <div class="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h2 class="font-display font-bold text-white">Cart</h2>
          <p class="text-xs text-gray-500">{{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }}</p>
        </div>
        <button @click="cart = []" class="text-xs text-gray-600 hover:text-red-400 transition-colors">Clear all</button>
      </div>

      <!-- Customer select -->
      <div class="px-3 pt-3 pb-2 border-b border-white/[0.04]">
        <select v-model="selectedCustomer" class="input-glass text-xs py-2">
          <option :value="null">Walk-in / Counter Customer</option>
          <option v-for="c in posCustomers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Cart items -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        <div v-if="!cart.length" class="py-12 text-center">
          <p class="text-3xl mb-3">🛒</p>
          <p class="text-sm text-gray-600">Cart is empty</p>
          <p class="text-xs text-gray-700 mt-1">Click products to add them</p>
        </div>
        <div v-for="item in cart" :key="item.id"
             class="glass-card p-3 flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-gray-200 leading-tight truncate">{{ item.name }}</p>
            <p class="text-[11px] text-gold-400 font-bold mt-0.5">৳{{ Number(item.price).toLocaleString() }}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button @click="item.qty = Math.max(1, item.qty - 1)"
              class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center">−</button>
            <span class="w-6 text-center text-xs font-bold text-gray-200">{{ item.qty }}</span>
            <button @click="item.qty++"
              class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center">+</button>
          </div>
          <button @click="removeFromCart(item.id)" class="text-gray-700 hover:text-red-400 transition-colors ml-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Totals -->
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

        <!-- Payment method -->
        <div class="grid grid-cols-2 gap-1.5">
          <button v-for="m in paymentMethods" :key="m"
            @click="paymentMethod = m"
            :class="['py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 border',
                     paymentMethod === m
                       ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                       : 'border-white/[0.07] text-gray-500 hover:text-gray-300']">
            {{ m }}
          </button>
        </div>

        <!-- Complete sale button -->
        <button
          :disabled="!cart.length || completing"
          @click="completeSale"
          class="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          {{ completing ? 'Processing…' : `Complete Sale · ৳${total.toLocaleString()}` }}
        </button>
      </div>
    </div>

    <!-- Success modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="successModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="successModal = false" />
          <div class="relative w-full max-w-sm glass-card p-8 text-center space-y-4 animate-slide-up">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white">Sale Complete!</h3>
            <p class="text-sm text-gray-400">
              Receipt <span class="font-mono text-gold-400">{{ lastReceiptNo }}</span><br/>
              Payment: <span class="text-gray-300">{{ lastPaymentMethod }}</span><br/>
              Total: <strong class="text-gold-400">৳{{ lastTotal.toLocaleString() }}</strong>
            </p>
            <div class="flex gap-3">
              <button @click="successModal = false" class="btn-ghost flex-1 justify-center text-sm">
                🖨️ Print Receipt
              </button>
              <button @click="successModal = false" class="btn-gold flex-1 justify-center text-sm">
                New Sale
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { error } = useToast()

const search          = ref('')
const activeCategory  = ref('All')
const discount        = ref(0)
const paymentMethod   = ref('Cash')
const selectedCustomer = ref<number | null>(null)
const successModal    = ref(false)
const completing      = ref(false)
const lastReceiptNo   = ref('')
const lastTotal       = ref(0)
const lastPaymentMethod = ref('')

const paymentMethods = ['Cash', 'Card', 'Mobile Banking', 'Bank Transfer']

// Fetch products from real API
const { data: productData, pending } = await useFetch('/api/pos/products')

const allProducts = computed(() => (productData.value as any)?.products ?? [])
const categories  = computed(() => (productData.value as any)?.categories ?? ['All'])

// POS customers (type = POS)
const { data: custData } = await useFetch('/api/customers', { query: { type: 'POS', per: 100 } })
const posCustomers = computed(() => (custData.value as any)?.customers ?? [])

const filteredProducts = computed(() => allProducts.value.filter((p: any) =>
  (activeCategory.value === 'All' || p.category === activeCategory.value) &&
  (`${p.base_name} ${p.weight_variant ?? ''}`.toLowerCase().includes(search.value.toLowerCase()) ||
   p.sku.toLowerCase().includes(search.value.toLowerCase()))
))

const cart = ref<Array<{ id: number; variantId: number; name: string; price: number; qty: number }>>([])

function addToCart(p: any) {
  const existing = cart.value.find(i => i.id === p.id)
  if (existing) existing.qty++
  else cart.value.push({
    id: p.id,
    variantId: p.id,
    name: `${p.base_name} ${p.weight_variant ?? ''}`.trim(),
    price: Number(p.price),
    qty: 1,
  })
}
function removeFromCart(id: number) { cart.value = cart.value.filter(i => i.id !== id) }

const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))
const total    = computed(() => Math.max(0, subtotal.value - (discount.value || 0)))

async function completeSale() {
  if (!cart.value.length || completing.value) return
  completing.value = true
  try {
    const result = await $fetch('/api/pos/complete', {
      method: 'POST',
      body: {
        customer_id:    selectedCustomer.value,
        items:          cart.value.map(i => ({ variant_id: i.variantId, quantity: i.qty, unit_price: i.price })),
        discount:       discount.value,
        payment_method: paymentMethod.value,
      },
    }) as any

    lastReceiptNo.value     = result.order_number
    lastTotal.value         = result.total
    lastPaymentMethod.value = paymentMethod.value
    successModal.value      = true

    // Reset cart
    cart.value = []
    discount.value = 0
    selectedCustomer.value = null
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to complete sale')
  } finally {
    completing.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
