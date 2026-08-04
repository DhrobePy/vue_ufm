<template>
  <div class="max-w-lg mx-auto space-y-5 pt-6">
    <div v-if="pending" class="glass-card p-10 text-center text-sm text-gray-500">Loading…</div>
    <div v-else-if="!order" class="glass-card p-10 text-center text-sm text-red-400">Order not found.</div>
    <template v-else>
      <div class="glass-card p-6 text-center space-y-1">
        <p class="text-xs text-gray-500 uppercase tracking-wider">POS Exit Verification</p>
        <h2 class="text-xl font-bold text-gray-100 font-mono">{{ order.order_number }}</h2>
        <p class="text-sm text-gray-400">{{ order.customer_name ?? 'Walk-in' }} · {{ order.branch_name }}</p>
      </div>

      <div class="glass-card p-5 space-y-2 text-sm">
        <div class="flex justify-between"><span class="text-gray-500">Total</span><span class="font-mono text-gray-200">৳{{ Number(order.total_amount).toLocaleString() }}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Paid now</span><span class="font-mono text-emerald-400">৳{{ Number(order.cash_amount).toLocaleString() }}</span></div>
        <div v-if="Number(order.credit_amount) > 0" class="flex justify-between"><span class="text-gray-500">On credit</span><span class="font-mono text-orange-400">৳{{ Number(order.credit_amount).toLocaleString() }}</span></div>
      </div>

      <div v-if="order.exit_status === 'cleared'" class="glass-card p-6 text-center space-y-2" style="background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.3)">
        <p class="text-3xl">✅</p>
        <p class="font-bold text-emerald-400">Cleared for Exit</p>
        <p class="text-xs text-gray-500">{{ order.cleared_by_name ? `by ${order.cleared_by_name}` : '' }}</p>
        <p v-if="scanCount > 1" class="text-[11px] text-red-400 font-semibold pt-1">
          ⚠ Scanned {{ scanCount }} times — already cleared before this scan. Verify no duplicate exit.
        </p>
      </div>
      <div v-else class="glass-card p-6 text-center space-y-3">
        <p class="text-3xl">⏳</p>
        <p class="font-bold text-orange-400">Unpaid credit portion — release not yet cleared</p>
        <p v-if="order.exit_requested_at" class="text-xs text-gray-500">Approval already requested{{ order.requested_by_name ? ` by ${order.requested_by_name}` : '' }} — waiting for a checker.</p>
        <div v-else class="flex gap-3 justify-center pt-2">
          <button @click="clearExit" :disabled="acting" class="btn-gold text-sm disabled:opacity-50">Clear for Exit</button>
          <button @click="requestApproval" :disabled="acting" class="btn-ghost text-sm disabled:opacity-50">Request Approval</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()

const orderId = computed(() => Number(route.params.order))
const sig = computed(() => String(route.query.sig ?? ''))
const { data, pending, refresh } = await useFetch(() => `/api/pos/exit/${orderId.value}`, { query: { sig } })
const order = computed<any>(() => (data.value as any)?.order ?? null)
const scanCount = computed<number>(() => (data.value as any)?.scan_count ?? 0)

const acting = ref(false)
async function clearExit() {
  acting.value = true
  try {
    await $fetch(`/api/pos/exit/${orderId.value}/clear`, { method: 'POST' })
    success('Cleared for exit ✓')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to clear')
  } finally { acting.value = false }
}
async function requestApproval() {
  acting.value = true
  try {
    await $fetch(`/api/pos/exit/${orderId.value}/request-approval`, { method: 'POST' })
    success('Approval requested — queued for a checker')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to request approval')
  } finally { acting.value = false }
}
</script>
