<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Record Delivery — ${order?.order_number ?? '…'}`"
      :subtitle="order ? `${order.customer_name} · ${order.shipping_address ?? ''}` : 'Loading…'"
      :breadcrumb="['Credit Sales', order?.order_number ?? '…', 'Record Delivery']"
    >
      <template #actions>
        <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost text-xs">← Back to Order</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="orderPending" class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading order…</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">

        <!-- Delivery type -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Delivery Type</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button v-for="t in deliveryTypes" :key="t.value"
              @click="form.is_final = t.value === 'full'"
              :class="['rounded-xl border p-4 text-left transition-all duration-150',
                (form.is_final ? 'full' : 'partial') === t.value
                  ? 'bg-gold-500/10 border-gold-500/40'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20']"
            >
              <p :class="['text-sm font-semibold', (form.is_final ? 'full' : 'partial') === t.value ? 'text-gold-300' : 'text-gray-300']">{{ t.label }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ t.description }}</p>
            </button>
          </div>
        </div>

        <!-- Partial qty -->
        <div v-if="!form.is_final" class="glass-card p-6 space-y-4">
          <h3 class="section-title">Items Delivered</h3>
          <p class="text-xs text-gray-500">Enter the quantity actually delivered for each item.</p>
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th>
                <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Ordered</th>
                <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Delivered</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="item in deliveryItems" :key="item.id">
                <td class="py-3 px-3">
                  <p class="text-gray-200 font-medium">{{ item.product_name }}</p>
                  <p class="text-gray-600">{{ item.weight_variant }}</p>
                </td>
                <td class="py-3 px-3 text-right text-gray-400">{{ item.quantity }} bags</td>
                <td class="py-3 px-3 text-right">
                  <input v-model.number="item.qty_deliver" type="number" min="0" :max="item.quantity"
                         class="w-20 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-right text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vehicle & driver -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Vehicle & Driver</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Truck Number</label>
              <input v-model="form.truck_number" type="text" class="input-glass" placeholder="e.g. Dhaka Metro GA-11-1234" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Name</label>
              <input v-model="form.driver_name" type="text" class="input-glass" placeholder="Driver's full name" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Contact</label>
              <input v-model="form.driver_contact" type="tel" class="input-glass" placeholder="+880 1xxx-xxxxxx" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Date</label>
              <input v-model="form.delivery_date" type="date" class="input-glass" />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Notes</h3>
          <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Any issues, damages, or remarks…" />
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submit" :disabled="saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Recording…' : 'Confirm Delivery' }}
          </button>
          <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">Delivery Address</h3>
          <div class="space-y-2 text-xs">
            <div class="flex gap-2"><span class="text-gray-600 w-20 shrink-0">Customer</span><span class="text-gray-300">{{ order?.customer_name }}</span></div>
            <div class="flex gap-2"><span class="text-gray-600 w-20 shrink-0">Address</span><span class="text-gray-400 leading-relaxed">{{ order?.shipping_address ?? '—' }}</span></div>
            <div class="flex gap-2"><span class="text-gray-600 w-20 shrink-0">Phone</span><span class="text-gray-300">{{ order?.customer_phone ?? '—' }}</span></div>
          </div>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Order Items</h3>
          <div v-for="item in deliveryItems" :key="item.id" class="flex justify-between text-xs py-1.5 border-b border-white/[0.04] last:border-0">
            <div>
              <p class="text-gray-300">{{ item.product_name }}</p>
              <p class="text-gray-600">{{ item.weight_variant }}</p>
            </div>
            <span class="text-gray-400 font-mono">{{ item.quantity }} bags</span>
          </div>
          <div class="flex justify-between text-xs pt-1">
            <span class="text-gray-600 font-semibold">Total Value</span>
            <span class="font-bold text-gray-200">৳{{ Number(order?.total_amount ?? 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error } = useToast()

const id = Number(route.params.id)

const { data: orderData, pending: orderPending } = await useFetch(`/api/credit-sales/${id}`)

const order        = computed(() => (orderData.value as any)?.order    ?? null)
const orderItems   = computed(() => (orderData.value as any)?.items    ?? [])

// Build editable delivery items
const deliveryItems = computed(() =>
  orderItems.value.map((item: any) => ({
    ...item,
    qty_deliver: item.quantity,  // default: full qty
  }))
)

const deliveryTypes = [
  { value: 'full',    label: 'Full Delivery',    description: 'All ordered items delivered in full' },
  { value: 'partial', label: 'Partial Delivery', description: 'Only some items / quantities delivered' },
]

const form = reactive({
  is_final:      true,
  delivery_date: new Date().toISOString().slice(0, 10),
  truck_number:  '',
  driver_name:   '',
  driver_contact: '',
  notes:         '',
})
const saving = ref(false)

async function submit() {
  saving.value = true
  try {
    const items = deliveryItems.value.map((item: any) => ({
      order_item_id: item.id,
      product_id:    item.product_id ?? null,
      variant_id:    item.variant_id ?? null,
      qty_delivered: form.is_final ? item.quantity : item.qty_deliver,
      unit_price:    item.unit_price ?? item.line_total / item.quantity,
    }))

    const result: any = await $fetch(`/api/credit-sales/${id}/deliver`, {
      method: 'POST',
      body: {
        ...form,
        items,
      },
    })
    success(`Delivery ${result.delivery_number} recorded successfully`)
    navigateTo(`/credit-sales/${id}`)
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to record delivery')
  } finally {
    saving.value = false
  }
}
</script>
