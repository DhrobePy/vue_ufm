<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Return / Claim — ${order?.order_number ?? '…'}`"
      :subtitle="order ? `${order.customer_name} · ${order.shipping_address ?? ''}` : 'Loading…'"
      :breadcrumb="['Credit Sales', order?.order_number ?? '…', 'Return']"
    >
      <template #actions>
        <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost text-xs">← Back to Order</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="orderPending" class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading order…</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">

        <!-- Return reason -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Return Reason</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button v-for="r in reasons" :key="r.value"
              @click="form.reason = r.value"
              :class="['rounded-xl border p-3 text-left text-xs transition-all duration-150',
                form.reason === r.value
                  ? 'bg-red-500/10 border-red-500/40 text-red-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']"
            >
              <p class="font-semibold">{{ r.label }}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ r.description }}</p>
            </button>
          </div>
          <div v-if="form.reason === 'other'" class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Specify Reason *</label>
            <input v-model="form.reasonDetail" type="text" class="input-glass" placeholder="Describe the reason…" />
          </div>
        </div>

        <!-- Items being returned -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Items to Return</h3>
          <p class="text-xs text-gray-500">Enter quantities to be returned for each item.</p>
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th>
                <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Ordered</th>
                <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Return Qty</th>
                <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Return Value</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="item in returnItems" :key="item.id">
                <td class="py-3 px-3">
                  <p class="text-gray-200 font-medium">{{ item.product_name }}</p>
                  <p class="text-gray-600">{{ item.weight_variant }} · ৳{{ Number(item.unit_price).toLocaleString() }}/bag</p>
                </td>
                <td class="py-3 px-3 text-right text-gray-400">{{ item.quantity }}</td>
                <td class="py-3 px-3 text-right">
                  <input v-model.number="item.return_qty" type="number" min="0" :max="item.quantity"
                         class="w-16 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-right text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50" />
                </td>
                <td class="py-3 px-3 text-right text-red-400 font-mono">
                  ৳{{ (item.return_qty * Number(item.unit_price)).toLocaleString() }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-white/[0.06]">
                <td colspan="3" class="pt-3 px-3 text-right text-gray-600 font-semibold">Total Return Value</td>
                <td class="pt-3 px-3 text-right font-bold text-red-400">৳{{ totalReturn.toLocaleString() }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Date & Notes -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Details</h3>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Return Date *</label>
            <input v-model="form.return_date" type="date" class="input-glass w-auto" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
            <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Additional details about this return…" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Submitting…' : 'Submit Return' }}
          </button>
          <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">Order Info</h3>
          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Order #</span><span class="font-mono text-gold-400/80">{{ order?.order_number }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Customer</span><span class="text-gray-300">{{ order?.customer_name }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Order Total</span><span class="text-gray-200">৳{{ Number(order?.total_amount ?? 0).toLocaleString() }}</span></div>
            <div class="h-px bg-white/[0.06]" />
            <div class="flex justify-between"><span class="text-gray-600">Return Value</span><span class="font-bold text-red-400">৳{{ totalReturn.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Net After Return</span><span class="font-bold text-emerald-400">৳{{ (Number(order?.total_amount ?? 0) - totalReturn).toLocaleString() }}</span></div>
          </div>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">About Returns</h3>
          <div class="space-y-2 text-xs text-gray-500 leading-relaxed">
            <p>Returns are submitted as <span class="text-amber-400 font-semibold">pending</span> and require admin approval before the balance is adjusted.</p>
            <p>The customer's outstanding balance is reduced only after the return is <span class="text-emerald-400 font-semibold">approved</span>.</p>
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

const order      = computed(() => (orderData.value as any)?.order ?? null)
const orderItems = computed(() => (orderData.value as any)?.items ?? [])

// Editable return items
const returnItems = computed(() =>
  orderItems.value.map((item: any) => ({
    ...item,
    return_qty: 0,
    unit_price: item.unit_price ?? (item.line_total / item.quantity),
  }))
)

const reasons = [
  { value: 'damaged',    label: 'Damaged Goods',    description: 'Items damaged during delivery' },
  { value: 'quality',    label: 'Quality Issue',     description: 'Product does not meet quality standard' },
  { value: 'wrong_item', label: 'Wrong Item',        description: 'Incorrect product delivered' },
  { value: 'excess',     label: 'Excess Delivery',   description: 'More than ordered was delivered' },
  { value: 'cancelled',  label: 'Order Cancelled',   description: 'Customer no longer needs the goods' },
  { value: 'other',      label: 'Other',             description: 'Specify below' },
]

const form = reactive({
  reason:       '',
  reasonDetail: '',
  return_date:  new Date().toISOString().slice(0, 10),
  notes:        '',
})
const saving = ref(false)

const totalReturn = computed(() =>
  returnItems.value.reduce((s: number, i: any) => s + Number(i.return_qty) * Number(i.unit_price), 0)
)

const isValid = computed(() =>
  form.reason && totalReturn.value > 0 &&
  (form.reason !== 'other' || form.reasonDetail)
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const items = returnItems.value
      .filter((i: any) => Number(i.return_qty) > 0)
      .map((i: any) => ({
        order_item_id: i.id,
        product_id:    i.product_id ?? null,
        variant_id:    i.variant_id ?? null,
        original_qty:  i.quantity,
        returned_qty:  i.return_qty,
        unit_price:    i.unit_price,
      }))

    const result: any = await $fetch(`/api/credit-sales/${id}/return`, {
      method: 'POST',
      body: {
        return_date:   form.return_date,
        return_reason: form.reason === 'other' ? form.reasonDetail : form.reason,
        return_type:   'partial',
        notes:         form.notes,
        items,
      },
    })
    success(`Return ${result.return_number} submitted (pending approval)`)
    navigateTo(`/credit-sales/${id}`)
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to submit return')
  } finally {
    saving.value = false
  }
}
</script>
