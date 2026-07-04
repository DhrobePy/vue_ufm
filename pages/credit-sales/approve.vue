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
          <button v-if="creditPct(order) > 80 && order.status !== 'escalated' && perms.canDo('credit_sales', 'approve', 'escalate')"
                  @click="doEscalate(order)"
                  class="text-xs py-2 px-3 rounded-xl font-semibold bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25 transition-all"
                  :disabled="acting === order.id">
            {{ acting === order.id ? '…' : 'Escalate' }}
          </button>
          <button v-if="perms.canDo('credit_sales', 'approve', 'approve')"
                  @click="openApprove(order)"
                  class="btn-gold text-xs py-2 px-4"
                  :disabled="acting === order.id">
            {{ acting === order.id ? '…' : 'Approve…' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Approve modal — with special instructions (gates) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="approveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
             style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
             @click.self="approveModal = false">
          <div class="w-full max-w-lg glass-card p-6 space-y-4 my-8" @click.stop>
            <div>
              <h3 class="section-title text-emerald-400">Approve Order</h3>
              <p class="text-sm text-gray-400 mt-1">
                <strong class="text-gold-400">{{ approveTarget?.order_number }}</strong> — {{ approveTarget?.customer_name }}
                · ৳{{ Number(approveTarget?.total_amount ?? 0).toLocaleString() }}
              </p>
            </div>

            <!-- Decision support -->
            <div class="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-xs space-y-1">
              <p class="text-gray-500">Current dues <span class="font-mono text-gray-300 float-right">৳{{ Number(approveTarget?.current_balance ?? 0).toLocaleString() }}</span></p>
              <p class="text-gray-500">+ This invoice <span class="font-mono text-gray-300 float-right">৳{{ Number(approveTarget?.balance_due ?? 0).toLocaleString() }}</span></p>
              <p class="text-gray-400 font-semibold border-t border-white/[0.06] pt-1">Exposure after shipping
                <span class="font-mono text-gold-300 float-right">৳{{ exposureAfter.toLocaleString() }}</span></p>
            </div>

            <!-- Special instructions (collapsible) -->
            <div class="rounded-xl border border-amber-500/15 overflow-hidden">
              <button @click="showConditions = !showConditions"
                      class="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-amber-300/90 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <span>⚙ Special Instructions (holds & payment conditions)</span>
                <span>{{ showConditions ? '▾' : '▸' }}</span>
              </button>
              <div v-if="showConditions" class="p-4 space-y-3 text-xs">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="cond.production_hold" type="checkbox" class="accent-amber-500" />
                  <span class="text-gray-300">⛔ Hold production until admin releases</span>
                </label>
                <input v-if="cond.production_hold" v-model="cond.production_hold_note" type="text"
                       class="input-glass w-full py-1.5" placeholder="Why is production held?" />

                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="cond.dispatch_hold" type="checkbox" class="accent-amber-500" />
                  <span class="text-gray-300">🚫 Hold dispatch until payment condition is met</span>
                </label>
                <template v-if="cond.dispatch_hold">
                  <select v-model="cond.condition_type" class="input-glass w-full py-1.5">
                    <option value="manual">Manual — accounts clears by hand</option>
                    <option value="outstanding_below">Old dues must drop below…</option>
                    <option value="outstanding_after_ship">Total dues after shipping ≤… (0 = pay everything)</option>
                    <option value="amount_received">Receive at least … against this order</option>
                  </select>
                  <input v-if="cond.condition_type !== 'manual'" v-model.number="cond.condition_amount"
                         type="number" min="0" class="input-glass w-full py-1.5 font-mono text-center"
                         placeholder="Amount (৳)" />
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input v-model="cond.auto_release" type="checkbox" class="accent-amber-500 mt-0.5" />
                    <span class="text-gray-500">⚡ Auto-release when condition is met
                      <span class="text-amber-500/80 block text-[10px]">Careful with cheques — money may not be cleared yet</span>
                    </span>
                  </label>
                  <input v-model="cond.accounts_note" type="text" class="input-glass w-full py-1.5"
                         placeholder="Note for the dispatch team…" />
                </template>
              </div>
            </div>

            <div class="flex gap-3 justify-end">
              <button @click="approveModal = false" class="btn-ghost text-xs">Cancel</button>
              <button @click="confirmApprove" :disabled="acting === approveTarget?.id"
                      class="btn-gold text-xs px-5">
                {{ acting === approveTarget?.id ? '…' : '✓ Approve' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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

// ── Approve modal with special instructions ───────────────────────────────────
const approveModal   = ref(false)
const approveTarget  = ref<any>(null)
const showConditions = ref(false)
const cond = reactive({
  production_hold: false, production_hold_note: '',
  dispatch_hold: false, condition_type: 'manual',
  condition_amount: null as number | null,
  auto_release: false, accounts_note: '',
})

const exposureAfter = computed(() =>
  Number(approveTarget.value?.current_balance ?? 0) + Number(approveTarget.value?.balance_due ?? 0))

function openApprove(order: any) {
  approveTarget.value  = order
  approveModal.value   = true
  showConditions.value = false
  Object.assign(cond, {
    production_hold: false, production_hold_note: '',
    dispatch_hold: false, condition_type: 'manual',
    condition_amount: null, auto_release: false, accounts_note: '',
  })
}

async function confirmApprove() {
  const order = approveTarget.value
  if (!order) return
  acting.value = order.id
  try {
    const hasConditions = cond.production_hold || cond.dispatch_hold
    await $fetch(`/api/credit-sales/${order.id}/workflow`, {
      method: 'POST',
      body: {
        to_status: 'approved',
        comments: 'Approved from approve queue',
        ...(hasConditions ? { conditions: { ...cond } } : {}),
      },
    })
    success(`Order ${order.order_number} approved ✓${hasConditions ? ' with special instructions' : ''}`)
    approveModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Approval blocked')
  } finally {
    acting.value = null
  }
}

async function doEscalate(order: any) {
  if (!confirm(`Escalate ${order.order_number} to admin?`)) return
  acting.value = order.id
  try {
    await $fetch(`/api/credit-sales/${order.id}/workflow`, {
      method: 'POST',
      body: { to_status: 'escalated', comments: 'Escalated — credit usage above 80%' },
    })
    success(`Order ${order.order_number} escalated`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to escalate')
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
