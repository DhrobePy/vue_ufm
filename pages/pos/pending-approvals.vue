<template>
  <div class="space-y-6">
    <UiPageHeader title="POS Exit Approvals" subtitle="Release requests for unpaid/partial-credit POS sales"
                  :breadcrumb="['POS', 'Pending Approvals']" />

    <div v-if="!requests.length" class="glass-card p-10 text-center text-sm text-gray-500">
      Nothing pending — all POS sales are cleared for exit.
    </div>

    <div v-for="r in requests" :key="r.id" class="glass-card p-5 flex items-center gap-4">
      <div class="flex-1">
        <p class="text-sm font-semibold text-gray-200">{{ r.reference_label }}</p>
        <p class="text-xs text-gray-500 mt-1">Requested by {{ r.requested_by_name }} · {{ timeAgo(r.created_at) }}</p>
      </div>
      <div class="text-right">
        <p class="font-mono text-orange-400 font-bold">৳{{ Number(r.amount).toLocaleString() }}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button @click="approve(r)" :disabled="acting === r.id"
          class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
          {{ acting === r.id ? '…' : '✓ Approve' }}
        </button>
        <button @click="reject(r)" :disabled="acting === r.id"
          class="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 transition-colors">
          Reject
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, refresh } = await useFetch('/api/pos/pending-approvals')
const requests = computed<any[]>(() => (data.value as any)?.requests ?? [])
const acting = ref<number | null>(null)

async function approve(r: any) {
  if (!confirm(`Approve exit release for ${r.reference_label}?`)) return
  acting.value = r.id
  try {
    await $fetch(`/api/pos/pending-approvals/${r.id}/approve`, { method: 'POST' })
    success('Exit release approved ✓')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to approve')
  } finally { acting.value = null }
}
async function reject(r: any) {
  const reason = prompt(`Reject exit release for ${r.reference_label}? Reason:`)
  if (!reason?.trim()) return
  acting.value = r.id
  try {
    await $fetch(`/api/pos/pending-approvals/${r.id}/reject`, { method: 'POST', body: { reason } })
    success('Rejected')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to reject')
  } finally { acting.value = null }
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>
