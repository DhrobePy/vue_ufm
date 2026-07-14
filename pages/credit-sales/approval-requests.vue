<template>
  <div class="space-y-5">
    <UiPageHeader title="Approval Requests" subtitle="Payments queued because they exceeded the maker's transaction limit"
                  :breadcrumb="['Credit Sales', 'Approval Requests']">
      <template #actions>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
          👁 Accounts
        </span>
      </template>
    </UiPageHeader>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button v-for="t in tabs" :key="t.value" @click="statusFilter = t.value; refresh()"
              :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border',
                statusFilter === t.value
                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
                  : 'text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]']">
        {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading…</p>
    </div>

    <div v-else-if="!requests.length" class="glass-card p-14 text-center space-y-2">
      <div class="text-5xl">📭</div>
      <p class="text-gray-400 font-semibold">Nothing here</p>
      <p class="text-xs text-gray-600">Payments over a maker's limit will appear for review</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="r in requests" :key="r.id" class="glass-card p-5 flex items-start gap-4 flex-wrap">
        <div class="min-w-[200px] flex-1">
          <p class="text-sm font-bold text-gray-200">{{ r.reference_label }}</p>
          <p class="text-xs text-gray-500 mt-1">
            {{ r.request_type === 'payment' ? 'Order payment' : 'Customer payment' }}
            · requested by <strong class="text-gray-400">{{ r.requested_by_name ?? '—' }}</strong>
            · {{ new Date(r.created_at).toLocaleString('en-GB') }}
          </p>
          <p class="text-[11px] text-amber-400/90 mt-1">⚠ {{ r.requested_reason }}</p>
          <p v-if="r.status !== 'pending'" class="text-[11px] text-gray-500 mt-1">
            {{ r.status === 'approved' ? '✓ Approved' : '✗ Rejected' }} by {{ r.decided_by_name ?? '—' }}
            {{ r.decision_note ? `— ${r.decision_note}` : '' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-gold-300 font-mono">৳{{ Number(r.amount).toLocaleString() }}</p>
        </div>
        <div v-if="r.status === 'pending'" class="flex items-center gap-2 shrink-0">
          <button @click="approve(r)" :disabled="acting === r.id"
                  class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
            {{ acting === r.id ? '…' : '✓ Approve & Post' }}
          </button>
          <button @click="reject(r)" :disabled="acting === r.id"
                  class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors">
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const tabs = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]
const statusFilter = ref('pending')

const { data, pending, refresh } = await useFetch('/api/credit-sales/pending-requests', {
  query: computed(() => ({ status: statusFilter.value })),
})
const requests = computed<any[]>(() => (data.value as any)?.requests ?? [])

const acting = ref<number | null>(null)

async function approve(r: any) {
  if (!confirm(`Post ৳${Number(r.amount).toLocaleString()} for ${r.reference_label} under your own authority?`)) return
  acting.value = r.id
  try {
    const url = r.request_type === 'payment'
      ? `/api/credit-sales/${r.order_id}/payment`
      : `/api/customers/${r.customer_id}/collect-payment`
    const res: any = await $fetch(url, { method: 'POST', body: r.payload })

    if (res.queued) {
      // Checker's own limit is also insufficient — leave the original
      // request pending for someone with higher authority.
      toastError(res.message ?? 'Your own limit is also insufficient for this amount')
      return
    }

    await $fetch(`/api/credit-sales/pending-requests/${r.id}/link-result`, {
      method: 'POST',
      body: { payment_id: res.id },
    })
    success(`Posted — ${res.payment_number ?? res.reference_number ?? 'payment recorded'} ✓`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to post payment')
  } finally {
    acting.value = null
  }
}

async function reject(r: any) {
  const note = prompt(`Reject ${r.reference_label}? Reason:`)
  if (note === null) return
  acting.value = r.id
  try {
    await $fetch(`/api/credit-sales/pending-requests/${r.id}/reject`, { method: 'POST', body: { note } })
    success('Request rejected')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to reject')
  } finally {
    acting.value = null
  }
}
</script>
