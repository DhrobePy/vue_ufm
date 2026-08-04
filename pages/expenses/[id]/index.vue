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
          <NuxtLink v-if="exp.status === 'pending'" :to="`/expenses/${exp.id}/edit`" class="btn-ghost text-xs">✏️ Edit</NuxtLink>
          <button v-if="exp.status === 'pending'" @click="openReject"
                  class="btn-ghost text-xs border-red-500/20 text-red-400 hover:bg-red-500/10">Reject</button>
          <button v-if="exp.status === 'pending'" @click="doApprove" :disabled="acting"
                  class="btn-gold text-xs">{{ acting ? '…' : '✓ Approve' }}</button>
          <button v-if="canCancel" @click="openCancel"
                  :disabled="acting"
                  class="btn-ghost text-xs border-orange-500/20 text-orange-400 hover:bg-orange-500/10">
            ↩ Cancel / Reverse
          </button>
        </template>
      </UiPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Expense details card -->
          <div class="glass-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="section-title">Expense Details</h3>
              <UiStatusBadge :status="exp.status" />
            </div>

            <!-- Amount hero -->
            <div class="rounded-2xl p-6 text-center"
                 style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.04));border:1px solid rgba(245,158,11,0.15)">
              <p class="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Amount</p>
              <p class="text-5xl font-bold text-gold-400 font-mono">৳{{ Number(exp.total_amount).toLocaleString() }}</p>
              <p class="text-xs text-gray-600 mt-2">
                {{ exp.category_name }}<span v-if="exp.subcategory_name"> — {{ exp.subcategory_name }}</span>
              </p>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-600 mb-1">Voucher No.</p>
                <p class="text-gray-200 font-mono font-medium">{{ exp.voucher_number }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Date</p>
                <p class="text-gray-200">{{ fmtDate(exp.expense_date) }}</p>
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
                <p class="text-gray-200 capitalize">{{ exp.payment_method || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Submitted By</p>
                <p class="text-gray-200">{{ exp.created_by_name || '—' }}</p>
              </div>
              <div v-if="Number(exp.unit_quantity) > 0">
                <p class="text-xs text-gray-600 mb-1">Quantity</p>
                <p class="text-gray-200">{{ exp.unit_quantity }} {{ exp.unit_type || '' }}</p>
              </div>
              <div v-if="Number(exp.per_unit_cost) > 0">
                <p class="text-xs text-gray-600 mb-1">Unit Cost</p>
                <p class="text-gray-200 font-mono">৳{{ Number(exp.per_unit_cost).toLocaleString() }}</p>
              </div>
              <div v-if="exp.handled_by_person">
                <p class="text-xs text-gray-600 mb-1">Handled By</p>
                <p class="text-gray-200">{{ exp.handled_by_person }}</p>
              </div>
              <div v-if="exp.payment_reference">
                <p class="text-xs text-gray-600 mb-1">Reference / Cheque No.</p>
                <p class="text-gray-200 font-mono">{{ exp.payment_reference }}</p>
              </div>
            </div>

            <!-- Bank / petty cash info -->
            <div v-if="exp.bank_name || exp.payment_account_name"
                 class="text-xs text-gray-500 pt-3 border-t border-white/[0.06]">
              <span v-if="exp.bank_name">
                Bank: <span class="text-gray-300">{{ exp.bank_name }}</span>
                <span v-if="exp.account_number"> · A/C: <span class="text-gray-300 font-mono">{{ exp.account_number }}</span></span>
              </span>
              <span v-else>
                Payment Account: <span class="text-gray-300">{{ exp.payment_account_name }}</span>
              </span>
            </div>

            <!-- Remarks -->
            <div class="pt-3 border-t border-white/[0.06]">
              <p class="text-xs text-gray-600 mb-2">Remarks / Description</p>
              <p class="text-sm text-gray-300 leading-relaxed">{{ exp.remarks || '—' }}</p>
            </div>

            <!-- Rejection / cancellation reason -->
            <div v-if="exp.rejection_reason" class="rounded-xl p-3 text-xs"
                 :style="exp.status === 'cancelled'
                   ? 'background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2)'
                   : 'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)'">
              <p :class="exp.status === 'cancelled' ? 'text-orange-400 font-semibold' : 'text-red-400 font-semibold'">
                {{ exp.status === 'cancelled' ? 'Cancellation Reason' : 'Rejection Reason' }}
              </p>
              <p class="text-gray-400 mt-1">{{ exp.rejection_reason }}</p>
            </div>
          </div>

          <!-- Review panel (only pending) -->
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

          <!-- Cancel / Reverse panel (approved) -->
          <div v-if="canCancel" class="glass-card p-5 space-y-3"
               style="border:1px solid rgba(249,115,22,0.15)">
            <h3 class="section-title text-orange-400">Reverse / Cancel</h3>
            <p class="text-xs text-gray-500">
              This will mark the voucher as <strong class="text-orange-300">Cancelled</strong> and create a reversal journal entry to undo the accounting entries.
              Use this if the payment was made in error or needs to be undone.
            </p>
            <button @click="openCancel" :disabled="acting"
                    class="py-2 px-5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 transition-all disabled:opacity-40">
              ↩ Cancel / Reverse this Expense
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <!-- Approval timeline -->
          <div class="glass-card p-5">
            <h3 class="section-title mb-4">Timeline</h3>
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
              <span>GL Account</span>
              <span class="text-gray-300 font-mono">
                {{ exp.gl_account_code ? `${exp.gl_account_code} — ${exp.gl_account_name}` : '—' }}
              </span>
            </div>
            <div v-if="exp.journal_entry_id" class="flex justify-between text-xs text-gray-500">
              <span>Journal Entry</span>
              <NuxtLink :to="`/accounts/journal`" class="text-blue-400 hover:text-blue-300 font-mono transition-colors">
                JE-{{ exp.journal_entry_id }}
              </NuxtLink>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Cost Centre</span>
              <span class="text-gray-300">{{ exp.branch_name || '—' }}</span>
            </div>
            <div v-if="exp.approved_at" class="flex justify-between text-xs text-gray-500">
              <span>Approved At</span>
              <span class="text-gray-300">{{ fmtDate(exp.approved_at) }}</span>
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
            <NuxtLink to="/expenses" class="btn-ghost w-full justify-start text-xs py-2">← Back to List</NuxtLink>
          </div>
        </div>
      </div>

      <!-- ── REJECT MODAL ──────────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="rejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
               style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
               @click.self="rejectModal = false">
            <div class="w-full max-w-md glass-card p-6 space-y-4" @click.stop>
              <h3 class="section-title text-red-400">Reject Expense</h3>
              <p class="text-sm text-gray-400">Reason for rejecting <strong class="text-gold-400">{{ exp.voucher_number }}</strong>:</p>
              <textarea v-model="rejectReason" rows="3" class="field-input w-full resize-none"
                        placeholder="Rejection reason…" />
              <div class="flex gap-3 justify-end">
                <button @click="rejectModal = false" class="btn-ghost text-xs">Cancel</button>
                <button @click="doReject" :disabled="!rejectReason.trim() || acting"
                        class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                  {{ acting ? '…' : 'Confirm Reject' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── CANCEL MODAL ──────────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
               style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
               @click.self="cancelModal = false">
            <div class="w-full max-w-md glass-card p-6 space-y-4" @click.stop>
              <h3 class="section-title text-orange-400">↩ Cancel / Reverse Expense</h3>
              <p class="text-sm text-gray-400">
                This will cancel <strong class="text-gold-400">{{ exp.voucher_number }}</strong>
                (৳{{ Number(exp.total_amount).toLocaleString() }}) and log a reversal entry.
              </p>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reason for Cancellation *
                </label>
                <textarea v-model="cancelReason" rows="3" class="field-input w-full resize-none"
                          placeholder="e.g. Duplicate entry, payment reversed, entered by mistake…" />
              </div>
              <div class="flex gap-3 justify-end">
                <button @click="cancelModal = false" class="btn-ghost text-xs">Close</button>
                <button @click="doCancel" :disabled="!cancelReason.trim() || acting"
                        class="py-2 px-5 rounded-xl text-xs font-semibold text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 disabled:opacity-40 transition-all">
                  {{ acting ? '…' : 'Confirm Cancellation' }}
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

// ── Date formatter ────────────────────────────────────────────────────────
function fmtDate(d: any): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return String(d).slice(0, 10) }
}
function fmtDateTime(d: any): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return String(d).slice(0, 16) }
}

// ── Computed state ────────────────────────────────────────────────────────
const canCancel = computed(() =>
  ['approved', 'pending'].includes(exp.value?.status)
  && exp.value?.status !== 'pending'   // pending uses Reject instead
)

// ── Timeline ──────────────────────────────────────────────────────────────
const timeline = computed(() => {
  const e = exp.value
  const items: any[] = []

  items.push({
    id:      1,
    event:   'Voucher Submitted',
    by:      e.created_by_name ?? '—',
    time:    fmtDate(e.created_at ?? e.expense_date),
    color:   '#6366f1',
    comment: '',
  })

  if (e.status === 'approved') {
    items.push({ id: 2, event: 'Approved', by: e.approved_by_name ?? 'Finance',
      time: fmtDateTime(e.approved_at), color: '#10b981', comment: '' })
  } else if (e.status === 'rejected') {
    items.push({ id: 2, event: 'Rejected', by: e.approved_by_name ?? 'Finance',
      time: fmtDateTime(e.approved_at), color: '#ef4444', comment: e.rejection_reason ?? '' })
  } else if (e.status === 'cancelled') {
    items.push({ id: 2, event: 'Cancelled / Reversed', by: '—',
      time: fmtDateTime(e.updated_at), color: '#f97316', comment: e.rejection_reason ?? '' })
  } else {
    items.push({ id: 2, event: 'Awaiting Approval', by: 'System',
      time: 'Now', color: '#eab308', comment: 'Pending finance review' })
  }

  return items
})

// ── Actions ───────────────────────────────────────────────────────────────
const acting        = ref(false)
const reviewComment = ref('')

const rejectModal  = ref(false)
const rejectReason = ref('')

const cancelModal  = ref(false)
const cancelReason = ref('')

function openReject() { rejectReason.value = ''; rejectModal.value = true }
function openCancel() { cancelReason.value = ''; cancelModal.value = true }

async function post(action: string, reason?: string) {
  acting.value = true
  try {
    await $fetch(`/api/expenses/${route.params.id}/approve`, {
      method: 'POST',
      body: { action, reason: reason || undefined },
    })
    await refresh()
    return true
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? `Failed to ${action}`)
    return false
  } finally {
    acting.value = false
  }
}

async function doApprove() {
  if (await post('approve', reviewComment.value || undefined))
    success(`${exp.value.voucher_number} approved ✓`)
}

async function doReject() {
  if (!rejectReason.value.trim()) return
  if (await post('reject', rejectReason.value)) {
    rejectModal.value = false
    toastError(`${exp.value.voucher_number} rejected`)
  }
}

async function doCancel() {
  if (!cancelReason.value.trim()) return
  if (await post('cancel', cancelReason.value)) {
    cancelModal.value = false
    success(`${exp.value.voucher_number} cancelled / reversed`)
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
