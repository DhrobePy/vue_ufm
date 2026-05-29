<template>
  <div class="space-y-6 max-w-4xl">

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading expense…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader
        :title="exp.voucher_number"
        :subtitle="exp.category_name || 'Expense'"
        :breadcrumb="['Expenses', 'History', exp.voucher_number]"
      >
        <template #actions>
          <button @click="printVoucher" class="btn-ghost text-xs">🖨️ Print Voucher</button>
          <button v-if="exp.status === 'pending'" @click="openReject"
                  class="btn-ghost text-xs border-red-500/20 text-red-400 hover:bg-red-500/10">Reject</button>
          <button v-if="exp.status === 'pending'" @click="doApprove" :disabled="acting"
                  class="btn-gold text-xs">{{ acting ? '…' : '✓ Approve' }}</button>
        </template>
      </UiPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Expense details card -->
          <div class="glass-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="section-title">Expense Details</h3>
              <div class="flex items-center gap-2">
                <UiStatusBadge :status="exp.status" />
                <span v-if="exp.priority" :class="['text-xs font-bold px-2 py-1 rounded-lg',
                  exp.priority === 'urgent' ? 'text-red-400 bg-red-500/10' :
                  exp.priority === 'high'   ? 'text-orange-400 bg-orange-500/10' : 'text-gray-500 bg-white/[0.04]']">
                  {{ exp.priority }}
                </span>
              </div>
            </div>

            <!-- Amount hero -->
            <div class="rounded-2xl p-6 text-center"
                 style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.04));border:1px solid rgba(245,158,11,0.15)">
              <p class="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Amount</p>
              <p class="text-5xl font-bold text-gold-400 font-mono">৳{{ Number(exp.total_amount).toLocaleString() }}</p>
              <p class="text-xs text-gray-600 mt-2">{{ exp.category_name }}<span v-if="exp.subcategory_name"> — {{ exp.subcategory_name }}</span></p>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-600 mb-1">Voucher No.</p>
                <p class="text-gray-200 font-mono font-medium">{{ exp.voucher_number }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Date</p>
                <p class="text-gray-200">{{ exp.expense_date }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Category</p>
                <p class="text-gray-200">{{ exp.category_name || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Branch</p>
                <p class="text-gray-200">{{ exp.branch_name || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Payment Method</p>
                <p class="text-gray-200">{{ exp.payment_method || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Submitted By</p>
                <p class="text-gray-200">{{ exp.created_by_name || '—' }}</p>
              </div>
              <div v-if="Number(exp.quantity) > 0">
                <p class="text-xs text-gray-600 mb-1">Quantity</p>
                <p class="text-gray-200">{{ exp.quantity }} {{ exp.unit_of_measurement }}</p>
              </div>
              <div v-if="Number(exp.unit_cost) > 0">
                <p class="text-xs text-gray-600 mb-1">Unit Cost</p>
                <p class="text-gray-200 font-mono">৳{{ Number(exp.unit_cost).toLocaleString() }}</p>
              </div>
              <div v-if="exp.handled_by_person">
                <p class="text-xs text-gray-600 mb-1">Handled By</p>
                <p class="text-gray-200">{{ exp.handled_by_person }}</p>
              </div>
            </div>

            <!-- Bank info if applicable -->
            <div v-if="exp.bank_name" class="text-xs text-gray-500 pt-3 border-t border-white/[0.06]">
              Bank: <span class="text-gray-300">{{ exp.bank_name }}</span>
              <span v-if="exp.account_number"> · A/C: <span class="text-gray-300 font-mono">{{ exp.account_number }}</span></span>
            </div>

            <!-- Remarks -->
            <div class="pt-3 border-t border-white/[0.06]">
              <p class="text-xs text-gray-600 mb-2">Remarks / Description</p>
              <p class="text-sm text-gray-300 leading-relaxed">{{ exp.remarks || '—' }}</p>
            </div>

            <!-- Rejection reason -->
            <div v-if="exp.rejection_reason" class="rounded-xl p-3 text-xs" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)">
              <p class="text-red-400 font-semibold">Rejection Reason</p>
              <p class="text-gray-400 mt-1">{{ exp.rejection_reason }}</p>
            </div>
          </div>

          <!-- Approval / rejection form (if pending) -->
          <div v-if="exp.status === 'pending'" class="glass-card p-5 space-y-3"
               style="border:1px solid rgba(245,158,11,0.15)">
            <h3 class="section-title">Review this Expense</h3>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Review Comment</label>
              <textarea v-model="reviewComment" rows="2" class="field-input w-full resize-none text-sm"
                        placeholder="Optional: add a comment for the submitter…" />
            </div>
            <div class="flex gap-3">
              <button @click="doApprove" :disabled="acting" class="btn-gold flex-1 justify-center">
                {{ acting ? '…' : '✓ Approve Expense' }}
              </button>
              <button @click="openReject" class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all">
                ✗ Reject
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <!-- Approval timeline -->
          <div class="glass-card p-5">
            <h3 class="section-title mb-4">Approval Timeline</h3>
            <div class="space-y-0">
              <div v-for="(ev, idx) in timeline" :key="ev.id" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                       :style="`background:${ev.color}18;border:1px solid ${ev.color}30`">
                    <div class="w-2 h-2 rounded-full" :style="`background:${ev.color}`" />
                  </div>
                  <div v-if="idx < timeline.length - 1" class="w-px flex-1 bg-white/[0.06] my-1 min-h-[16px]" />
                </div>
                <div class="pb-4">
                  <p class="text-xs font-semibold text-gray-200">{{ ev.event }}</p>
                  <p class="text-[11px] text-gray-600 mt-0.5">{{ ev.by }} · {{ ev.time }}</p>
                  <p v-if="ev.comment" class="text-[11px] text-gray-500 mt-1 italic">{{ ev.comment }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related</h3>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Category Code</span>
              <span class="text-gray-300 font-mono">{{ exp.category_code || '—' }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Cost Centre</span>
              <span class="text-gray-300">{{ exp.branch_name || '—' }}</span>
            </div>
            <div v-if="exp.approved_at" class="flex justify-between text-xs text-gray-500">
              <span>Approved At</span>
              <span class="text-gray-300">{{ exp.approved_at }}</span>
            </div>
            <div v-if="exp.approved_by_name" class="flex justify-between text-xs text-gray-500">
              <span>Approved By</span>
              <span class="text-gray-300">{{ exp.approved_by_name }}</span>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
            <button @click="printVoucher" class="btn-ghost w-full justify-start text-xs py-2">🖨️ Print Voucher</button>
            <NuxtLink to="/expenses/history" class="btn-ghost w-full justify-start text-xs py-2">← Back to History</NuxtLink>
          </div>
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
              <p class="text-sm text-gray-400">Please provide a reason for rejecting <strong class="text-gold-400">{{ exp.voucher_number }}</strong>.</p>
              <textarea v-model="rejectReason" rows="3" class="field-input w-full resize-none"
                        placeholder="Rejection reason…" />
              <div class="flex gap-3 justify-end">
                <button @click="rejectModal = false" class="btn-ghost text-xs">Cancel</button>
                <button @click="doReject"
                        :disabled="!rejectReason.trim() || acting"
                        class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                  {{ acting ? '…' : 'Confirm Reject' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()

const { data, pending, error, refresh } = await useFetch(
  () => `/api/expenses/${route.params.id}`,
)

const exp = computed(() => (data.value?.expense ?? {}) as any)

// Build timeline from real data
const timeline = computed(() => {
  const e = exp.value
  const items: Array<{ id: number; event: string; by: string; time: string; color: string; comment: string }> = []

  items.push({
    id: 1,
    event: 'Voucher Submitted',
    by: e.created_by_name ?? '—',
    time: e.expense_date ?? '—',
    color: '#6366f1',
    comment: '',
  })

  if (e.status === 'approved') {
    items.push({
      id: 2,
      event: 'Approved',
      by: e.approved_by_name ?? 'Finance',
      time: e.approved_at ? String(e.approved_at).slice(0, 16).replace('T', ' ') : '—',
      color: '#10b981',
      comment: '',
    })
  } else if (e.status === 'rejected') {
    items.push({
      id: 2,
      event: 'Rejected',
      by: e.approved_by_name ?? 'Finance',
      time: e.approved_at ? String(e.approved_at).slice(0, 16).replace('T', ' ') : '—',
      color: '#ef4444',
      comment: e.rejection_reason ?? '',
    })
  } else {
    items.push({
      id: 2,
      event: 'Awaiting Approval',
      by: 'System',
      time: 'Now',
      color: '#eab308',
      comment: 'Pending finance review',
    })
  }

  return items
})

const acting        = ref(false)
const reviewComment = ref('')
const rejectModal   = ref(false)
const rejectReason  = ref('')

function openReject() {
  rejectReason.value = ''
  rejectModal.value  = true
}

async function doApprove() {
  acting.value = true
  try {
    await $fetch(`/api/expenses/${route.params.id}/approve`, {
      method: 'POST',
      body: { action: 'approve', reason: reviewComment.value || undefined },
    })
    success(`${exp.value.voucher_number} approved ✓`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to approve')
  } finally {
    acting.value = false
  }
}

async function doReject() {
  if (!rejectReason.value.trim()) return
  acting.value = true
  try {
    await $fetch(`/api/expenses/${route.params.id}/approve`, {
      method: 'POST',
      body: { action: 'reject', reason: rejectReason.value },
    })
    toastError(`${exp.value.voucher_number} rejected`)
    rejectModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to reject')
  } finally {
    acting.value = false
  }
}

function printVoucher() {
  navigateTo(`/expenses/${route.params.id}/voucher`)
}
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
