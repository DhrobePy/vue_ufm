<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Record Over-Delivery — ${order?.order_number ?? '…'}`"
      :subtitle="order ? `${order.customer_name} · goods received beyond what was ordered` : 'Loading…'"
      :breadcrumb="['Credit Sales', order?.order_number ?? '…', 'Over-Delivery']"
    >
      <template #actions>
        <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost text-xs">← Back to Order</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="orderPending" class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading order…</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">

        <!-- Resolution -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Resolution</h3>
          <div class="grid grid-cols-3 gap-3">
            <button @click="form.resolution = 'bill'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.resolution === 'bill' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']">
              <p class="font-semibold text-sm">Bill Customer</p>
              <p class="text-[11px] mt-0.5 opacity-70">Add extra amount to the invoice</p>
            </button>
            <button @click="form.resolution = 'retrieve'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.resolution === 'retrieve' ? 'bg-sky-500/10 border-sky-500/40 text-sky-300' : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']">
              <p class="font-semibold text-sm">Retrieve Goods</p>
              <p class="text-[11px] mt-0.5 opacity-70">Take the excess back, no charge</p>
            </button>
            <button @click="form.resolution = 'writeoff'"
              :class="['rounded-xl border p-4 text-left transition-all',
                form.resolution === 'writeoff' ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']">
              <p class="font-semibold text-sm">Write Off</p>
              <p class="text-[11px] mt-0.5 opacity-70">Company absorbs the loss</p>
            </button>
          </div>
        </div>

        <!-- Extra items -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Extra Quantity Delivered</h3>
          <p class="text-xs text-gray-500">Enter how many extra bags were delivered for each item, beyond what was ordered.</p>

          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="pb-2 px-2 text-left text-gray-500 font-medium">Product</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Ordered</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Unit Price</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Extra Qty</th>
                  <th class="pb-2 px-2 text-right text-gray-500 font-medium">Extra Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="(item, i) in odItems" :key="item.id">
                  <td class="py-3 px-2">
                    <p class="text-gray-200 font-medium">{{ item.product_name || '—' }}</p>
                    <p class="text-gray-600 text-[10px]">{{ item.weight_variant ?? '' }}</p>
                  </td>
                  <td class="py-3 px-2 text-right text-gray-400">{{ Number(item.qty_bags).toFixed(0) }}</td>
                  <td class="py-3 px-2 text-right text-gray-400">৳{{ Number(item.unit_price).toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right">
                    <input v-model.number="odItems[i].extra_qty" type="number" min="0" step="1"
                      class="w-20 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1.5 text-right text-xs text-gray-200 outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30" />
                  </td>
                  <td class="py-3 px-2 text-right font-mono" :class="item.extra_qty > 0 ? 'text-amber-400' : 'text-gray-600'">
                    {{ item.extra_qty > 0 ? '৳' + (item.extra_qty * Number(item.unit_price)).toLocaleString() : '—' }}
                  </td>
                </tr>
                <tr v-if="!odItems.length">
                  <td colspan="5" class="py-6 text-center text-gray-600">No items found on this order</td>
                </tr>
              </tbody>
              <tfoot v-if="odItems.length">
                <tr class="border-t border-white/[0.08]">
                  <td colspan="3" class="pt-3 px-2 text-right text-gray-500 font-semibold">Total Extra Value</td>
                  <td class="pt-3 px-2 text-right text-gray-400 font-medium">{{ totalExtraQty }} bag{{ totalExtraQty !== 1 ? 's' : '' }}</td>
                  <td class="pt-3 px-2 text-right font-bold text-amber-400 text-sm">৳{{ totalExtraValue.toLocaleString() }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Date & Notes -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Details</h3>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date *</label>
            <input v-model="form.od_date" type="date" class="form-input" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
            <textarea v-model="form.notes" rows="3" class="form-input resize-none" placeholder="How was the excess discovered? Weighbridge slip, driver report, etc." />
          </div>
        </div>

        <div v-if="apiError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ apiError }}</div>

        <div class="flex items-center gap-3 pb-4">
          <button @click="submit" :disabled="saving || totalExtraValue === 0"
            class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed gap-2">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            {{ saving ? 'Submitting…' : 'Submit for Approval' }}
          </button>
          <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-2">
          <h3 class="text-sm font-semibold text-gray-300">Approval</h3>
          <div class="rounded-xl p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <p class="font-semibold mb-1">⏳ Pending Approval</p>
            <p class="opacity-80 leading-snug">A different authorised user must approve this before {{ form.resolution === 'bill' ? "the customer's invoice is updated" : 'it takes effect' }}.</p>
          </div>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Previous Over-Deliveries
            <span v-if="previousODs.length" class="text-xs font-normal text-gray-500 ml-1">({{ previousODs.length }})</span>
          </h3>
          <div v-if="odsLoading" class="text-xs text-gray-600 py-2 text-center animate-pulse">Loading…</div>
          <div v-else-if="!previousODs.length" class="text-xs text-gray-600 text-center py-3">None yet</div>
          <div v-else class="space-y-2">
            <div v-for="od in previousODs" :key="od.id" class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-mono text-gold-400/80 font-semibold">{{ od.od_number }}</span>
                <span :class="['badge text-[10px]',
                  od.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                  od.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400']">
                  {{ od.status }}
                </span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>{{ String(od.od_date).slice(0,10) }} · {{ od.resolution }}</span>
                <span class="text-amber-400 font-semibold">৳{{ Number(od.total_extra_amount).toLocaleString() }}</span>
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
const route = useRoute()
const { success, error: toastError } = useToast()
const id = Number(route.params.id)

const { data: orderData, pending: orderPending } = await useFetch(`/api/credit-sales/${id}`)
const order      = computed(() => (orderData.value as any)?.order ?? null)
const orderItems = computed(() => (orderData.value as any)?.items ?? [])

const { data: odData, pending: odsLoading } = await useFetch(`/api/credit-sales/${id}/over-deliveries`)
const previousODs = computed(() => (odData.value as any)?.over_deliveries ?? [])

const odItems = ref<any[]>([])
watch(orderItems, (items) => {
  odItems.value = items.map((item: any) => ({ ...item, extra_qty: 0, unit_price: Number(item.unit_price ?? 0) }))
}, { immediate: true })

const form = reactive({
  resolution: 'bill' as 'bill' | 'retrieve' | 'writeoff',
  od_date: new Date().toISOString().slice(0, 10),
  notes: '',
})

const totalExtraValue = computed(() => odItems.value.reduce((s, i) => s + Number(i.extra_qty || 0) * Number(i.unit_price || 0), 0))
const totalExtraQty    = computed(() => odItems.value.reduce((s, i) => s + Number(i.extra_qty || 0), 0))

const saving   = ref(false)
const apiError = ref('')

async function submit() {
  saving.value = true
  apiError.value = ''
  const items = odItems.value
    .filter(i => Number(i.extra_qty) > 0)
    .map(i => ({
      order_item_id: i.id, product_id: i.product_id ?? null, variant_id: i.variant_id ?? null,
      extra_qty: Number(i.extra_qty), unit_price: Number(i.unit_price),
    }))
  try {
    const result: any = await $fetch(`/api/credit-sales/${id}/over-delivery`, {
      method: 'POST',
      body: { od_date: form.od_date, resolution: form.resolution, notes: form.notes || null, items },
    })
    success(`Over-delivery ${result.od_number} submitted — pending approval`)
    navigateTo(`/credit-sales/${id}`)
  } catch (e: any) {
    apiError.value = e?.data?.statusMessage ?? 'Failed to submit'
  } finally {
    saving.value = false
  }
}
</script>
