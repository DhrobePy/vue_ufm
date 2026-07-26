<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-card p-6 w-full max-w-md space-y-4">
      <h1 class="text-lg font-bold text-gray-100">Commodity Dispatch Verification</h1>

      <template v-if="sale">
        <div class="text-xs space-y-1.5">
          <div class="flex justify-between"><span class="text-gray-500">Sale</span><span class="font-mono text-gold-400">{{ sale.sale_number }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Customer</span><span class="text-gray-200">{{ sale.customer_name }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Commodity</span><span class="text-gray-200">{{ sale.commodity_name }}{{ sale.origin ? ` (${sale.origin})` : '' }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Quantity</span><span class="text-gray-200 font-mono">{{ Number(sale.quantity).toLocaleString() }} {{ sale.unit ?? sale.commodity_unit }}</span></div>
        </div>

        <!-- Stage -->
        <div v-if="dispatch?.confirmed_at" class="rounded-xl p-3 text-xs text-emerald-300" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);">
          ✅ ALREADY DELIVERED — {{ dispatch.confirmed_at }} by {{ dispatch.confirmed_by_name }}. A second delivery is not possible.
        </div>
        <template v-else-if="!dispatch?.gate_out_at">
          <p class="text-xs text-gray-400">Stage 1 — record goods leaving the warehouse:</p>
          <input v-model="form.driver_name" class="input-glass text-xs" placeholder="Driver name" />
          <input v-model="form.vehicle_number" class="input-glass text-xs" placeholder="Vehicle number" />
          <button @click="act('gate_out')" :disabled="acting" class="btn-gold text-xs w-full">🚚 Confirm Gate-Out</button>
        </template>
        <template v-else>
          <p class="text-xs text-gray-400">Stage 2 — confirm delivery at the customer (locks permanently):</p>
          <input v-model="form.received_by" class="input-glass text-xs" placeholder="Received by (name at customer)" />
          <button @click="act('deliver')" :disabled="acting" class="btn-gold text-xs w-full">📦 Confirm Delivery</button>
        </template>
      </template>
      <p v-else class="text-xs text-gray-500">Loading…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const { success, error: toastError } = useToast()
const saleId = computed(() => Number(route.params.id))
const sig    = computed(() => String(route.query.sig ?? ''))

const { data, refresh } = await useFetch(() => `/api/trading/sales/${saleId.value}`)
const sale     = computed<any>(() => (data.value as any)?.sale ?? null)
const dispatch = computed<any>(() => (data.value as any)?.dispatch ?? null)

const form = reactive({ driver_name: '', vehicle_number: '', received_by: '' })
const acting = ref(false)
async function act(action: 'gate_out' | 'deliver') {
  acting.value = true
  try {
    await $fetch(`/api/trading/sales/${saleId.value}/dispatch`, {
      method: 'POST',
      body: { action, sig: sig.value || undefined, ...form },
    })
    success(action === 'deliver' ? 'Delivery confirmed & locked ✓' : 'Gate-out recorded ✓')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Action failed')
    await refresh()
  } finally { acting.value = false }
}
</script>
