<template>
  <div class="space-y-6">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader :title="note.note_number"
                    :subtitle="`${note.supplier_name || '—'} · ${note.note_type === 'debit' ? 'Debit Note (DAN)' : 'Credit Note (CAN)'}`"
                    :breadcrumb="['Purchase','Adjustments', note.note_number]">
        <template #actions>
          <NuxtLink to="/purchase/adjustments" class="btn-ghost text-xs">← All Notes</NuxtLink>
          <NuxtLink v-if="note.purchase_order_id" :to="`/purchase/orders/${note.purchase_order_id}`" class="btn-ghost text-xs">View PO</NuxtLink>
        </template>
      </UiPageHeader>

      <!-- Type & Status banner -->
      <div class="rounded-xl border-2 p-4 flex flex-wrap items-center gap-4"
        :class="note.note_type === 'debit' ? 'border-orange-500/40 bg-orange-500/5' : 'border-blue-500/40 bg-blue-500/5'">
        <div class="flex-1">
          <p class="text-lg font-bold" :class="note.note_type === 'debit' ? 'text-orange-400' : 'text-blue-400'">
            {{ note.note_type === 'debit' ? '▲ Debit Adjustment Note (DAN)' : '▼ Credit Adjustment Note (CAN)' }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ note.note_type === 'debit'
              ? 'We owe the supplier more — increases payable amount when posted.'
              : 'Supplier owes us a reduction — decreases payable and creates credit when posted.' }}
          </p>
        </div>
        <UiStatusBadge :status="note.status" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">

          <!-- Note details -->
          <div class="glass-card p-6 space-y-4">
            <h3 class="section-title">Note Details</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="space-y-2">
                <div class="flex justify-between"><span class="text-gray-500">Note Number</span><span class="font-mono text-gold-400/80 font-bold">{{ note.note_number }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Reason</span><span class="text-gray-300">{{ reasonLabels[note.reason_type] || note.reason_type }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Purchase Order</span>
                  <NuxtLink :to="`/purchase/orders/${note.purchase_order_id}`" class="font-mono text-gold-400/80 hover:underline">#{{ note.po_number }}</NuxtLink>
                </div>
                <div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-300">{{ note.supplier_name || '—' }}</span></div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between"><span class="text-gray-500">Quantity</span><span class="text-gray-300">{{ note.quantity_kg ? Number(note.quantity_kg).toLocaleString() + ' kg' : '—' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Unit Price</span><span class="text-gray-300">{{ note.unit_price_per_kg ? '৳' + Number(note.unit_price_per_kg).toLocaleString() : '—' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Amount</span>
                  <span class="text-xl font-bold" :class="note.note_type === 'debit' ? 'text-orange-400' : 'text-blue-400'">
                    ৳{{ Number(note.amount).toLocaleString() }}
                  </span>
                </div>
                <div class="flex justify-between"><span class="text-gray-500">Created</span><span class="text-gray-400">{{ note.created_at?.slice(0,10) }}</span></div>
              </div>
            </div>
            <div v-if="note.description" class="border-t border-white/[0.06] pt-4">
              <p class="text-xs font-semibold text-gray-600 mb-1">Description:</p>
              <p class="text-xs text-gray-400 whitespace-pre-wrap">{{ note.description }}</p>
            </div>
          </div>

          <!-- PO Financial Context -->
          <div class="glass-card p-5 space-y-3">
            <h3 class="section-title">PO Financial Context</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
              <div class="bg-white/[0.03] rounded-lg p-3">
                <p class="text-gray-500 mb-1">Order Value</p>
                <p class="font-bold text-gray-200">৳{{ Number(note.total_order_value || 0).toLocaleString() }}</p>
              </div>
              <div class="bg-white/[0.03] rounded-lg p-3">
                <p class="text-gray-500 mb-1">Received</p>
                <p class="font-bold text-emerald-400">৳{{ Number(note.total_received_value || 0).toLocaleString() }}</p>
              </div>
              <div class="bg-white/[0.03] rounded-lg p-3">
                <p class="text-gray-500 mb-1">Total Paid</p>
                <p class="font-bold text-blue-400">৳{{ Number(note.total_paid || 0).toLocaleString() }}</p>
              </div>
              <div class="bg-white/[0.03] rounded-lg p-3">
                <p class="text-gray-500 mb-1">Balance</p>
                <p class="font-bold text-red-400">৳{{ Number(note.balance_payable || 0).toLocaleString() }}</p>
              </div>
            </div>
            <!-- Preview after posting -->
            <div v-if="note.status === 'approved'" class="rounded-lg bg-white/[0.03] border border-white/[0.08] p-3 text-xs text-gray-400">
              <strong class="text-gray-300">After posting this {{ note.note_type === 'debit' ? 'DAN' : 'CAN' }}:</strong>
              Balance Payable will become
              <strong :class="note.note_type === 'debit' ? 'text-orange-400' : 'text-emerald-400'">
                ৳{{ afterPostBalance.toLocaleString() }}
              </strong>
              ({{ note.note_type === 'debit' ? '+' : '−' }}৳{{ Number(note.amount).toLocaleString() }})
            </div>
          </div>
        </div>

        <!-- Right: Workflow + Actions -->
        <div class="space-y-4">

          <!-- Workflow tracker -->
          <div class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-300">Workflow</h3>
            <div v-for="step in workflowSteps" :key="step.label" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                :class="stepClass(step)">
                {{ step.icon }}
              </div>
              <span class="text-sm" :class="stepActive(step) ? 'text-gray-200 font-medium' : 'text-gray-600'">
                {{ step.label }}
              </span>
            </div>
            <div v-if="note.status === 'cancelled'" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 text-xs font-bold">✕</div>
              <span class="text-sm text-red-400 font-medium">Cancelled</span>
            </div>
          </div>

          <!-- Admin actions -->
          <div v-if="!['posted','cancelled'].includes(note.status)" class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-300">Actions</h3>

            <!-- Approve -->
            <button v-if="note.status === 'draft'" @click="doAction('approve')" :disabled="acting"
              class="btn-ghost text-xs w-full justify-center text-blue-400 border-blue-500/30 hover:border-blue-400/60">
              {{ acting === 'approve' ? 'Approving…' : '✓ Approve Note' }}
            </button>

            <!-- Post -->
            <button v-if="note.status === 'approved'" @click="doAction('post')" :disabled="acting"
              class="btn-gold text-xs w-full justify-center">
              {{ acting === 'post' ? 'Posting…' : '⬆ Post Note (Apply Financial Effect)' }}
            </button>

            <!-- Cancel -->
            <div>
              <button @click="showCancelForm = !showCancelForm"
                class="btn-ghost text-xs w-full justify-center text-red-400 border-red-500/30 hover:border-red-400/60">
                ✕ Cancel Note
              </button>
              <div v-if="showCancelForm" class="mt-3 space-y-2">
                <textarea v-model="cancelReason" rows="3" class="input-glass text-xs resize-none"
                  placeholder="Reason for cancellation (required)…" />
                <button @click="doCancel" :disabled="acting || !cancelReason.trim()"
                  class="w-full py-2 px-4 rounded-xl bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50">
                  {{ acting === 'cancel' ? 'Cancelling…' : 'Confirm Cancellation' }}
                </button>
              </div>
            </div>
          </div>

          <div v-else class="glass-card p-4 text-center text-xs text-gray-500">
            <p class="text-lg mb-1">🔒</p>
            <p class="font-medium text-gray-400">{{ note.status === 'posted' ? 'This note is posted and locked.' : 'This note has been cancelled.' }}</p>
            <p class="mt-1">No further actions available.</p>
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
const acting = ref<string | false>(false)
const showCancelForm = ref(false)
const cancelReason   = ref('')

const { data, pending, error, refresh } = await useFetch(
  () => `/api/purchase/adjustments/${route.params.id}`,
)
const note = computed(() => (data.value?.note ?? {}) as any)

const reasonLabels: Record<string,string> = {
  over_delivery:          'Over-Delivery',
  under_delivery_closure: 'Under-Delivery Closure',
  quality_deduction:      'Quality / Weight Deduction',
  price_dispute:          'Price Dispute',
  return:                 'Goods Return',
  other:                  'Other',
}

const workflowSteps = [
  { label: 'Draft',    statusGe: 'draft',    icon: '✎' },
  { label: 'Approved', statusGe: 'approved', icon: '✓' },
  { label: 'Posted',   statusGe: 'posted',   icon: '⬆' },
]
const statusOrder = { draft: 1, approved: 2, posted: 3, cancelled: 0 }

function stepActive(step: any) {
  return (statusOrder as any)[note.value.status] >= (statusOrder as any)[step.statusGe]
}
function stepClass(step: any) {
  if (note.value.status === 'cancelled') return 'bg-red-500/10 text-red-500'
  return stepActive(step)
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'bg-white/[0.05] text-gray-600'
}

const afterPostBalance = computed(() => {
  const bal = Number(note.value.balance_payable || 0)
  const amt = Number(note.value.amount || 0)
  return note.value.note_type === 'debit' ? Math.max(0, bal + amt) : Math.max(0, bal - amt)
})

async function doAction(action: string) {
  acting.value = action
  try {
    await $fetch(`/api/purchase/adjustments/${route.params.id}`, {
      method: 'PATCH',
      body: { action },
    })
    success(`Note ${action === 'approve' ? 'approved' : 'posted'} successfully`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? `Failed to ${action}`)
  } finally {
    acting.value = false
  }
}

async function doCancel() {
  if (!cancelReason.value.trim()) return
  acting.value = 'cancel'
  try {
    await $fetch(`/api/purchase/adjustments/${route.params.id}`, {
      method: 'PATCH',
      body: { action: 'cancel', cancel_reason: cancelReason.value.trim() },
    })
    success('Note cancelled')
    showCancelForm.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to cancel')
  } finally {
    acting.value = false
  }
}
</script>
