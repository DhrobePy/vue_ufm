<template>
  <div class="space-y-6 max-w-2xl">
    <UiPageHeader title="Manual Status Override" subtitle="Admin escape hatch for orders stuck outside the normal pipeline"
                  :breadcrumb="['Credit Sales', 'Order Status Override']" />

    <div class="glass-card p-5 space-y-4">
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Number</label>
        <div class="flex gap-2">
          <input v-model="orderNumberInput" @keyup.enter="lookup" class="input-glass flex-1" placeholder="e.g. CO-20260715-0001" />
          <button @click="lookup" :disabled="!orderNumberInput.trim() || looking" class="btn-gold text-xs disabled:opacity-50">
            {{ looking ? '…' : 'Find' }}
          </button>
        </div>
        <p v-if="lookupError" class="text-xs text-red-400">{{ lookupError }}</p>
      </div>
    </div>

    <div v-if="order" class="glass-card p-5 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-gray-200">{{ order.order_number }}</p>
          <p class="text-xs text-gray-500">{{ order.customer_name }}</p>
        </div>
        <UiStatusBadge :status="order.status" />
      </div>

      <div v-if="!allowedTargets.length" class="text-xs text-gray-500 rounded-xl p-3" style="background:rgba(107,114,128,0.08);">
        No manual override targets from status "{{ order.status }}" — this order isn't in an overridable stage.
      </div>

      <template v-else>
        <div class="space-y-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Override To</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="t in allowedTargets" :key="t" @click="target = t"
              :class="['px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                target === t ? 'bg-gold-500/15 text-gold-400 border-gold-500/30' : 'text-gray-400 border-white/[0.08] hover:border-white/[0.18]']">
              {{ statusLabel(t) }}
            </button>
          </div>
        </div>

        <div v-if="target === 'cancelled'" class="text-xs text-amber-400 rounded-xl p-3" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);">
          ⚠ This reverses the goods-on-board invoice (posts a credit note + reversing journal entry). Only allowed if the order has zero payments, returns, or over-deliveries recorded — otherwise reverse those first.
        </div>
        <div v-else-if="['goods_on_board','shipped','delivered'].includes(target ?? '')" class="text-xs text-blue-300 rounded-xl p-3" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);">
          ℹ If the goods-on-board invoice hasn't posted yet, it will post automatically as part of this override (the accounting pivot never gets skipped).
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason *</label>
          <textarea v-model="reason" rows="2" class="input-glass resize-none" placeholder="Why this order needs a manual override…" />
        </div>

        <button @click="submit" :disabled="!target || !reason.trim() || submitting" class="btn-gold text-xs w-full disabled:opacity-50">
          {{ submitting ? 'Applying…' : `Override to ${target ? statusLabel(target) : '…'}` }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const orderNumberInput = ref('')
const looking          = ref(false)
const lookupError      = ref('')
const order             = ref<any>(null)
const target            = ref<string | null>(null)
const reason            = ref('')
const submitting        = ref(false)

// Mirrors server/api/credit-sales/[id]/override-status.post.ts's
// OVERRIDE_TRANSITIONS — display-only; the server re-validates independently.
const OVERRIDE_TRANSITIONS: Record<string, string[]> = {
  ready_to_ship:  ['goods_on_board', 'shipped', 'hold'],
  goods_on_board: ['shipped', 'delivered', 'hold'],
  shipped:        ['delivered'],
  hold:           ['ready_to_ship', 'goods_on_board', 'shipped', 'delivered'],
  delivered:      ['cancelled'],
}

const allowedTargets = computed(() => OVERRIDE_TRANSITIONS[order.value?.status] ?? [])

function statusLabel(s: string) {
  return s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

async function lookup() {
  const num = orderNumberInput.value.trim()
  if (!num) return
  looking.value     = true
  lookupError.value = ''
  order.value       = null
  target.value      = null
  reason.value      = ''
  try {
    const res: any = await $fetch('/api/credit-sales', { query: { search: num, per: 5 } })
    const match = (res.orders ?? []).find((o: any) => o.order_number.toLowerCase() === num.toLowerCase())
      ?? (res.orders ?? [])[0]
    if (!match) { lookupError.value = 'No order found with that number'; return }
    order.value = match
  } catch (e: any) {
    lookupError.value = e?.data?.statusMessage ?? 'Lookup failed'
  } finally {
    looking.value = false
  }
}

async function submit() {
  if (!order.value || !target.value || !reason.value.trim()) return
  submitting.value = true
  try {
    await $fetch(`/api/credit-sales/${order.value.id}/override-status`, {
      method: 'POST',
      body: { to_status: target.value, reason: reason.value.trim() },
    })
    success(`${order.value.order_number} moved to ${statusLabel(target.value)} ✓`)
    order.value.status = target.value
    target.value = null
    reason.value = ''
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Override failed')
  } finally {
    submitting.value = false
  }
}
</script>
