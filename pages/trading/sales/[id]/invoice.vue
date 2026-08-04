<template>
  <div style="max-width:800px;margin:0 auto;background:#fff;color:#111;font-family:Arial,sans-serif;">
    <div class="no-print" style="padding:12px;display:flex;gap:8px;">
      <button onclick="window.print()" style="padding:8px 16px;background:#d97706;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">🖨 Print</button>
      <NuxtLink :to="`/trading/sales/${saleId}`" style="padding:8px 16px;background:#eee;border-radius:6px;text-decoration:none;color:#333;">← Back</NuxtLink>
    </div>

    <div v-if="sale" style="border:1px solid #e5e7eb;border-radius:10px;margin:12px;padding:28px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid #111827;padding-bottom:14px;">
        <div>
          <div style="font-size:18px;font-weight:800;">Ujjal Flour Mills</div>
          <div style="font-size:12px;color:#6b7280;">উজ্জল ফ্লাওয়ার মিলস</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">{{ sale.branch_address || '১৭, নুরাইবাগ, ডেমরা, ঢাকা' }}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px;font-weight:800;letter-spacing:1px;">INVOICE <span style="font-weight:600;font-size:12px;color:#6b7280;">/ COMMODITY SALE</span></div>
          <div style="font-family:monospace;font-weight:700;font-size:14px;margin-top:2px;">{{ sale.sale_number }}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">Date: {{ fmtDate(sale.sale_date) }}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
          <h4 style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;">Bill To</h4>
          <div style="font-size:13px;"><strong>{{ sale.customer_name }}</strong></div>
          <div v-if="sale.business_name" style="font-size:13px;">{{ sale.business_name }}</div>
          <div v-if="sale.customer_phone" style="font-size:13px;">Phone: {{ sale.customer_phone }}</div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
          <h4 style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;">Sold From</h4>
          <div style="font-size:13px;">{{ sale.branch_name || '—' }}</div>
          <div v-if="sale.origin" style="font-size:13px;">Origin: {{ sale.origin }}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="background:#111827;color:#fff;font-size:11px;text-transform:uppercase;padding:8px 10px;text-align:left;">Commodity</th>
            <th style="background:#111827;color:#fff;font-size:11px;text-transform:uppercase;padding:8px 10px;text-align:right;">Quantity</th>
            <th style="background:#111827;color:#fff;font-size:11px;text-transform:uppercase;padding:8px 10px;text-align:right;">Unit Price</th>
            <th style="background:#111827;color:#fff;font-size:11px;text-transform:uppercase;padding:8px 10px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border-bottom:1px solid #f3f4f6;padding:8px 10px;font-size:13px;">{{ sale.commodity_name }}</td>
            <td style="border-bottom:1px solid #f3f4f6;padding:8px 10px;font-size:13px;text-align:right;">{{ trimQty(sale.quantity) }} {{ sale.unit }}</td>
            <td style="border-bottom:1px solid #f3f4f6;padding:8px 10px;font-size:13px;text-align:right;">৳{{ Number(sale.unit_price).toFixed(2) }}</td>
            <td style="border-bottom:1px solid #f3f4f6;padding:8px 10px;font-size:13px;text-align:right;">৳{{ Number(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:16px;margin-left:auto;width:320px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-top:2px solid #111827;font-weight:800;font-size:16px;">
          <span>Invoice Total</span><span>৳{{ Number(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div v-if="Number(sale.advance_paid) > 0" style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6;">
          <span>Advance Paid</span><span>৳{{ Number(sale.advance_paid).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div v-if="Number(sale.amount_paid) > 0" style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6;">
          <span>Paid</span><span>৳{{ Number(sale.amount_paid).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6;color:#b91c1c;font-weight:700;">
          <span>Balance Due (this invoice)</span><span>৳{{ Number(sale.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6;">
          <span>Previous Account Due</span><span>৳{{ previousDue.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:10px;margin-top:4px;border-top:2px solid #111827;font-weight:800;font-size:16px;">
          <span>Total Account Due</span><span>৳{{ (previousDue + Number(sale.balance_due)).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:40px;gap:24px;">
        <div style="flex:1;text-align:center;border-top:1px solid #9ca3af;padding-top:6px;font-size:11px;color:#6b7280;">Prepared By</div>
        <div style="flex:1;text-align:center;border-top:1px solid #9ca3af;padding-top:6px;font-size:11px;color:#6b7280;">Received By (Customer)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route  = useRoute()
const saleId = computed(() => Number(route.params.id))
const { data } = await useFetch(() => `/api/trading/sales/${saleId.value}/invoice`)
const sale        = computed<any>(() => (data.value as any)?.sale ?? null)
const previousDue = computed(() => Number((data.value as any)?.previous_due ?? 0))

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}
function trimQty(q: any) {
  return Number(q).toFixed(3).replace(/\.?0+$/, '')
}
</script>

<style>
@media print { .no-print { display: none !important; } }
</style>
