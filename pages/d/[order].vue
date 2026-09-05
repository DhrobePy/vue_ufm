<template>
  <div class="min-h-screen" style="background:#0e0c0a;font-family:'Inter',sans-serif;">

    <!-- Header bar -->
    <div style="background:rgba(20,16,10,0.97);border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 20px;display:flex;align-items:center;gap:12px;">
      <UiBackButton v-if="hasHistory" />
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🏭</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#e5e7eb;">Ujjal FMC — Gate Pass &amp; Delivery</div>
        <div style="font-size:11px;color:#6b7280;">Two-stage QR verification</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" style="padding:60px 24px;text-align:center;">
      <div style="width:40px;height:40px;border:3px solid rgba(245,158,11,0.2);border-top-color:#f59e0b;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
      <p style="color:#6b7280;font-size:13px;">Loading order…</p>
    </div>

    <!-- Error / not verified -->
    <div v-else-if="error || !orderData" style="padding:20px;max-width:480px;margin:0 auto;">
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <div style="background:#dc2626;color:#fff;padding:24px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">✕</div>
          <div style="font-size:16px;font-weight:700;">Not Verified</div>
        </div>
        <div style="padding:20px;text-align:center;font-size:13px;color:#9ca3af;">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Order card -->
    <div v-else style="padding:20px;max-width:480px;margin:0 auto;">

      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;margin-bottom:16px;">

        <!-- Stage header band -->
        <div v-if="stage === 'done'" style="background:#374151;color:#fff;padding:22px;text-align:center;">
          <div style="font-size:36px;margin-bottom:4px;">✓</div>
          <div style="font-size:16px;font-weight:700;">COMPLETED</div>
          <div style="font-size:12px;color:#d1d5db;margin-top:2px;">Gate pass &amp; delivery both recorded.</div>
        </div>
        <div v-else-if="stage === 'delivery'" style="background:#16a34a;color:#fff;padding:22px;text-align:center;">
          <div style="font-size:36px;margin-bottom:4px;">📦</div>
          <div style="font-size:16px;font-weight:700;">CONFIRM DELIVERY</div>
          <div style="font-size:12px;color:#dcfce7;margin-top:2px;">Goods already left the gate — confirm the customer received them.</div>
        </div>
        <div v-else-if="!orderData.dispatch_ok" style="background:#dc2626;color:#fff;padding:22px;text-align:center;">
          <div style="font-size:36px;margin-bottom:4px;">⛔</div>
          <div style="font-size:16px;font-weight:700;">HELD — DO NOT RELEASE</div>
          <div style="font-size:12px;color:#fecaca;margin-top:2px;">This order is not cleared for dispatch.</div>
        </div>
        <div v-else style="background:#2563eb;color:#fff;padding:22px;text-align:center;">
          <div style="font-size:36px;margin-bottom:4px;">🚪</div>
          <div style="font-size:16px;font-weight:700;">GATE PASS</div>
          <div style="font-size:12px;color:#dbeafe;margin-top:2px;">Verify the load &amp; driver, then release the goods.</div>
        </div>

        <!-- Reuse banner -->
        <div v-if="orderData.is_reuse" style="margin:12px 14px 0;padding:10px 12px;border-radius:10px;background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.3);color:#fca5a5;font-size:11.5px;">
          ⚠ <strong>This QR has already been used.</strong> Scanned {{ orderData.scan_total }} time(s) — admins have been notified.
        </div>

        <!-- Order facts (no amounts) -->
        <div style="padding:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:13px;">
          <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">Invoice No.</span><span style="font-weight:700;color:#e5e7eb;font-family:monospace;">{{ orderData.order.order_number }}</span></div>
          <div v-if="orderData.delivery_number" style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">Delivery</span><span style="font-weight:700;color:#fbbf24;font-family:monospace;">{{ orderData.delivery_number }} <span style="color:#6b7280;font-weight:400;">(partial)</span></span></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">Customer</span><span style="color:#d1d5db;font-weight:600;">{{ orderData.order.customer_name }}</span></div>
          <div v-if="orderData.order.branch_name" style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">From</span><span style="color:#d1d5db;">{{ orderData.order.branch_name }}</span></div>
        </div>

        <!-- Progress -->
        <div style="padding:0 16px 12px;display:flex;align-items:center;gap:8px;">
          <span :style="`padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:700;${gateOut ? 'background:rgba(74,222,128,0.15);color:#4ade80;' : 'background:rgba(96,165,250,0.15);color:#60a5fa;'}`">
            {{ gateOut ? '✓ Gate out' : '1 · Gate out' }}
          </span>
          <span style="color:#4b5563;font-size:12px;">→</span>
          <span :style="`padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:700;${delivered ? 'background:rgba(74,222,128,0.15);color:#4ade80;' : 'background:rgba(156,163,175,0.15);color:#6b7280;'}`">
            {{ delivered ? '✓ Delivered' : '2 · Delivered' }}
          </span>
        </div>

        <!-- Items (qty only — no prices) -->
        <div v-if="orderData.items?.length" style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Items ({{ totalBags }} bags)</div>
          <div v-for="(it, i) in orderData.items" :key="i" style="display:flex;justify-content:space-between;padding:6px 0;font-size:12.5px;"
               :style="i < orderData.items.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''">
            <span style="color:#e5e7eb;">{{ it.product_name }}<span v-if="it.weight_variant" style="color:#9ca3af;"> · {{ it.weight_variant }}</span></span>
            <span style="color:#fbbf24;font-weight:700;">{{ fmtNum(it.quantity) }} bags</span>
          </div>
        </div>
      </div>

      <!-- Stage 1: Gate pass form -->
      <div v-if="stage === 'gate' && orderData.dispatch_ok"
           style="background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.2);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div v-if="!orderData.can_gate" style="text-align:center;font-size:12.5px;color:#9ca3af;">
          Your account is not authorised to release goods at the gate.
        </div>
        <form v-else @submit.prevent="submitGate" style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;">Driver name *</label>
            <input v-model="gateForm.driver_name" required maxlength="150" placeholder="Driver at the gate"
              style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:#e5e7eb;font-size:13px;outline:none;" />
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:4px;">Vehicle / Truck no. *</label>
            <input v-model="gateForm.vehicle_number" required maxlength="100" placeholder="Vehicle leaving the gate"
              style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:#e5e7eb;font-size:13px;outline:none;" />
          </div>
          <input v-model="gateForm.gate_note" maxlength="500" placeholder="Gate note (optional — e.g. seal no.)"
            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:#e5e7eb;font-size:13px;outline:none;" />
          <p v-if="gateError" style="color:#f87171;font-size:12px;text-align:center;">{{ gateError }}</p>
          <button type="submit" :disabled="gateSubmitting"
            style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer;"
            :style="gateSubmitting ? 'opacity:0.5;cursor:not-allowed' : ''">
            {{ gateSubmitting ? 'Releasing…' : '🚪 Confirm Gate Pass (release goods)' }}
          </button>
          <p style="font-size:10.5px;color:#6b7280;text-align:center;">Releasing as <strong>{{ myName }}</strong>.</p>
        </form>
      </div>
      <div v-else-if="stage === 'gate' && !orderData.dispatch_ok"
           style="background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.2);border-radius:16px;padding:18px;margin-bottom:16px;font-size:12.5px;color:#fca5a5;">
        🔒 This order is <strong>held</strong>. It cannot leave until Accounts/Admin clears the dispatch hold in Payment Watch.
      </div>

      <!-- Stage 2: Delivery confirmation form -->
      <div v-if="stage === 'delivery'"
           style="background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="font-size:11.5px;color:#6b7280;margin-bottom:12px;">
          Released at gate by <strong style="color:#9ca3af;">{{ orderData.confirmation?.gate_out_by_name ?? 'staff' }}</strong>
          on {{ formatDateTime(orderData.confirmation?.gate_out_at) }}
          <template v-if="orderData.confirmation?.driver_name"> · Driver {{ orderData.confirmation.driver_name }} · Vehicle {{ orderData.confirmation.vehicle_number }}</template>
        </div>
        <div v-if="!orderData.can_deliver" style="text-align:center;font-size:12.5px;color:#9ca3af;">
          Waiting for an authorised staff member to confirm delivery.
        </div>
        <form v-else @submit.prevent="submitDeliver" style="display:flex;flex-direction:column;gap:10px;">
          <input v-model="deliverForm.received_by" maxlength="150" placeholder="Received by (customer name, optional)"
            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:#e5e7eb;font-size:13px;outline:none;" />
          <input v-model="deliverForm.note" maxlength="500" placeholder="Note (optional)"
            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:#e5e7eb;font-size:13px;outline:none;" />
          <p v-if="deliverError" style="color:#f87171;font-size:12px;text-align:center;">{{ deliverError }}</p>
          <button type="submit" :disabled="deliverSubmitting"
            style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer;"
            :style="deliverSubmitting ? 'opacity:0.5;cursor:not-allowed' : ''">
            {{ deliverSubmitting ? 'Confirming…' : '✓ Confirm Delivery' }}
          </button>
          <p style="font-size:10.5px;color:#6b7280;text-align:center;">Confirming as <strong>{{ myName }}</strong>.</p>
        </form>
      </div>

      <!-- Done -->
      <div v-if="stage === 'done'"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;margin-bottom:16px;font-size:12.5px;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">Gate out</span><span style="color:#d1d5db;">{{ orderData.confirmation?.gate_out_by_name ?? '—' }} · {{ formatDateTime(orderData.confirmation?.gate_out_at) }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">Delivered</span><span style="color:#d1d5db;">{{ orderData.confirmation?.confirmed_by_name ?? '—' }} · {{ formatDateTime(orderData.confirmation?.confirmed_at) }}</span></div>
        <div v-if="orderData.confirmation?.received_by" style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">Received by</span><span style="color:#d1d5db;">{{ orderData.confirmation.received_by }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#6b7280;">QR scanned</span><span :style="orderData.scan_total > 2 ? 'color:#f87171;font-weight:700;' : 'color:#d1d5db;'">{{ orderData.scan_total }} time(s)</span></div>
        <p style="font-size:10.5px;color:#f59e0b;margin-top:8px;">🔒 This order is locked — it cannot be delivered again.</p>
      </div>

      <!-- Scan history -->
      <div v-if="orderData.scans?.length" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Scan History</div>
        <div v-for="(s, i) in orderData.scans.slice(0, 10)" :key="i"
          style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;"
          :style="i < orderData.scans.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:13px;">{{ s.stage === 'gate' ? '🚪' : s.stage === 'delivery' ? '📦' : '✓' }}</span>
            <div>
              <div style="font-size:11.5px;color:#d1d5db;font-weight:500;text-transform:capitalize;">{{ s.stage }}<span v-if="s.reused" style="color:#f87171;"> (reuse)</span></div>
              <div style="font-size:9.5px;color:#6b7280;">{{ s.scanned_by_name }} · {{ formatDateTime(s.scanned_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:16px 0 32px;">
        <p style="font-size:10px;color:#4b5563;">Powered by Ujjal FMC ERP &nbsp;·&nbsp; {{ orderData.order.order_number }}</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route    = useRoute()
const orderNum = computed(() => (route.params.order as string ?? '').toUpperCase())
const sig      = computed(() => String(route.query.sig ?? ''))
const deliveryId = computed(() => route.query.delivery_id ? Number(route.query.delivery_id) : null)

const { user } = useUserSession()
const myName = computed(() => (user.value as any)?.name ?? (user.value as any)?.display_name ?? '')

// Public page, often opened fresh from a QR scan (no in-app history) — only
// show Back when there's actually somewhere to go back to.
const hasHistory = ref(false)
onMounted(() => { hasHistory.value = !!window.history.state?.back })

const { data: orderData, pending, error, refresh } = await useFetch<any>(
  () => `/api/verify/${orderNum.value}`,
  { key: `verify-${orderNum.value}-${deliveryId.value ?? 'whole'}`, query: computed(() => ({ sig: sig.value, delivery_id: deliveryId.value ?? undefined })) },
)

const errorMessage = computed(() =>
  (error.value as any)?.data?.statusMessage ?? 'Could not verify this code.',
)

const stage    = computed(() => orderData.value?.stage ?? 'error')
const gateOut  = computed(() => !!orderData.value?.confirmation?.gate_out_at)
const delivered = computed(() => !!orderData.value?.confirmation?.confirmed_at)

const totalBags = computed(() =>
  (orderData.value?.items ?? []).reduce((s: number, i: any) => s + Number(i.quantity ?? 0), 0),
)

const gateForm = reactive({ driver_name: '', vehicle_number: '', gate_note: '' })
const gateSubmitting = ref(false)
const gateError = ref('')

async function submitGate() {
  gateError.value = ''
  gateSubmitting.value = true
  try {
    await $fetch(`/api/verify/${orderNum.value}/gate`, {
      method: 'POST',
      body: { sig: sig.value, delivery_id: deliveryId.value ?? undefined, ...gateForm },
    })
    await refresh()
  } catch (e: any) {
    gateError.value = e?.data?.statusMessage ?? 'Server error. Please try again.'
  } finally {
    gateSubmitting.value = false
  }
}

const deliverForm = reactive({ received_by: '', note: '' })
const deliverSubmitting = ref(false)
const deliverError = ref('')

async function submitDeliver() {
  deliverError.value = ''
  deliverSubmitting.value = true
  try {
    await $fetch(`/api/verify/${orderNum.value}/deliver`, {
      method: 'POST',
      body: { sig: sig.value, delivery_id: deliveryId.value ?? undefined, ...deliverForm },
    })
    await refresh()
  } catch (e: any) {
    deliverError.value = e?.data?.statusMessage ?? 'Server error. Please try again.'
  } finally {
    deliverSubmitting.value = false
  }
}

function formatDateTime(d: string | null | undefined) {
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
</style>
