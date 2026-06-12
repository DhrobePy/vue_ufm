<template>
  <div class="space-y-6">
    <UiPageHeader title="Approve Orders" subtitle="Review pending credit orders — check utilisation before approving"
                  :breadcrumb="['Credit Sales','Approve']" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <KpiCard label="Awaiting Approval" :value="String(orders.length)"
               :trend="`${escalatedCount} escalated`" :trend-up="false" icon="check" color="yellow" />
      <KpiCard label="Total Value"
               :value="'৳' + (orders.reduce((s,o) => s + Number(o.total_amount), 0) / 100000).toFixed(1) + 'L'"
               trend="pending orders" icon="money" color="gold" />
      <KpiCard label="Near Credit Limit" :value="String(orders.filter(o => creditPct(o) > 80).length)"
               trend="orders > 80% utilisation" :trend-up="false" icon="chart" color="orange" />
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="space-y-3">
      <div v-if="orders.length === 0" class="glass-card p-8 text-center text-xs text-gray-600">
        No orders pending approval.
      </div>
      <div v-for="order in orders" :key="order.id"
           class="glass-card-hover p-5 flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Order</p>
            <p class="text-sm font-mono font-semibold text-gold-400">{{ order.order_number }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ order.order_date }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Customer</p>
            <p class="text-sm font-medium text-gray-200 truncate">{{ order.customer_name }}</p>
            <UiStatusBadge :status="order.status" />
          </div>
          <div>
            <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Amount</p>
            <p class="text-sm font-bold text-white">৳{{ Number(order.total_amount).toLocaleString() }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Due: ৳{{ Number(order.balance_due).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Credit Usage</p>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-1.5 rounded-full bg-white/[0.06]">
                <div class="h-full rounded-full transition-all"
                     :style="`width:${Math.min(creditPct(order),100)}%; background:${creditPct(order) > 80 ? '#f97316' : '#10b981'}`" />
              </div>
              <span :class="['text-xs font-bold', creditPct(order) > 80 ? 'text-orange-400' : 'text-emerald-400']">
                {{ creditPct(order) }}%
              </span>
            </div>
            <p v-if="creditPct(order) > 80" class="text-[10px] text-orange-400 mt-1">⚠ Exceeds 80% threshold</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink :to="`/credit-sales/${order.id}`" class="btn-ghost text-xs py-2 px-3">View</NuxtLink>
          <button v-if="perms.canDo('credit_sales', 'approve', 'reject')"
                  @click="showReject(order)" class="btn-ghost text-xs py-2 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10">Reject</button>
          <button v-if="perms.canDo('credit_sales', 'approve', creditPct(order) > 80 ? 'escalate' : 'approve')"
                  @click="doApprove(order)"
                  :class="['text-xs py-2 px-4 rounded-xl font-semibold transition-all duration-200',
                    creditPct(order) > 80 ? 'bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25' : 'btn-gold']"
                  :disabled="acting === order.id">
            {{ acting === order.id ? '…' : creditPct(order) > 80 ? 'Escalate' : 'Approve' }}
          </button>
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
            <h3 class="section-title text-red-400">Reject Order</h3>
            <p class="text-sm text-gray-400">Rejecting <strong class="text-gold-400">{{ rejectTarget?.order_number }}</strong>. Please provide a reason.</p>
            <textarea v-model="rejectReason" rows="3" class="field-input w-full resize-none" placeholder="Rejection reason…" />
            <div class="flex gap-3 justify-end">
              <button @click="rejectModal = false" class="btn-ghost text-xs">Cancel</button>
              <button @click="confirmReject" :disabled="!rejectReason || acting === rejectTarget?.id"
                      class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10">
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
const perms = usePermissions()
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data, pending, error, refresh } = await useFetch('/api/credit-sales', {
  query: { status: 'pending_approval', per: 50 },
})

// Also fetch escalated and merge
const { data: escalatedData } = await useFetch('/api/credit-sales', {
  query: { status: 'escalated', per: 50 },
})

const orders = computed(() => [
  ...(data.value?.orders ?? []),
  ...(escalatedData.value?.orders ?? []),
])

const escalatedCount = computed(() => escalatedData.value?.total ?? 0)

function creditPct(order: any): number {
  if (!order.credit_limit || order.credit_limit <= 0) return 0
  return Math.round((Number(order.current_balance) / Number(order.credit_limit)) * 100)
}

const acting = ref<number | null>(null)

async function doApprove(order: any) {
  acting.value = order.id
  const newStatus = creditPct(order) > 80 ? 'escalated' : 'approved'
  try {
    await $fetch(`/api/credit-sales/${order.id}/workflow`, {
      method: 'POST',
      body: { to_status: newStatus, comments: 'Approved from approve queue' },
    })
    success(`Order ${order.order_number} ${newStatus === 'approved' ? 'approved' : 'escalated'} ✓`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update order')
  } finally {
    acting.value = null
  }
}

const rejectModal  = ref(false)
const rejectTarget = ref<any>(null)
const rejectReason = ref('')

function showReject(order: any) { rejectTarget.value = order; rejectModal.value = true; rejectReason.value = '' }

async function confirmReject() {
  if (!rejectTarget.value || !rejectReason.value) return
  acting.value = rejectTarget.value.id
  try {
    await $fetch(`/api/credit-sales/${rejectTarget.value.id}/workflow`, {
      method: 'POST',
      body: { to_status: 'rejected', comments: rejectReason.value },
    })
    success(`Order ${rejectTarget.value.order_number} rejected`)
    rejectModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to reject order')
  } finally {
    acting.value = null
  }
}
</script>
