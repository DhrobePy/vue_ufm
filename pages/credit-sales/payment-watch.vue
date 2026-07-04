<template>
  <div class="space-y-5">
    <UiPageHeader title="Payment Watch" subtitle="Held orders — clear dispatch when payment conditions are met"
                  :breadcrumb="['Credit Sales', 'Payment Watch']">
      <template #actions>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
          👁 Accounts
        </span>
      </template>
    </UiPageHeader>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="glass-card p-4">
        <p class="text-[11px] text-gray-500 uppercase tracking-wide">On Watch</p>
        <p class="text-2xl font-bold text-gray-100 mt-1">{{ orders.length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-[11px] text-gray-500 uppercase tracking-wide">Condition Met</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">{{ orders.filter(o => o.condition_met && !o.dispatch_cleared).length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-[11px] text-gray-500 uppercase tracking-wide">Cleared, Not Shipped</p>
        <p class="text-2xl font-bold text-sky-400 mt-1">{{ orders.filter(o => o.dispatch_cleared).length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-[11px] text-gray-500 uppercase tracking-wide">Held Value</p>
        <p class="text-2xl font-bold text-gold-400 mt-1">৳{{ heldValue.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Flash -->
    <div v-if="flash" class="glass-card px-4 py-3 text-sm border bg-emerald-500/10 border-emerald-500/25 text-emerald-300 flex items-center justify-between">
      <span>✓ {{ flash }}</span>
      <button v-if="undoTarget" @click="undoClear" class="text-xs underline text-emerald-400 hover:text-emerald-200">Undo</button>
    </div>

    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading watch list…</p>
    </div>

    <div v-else-if="!orders.length" class="glass-card p-14 text-center space-y-2">
      <div class="text-5xl">🕊️</div>
      <p class="text-gray-400 font-semibold">Nothing on watch</p>
      <p class="text-xs text-gray-600">Orders with payment conditions or production holds appear here</p>
    </div>

    <!-- Watch cards -->
    <div v-else class="space-y-3">
      <div v-for="o in orders" :key="o.id"
           class="glass-card p-0 overflow-hidden"
           :class="o.condition_met && !o.dispatch_cleared ? 'border-emerald-500/30' : ''">
        <div class="px-5 py-4 flex items-start gap-4 flex-wrap">
          <!-- Order info -->
          <div class="min-w-[180px]">
            <NuxtLink :to="`/credit-sales/${o.id}`" class="font-bold text-gray-200 text-sm hover:text-gold-400">
              {{ o.order_number }}
            </NuxtLink>
            <p class="text-xs text-gray-500 mt-0.5">{{ o.customer_name }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <UiStatusBadge :status="o.status" />
              <span v-if="o.production_hold && !o.production_released"
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
                ⛔ Production hold
              </span>
            </div>
          </div>

          <!-- Money -->
          <div class="text-xs space-y-1 min-w-[150px]">
            <p class="text-gray-500">Invoice <span class="font-mono font-bold text-gray-300 float-right">৳{{ Number(o.total_amount).toLocaleString() }}</span></p>
            <p class="text-gray-500">Received <span class="font-mono font-bold text-emerald-400 float-right">৳{{ Number(o.amount_paid).toLocaleString() }}</span></p>
            <p class="text-gray-500">Balance <span class="font-mono font-bold text-gold-400 float-right">৳{{ Number(o.balance_due).toLocaleString() }}</span></p>
          </div>

          <!-- Condition progress -->
          <div class="flex-1 min-w-[220px]" v-if="o.dispatch_hold">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-gray-500">{{ conditionLabel(o) }}</span>
              <span :class="o.condition_met ? 'text-emerald-400 font-bold' : 'text-gray-500'">
                {{ o.condition_met ? '✓ CONDITION MET' : progressText(o) }}
              </span>
            </div>
            <div class="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="o.condition_met ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500/60'"
                   :style="`width:${progressPct(o)}%`"/>
            </div>
            <p v-if="o.accounts_note" class="text-[11px] text-gray-600 mt-1.5 italic">📝 {{ o.accounts_note }}</p>
            <p v-if="o.auto_release" class="text-[10px] text-amber-500/80 mt-0.5">⚡ Auto-release on condition (cheque risk accepted)</p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 items-end shrink-0">
            <template v-if="o.dispatch_hold && !o.dispatch_cleared">
              <button @click="clearDispatch(o)" :disabled="acting === o.id"
                      class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
                {{ acting === o.id ? '…' : '✓ Grant Clearance' }}
              </button>
            </template>
            <template v-else-if="o.dispatch_cleared">
              <span class="text-[11px] text-emerald-400">
                ✓ Cleared {{ o.cleared_by_name ? `by ${o.cleared_by_name}` : '' }}
              </span>
              <button @click="revokeDispatch(o)" :disabled="acting === o.id"
                      class="px-3 py-1 rounded-lg text-[11px] text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors">
                Revoke
              </button>
            </template>
            <button v-if="o.production_hold && !o.production_released && isAdmin"
                    @click="releaseProduction(o)" :disabled="acting === o.id"
                    class="px-3 py-1 rounded-lg text-[11px] text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 disabled:opacity-40 transition-colors">
              Release Production
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { user } = useUserSession()
const { error: toastError } = useToast()

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()))

const { data, pending, refresh } = await useFetch('/api/credit-sales/payment-watch')
const orders = computed<any[]>(() => (data.value as any)?.orders ?? [])
const heldValue = computed(() =>
  orders.value.filter(o => o.dispatch_hold && !o.dispatch_cleared)
    .reduce((s, o) => s + Number(o.total_amount ?? 0), 0))

const acting     = ref<number | null>(null)
const flash      = ref('')
const undoTarget = ref<any>(null)

function conditionLabel(o: any): string {
  const amt = o.condition_amount != null ? ` ৳${Number(o.condition_amount).toLocaleString()}` : ''
  const map: Record<string, string> = {
    manual:                 'Manual clearance by accounts',
    outstanding_below:      `Old dues must drop to${amt}`,
    outstanding_after_ship: Number(o.condition_amount) === 0 ? 'Pay everything incl. this invoice' : `Total dues after shipping ≤${amt}`,
    amount_received:        `Receive${amt} against this order`,
  }
  return map[o.condition_type] ?? 'Dispatch hold'
}

function progressPct(o: any): number {
  if (o.condition_met) return 100
  const target = Number(o.condition_amount ?? 0)
  const cur    = Number(o.current_value ?? 0)
  if (o.condition_type === 'amount_received' && target > 0)
    return Math.min(99, Math.round((cur / target) * 100))
  if (['outstanding_below', 'outstanding_after_ship'].includes(o.condition_type) && cur > 0)
    return Math.min(99, Math.max(5, Math.round((target / cur) * 100)))
  return 5
}

function progressText(o: any): string {
  if (o.current_value == null) return 'waiting'
  if (o.condition_type === 'amount_received')
    return `৳${Number(o.current_value).toLocaleString()} received`
  return `dues ৳${Number(o.current_value).toLocaleString()}`
}

async function gateAction(o: any, action: string, note?: string) {
  acting.value = o.id
  try {
    await $fetch(`/api/credit-sales/${o.id}/gates`, { method: 'POST', body: { action, note } })
    await refresh()
    return true
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Action failed')
    return false
  } finally {
    acting.value = null
  }
}

async function clearDispatch(o: any) {
  if (!confirm(`Grant dispatch clearance for ${o.order_number}?`)) return
  if (await gateAction(o, 'clear_dispatch')) {
    flash.value = `Clearance granted for ${o.order_number}`
    undoTarget.value = o
    setTimeout(() => { if (undoTarget.value?.id === o.id) { flash.value = ''; undoTarget.value = null } }, 15000)
  }
}

async function undoClear() {
  const o = undoTarget.value
  if (!o) return
  if (await gateAction(o, 'revoke_dispatch', 'Undo — cleared by mistake')) {
    flash.value = `Clearance undone for ${o.order_number}`
    undoTarget.value = null
    setTimeout(() => { flash.value = '' }, 4000)
  }
}

async function revokeDispatch(o: any) {
  const note = prompt(`Revoke clearance for ${o.order_number}? Reason:`)
  if (note === null) return
  if (await gateAction(o, 'revoke_dispatch', note || undefined)) {
    flash.value = `Clearance revoked for ${o.order_number}`
    setTimeout(() => { flash.value = '' }, 4000)
  }
}

async function releaseProduction(o: any) {
  if (!confirm(`Release the production hold on ${o.order_number}?`)) return
  if (await gateAction(o, 'release_production')) {
    flash.value = `Production hold released for ${o.order_number}`
    setTimeout(() => { flash.value = '' }, 4000)
  }
}
</script>
