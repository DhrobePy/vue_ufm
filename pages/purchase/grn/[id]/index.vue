<template>
  <div class="space-y-6">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading GRN…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader :title="`GRN — ${grn.grn_number}`"
                    :subtitle="`${grn.supplier_name} · ${grn.grn_date}`"
                    :breadcrumb="['Purchase','GRNs', grn.grn_number]">
        <template #actions>
          <NuxtLink :to="`/purchase/grn/${route.params.id}/print`" class="btn-ghost text-xs">🖨 Print</NuxtLink>
          <NuxtLink :to="`/purchase/grn/${route.params.id}/edit`" class="btn-ghost text-xs" v-if="grn.grn_status !== 'cancelled'">✏ Edit</NuxtLink>
          <NuxtLink to="/purchase/grn" class="btn-ghost text-xs">← All GRNs</NuxtLink>
        </template>
      </UiPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">

          <div class="glass-card p-6 space-y-5">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 class="text-xl font-bold font-mono text-gold-400">{{ grn.grn_number }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">Date: {{ grn.grn_date }}</p>
              </div>
              <UiStatusBadge :status="grn.grn_status" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div class="space-y-3">
                <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">PO & Supplier</h3>
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-500">PO #</span>
                    <NuxtLink :to="`/purchase/orders/${grn.purchase_order_id}`"
                      class="font-mono text-gold-400/80 hover:underline">{{ grn.po_number }}</NuxtLink>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Supplier</span>
                    <span class="text-gray-200">{{ grn.supplier_name }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Transport</h3>
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Vehicle</span>
                    <span class="text-gray-200">{{ grn.truck_number || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Unload Point</span>
                    <span class="text-gray-200">{{ grn.unload_point_name || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Qty table -->
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Qty (kg)</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Rate / kg</th>
                  <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="py-3 px-3 text-gray-200">Quantity Received</td>
                  <td class="py-3 px-3 text-right font-mono text-gray-300">{{ Number(grn.quantity_received_kg).toLocaleString() }}</td>
                  <td class="py-3 px-3 text-right font-mono text-gray-300">৳{{ Number(grn.unit_price_per_kg || 0).toLocaleString() }}</td>
                  <td class="py-3 px-3 text-right font-mono font-bold text-gray-200">৳{{ Number(grn.total_value).toLocaleString() }}</td>
                </tr>
                <tr v-if="Number(grn.variance_percentage)">
                  <td colspan="3" class="py-2 px-3 text-gray-500">Variance</td>
                  <td class="py-2 px-3 text-right font-mono"
                    :class="Number(grn.variance_percentage) > 0 ? 'text-emerald-400' : 'text-red-400'">
                    {{ Number(grn.variance_percentage) > 0 ? '+' : '' }}{{ Number(grn.variance_percentage).toFixed(2) }}%
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="grn.remarks" class="text-xs text-gray-500 border-t border-white/[0.06] pt-3">
              <span class="font-semibold text-gray-600">Remarks: </span>{{ grn.remarks }}
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="space-y-5">
          <div class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-300">GRN Summary</h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between"><span class="text-gray-600">Received Qty</span><span class="text-gray-200 font-mono">{{ Number(grn.quantity_received_kg).toLocaleString() }} kg</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Unit Price</span><span class="text-gray-200 font-mono">৳{{ Number(grn.unit_price_per_kg || grn.po_unit_price || 0).toLocaleString() }}/kg</span></div>
              <div class="h-px bg-white/[0.06]" />
              <div class="flex justify-between"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gold-400">৳{{ Number(grn.total_value).toLocaleString() }}</span></div>
            </div>
          </div>

          <div v-if="grn.grn_status !== 'cancelled'" class="glass-card p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-300">Actions</h3>
            <NuxtLink :to="`/purchase/grn/${route.params.id}/edit`" class="btn-ghost text-xs w-full justify-start gap-2">✏ Edit GRN</NuxtLink>
            <NuxtLink :to="`/purchase/grn/${route.params.id}/print`" class="btn-ghost text-xs w-full justify-start gap-2">🖨 Print Receipt</NuxtLink>
            <button @click="cancelGRN" :disabled="cancelling"
              class="btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:border-red-500/30"
              :class="cancelling ? 'opacity-50 cursor-not-allowed' : ''">
              {{ cancelling ? 'Cancelling…' : '✕ Cancel GRN' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route  = useRoute()
const { success, error: toastError } = useToast()
const cancelling = ref(false)

const { data, pending, error, refresh } = await useFetch(
  () => `/api/purchase/grn/${route.params.id}`,
)

const grn = computed(() => (data.value?.grn ?? {}) as any)

async function cancelGRN() {
  if (!confirm(`Cancel GRN ${grn.value.grn_number}? This cannot be undone.`)) return
  cancelling.value = true
  try {
    await $fetch(`/api/purchase/grn/${route.params.id}`, { method: 'DELETE' })
    success('GRN cancelled successfully')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to cancel GRN')
  } finally {
    cancelling.value = false
  }
}
</script>
