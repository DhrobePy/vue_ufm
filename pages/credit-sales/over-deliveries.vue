<template>
  <div class="space-y-5">
    <UiPageHeader title="Over-Deliveries" subtitle="Goods delivered beyond what was ordered — review, approve, resolve"
                  :breadcrumb="['Credit Sales', 'Over-Deliveries']">
      <template #actions>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
          👁 Accounts
        </span>
      </template>
    </UiPageHeader>

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

    <div v-else-if="!items.length" class="glass-card p-14 text-center space-y-2">
      <div class="text-5xl">📦</div>
      <p class="text-gray-400 font-semibold">Nothing here</p>
      <p class="text-xs text-gray-600">Over-deliveries recorded on any order will appear for review</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="od in items" :key="od.id" class="glass-card p-5 flex items-start gap-4 flex-wrap">
        <div class="min-w-[200px] flex-1">
          <NuxtLink :to="`/credit-sales/${od.order_id}`" class="text-sm font-bold text-gold-400 hover:text-gold-300">{{ od.order_number }}</NuxtLink>
          <span class="font-mono text-xs text-gray-500 ml-2">{{ od.od_number }}</span>
          <p class="text-xs text-gray-500 mt-1">
            {{ od.customer_name }} · {{ od.total_extra_qty }} bags extra
            · resolution <strong class="text-gray-400">{{ od.resolution }}</strong>
            · by {{ od.created_by_name ?? '—' }} · {{ new Date(od.created_at).toLocaleString('en-GB') }}
          </p>
          <p v-if="od.notes" class="text-[11px] text-gray-600 mt-1">{{ od.notes }}</p>
          <p v-if="od.status !== 'pending'" class="text-[11px] text-gray-500 mt-1">
            {{ od.status === 'approved' ? '✓ Approved' : '✗ Rejected' }} by {{ od.approved_by_name ?? '—' }}
            {{ od.decision_note ? `— ${od.decision_note}` : '' }}
          </p>
          <p v-if="od.resolution === 'retrieve' && od.status === 'approved'" class="text-[11px] mt-1"
             :class="od.retrieved_at ? 'text-emerald-400' : 'text-amber-400'">
            {{ od.retrieved_at ? `✓ Retrieved ${new Date(od.retrieved_at).toLocaleDateString('en-GB')}` : '⏳ Awaiting physical retrieval' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-amber-300 font-mono">৳{{ Number(od.total_extra_amount).toLocaleString() }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <template v-if="od.status === 'pending'">
            <button @click="decide(od, 'approve')" :disabled="acting === od.id"
                    class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
              {{ acting === od.id ? '…' : '✓ Approve' }}
            </button>
            <button @click="decide(od, 'reject')" :disabled="acting === od.id"
                    class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors">
              Reject
            </button>
          </template>
          <button v-else-if="od.resolution === 'retrieve' && od.status === 'approved' && !od.retrieved_at"
                  @click="markRetrieved(od)" :disabled="acting === od.id"
                  class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25 hover:bg-sky-500/25 disabled:opacity-40 transition-colors">
            {{ acting === od.id ? '…' : '📦 Mark Retrieved' }}
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

const { data, pending, refresh } = await useFetch('/api/credit-sales/over-deliveries', {
  query: computed(() => ({ status: statusFilter.value })),
})
const items = computed<any[]>(() => (data.value as any)?.over_deliveries ?? [])

const acting = ref<number | null>(null)

async function decide(od: any, action: 'approve' | 'reject') {
  const note = action === 'reject' ? prompt(`Reject ${od.od_number}? Reason:`) : null
  if (action === 'reject' && note === null) return
  if (action === 'approve' && !confirm(`Approve ${od.od_number} (${od.resolution}) — ৳${Number(od.total_extra_amount).toLocaleString()}?`)) return

  acting.value = od.id
  try {
    await $fetch(`/api/credit-sales/over-deliveries/${od.id}/status`, {
      method: 'PATCH',
      body: { action, notes: note || undefined },
    })
    success(`${od.od_number} ${action}d`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to decide')
  } finally {
    acting.value = null
  }
}

async function markRetrieved(od: any) {
  if (!confirm(`Mark ${od.od_number} as physically retrieved?`)) return
  acting.value = od.id
  try {
    await $fetch(`/api/credit-sales/over-deliveries/${od.id}/retrieve`, { method: 'POST' })
    success('Marked retrieved')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to mark retrieved')
  } finally {
    acting.value = null
  }
}
</script>
