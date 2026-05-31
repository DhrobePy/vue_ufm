<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Record Return — ${order?.order_number ?? '…'}`"
      :subtitle="order ? `${order.customer_name} · Balance Due: ৳${Number(order.balance_due ?? 0).toLocaleString()}` : 'Loading…'"
      :breadcrumb="['Credit Sales', order?.order_number ?? '…', 'Return']"
    >
      <template #actions>
        <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost text-xs">← Back to Order</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="orderPending" class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading order…</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ── Left: Return Form ─────────────────────────── -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Return Type -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Return Type</h3>
          <div class="grid grid-cols-2 gap-3">
            <button @click="form.return_type = 'partial'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.return_type === 'partial'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']">
              <p class="font-semibold text-sm">Partial Return</p>
              <p class="text-[11px] mt-0.5 opacity-70">Some items returned, order continues</p>
            </button>
            <button @click="form.return_type = 'full'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.return_type === 'full'
                  ? 'bg-red-500/10 border-red-500/40 text-red-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']">
              <p class="font-semibold text-sm">Full Return</p>
              <p class="text-[11px] mt-0.5 opacity-70">All goods returned, order fully reversed</p>
            </button>
          </div>
        </div>

        <!-- Return Reason -->
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
            <input v-model="form.reasonDetail" type="text" class="form-input" placeholder="Describe the reason…" />
          </div>
        </div>

        <!-- Items to Return -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="section-title">Items to Return</h3>
            <button v-if="form.return_type === 'full'" @click="fillAll"
              class="btn-secondary text-xs">↑ Fill All Quantities</button>
          </div>
          <p class="text-xs text-gray-500">Enter quantities to be returned for each item.</p>

          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="pb-2 px-2 text-left text-gray-500 font-medium">Product</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Ordered</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Unit Price</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Return Qty</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Return Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="(item, i) in returnItems" :key="item.id">
                  <td class="py-3 px-2">
                    <p class="text-gray-200 font-medium">{{ item.product_name || '—' }}</p>
                    <p class="text-gray-600 text-[10px]">{{ item.weight_variant ?? '' }}</p>
                  </td>
                  <td class="py-3 px-2 text-right text-gray-400">{{ Number(item.qty_bags).toFixed(0) }}</td>
                  <td class="py-3 px-2 text-right text-gray-400">৳{{ Number(item.unit_price).toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right">
                    <input
                      v-model.number="returnItems[i].return_qty"
                      type="number" min="0" :max="item.qty_bags" step="1"
                      class="w-20 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1.5
                             text-right text-xs text-gray-200 outline-none
                             focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30"
                      @change="clampQty(i)"
                    />
                  </td>
                  <td class="py-3 px-2 text-right font-mono"
                    :class="item.return_qty > 0 ? 'text-red-400' : 'text-gray-600'">
                    {{ item.return_qty > 0 ? '৳' + (item.return_qty * Number(item.unit_price)).toLocaleString() : '—' }}
                  </td>
                </tr>
                <tr v-if="!returnItems.length">
                  <td colspan="5" class="py-6 text-center text-gray-600">No items found on this order</td>
                </tr>
              </tbody>
              <tfoot v-if="returnItems.length">
                <tr class="border-t border-white/[0.08]">
                  <td colspan="3" class="pt-3 px-2 text-right text-gray-500 font-semibold">Total Return Value</td>
                  <td class="pt-3 px-2 text-right text-gray-400 font-medium">
                    {{ totalReturnQty }} bag{{ totalReturnQty !== 1 ? 's' : '' }}
                  </td>
                  <td class="pt-3 px-2 text-right font-bold text-red-400 text-sm">
                    ৳{{ totalReturnValue.toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Date & Notes -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Return Date *</label>
              <input v-model="form.return_date" type="date" class="form-input" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collected By</label>
              <input v-model="form.collected_by" class="form-input" placeholder="Name of person receiving goods" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes (optional)</label>
            <textarea v-model="form.notes" rows="3" class="form-input resize-none"
              placeholder="Any additional details about this return…" />
          </div>
        </div>

        <!-- Validation summary -->
        <div v-if="!isValid && submitted" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-1">
          <p v-if="!form.reason">• Please select a return reason</p>
          <p v-if="form.reason === 'other' && !form.reasonDetail">• Please specify the reason</p>
          <p v-if="totalReturnValue === 0">• Enter at least one return quantity</p>
        </div>

        <!-- Error -->
        <div v-if="apiError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ apiError }}</div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pb-4">
          <button @click="submit" :disabled="saving"
            class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 gap-2">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            {{ saving ? 'Submitting…' : 'Submit Return' }}
          </button>
          <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
          <span v-if="totalReturnValue > 0" class="ml-auto text-xs text-gray-500">
            Total: <span class="text-red-400 font-bold">৳{{ totalReturnValue.toLocaleString() }}</span>
          </span>
        </div>
      </div>

      <!-- ── Right sidebar ──────────────────────────────── -->
      <div class="space-y-5">

        <!-- Order summary -->
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">Order Summary</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Order #</span><span class="font-mono text-gold-400/80">{{ order?.order_number }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Customer</span><span class="text-gray-300">{{ order?.customer_name }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Order Total</span><span class="text-gray-200">৳{{ Number(order?.total_amount ?? 0).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Amount Paid</span><span class="text-emerald-400">৳{{ Number(order?.amount_paid ?? 0).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Balance Due</span><span class="text-red-400 font-semibold">৳{{ Number(order?.balance_due ?? 0).toLocaleString() }}</span></div>
            <div v-if="totalReturnValue > 0" class="flex justify-between border-t border-white/[0.06] pt-2">
              <span class="text-gray-500">After This Return</span>
              <span class="font-bold text-amber-400">৳{{ Math.max(0, Number(order?.balance_due ?? 0) - totalReturnValue).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Approval info -->
        <div class="glass-card p-5 space-y-2">
          <h3 class="text-sm font-semibold text-gray-300">Approval</h3>
          <div class="rounded-xl p-3 text-xs"
            :class="isAdmin
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'">
            <p class="font-semibold mb-1">{{ isAdmin ? '✓ Auto-Approved' : '⏳ Pending Approval' }}</p>
            <p class="opacity-80 leading-snug">
              {{ isAdmin
                ? 'As admin, the return will be approved immediately and balance adjusted.'
                : 'Return will be submitted as pending. An admin must approve it before the balance is adjusted.' }}
            </p>
          </div>
        </div>

        <!-- Previous returns -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Previous Returns
            <span v-if="previousReturns.length" class="text-xs font-normal text-gray-500 ml-1">({{ previousReturns.length }})</span>
          </h3>
          <div v-if="returnsLoading" class="text-xs text-gray-600 py-2 text-center animate-pulse">Loading…</div>
          <div v-else-if="!previousReturns.length" class="text-xs text-gray-600 text-center py-3">No prior returns</div>
          <div v-else class="space-y-2">
            <div v-for="ret in previousReturns" :key="ret.id"
              class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-mono text-gold-400/80 font-semibold">{{ ret.return_number }}</span>
                <span :class="['badge text-[10px]',
                  ret.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                  ret.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400']">
                  {{ ret.status }}
                </span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>{{ ret.return_date }}</span>
                <span class="text-red-400 font-semibold">৳{{ Number(ret.total_returned_amount).toLocaleString() }}</span>
              </div>
              <p class="text-gray-600 truncate">{{ ret.return_reason ?? '—' }}</p>
              <div v-if="ret.items?.length" class="text-[10px] text-gray-600 mt-1">
                {{ ret.items.map((i: any) => `${i.product_name ?? ''} ×${Number(i.returned_qty).toFixed(0)}`).join(', ') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route  = useRoute()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()

const id = Number(route.params.id)

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase())
)

// ── Fetch order ───────────────────────────────────────────
const { data: orderData, pending: orderPending } = await useFetch(`/api/credit-sales/${id}`)
const order      = computed(() => (orderData.value as any)?.order ?? null)
const orderItems = computed(() => (orderData.value as any)?.items ?? [])

// ── Fetch previous returns ────────────────────────────────
const { data: returnsData, pending: returnsLoading } = await useFetch(`/api/credit-sales/${id}/returns`)
const previousReturns = computed(() => (returnsData.value as any)?.returns ?? [])

// ── Reactive return items (ref — NOT computed, so v-model works) ──
const returnItems = ref<any[]>([])

watch(orderItems, (items) => {
  returnItems.value = items.map((item: any) => ({
    ...item,
    return_qty: 0,
    unit_price: Number(item.unit_price ?? 0),
  }))
}, { immediate: true })

function clampQty(i: number) {
  const item = returnItems.value[i]
  if (item.return_qty < 0) item.return_qty = 0
  if (item.return_qty > Number(item.qty_bags)) item.return_qty = Number(item.qty_bags)
}

function fillAll() {
  returnItems.value.forEach(item => {
    item.return_qty = Number(item.qty_bags)
  })
}

// ── Form state ────────────────────────────────────────────
const reasons = [
  { value: 'damaged',    label: 'Damaged Goods',   description: 'Items damaged during delivery' },
  { value: 'quality',    label: 'Quality Issue',    description: 'Product does not meet quality standard' },
  { value: 'wrong_item', label: 'Wrong Item',       description: 'Incorrect product delivered' },
  { value: 'excess',     label: 'Excess Delivery',  description: 'More than ordered was delivered' },
  { value: 'cancelled',  label: 'Order Cancelled',  description: 'Customer no longer needs the goods' },
  { value: 'other',      label: 'Other',            description: 'Specify below' },
]

const form = reactive({
  return_type:  'partial' as 'partial' | 'full',
  reason:       '',
  reasonDetail: '',
  return_date:  new Date().toISOString().slice(0, 10),
  collected_by: '',
  notes:        '',
})

const saving    = ref(false)
const submitted = ref(false)
const apiError  = ref('')

// ── Computed totals ───────────────────────────────────────
const totalReturnValue = computed(() =>
  returnItems.value.reduce((s, i) => s + Number(i.return_qty || 0) * Number(i.unit_price || 0), 0)
)
const totalReturnQty = computed(() =>
  returnItems.value.reduce((s, i) => s + Number(i.return_qty || 0), 0)
)

const isValid = computed(() =>
  !!form.reason &&
  (form.reason !== 'other' || !!form.reasonDetail.trim()) &&
  totalReturnValue.value > 0
)

// ── Submit ────────────────────────────────────────────────
async function submit() {
  submitted.value = true
  if (!isValid.value) return

  saving.value = true
  apiError.value = ''

  const items = returnItems.value
    .filter(i => Number(i.return_qty) > 0)
    .map(i => ({
      order_item_id: i.id,
      product_id:    i.product_id ?? null,
      variant_id:    i.variant_id ?? null,
      original_qty:  Number(i.qty_bags),
      returned_qty:  Number(i.return_qty),
      unit_price:    Number(i.unit_price),
    }))

  const returnReason = form.reason === 'other' ? form.reasonDetail : form.reason
  const notesText    = [
    form.collected_by ? `Collected by: ${form.collected_by}` : '',
    form.notes,
  ].filter(Boolean).join(' | ')

  try {
    const result: any = await $fetch(`/api/credit-sales/${id}/return`, {
      method: 'POST',
      body: {
        return_date:   form.return_date,
        return_type:   form.return_type,
        return_reason: returnReason,
        notes:         notesText || null,
        items,
      },
    })
    const msg = result.status === 'approved'
      ? `Return ${result.return_number} approved & balance adjusted ✓`
      : `Return ${result.return_number} submitted — pending admin approval`
    success(msg)
    navigateTo(`/credit-sales/${id}`)
  } catch (e: any) {
    apiError.value = e?.data?.statusMessage ?? 'Failed to submit return'
  } finally {
    saving.value = false
  }
}
</script>
