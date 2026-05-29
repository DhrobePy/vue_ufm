<template>
  <!-- No ERP shell – this page IS the invoice -->
  <div style="min-height:100vh;background:#e8e4dd;font-family:'Inter',sans-serif;">

    <!-- ── Print toolbar (hidden when printing) ──────── -->
    <div class="no-print" style="position:sticky;top:0;z-index:100;background:rgba(14,12,10,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);padding:12px 24px;display:flex;align-items:center;gap:12px;">
      <NuxtLink :to="`/credit-sales/${route.params.id}`"
        style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);color:#9ca3af;font-size:12px;font-weight:500;text-decoration:none;transition:all .15s ease;"
        onmouseover="this.style.color='#e5e7eb';this.style.borderColor='rgba(255,255,255,0.22)'"
        onmouseout="this.style.color='#9ca3af';this.style.borderColor='rgba(255,255,255,0.12)'"
      >
        ← Back to Order
      </NuxtLink>
      <div style="flex:1;text-align:center;">
        <span style="font-size:13px;color:#d1d5db;font-weight:600;">{{ invoiceNo }}</span>
        <span style="font-size:11px;color:#6b7280;margin-left:8px;">Preview — click Print to generate PDF</span>
      </div>
      <button onclick="window.print()"
        style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:12px;font-weight:700;border:none;cursor:pointer;">
        🖨️ Print / Save PDF
      </button>
    </div>

    <!-- ── A4 Paper ───────────────────────────────────── -->
    <div style="max-width:794px;margin:32px auto;padding-bottom:48px;" class="no-print-margin">
      <div id="invoice-paper" style="background:#fff;box-shadow:0 4px 32px rgba(0,0,0,0.18),0 1px 4px rgba(0,0,0,0.12);border-radius:4px;overflow:hidden;">

        <!-- ═══ HEADER BAND ══════════════════════════════ -->
        <div style="background:linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%);padding:32px 40px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
          <!-- Company identity -->
          <div style="display:flex;align-items:flex-start;gap:16px;">
            <div style="width:52px;height:52px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#000;flex-shrink:0;box-shadow:0 4px 16px rgba(245,158,11,0.4);">U</div>
            <div>
              <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Ujjal Flour Mills Co.</div>
              <div style="font-size:11px;color:#f59e0b;font-weight:600;margin-top:3px;letter-spacing:0.05em;">PREMIUM WHEAT PRODUCTS</div>
              <div style="font-size:10.5px;color:#9ca3af;margin-top:6px;line-height:1.7;">
                Sirajgonj Sadar, Sirajgonj-6700 · Demra, Dhaka-1361<br>
                📞 +880 1711-000000 · ✉ accounts@ujjalfmc.com<br>
                Trade Lic: TL-SRG-2018-4821 · BIN: 002148694
              </div>
            </div>
          </div>
          <!-- Invoice badge -->
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:10px;font-weight:700;color:#f59e0b;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Credit Invoice</div>
            <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">{{ invoiceNo }}</div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Issue Date</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ order.orderDate }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Due Date</span>
                <span style="font-size:11px;color:#f87171;font-weight:700;">{{ order.requiredDate }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Branch</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ order.branch }}</span>
              </div>
              <div style="margin-top:6px;">
                <span :style="`font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${statusStyle}`">{{ order.status.replace(/_/g,' ').toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ BILL-TO / SHIP-TO ════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #f0ede8;">
          <div style="padding:24px 40px;border-right:1px solid #f0ede8;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Bill To</div>
            <div style="font-size:15px;font-weight:800;color:#111;margin-bottom:4px;">{{ order.customer }}</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div>{{ order.customerType }} Customer · {{ order.branch }} Territory</div>
              <div>Credit Limit: <span style="font-weight:700;color:#d97706;">৳{{ (order?.creditLimit ?? 0).toLocaleString() }}</span></div>
              <div>Outstanding: <span style="font-weight:700;color:#dc2626;">৳{{ (order?.currentBalance ?? 0).toLocaleString() }}</span></div>
            </div>
          </div>
          <div style="padding:24px 40px;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Ship To</div>
            <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px;">{{ order.customer }}</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div>{{ order.deliveryAddress }}</div>
              <div>Priority: <span :style="`font-weight:700;color:${order.priority==='urgent'?'#dc2626':order.priority==='high'?'#ea580c':'#6b7280'}`">{{ order.priority.toUpperCase() }}</span></div>
            </div>
          </div>
        </div>

        <!-- ═══ LINE ITEMS TABLE ═════════════════════════ -->
        <div style="padding:0 40px;">
          <table style="width:100%;border-collapse:collapse;margin:0;">
            <thead>
              <tr style="background:#faf8f5;border-bottom:2px solid #f0ede8;">
                <th style="padding:12px 10px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">#</th>
                <th style="padding:12px 10px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Product Description</th>
                <th style="padding:12px 10px;text-align:center;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Qty (Bags)</th>
                <th style="padding:12px 10px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Unit Price</th>
                <th style="padding:12px 10px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Discount</th>
                <th style="padding:12px 10px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in items" :key="item.id"
                  :style="`border-bottom:1px solid #f5f3f0;background:${i%2===0?'#fff':'#fefcfa'}`">
                <td style="padding:13px 10px;font-size:11px;color:#9ca3af;font-weight:600;">{{ i + 1 }}</td>
                <td style="padding:13px 10px;">
                  <div style="font-size:13px;font-weight:700;color:#111;">{{ item.product }}</div>
                  <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Premium wheat flour · Ujjal FMC brand</div>
                </td>
                <td style="padding:13px 10px;text-align:center;font-size:13px;font-weight:700;color:#374151;">{{ item.qty.toLocaleString() }}</td>
                <td style="padding:13px 10px;text-align:right;font-size:13px;color:#374151;font-family:monospace;">৳{{ item.price.toLocaleString() }}</td>
                <td style="padding:13px 10px;text-align:right;font-size:12px;color:#dc2626;font-family:monospace;">
                  {{ item.discount > 0 ? `-৳${item.discount.toLocaleString()}` : '—' }}
                </td>
                <td style="padding:13px 10px;text-align:right;font-size:13px;font-weight:700;color:#111;font-family:monospace;">
                  ৳{{ ((item.qty * item.price) - item.discount).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ TOTALS ════════════════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 300px;gap:0;border-top:2px solid #f0ede8;margin:0 40px 0 40px;padding-top:24px;padding-bottom:24px;">
          <!-- Notes + terms -->
          <div style="padding-right:32px;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Notes &amp; Terms</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div v-if="order.notes" style="margin-bottom:6px;font-style:italic;color:#374151;">{{ order.notes }}</div>
              <div>• Payment due within 30 days of invoice date.</div>
              <div>• Goods once sold cannot be returned without prior approval.</div>
              <div>• Interest @ 2% per month charged on overdue balances.</div>
              <div>• Subject to Sirajgonj jurisdiction.</div>
            </div>
          </div>
          <!-- Totals block -->
          <div style="background:#faf8f5;border-radius:12px;padding:20px;border:1px solid #f0ede8;">
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;">
              <span style="color:#6b7280;">Subtotal</span>
              <span style="font-family:monospace;color:#374151;">৳{{ subtotal.toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;">
              <span style="color:#6b7280;">Line Discounts</span>
              <span style="font-family:monospace;color:#dc2626;">-৳{{ totalDiscount.toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;">
              <span style="color:#6b7280;">Overall Discount</span>
              <span style="font-family:monospace;color:#dc2626;">৳0</span>
            </div>
            <div style="border-top:1px solid #e5e0d8;margin:8px 0;"></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:15px;font-weight:800;">
              <span style="color:#111;">Invoice Total</span>
              <span style="font-family:monospace;color:#b45309;">৳{{ (order?.total ?? 0).toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;">
              <span style="color:#6b7280;">Advance Paid</span>
              <span style="font-family:monospace;color:#16a34a;font-weight:600;">-৳{{ (order?.advance ?? 0).toLocaleString() }}</span>
            </div>
            <div style="background:linear-gradient(135deg,#fef3c7,#fef9ee);border-radius:8px;padding:12px 14px;margin-top:8px;border:1px solid #fcd34d;">
              <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;">
                <span style="color:#92400e;">Balance Due</span>
                <span style="font-family:monospace;color:#b45309;">৳{{ (order?.balanceDue ?? 0).toLocaleString() }}</span>
              </div>
              <div style="font-size:10px;color:#b45309;margin-top:4px;opacity:0.8;">Due: {{ order?.requiredDate }}</div>
            </div>
          </div>
        </div>

        <!-- ═══ SIGNATURE STRIP ══════════════════════════ -->
        <div style="margin:0 40px;padding:24px 0 0;border-top:1px solid #f0ede8;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;">
          <div v-for="sig in ['Sales Officer', 'Accounts & Finance', 'Customer / Receiver']" :key="sig"
               style="text-align:center;">
            <div style="height:48px;border-bottom:1.5px solid #d1d5db;margin-bottom:8px;"></div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;">{{ sig }}</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:3px;">Signature &amp; Stamp</div>
          </div>
        </div>

        <!-- ═══ FOOTER BAND ══════════════════════════════ -->
        <div style="margin-top:28px;background:#faf8f5;border-top:1px solid #f0ede8;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:10px;color:#9ca3af;">
            Generated by Ujjal FMC ERP · {{ generatedAt }}
          </div>
          <div style="font-size:10px;color:#9ca3af;text-align:center;">
            This is a computer-generated invoice and is valid without signature<br>
            when processed through the ERP system.
          </div>
          <div style="text-align:right;">
            <!-- Mini QR-code placeholder -->
            <div style="width:48px;height:48px;background:#111;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-left:auto;">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="2" fill="white"/>
                <rect x="5" y="5" width="8" height="8" rx="1" fill="#111"/>
                <rect x="20" y="2" width="14" height="14" rx="2" fill="white"/>
                <rect x="23" y="5" width="8" height="8" rx="1" fill="#111"/>
                <rect x="2" y="20" width="14" height="14" rx="2" fill="white"/>
                <rect x="5" y="23" width="8" height="8" rx="1" fill="#111"/>
                <rect x="20" y="20" width="4" height="4" fill="white"/>
                <rect x="26" y="20" width="4" height="4" fill="white"/>
                <rect x="20" y="26" width="4" height="4" fill="white"/>
                <rect x="26" y="26" width="8" height="8" fill="white"/>
                <rect x="32" y="20" width="2" height="4" fill="white"/>
              </svg>
            </div>
            <div style="font-size:8px;color:#9ca3af;margin-top:3px;text-align:center;">Scan to verify</div>
          </div>
        </div>

      </div><!-- end invoice-paper -->
    </div><!-- end A4 wrapper -->

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route   = useRoute()
const orderId = computed(() => Number(route.params.id))

const { data, error } = await useFetch(() => `/api/credit-sales/${orderId.value}`)

const invoiceNo = computed(() => data.value?.order?.order_number ?? `INV-${orderId.value}`)

const order = computed(() => {
  const o = data.value?.order
  if (!o) return null
  return {
    customer:        o.customer_name,
    customerType:    o.customer_type ?? 'credit',
    branch:          o.branch_name   ?? '—',
    status:          o.status,
    priority:        o.priority,
    total:           Number(o.total_amount  ?? 0),
    advance:         Number(o.amount_paid   ?? 0),
    orderDate:       String(o.order_date).slice(0, 10),
    requiredDate:    o.required_date ? String(o.required_date).slice(0, 10) : '—',
    deliveryAddress: o.delivery_address ?? '',
    notes:           o.notes ?? '',
    // Customer credit info
    creditLimit:     Number(o.credit_limit     ?? 0),
    currentBalance:  Number(o.current_balance  ?? 0),
    balanceDue:      Number(o.balance_due       ?? 0),
  }
})

const items = computed(() =>
  (data.value?.items ?? []).map((i: any) => ({
    id:       i.id,
    product:  `${i.product_name ?? '—'}${i.weight_variant ? ' — ' + i.weight_variant : ''}`,
    qty:      Number(i.quantity        ?? 0),
    price:    Number(i.unit_price      ?? 0),
    discount: Number(i.discount_amount ?? 0),
  }))
)

const subtotal      = computed(() => items.value.reduce((s: number, i: any) => s + i.qty * i.price, 0))
const totalDiscount = computed(() => items.value.reduce((s: number, i: any) => s + i.discount, 0))

const statusStyle = computed(() => {
  const s = order.value?.status ?? ''
  if (s === 'completed' || s === 'delivered')          return 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0;'
  if (s === 'cancelled' || s === 'rejected')           return 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;'
  if (s === 'in_production' || s === 'ready_to_ship')  return 'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;'
  if (s === 'escalated')                               return 'background:#fed7aa;color:#9a3412;border:1px solid #fdba74;'
  return 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;'
})

const generatedAt = new Date().toLocaleString('en-BD', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

// Auto-print if ?print=1
onMounted(() => {
  if (useRoute().query.print === '1') {
    setTimeout(() => window.print(), 600)
  }
})
</script>

<style>
/* Full-bleed paper for print */
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; margin: 0; padding: 0; }
  #invoice-paper { box-shadow: none !important; border-radius: 0 !important; }
  .no-print-margin { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
  @page { margin: 0; size: A4 portrait; }
}
</style>
