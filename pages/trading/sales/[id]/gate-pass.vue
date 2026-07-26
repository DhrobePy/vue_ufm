<template>
  <div style="max-width:800px;margin:0 auto;background:#fff;color:#111;font-family:Arial,sans-serif;">
    <div class="no-print" style="padding:12px;display:flex;gap:8px;">
      <button onclick="window.print()" style="padding:8px 16px;background:#d97706;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">🖨 Print</button>
      <NuxtLink :to="`/trading/sales/${saleId}`" style="padding:8px 16px;background:#eee;border-radius:6px;text-decoration:none;color:#333;">← Back</NuxtLink>
    </div>

    <div v-if="sale" style="border:2px solid #111;margin:12px;padding:24px;">
      <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px;">
        <h1 style="margin:0;font-size:22px;">UJJAL FLOUR MILLS — COMMODITY GATE PASS</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#555;">Trading dispatch — no amounts on this document</p>
      </div>

      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#666;width:180px;">Gate Pass / Sale #</td><td style="font-weight:700;font-family:monospace;">{{ sale.sale_number }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Date</td><td>{{ String(sale.sale_date).slice(0, 10) }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Customer</td><td style="font-weight:700;">{{ sale.customer_name }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Address</td><td>{{ sale.customer_address ?? '—' }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Commodity</td><td>{{ sale.commodity_name }}{{ sale.origin ? ` (${sale.origin})` : '' }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Quantity</td><td style="font-weight:700;">{{ Number(sale.quantity).toLocaleString() }} {{ sale.unit }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">From Branch</td><td>{{ sale.branch_name ?? '—' }}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Driver / Vehicle</td><td>{{ sale.driver_name ?? '____________' }} / {{ sale.vehicle_number ?? '____________' }}</td></tr>
      </table>

      <div style="display:flex;gap:24px;margin-top:24px;align-items:center;">
        <div style="flex:1;">
          <p style="font-size:12px;color:#666;">Scan at gate-out and again at delivery. Second delivery scan is refused and flagged.</p>
          <p style="font-size:11px;color:#999;font-family:monospace;">{{ verifyUrl }}</p>
        </div>
        <canvas ref="qrCanvas" width="130" height="130" style="border:1px solid #ddd;" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:48px;text-align:center;font-size:12px;">
        <div style="border-top:1px solid #111;padding-top:6px;">Gate Officer</div>
        <div style="border-top:1px solid #111;padding-top:6px;">Driver</div>
        <div style="border-top:1px solid #111;padding-top:6px;">Received By</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const saleId = computed(() => Number(route.params.id))
const { data } = await useFetch(() => `/api/trading/sales/${saleId.value}/gate-pass`)
const sale = computed<any>(() => (data.value as any)?.sale ?? null)
const verifyUrl = computed(() => {
  const path = (data.value as any)?.verify_path ?? ''
  return path && typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
})

// Same qrcode lib the credit-sales dispatch slip uses
const qrCanvas = ref<HTMLCanvasElement | null>(null)
onMounted(async () => {
  try {
    const { default: QRCode } = await import('qrcode')
    if (qrCanvas.value && verifyUrl.value) {
      await QRCode.toCanvas(qrCanvas.value, verifyUrl.value, { width: 130, margin: 1 })
    }
  } catch { /* QR lib unavailable — printed URL still works */ }
})
</script>

<style>
@media print { .no-print { display: none !important; } }
</style>
