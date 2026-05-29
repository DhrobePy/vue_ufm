<template>
  <div class="space-y-6">
    <UiPageHeader title="Approve Expenses" subtitle="Review pending expense vouchers"
                  :breadcrumb="['Expenses','Approve']" />

    <div v-if="loading" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <div v-else class="space-y-3">
      <div v-for="e in expenses" :key="e.id"
           class="glass-card-hover p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black shrink-0"
             style="background:linear-gradient(135deg,#f59e0b,#d97706);">
          {{ (e.category_name || 'E')[0] }}
        </div>
        <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">Voucher</p>
            <p class="font-mono text-gold-400/80 font-medium">{{ e.voucher_number }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">Category</p>
            <p class="text-gray-300">{{ e.category_name || '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">Amount</p>
            <p class="font-bold text-white">৳{{ Number(e.total_amount).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">Submitted By</p>
            <p class="text-gray-400">{{ e.created_by_name || '—' }}</p>
          </div>
        </div>
        <p v-if="e.remarks" class="text-xs text-gray-500 md:max-w-[200px] truncate">{{ e.remarks }}</p>
        <div class="flex gap-2 shrink-0">
          <button @click="openReject(e)" :disabled="acting === e.id"
                  class="btn-ghost text-xs py-1.5 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10">
            Reject
          </button>
          <button @click="doApprove(e)" :disabled="acting === e.id"
                  class="btn-gold text-xs py-1.5 px-3">
            {{ acting === e.id ? '…' : 'Approve' }}
          </button>
        </div>
      </div>

      <div v-if="!expenses.length" class="glass-card p-12 text-center">
        <p class="text-emerald-400 font-semibold">✓ All caught up — no pending expenses</p>
      </div>
    </div>

    <!-- Reject modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="rejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
             @click.self="rejectModal = false">
          <div class="w-full max-w-md glass-card p-6 space-y-4" @click.stop>
            <h3 class="section-title text-red-400">Reject Expense</h3>
            <p class="text-sm text-gray-400">
              Rejecting <strong class="text-gold-400">{{ rejectTarget?.voucher_number }}</strong>.
              Please provide a reason.
            </p>
            <textarea v-model="rejectReason" rows="3" class="field-input w-full resize-none"
                      placeholder="Rejection reason…" />
            <div class="flex gap-3 justify-end">
              <button @click="rejectModal = false" class="btn-ghost text-xs">Cancel</button>
              <button @click="confirmReject"
                      :disabled="!rejectReason.trim() || acting === rejectTarget?.id"
                      class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                {{ acting === rejectTarget?.id ? '…' : 'Confirm Reject' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, pending: loading, error: fetchError, refresh } = await useFetch('/api/expenses', {
  query: { status: 'pending', per: 50 },
})

const expenses = computed(() => (data.value?.expenses ?? []) as any[])

const acting      = ref<number | null>(null)
const rejectModal = ref(false)
const rejectTarget = ref<any>(null)
const rejectReason = ref('')

async function doApprove(e: any) {
  acting.value = e.id
  try {
    await $fetch(`/api/expenses/${e.id}/approve`, {
      method: 'POST',
      body: { action: 'approve' },
    })
    success(`${e.voucher_number} approved ✓`)
    await refresh()
  } catch (err: any) {
    toastError(err?.data?.statusMessage ?? 'Failed to approve')
  } finally {
    acting.value = null
  }
}

function openReject(e: any) {
  rejectTarget.value = e
  rejectReason.value = ''
  rejectModal.value  = true
}

async function confirmReject() {
  if (!rejectTarget.value || !rejectReason.value.trim()) return
  acting.value = rejectTarget.value.id
  try {
    await $fetch(`/api/expenses/${rejectTarget.value.id}/approve`, {
      method: 'POST',
      body: { action: 'reject', reason: rejectReason.value },
    })
    toastError(`${rejectTarget.value.voucher_number} rejected`)
    rejectModal.value = false
    await refresh()
  } catch (err: any) {
    toastError(err?.data?.statusMessage ?? 'Failed to reject')
  } finally {
    acting.value = null
  }
}
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
