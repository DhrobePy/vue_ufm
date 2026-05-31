<template>
  <div class="space-y-6">

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading purchase order…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader :title="`Purchase Order — ${po.po_number}`"
                    :subtitle="`${po.company_name || '—'} · ${po.po_status || '—'}`"
                    :breadcrumb="['Purchase', 'Orders', po.po_number]">
        <template #actions>
          <button @click="printPO" class="btn-ghost text-xs">🖨 Print PO</button>
          <NuxtLink to="/purchase/orders" class="btn-ghost text-xs">← All POs</NuxtLink>
        </template>
      </UiPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">

          <!-- PO info card -->
          <div id="po-print" class="glass-card p-6 space-y-5">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 class="text-xl font-bold font-mono text-gold-400">{{ po.po_number }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">Date: {{ po.po_date }} · By: {{ po.created_by_name || '—' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <UiStatusBadge :status="po.po_status" />
                <UiStatusBadge :status="po.payment_status" />
                <UiStatusBadge :status="po.delivery_status" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="space-y-2">
                <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Supplier</h3>
                <p class="text-gray-200 font-semibold">{{ po.company_name || '—' }}</p>
                <p v-if="po.supplier_address" class="text-gray-400">{{ po.supplier_address }}</p>
                <p v-if="po.phone" class="text-gray-400">{{ po.phone }}</p>
              </div>
              <div class="space-y-2">
                <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Delivery</h3>
                <p class="text-gray-300">Expected: <span class="text-gray-200 font-semibold">{{ po.expected_delivery_date || '—' }}</span></p>
                <p class="text-gray-300">To: <span class="text-gray-200">{{ po.branch_name || '—' }}</span></p>
                <p v-if="po.supplier_payment_terms" class="text-gray-300">Payment Terms: <span class="text-gray-200">{{ po.supplier_payment_terms }} days</span></p>
                <p class="text-gray-300">Wheat Origin: <span class="text-gray-200">{{ po.wheat_origin || '—' }}</span></p>
              </div>
            </div>

            <!-- Single-commodity line item row -->
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Qty (kg)</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Rate / kg</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Total Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="py-3 px-3 text-gray-200">{{ po.wheat_origin ? po.wheat_origin + ' Wheat' : 'Wheat' }}</td>
                  <td class="py-3 px-3 text-right font-mono text-gray-300">{{ Number(po.quantity_kg).toLocaleString() }}</td>
                  <td class="py-3 px-3 text-right font-mono text-gray-300">৳{{ Number(po.unit_price_per_kg || 0).toLocaleString() }}</td>
                  <td class="py-3 px-3 text-right font-mono font-bold text-gray-200">৳{{ Number(po.total_order_value).toLocaleString() }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-white/10">
                  <td colspan="3" class="pt-3 px-3 text-right text-gray-400 font-semibold">Grand Total</td>
                  <td class="pt-3 px-3 text-right font-bold text-gold-400 text-sm">৳{{ Number(po.total_order_value).toLocaleString() }}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Notes -->
            <div v-if="po.remarks" class="text-xs text-gray-500 border-t border-white/[0.06] pt-3">
              <span class="font-semibold text-gray-600">Notes: </span>{{ po.remarks }}
            </div>
          </div>

          <!-- GRNs received -->
          <div class="glass-card p-5 space-y-3">
            <h3 class="section-title">Goods Received</h3>
            <div v-if="!grns.length" class="text-xs text-gray-600 text-center py-4">No GRNs recorded yet.</div>
            <div v-for="grn in grns" :key="grn.id"
                 class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs">
              <div>
                <p class="font-mono text-gold-400/80">{{ grn.grn_number }}</p>
                <p class="text-gray-500 mt-0.5">
                  {{ grn.grn_date }} · {{ Number(grn.quantity_received_kg).toLocaleString() }} kg
                  <span v-if="grn.quality_grade"> · Grade {{ grn.quality_grade }}</span>
                  <span v-if="grn.unload_branch_name"> · {{ grn.unload_branch_name }}</span>
                </p>
              </div>
              <UiStatusBadge :status="grn.grn_status || 'completed'" />
            </div>
            <NuxtLink to="/purchase/grn/create" class="btn-ghost text-xs">+ Record GRN</NuxtLink>
          </div>

          <!-- Payment history -->
          <div v-if="payments.length" class="glass-card p-5 space-y-3">
            <h3 class="section-title">Payment History</h3>
            <div v-for="pmt in payments" :key="pmt.id"
                 class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs">
              <div>
                <p class="font-semibold text-gray-200">৳{{ Number(pmt.amount_paid ?? pmt.amount ?? 0).toLocaleString() }}</p>
                <p class="text-gray-500 mt-0.5">
                  {{ pmt.payment_date }} · {{ pmt.payment_mode || pmt.payment_method || '—' }}
                  <span v-if="pmt.bank_name"> · {{ pmt.bank_name }}</span>
                  <span v-if="pmt.reference_number"> · Ref: {{ pmt.reference_number }}</span>
                </p>
              </div>
              <UiStatusBadge status="approved" />
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="space-y-5">
          <div class="glass-card p-5 space-y-4">
            <h3 class="text-sm font-semibold text-gray-300">Payment Status</h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-600">PO Total</span>
                <span class="font-bold text-gray-200">৳{{ Number(po.total_order_value).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Paid</span>
                <span class="font-bold text-emerald-400">৳{{ Number(po.total_paid || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Outstanding</span>
                <span class="font-bold text-red-400">৳{{ outstanding.toLocaleString() }}</span>
              </div>
            </div>
            <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full bg-emerald-500 transition-all"
                   :style="`width:${paidPct}%`" />
            </div>
            <NuxtLink to="/purchase/payments/record" class="btn-gold text-xs w-full justify-center">Record Payment</NuxtLink>
          </div>

          <div class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-300">Delivery Progress</h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-600">Ordered</span>
                <span class="text-gray-300">{{ Number(po.quantity_kg).toLocaleString() }} kg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Received</span>
                <span class="font-bold text-emerald-400">{{ receivedKg.toLocaleString() }} kg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Pending</span>
                <span class="font-bold text-yellow-400">{{ (Number(po.quantity_kg) - receivedKg).toLocaleString() }} kg</span>
              </div>
            </div>
            <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full bg-sky-500 transition-all"
                   :style="`width:${deliveredPct}%`" />
            </div>
          </div>

          <div class="glass-card p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-300">Actions</h3>
            <NuxtLink :to="`/purchase/orders/${route.params.id}/edit`" class="btn-ghost text-xs w-full justify-start gap-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit PO
            </NuxtLink>
            <button class="btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:border-red-500/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-12.728 12.728"/><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636l12.728 12.728"/></svg>
              Cancel PO
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()

const { data, pending, error } = await useFetch(
  () => `/api/purchase/orders/${route.params.id}`,
)

const po       = computed(() => (data.value?.po       ?? {}) as any)
const grns     = computed(() => (data.value?.grns     ?? []) as any[])
const payments = computed(() => (data.value?.payments ?? []) as any[])

const outstanding   = computed(() => Math.max(0, Number(po.value.total_order_value ?? 0) - Number(po.value.total_paid ?? 0)))
const paidPct       = computed(() => {
  const total = Number(po.value.total_order_value ?? 0)
  if (!total) return 0
  return Math.min(100, Math.round((Number(po.value.total_paid ?? 0) / total) * 100))
})
const receivedKg    = computed(() => grns.value.reduce((s: number, g: any) => s + Number(g.quantity_received_kg ?? 0), 0))
const deliveredPct  = computed(() => {
  const ordered = Number(po.value.quantity_kg ?? 0)
  if (!ordered) return 0
  return Math.min(100, Math.round((receivedKg.value / ordered) * 100))
})

function printPO() {
  navigateTo(`/purchase/orders/${route.params.id}/print`)
}
</script>
