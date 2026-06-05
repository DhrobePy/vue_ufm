<template>
  <div class="space-y-6">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading GRN…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader :title="`GRN — ${grn.grn_number}`"
                    :subtitle="`${grn.supplier_name} · ${grn.grn_date}`"
                    :breadcrumb="['Purchase','GRNs', grn.grn_number]">
        <template #actions>
          <NuxtLink :to="`/purchase/grn/${route.params.id}/print`" target="_blank" class="btn-ghost text-xs">🖨 Print</NuxtLink>
          <NuxtLink v-if="grn.grn_status !== 'cancelled'" :to="`/purchase/grn/${route.params.id}/edit`" class="btn-ghost text-xs">✏ Edit</NuxtLink>
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

            <!-- Detail Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div class="space-y-3">
                <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">PO & Supplier</h3>
                <div class="space-y-1.5">
                  <div class="flex justify-between">
                    <span class="text-gray-500">PO #</span>
                    <NuxtLink :to="`/purchase/orders/${grn.purchase_order_id}`"
                      class="font-mono text-gold-400/80 hover:underline">{{ grn.po_number }}</NuxtLink>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Supplier</span>
                    <span class="text-gray-200">{{ grn.supplier_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Wheat Origin</span>
                    <span class="text-gray-200">{{ grn.wheat_origin || '—' }}</span>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Transport</h3>
                <div class="space-y-1.5">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Truck #</span>
                    <span class="text-gray-200 font-mono">{{ grn.truck_number || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Unload Point</span>
                    <span class="text-gray-200">{{ grn.unload_branch_name || grn.unload_point_name || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Unit Price</span>
                    <span class="text-gray-200 font-mono">৳{{ Number(grn.unit_price_per_kg || grn.po_unit_price || 0).toLocaleString() }}/KG</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quantity Table -->
            <div class="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-white/[0.08]">
                    <th class="px-4 py-2.5 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
                    <th class="px-4 py-2.5 text-right text-gray-600 font-semibold uppercase tracking-wider">Weight (KG)</th>
                    <th class="px-4 py-2.5 text-right text-gray-600 font-semibold uppercase tracking-wider">Value (৳)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.05]">
                  <!-- Expected Quantity row — admin only (variance tracking) -->
                  <tr v-if="isAdmin && Number(grn.expected_quantity) > 0">
                    <td class="px-4 py-3 text-gray-400">Expected (Billed) Quantity</td>
                    <td class="px-4 py-3 text-right font-mono text-purple-400">{{ Number(grn.expected_quantity).toLocaleString() }}</td>
                    <td class="px-4 py-3 text-right font-mono text-purple-400">৳{{ expectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</td>
                  </tr>
                  <!-- Actual Received -->
                  <tr>
                    <td class="px-4 py-3 text-gray-200 font-semibold">Quantity Received</td>
                    <td class="px-4 py-3 text-right font-mono text-emerald-400 font-semibold">{{ Number(grn.quantity_received_kg).toLocaleString() }}</td>
                    <td class="px-4 py-3 text-right font-mono text-emerald-400 font-semibold">৳{{ Number(grn.total_value).toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</td>
                  </tr>
                  <!-- Variance — admin only -->
                  <tr v-if="isAdmin && Number(grn.expected_quantity) > 0">
                    <td class="px-4 py-3 font-semibold" :class="varianceColor">Variance (Billed vs Received)</td>
                    <td class="px-4 py-3 text-right font-mono font-semibold" :class="varianceColor">
                      {{ varianceKg > 0 ? '+' : '' }}{{ varianceKg.toLocaleString(undefined, { maximumFractionDigits: 2 }) }}
                      <span class="text-[10px] ml-1">({{ varianceKg > 0 ? '+' : '' }}{{ variancePct.toFixed(2) }}%)</span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono font-semibold" :class="varianceColor">
                      {{ varianceKg > 0 ? '+' : '' }}৳{{ (varianceKg * Number(grn.unit_price_per_kg || grn.po_unit_price || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 }) }}
                    </td>
                  </tr>
                  <!-- Billed Amount row (for everyone) -->
                  <tr class="bg-gold-500/[0.04] border-t-2 border-gold-500/20">
                    <td class="px-4 py-3 font-bold text-gray-200 uppercase text-xs tracking-wider">BILLED AMOUNT</td>
                    <td class="px-4 py-3 text-right font-mono font-semibold text-gray-300">{{ Number(grn.expected_quantity || grn.quantity_received_kg).toLocaleString() }} KG</td>
                    <td class="px-4 py-3 text-right font-mono font-bold text-gold-400">৳{{ expectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Variance remarks — admin only -->
            <div v-if="isAdmin && grn.variance_remarks" class="text-xs border-t border-white/[0.06] pt-3">
              <span class="font-semibold text-gray-500">Variance Remarks: </span>
              <span class="text-gray-400">{{ grn.variance_remarks }}</span>
            </div>
            <div v-if="grn.remarks" class="text-xs border-t border-white/[0.06] pt-3">
              <span class="font-semibold text-gray-500">Remarks: </span>
              <span class="text-gray-400">{{ grn.remarks }}</span>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="space-y-5">
          <!-- BILLED AMOUNT box -->
          <div class="glass-card p-5 border border-gold-500/20 bg-gold-500/[0.03]">
            <p class="text-xs text-gray-500 mb-1">BILLED AMOUNT (Amount Due)</p>
            <p class="text-2xl font-bold text-gold-400 font-mono">
              ৳{{ expectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}
            </p>
            <p class="text-[10px] text-gray-600 mt-1">
              Billed Qty × Unit Price
            </p>
          </div>

          <!-- Actual value — admin only (reveals the variance) -->
          <div v-if="isAdmin && Number(grn.expected_quantity) > 0" class="glass-card p-4 border border-white/[0.06]">
            <p class="text-xs text-gray-500 mb-0.5">Actual Weighed Value (admin reference)</p>
            <p class="text-lg font-semibold text-gray-400 font-mono">৳{{ Number(grn.total_value).toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</p>
          </div>

          <div v-if="grn.grn_status !== 'cancelled'" class="glass-card p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-300">Actions</h3>
            <NuxtLink :to="`/purchase/grn/${route.params.id}/edit`" class="btn-ghost text-xs w-full justify-start gap-2">✏ Edit GRN</NuxtLink>
            <NuxtLink :to="`/purchase/grn/${route.params.id}/print`" target="_blank" class="btn-ghost text-xs w-full justify-start gap-2">🖨 Print Receipt</NuxtLink>
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
const route = useRoute()
const { success, error: toastError } = useToast()
const cancelling = ref(false)

const { user: sessionUser } = useUserSession()
const isAdmin = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const { data, pending, error, refresh } = await useFetch(
  () => `/api/purchase/grn/${route.params.id}`,
)
const grn = computed(() => (data.value?.grn ?? {}) as any)

const unitPrice   = computed(() => Number(grn.value?.unit_price_per_kg || grn.value?.po_unit_price || 0))
const expectedValue = computed(() => Number(grn.value?.expected_quantity || 0) * unitPrice.value)

const varianceKg  = computed(() => Number(grn.value?.quantity_received_kg || 0) - Number(grn.value?.expected_quantity || 0))
const variancePct = computed(() => {
  const exp = Number(grn.value?.expected_quantity || 0)
  return exp > 0 ? (varianceKg.value / exp) * 100 : 0
})
const varianceColor = computed(() => varianceKg.value >= 0 ? 'text-emerald-400' : 'text-red-400')

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
