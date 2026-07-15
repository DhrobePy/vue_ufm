<template>
  <!-- No ERP shell – this page IS the dispatch slip -->
  <div style="min-height:100vh;background:#e8e4dd;font-family:'Inter',sans-serif;">

    <!-- ── Print toolbar (hidden when printing) ──────── -->
    <div class="no-print" style="position:sticky;top:0;z-index:100;background:rgba(14,12,10,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);padding:12px 24px;display:flex;align-items:center;gap:12px;">
      <NuxtLink :to="`/credit-sales/${route.params.id}`"
        style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);color:#9ca3af;font-size:12px;font-weight:500;text-decoration:none;">
        ← Back to Order
      </NuxtLink>
      <div style="flex:1;text-align:center;">
        <span style="font-size:13px;color:#d1d5db;font-weight:600;">{{ order.order_number }}</span>
        <span style="font-size:11px;color:#6b7280;margin-left:8px;">Dispatch Slip / Gate Pass — driver copy, no amounts</span>
      </div>
      <button onclick="window.print()"
        style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:12px;font-weight:700;border:none;cursor:pointer;">
        🖨️ Print / Save PDF
      </button>
    </div>

    <div v-if="pending" class="no-print" style="max-width:794px;margin:32px auto;text-align:center;color:#9ca3af;font-size:13px;">Loading…</div>
    <div v-else-if="error" class="no-print" style="max-width:794px;margin:32px auto;text-align:center;color:#f87171;font-size:13px;">⚠ {{ error.message }}</div>

    <!-- ── A4 Paper — one page ── -->
    <div v-else style="max-width:794px;margin:32px auto;padding-bottom:48px;" class="no-print-margin">
      <div class="slip-paper" style="background:#fff;box-shadow:0 4px 32px rgba(0,0,0,0.18),0 1px 4px rgba(0,0,0,0.12);border-radius:4px;overflow:hidden;">

        <!-- ═══ HEADER BAND ══════════════════════════════ -->
        <div style="background:linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%);padding:24px 40px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
          <div style="display:flex;align-items:flex-start;gap:16px;">
            <div style="width:52px;height:52px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#000;flex-shrink:0;">U</div>
            <div>
              <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Ujjal Flour Mills Co.</div>
              <div style="font-size:11px;color:#f59e0b;font-weight:600;margin-top:3px;letter-spacing:0.05em;">DISPATCH SLIP / GATE PASS</div>
              <div style="font-size:10.5px;color:#9ca3af;margin-top:6px;line-height:1.7;">
                Sirajgonj Sadar, Sirajgonj-6700 · Demra, Dhaka-1361<br>
                📞 +880 1711-000000
              </div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Order Reference</div>
            <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">{{ order.order_number }}</div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Order Date</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ order.order_date || '—' }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Branch</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ order.branch_name || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ STATUS BANNER ══════════════════════════════ -->
        <div :style="`padding:10px 40px;font-size:11px;font-weight:700;letter-spacing:0.03em;${statusBanner.style}`">
          {{ statusBanner.text }}
        </div>

        <!-- ═══ CUSTOMER / DELIVERY ══════════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px 40px 0;">
          <div>
            <h3 style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Deliver To</h3>
            <p style="font-size:14px;font-weight:700;color:#111;">{{ order.customer_name || '—' }}</p>
            <p v-if="order.customer_phone" style="font-size:11px;color:#6b7280;margin-top:2px;">{{ order.customer_phone }}</p>
            <p v-if="order.shipping_address" style="font-size:11px;color:#6b7280;margin-top:4px;line-height:1.5;">{{ order.shipping_address }}</p>
          </div>
          <div>
            <h3 style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Driver &amp; Vehicle</h3>
            <div style="font-size:12px;color:#374151;line-height:1.9;">
              <div>Driver: <strong style="color:#111;">{{ confirmation?.driver_name || '— to be filled at gate —' }}</strong></div>
              <div>Vehicle: <strong style="color:#111;">{{ confirmation?.vehicle_number || '— to be filled at gate —' }}</strong></div>
              <div v-if="order.delivery_type">Truck Type: <strong style="color:#111;">{{ order.delivery_type === 'mini_truck' ? 'Mini Truck' : 'Big Truck' }}</strong></div>
              <div v-if="order.total_weight_kg">Total Weight: <strong style="color:#111;">{{ Number(order.total_weight_kg).toLocaleString() }} KG</strong></div>
            </div>
          </div>
        </div>

        <!-- ═══ ITEMS (no prices) ══════════════════════════════ -->
        <div style="margin:24px 40px 0;border:1px solid #f0ede8;border-radius:10px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#faf8f5;border-bottom:2px solid #f0ede8;">
                <th style="padding:10px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">#</th>
                <th style="padding:10px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Product</th>
                <th style="padding:10px 14px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Quantity (Bags)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in items" :key="i" :style="`border-bottom:1px solid #f5f3f0;background:${i%2===0?'#fff':'#fefcfa'}`">
                <td style="padding:10px 14px;font-size:11px;color:#9ca3af;font-weight:600;">{{ i + 1 }}</td>
                <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#111;">
                  {{ item.product_name }}<span v-if="item.weight_variant" style="color:#6b7280;font-weight:400;"> · {{ item.weight_variant }}</span><span v-if="item.grade" style="color:#6b7280;font-weight:400;"> · Grade {{ item.grade }}</span>
                </td>
                <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:700;color:#374151;font-family:monospace;">{{ item.quantity.toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background:#faf8f5;border-top:2px solid #f0ede8;">
                <td colspan="2" style="padding:10px 14px;font-size:11px;font-weight:800;color:#111;">Total Bags</td>
                <td style="padding:10px 14px;text-align:right;font-size:14px;font-weight:900;color:#b45309;font-family:monospace;">{{ totalQty.toLocaleString() }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ═══ QR + INSTRUCTIONS ══════════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 220px;gap:20px;margin:24px 40px 0;padding:18px 20px;background:#faf8f5;border-radius:10px;border:1px solid #f0ede8;align-items:center;">
          <div style="font-size:11px;color:#6b7280;line-height:1.8;">
            <p style="font-weight:800;color:#111;font-size:12px;margin-bottom:6px;">Scan this code TWICE:</p>
            <p>1️⃣ At the gate, before the truck leaves — captures driver &amp; vehicle, marks the order shipped.</p>
            <p>2️⃣ At the customer's door, on delivery — confirms receipt.</p>
            <p style="margin-top:8px;color:#9ca3af;">Scanning requires an ERP login. A third scan is flagged as a possible duplicate delivery and alerts the office.</p>
          </div>
          <div style="text-align:center;">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="Gate pass QR" style="width:120px;height:120px;border:1px solid #e5e0d8;border-radius:8px;padding:4px;background:#fff;" />
            <div v-else style="width:120px;height:120px;border:1px dashed #d1d5db;border-radius:8px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af;">QR unavailable</div>
            <p style="font-size:9px;color:#9ca3af;margin-top:6px;">{{ order.order_number }}</p>
          </div>
        </div>

        <!-- ═══ SIGNATURES ══════════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:28px 40px 0;">
          <div style="border-top:1.5px solid #111;padding-top:8px;">
            <p style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">Dispatch / Gate Officer</p>
            <p style="font-size:9px;color:#9ca3af;margin-top:2px;">Name &amp; Signature</p>
          </div>
          <div style="border-top:1.5px solid #111;padding-top:8px;">
            <p style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">Driver</p>
            <p style="font-size:9px;color:#9ca3af;margin-top:2px;">Name &amp; Signature</p>
          </div>
        </div>

        <!-- ═══ FOOTER ══════════════════════════════ -->
        <div style="margin-top:24px;padding:14px 40px;background:#faf8f5;border-top:1px solid #f0ede8;text-align:center;">
          <p style="font-size:9px;color:#9ca3af;">This document authorizes goods movement only — it carries no pricing or payment information. Retain until delivery is confirmed.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()

const { data, pending, error } = await useFetch(`/api/credit-sales/${route.params.id}/dispatch-slip`)

const order        = computed(() => (data.value?.order ?? {}) as any)
const items        = computed(() => (data.value?.items ?? []) as any[])
const confirmation = computed(() => data.value?.confirmation as any)
const totalQty      = computed(() => items.value.reduce((s, i) => s + Number(i.quantity ?? 0), 0))

const statusBanner = computed(() => {
  if (confirmation.value?.confirmed_at) {
    return { text: '✓ DELIVERED — confirmed by ' + (confirmation.value.confirmed_by_name ?? 'recipient'), style: 'background:rgba(16,185,129,0.1);color:#047857;' }
  }
  if (confirmation.value?.gate_out_at) {
    return { text: '🚚 GATE-OUT RECORDED — awaiting delivery confirmation', style: 'background:rgba(245,158,11,0.1);color:#b45309;' }
  }
  return { text: '⏳ AWAITING GATE SCAN — not yet dispatched', style: 'background:rgba(107,114,128,0.08);color:#4b5563;' }
})

const qrDataUrl = ref('')
onMounted(async () => {
  if (useRoute().query.print === '1') setTimeout(() => window.print(), 600)
  const orderNumber = order.value?.order_number
  const qrSig        = data.value?.qr_sig
  if (orderNumber && qrSig) {
    try {
      const { default: QRCode } = await import('qrcode')
      const url = `${window.location.origin}/d/${orderNumber}?sig=${qrSig}`
      qrDataUrl.value = await QRCode.toDataURL(url, { width: 120, margin: 1, color: { dark: '#111827', light: '#ffffff' } })
    } catch (e) {
      console.warn('[dispatch-slip] QR generation failed:', e)
    }
  }
})
</script>

<style>
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; margin: 0; padding: 0; }
  .slip-paper { box-shadow: none !important; border-radius: 0 !important; }
  .no-print-margin { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
  @page { margin: 0; size: A4 portrait; }
}
</style>
