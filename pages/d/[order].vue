<template>
  <div class="min-h-screen" style="background:#0e0c0a;font-family:'Inter',sans-serif;">

    <!-- Header bar -->
    <div style="background:rgba(20,16,10,0.97);border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 20px;display:flex;align-items:center;gap:12px;">
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🏭</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#e5e7eb;">Ujjal FMC — Delivery Verification</div>
        <div style="font-size:11px;color:#6b7280;">Scan &amp; confirm goods dispatch</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" style="padding:60px 24px;text-align:center;">
      <div style="width:40px;height:40px;border:3px solid rgba(245,158,11,0.2);border-top-color:#f59e0b;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
      <p style="color:#6b7280;font-size:13px;">Loading order…</p>
    </div>

    <!-- Error / not found -->
    <div v-else-if="error || !orderData" style="padding:48px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">❌</div>
      <p style="color:#f87171;font-size:15px;font-weight:600;">Order Not Found</p>
      <p style="color:#6b7280;font-size:12px;margin-top:6px;">{{ route.params.order }} — no matching order in the system.</p>
    </div>

    <!-- Order card -->
    <div v-else style="padding:20px;max-width:480px;margin:0 auto;">

      <!-- Status badge + order number -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
          <div>
            <div style="font-size:18px;font-weight:700;color:#e5e7eb;letter-spacing:0.5px;">{{ orderData.order.order_number }}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:2px;">{{ orderData.order.customer_name }} · {{ orderData.order.branch_name }}</div>
          </div>
          <div :style="`padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;${statusStyle}`">
            {{ statusLabel }}
          </div>
        </div>

        <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Order Date</div>
            <div style="font-size:13px;color:#d1d5db;font-weight:600;margin-top:2px;">{{ formatDate(orderData.order.order_date) }}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Required By</div>
            <div style="font-size:13px;color:#d1d5db;font-weight:600;margin-top:2px;">{{ orderData.order.required_date ? formatDate(orderData.order.required_date) : '—' }}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Total Amount</div>
            <div style="font-size:13px;color:#d1d5db;font-weight:600;margin-top:2px;">৳{{ fmtNum(orderData.order.total_amount) }}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Balance Due</div>
            <div :style="`font-size:13px;font-weight:600;margin-top:2px;${orderData.order.balance_due > 0 ? 'color:#f87171' : 'color:#4ade80'}`">৳{{ fmtNum(orderData.order.balance_due) }}</div>
          </div>
        </div>
      </div>

      <!-- ── Line items ── -->
      <div v-if="orderData.items?.length" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px 20px;margin-bottom:16px;">
        <div style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">
          📦 Items ({{ totalBags }} bags)
        </div>
        <div v-for="(it, i) in orderData.items" :key="i"
          style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;"
          :style="i < orderData.items.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.05);' : ''">
          <div style="min-width:0;">
            <div style="font-size:13px;color:#e5e7eb;font-weight:600;">
              {{ it.product_name }}<span v-if="it.weight_variant" style="color:#9ca3af;font-weight:500;"> · {{ it.weight_variant }}</span>
            </div>
            <div v-if="it.grade || it.sku" style="font-size:10px;color:#6b7280;margin-top:1px;">
              <span v-if="it.grade">Grade {{ it.grade }}</span><span v-if="it.grade && it.sku"> · </span><span v-if="it.sku">{{ it.sku }}</span>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:13px;color:#fbbf24;font-weight:700;">{{ fmtNum(it.quantity) }} <span style="font-size:10px;color:#9ca3af;font-weight:500;">bags</span></div>
            <div style="font-size:10px;color:#6b7280;">৳{{ fmtNum(it.line_total) }}</div>
          </div>
        </div>
      </div>

      <!-- ── Dispatch confirmation panel ── -->
      <div v-if="canConfirmDispatch || orderData.order.status === 'dispatched'" style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:16px;padding:20px;margin-bottom:16px;">

        <!-- Already dispatched -->
        <div v-if="orderData.order.status === 'dispatched' && !confirmSuccess">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <div style="font-size:24px;">🚚</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:#fbbf24;">Order Dispatched</div>
              <div style="font-size:11px;color:#9ca3af;">Goods have left the warehouse. You can re-scan to verify.</div>
            </div>
          </div>
          <button @click="showPinEntry = !showPinEntry"
            style="width:100%;padding:10px;border-radius:10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#fbbf24;font-size:12px;font-weight:600;cursor:pointer;">
            {{ showPinEntry ? '↑ Hide PIN entry' : '🔢 Re-scan with PIN' }}
          </button>
        </div>

        <!-- Ready to dispatch -->
        <div v-else-if="canConfirmDispatch && !confirmSuccess">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="font-size:24px;">📦</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:#fbbf24;">Confirm Dispatch</div>
              <div style="font-size:11px;color:#9ca3af;">Enter the 6-digit PIN from the invoice to confirm goods dispatch.</div>
            </div>
          </div>
          <div style="margin-bottom:1px;" :style="showPinEntry ? '' : 'display:none'"></div>
          <div :style="showPinEntry || canConfirmDispatch ? '' : 'display:none'">
            <div style="display:flex;gap:8px;margin-bottom:12px;">
              <input v-model="pinInput" type="number" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="6-digit PIN"
                style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:11px 14px;color:#e5e7eb;font-size:18px;font-weight:700;letter-spacing:4px;font-family:monospace;outline:none;text-align:center;"
                @keyup.enter="confirmDispatch"
                :disabled="confirming" />
            </div>
            <p v-if="pinError" style="color:#f87171;font-size:12px;text-align:center;margin-bottom:10px;">{{ pinError }}</p>
            <button @click="confirmDispatch" :disabled="confirming || !pinInput"
              style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:opacity 0.15s;"
              :style="(confirming || !pinInput) ? 'opacity:0.5;cursor:not-allowed' : ''">
              <span v-if="confirming">Verifying…</span>
              <span v-else>✓ Confirm Dispatch</span>
            </button>
          </div>
        </div>

        <!-- Success -->
        <div v-if="confirmSuccess" style="text-align:center;padding:8px 0;">
          <div style="font-size:48px;margin-bottom:10px;">✅</div>
          <div style="font-size:16px;font-weight:700;color:#4ade80;margin-bottom:6px;">{{ confirmMessage }}</div>
          <div style="font-size:12px;color:#6b7280;">Order status has been updated.</div>
        </div>

      </div>

      <!-- ── Final delivery confirmation (authorized staff only) ── -->
      <div v-if="orderData.order.status === 'dispatched' && canDeliver && !deliverSuccess"
        style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.2);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <div style="font-size:24px;">✅</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#4ade80;">Confirm Final Delivery</div>
            <div style="font-size:11px;color:#9ca3af;">Logged in as {{ deliverUserName }}. This records the full delivery, posts it to the customer ledger and marks the order delivered.</div>
          </div>
        </div>
        <p v-if="deliverError" style="color:#f87171;font-size:12px;text-align:center;margin-bottom:10px;">{{ deliverError }}</p>
        <button v-if="!deliverArmed" @click="deliverArmed = true"
          style="width:100%;padding:12px;border-radius:12px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:#4ade80;font-size:14px;font-weight:700;cursor:pointer;">
          🚚 Confirm Delivery…
        </button>
        <div v-else style="display:flex;gap:8px;">
          <button @click="deliverArmed = false" :disabled="delivering"
            style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#9ca3af;font-size:13px;font-weight:600;cursor:pointer;">
            Cancel
          </button>
          <button @click="confirmDelivery" :disabled="delivering"
            style="flex:2;padding:12px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;"
            :style="delivering ? 'opacity:0.5;cursor:not-allowed' : ''">
            <span v-if="delivering">Recording delivery…</span>
            <span v-else>✓ Yes, mark as delivered</span>
          </button>
        </div>
      </div>

      <!-- Delivery success -->
      <div v-if="deliverSuccess"
        style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.2);border-radius:16px;padding:24px;margin-bottom:16px;text-align:center;">
        <div style="font-size:48px;margin-bottom:10px;">🎉</div>
        <div style="font-size:16px;font-weight:700;color:#4ade80;margin-bottom:6px;">{{ deliverMessage }}</div>
        <div style="font-size:12px;color:#6b7280;">Ledger updated · order marked as delivered.</div>
      </div>

      <!-- PIN entry for re-scan (dispatched state) -->
      <div v-if="orderData.order.status === 'dispatched' && showPinEntry && !confirmSuccess"
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <input v-model="pinInput" type="number" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="6-digit PIN"
            style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:11px 14px;color:#e5e7eb;font-size:18px;font-weight:700;letter-spacing:4px;font-family:monospace;outline:none;text-align:center;"
            @keyup.enter="confirmDispatch"
            :disabled="confirming" />
        </div>
        <p v-if="pinError" style="color:#f87171;font-size:12px;text-align:center;margin-bottom:10px;">{{ pinError }}</p>
        <button @click="confirmDispatch" :disabled="confirming || !pinInput"
          style="width:100%;padding:12px;border-radius:12px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);color:#fbbf24;font-size:13px;font-weight:600;cursor:pointer;"
          :style="(confirming || !pinInput) ? 'opacity:0.5;cursor:not-allowed' : ''">
          <span v-if="confirming">Verifying…</span>
          <span v-else>🔢 Verify PIN</span>
        </button>
      </div>

      <!-- Scan history -->
      <div v-if="orderData.scans.length" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;margin-bottom:16px;">
        <div style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Scan History</div>
        <div style="space-y:8px;">
          <div v-for="(s, i) in orderData.scans.slice(0, 10)" :key="i"
            style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:14px;">{{ s.scan_type === 'dispatch' ? '📦' : s.scan_type === 'delivery' ? '🚚' : '👁️' }}</span>
              <div>
                <div style="font-size:12px;color:#d1d5db;font-weight:500;text-transform:capitalize;">{{ s.scan_type }}</div>
                <div style="font-size:10px;color:#6b7280;">{{ formatDateTime(s.scanned_at) }}</div>
              </div>
            </div>
            <div v-if="s.scan_type !== 'view'"
              :style="`font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;${s.pin_correct ? 'background:rgba(74,222,128,0.1);color:#4ade80;' : 'background:rgba(248,113,113,0.1);color:#f87171;'}`">
              {{ s.pin_correct ? '✓ Correct' : '✗ Wrong' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:20px 0 40px;">
        <p style="font-size:10px;color:#4b5563;">Powered by Ujjal FMC ERP &nbsp;·&nbsp; {{ orderData.order.order_number }}</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route       = useRoute()
const orderNum    = computed(() => (route.params.order as string ?? '').toUpperCase())

const { data: orderData, pending, error } = await useFetch<any>(
  () => `/api/verify/${orderNum.value}`,
  { key: `verify-${orderNum.value}` },
)

const pinInput       = ref('')
const pinError       = ref('')
const confirming     = ref(false)
const confirmSuccess = ref(false)
const confirmMessage = ref('')
const showPinEntry   = ref(false)

// ── Final delivery (authorized ERP users only) ──
const { data: canDeliverData } = await useFetch<any>('/api/verify/can-deliver')
const canDeliver      = computed(() => canDeliverData.value?.allowed === true)
const deliverUserName = computed(() => canDeliverData.value?.user_name ?? '')
const deliverArmed    = ref(false)
const delivering      = ref(false)
const deliverSuccess  = ref(false)
const deliverMessage  = ref('')
const deliverError    = ref('')

async function confirmDelivery() {
  deliverError.value = ''
  delivering.value = true
  try {
    const res = await $fetch<any>(`/api/verify/${orderNum.value}/deliver`, { method: 'POST' })
    deliverSuccess.value = true
    deliverMessage.value = res.message ?? 'Delivery confirmed'
    await refreshNuxtData(`verify-${orderNum.value}`)
  } catch (e: any) {
    deliverError.value = e?.data?.statusMessage ?? 'Server error. Please try again.'
    deliverArmed.value = false
  } finally {
    delivering.value = false
  }
}

const canConfirmDispatch = computed(() =>
  orderData.value?.order?.status === 'ready_to_ship' && orderData.value?.order?.has_dispatch_pin,
)

const totalBags = computed(() =>
  (orderData.value?.items ?? []).reduce((s: number, i: any) => s + Number(i.quantity ?? 0), 0),
)

const statusLabel = computed(() => {
  const s = orderData.value?.order?.status ?? ''
  const map: Record<string, string> = {
    pending_approval:  'Pending Approval',
    escalated:         'Escalated',
    approved:          'Approved',
    in_production:     'In Production',
    produced:          'Produced',
    ready_to_ship:     'Ready to Ship',
    dispatched:        'Dispatched',
    delivered:         'Delivered',
    completed:         'Completed',
    cancelled:         'Cancelled',
    rejected:          'Rejected',
  }
  return map[s] ?? s
})

const statusStyle = computed(() => {
  const s = orderData.value?.order?.status ?? ''
  if (s === 'delivered' || s === 'completed') return 'background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3);'
  if (s === 'dispatched')                     return 'background:rgba(96,165,250,0.15);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);'
  if (s === 'ready_to_ship')                  return 'background:rgba(167,139,250,0.15);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);'
  if (s === 'in_production' || s === 'produced') return 'background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);'
  if (s === 'cancelled' || s === 'rejected')  return 'background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3);'
  if (s === 'escalated')                      return 'background:rgba(251,146,60,0.15);color:#fb923c;border:1px solid rgba(251,146,60,0.3);'
  return 'background:rgba(156,163,175,0.15);color:#9ca3af;border:1px solid rgba(156,163,175,0.3);'
})

async function confirmDispatch() {
  pinError.value = ''
  if (!pinInput.value || String(pinInput.value).length !== 6) {
    pinError.value = 'Please enter the full 6-digit PIN'
    return
  }
  confirming.value = true
  try {
    const res = await $fetch<any>(`/api/verify/${orderNum.value}/confirm`, {
      method: 'POST',
      body: { pin: String(pinInput.value), scan_type: 'dispatch' },
    })
    if (res.pin_correct) {
      confirmSuccess.value = true
      confirmMessage.value = res.message
      // Refresh order data to show updated status
      await refreshNuxtData(`verify-${orderNum.value}`)
    } else {
      pinError.value = res.message ?? 'Incorrect PIN'
    }
  } catch (e: any) {
    pinError.value = e?.data?.statusMessage ?? 'Server error. Please try again.'
  } finally {
    confirming.value = false
  }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

function formatDateTime(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return d }
}

function fmtNum(n: number) {
  return Number(n ?? 0).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
</style>
