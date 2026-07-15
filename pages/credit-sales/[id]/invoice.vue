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
      <!-- Admin: edit T&C toggle -->
      <button v-if="isAdmin" @click="tcEditorOpen = !tcEditorOpen"
        :style="`display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all .15s;${tcEditorOpen?'background:rgba(245,158,11,0.15);color:#f59e0b;':'background:rgba(255,255,255,0.07);color:#9ca3af;'}`">
        ✏️ Edit T&amp;C
      </button>
      <button onclick="window.print()"
        style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:12px;font-weight:700;border:none;cursor:pointer;">
        🖨️ Print / Save PDF
      </button>
    </div>

    <!-- ── T&C Editor panel (admin only, screen only) ────── -->
    <div v-if="isAdmin && tcEditorOpen" class="no-print"
         style="background:rgba(20,16,10,0.97);border-bottom:1px solid rgba(245,158,11,0.2);padding:16px 24px;">
      <div style="max-width:794px;margin:0 auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div>
            <span style="font-size:13px;font-weight:700;color:#f59e0b;">Credit Invoice — Notes &amp; Terms</span>
            <span style="font-size:11px;color:#6b7280;margin-left:8px;">One clause per line · changes apply to all future prints</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button @click="resetTC"
              style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#9ca3af;font-size:11px;cursor:pointer;">
              Reset to Default
            </button>
            <button @click="saveTC" :disabled="tcSaving"
              style="padding:6px 14px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:11px;font-weight:700;border:none;cursor:pointer;">
              {{ tcSaving ? 'Saving…' : '✓ Save T&C' }}
            </button>
          </div>
        </div>
        <textarea v-model="tcDraft" rows="7"
          style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(245,158,11,0.2);border-radius:10px;color:#e5e7eb;font-size:12px;line-height:1.7;padding:12px 14px;resize:vertical;font-family:'Inter',sans-serif;outline:none;"
          placeholder="One clause per line…"
        />
        <p v-if="tcSaveMsg" style="font-size:11px;margin-top:6px;"
           :style="tcSaveMsg.startsWith('✓') ? 'color:#4ade80;' : 'color:#f87171;'">
          {{ tcSaveMsg }}
        </p>
      </div>
    </div>

    <!-- ── A4 Paper ───────────────────────────────────── -->
    <div style="max-width:794px;margin:32px auto;padding-bottom:48px;" class="no-print-margin">
      <div id="invoice-paper" style="background:#fff;box-shadow:0 4px 32px rgba(0,0,0,0.18),0 1px 4px rgba(0,0,0,0.12);border-radius:4px;overflow:hidden;">

        <!-- ═══ HEADER BAND ══════════════════════════════ -->
        <div style="background:linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%);padding:24px 40px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
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
          <div style="padding:17px 40px;border-right:1px solid #f0ede8;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Bill To</div>
            <div style="font-size:15px;font-weight:800;color:#111;margin-bottom:4px;">{{ order.customer }}</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div>{{ order.customerType }} Customer · {{ order.branch }} Territory</div>
              <div>Credit Limit: <span style="font-weight:700;color:#d97706;">৳{{ (order?.creditLimit ?? 0).toLocaleString() }}</span></div>
              <div>Outstanding: <span style="font-weight:700;color:#dc2626;">৳{{ (order?.currentBalance ?? 0).toLocaleString() }}</span></div>
            </div>
          </div>
          <div style="padding:17px 40px;">
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
                <td style="padding:9px 10px;font-size:11px;color:#9ca3af;font-weight:600;">{{ i + 1 }}</td>
                <td style="padding:9px 10px;">
                  <div style="font-size:13px;font-weight:700;color:#111;">{{ item.product }}</div>
                  <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Premium wheat flour · Ujjal FMC brand</div>
                </td>
                <td style="padding:9px 10px;text-align:center;font-size:13px;font-weight:700;color:#374151;">{{ item.qty.toLocaleString() }}</td>
                <td style="padding:9px 10px;text-align:right;font-size:13px;color:#374151;font-family:monospace;">৳{{ item.price.toLocaleString() }}</td>
                <td style="padding:9px 10px;text-align:right;font-size:12px;color:#dc2626;font-family:monospace;">
                  {{ item.discount > 0 ? `-৳${item.discount.toLocaleString()}` : '—' }}
                </td>
                <td style="padding:9px 10px;text-align:right;font-size:13px;font-weight:700;color:#111;font-family:monospace;">
                  ৳{{ ((item.qty * item.price) - item.discount).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ TOTALS ════════════════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 300px;gap:0;border-top:2px solid #f0ede8;margin:0 40px 0 40px;padding-top:16px;padding-bottom:16px;">
          <!-- Notes + terms -->
          <div style="padding-right:32px;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Notes &amp; Terms</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div v-if="order.notes" style="margin-bottom:6px;font-style:italic;color:#374151;">{{ order.notes }}</div>
              <div v-for="(clause, ci) in tcClauses" :key="ci">• {{ clause }}</div>
            </div>
          </div>
          <!-- Totals block -->
          <div style="background:#faf8f5;border-radius:12px;padding:14px 20px;border:1px solid #f0ede8;">
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;">
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
              <span style="color:#6b7280;">Total Paid{{ payments.length > 1 ? ` (${payments.length} payments)` : payments.length === 1 ? ' (1 payment)' : '' }}</span>
              <span style="font-family:monospace;color:#16a34a;font-weight:600;">-৳{{ totalPaid.toLocaleString() }}</span>
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

        <!-- ═══ PAYMENT HISTORY ══════════════════════════ -->
        <div v-if="payments.length" style="margin:0 40px 14px;padding:14px 20px;border-radius:12px;background:#f9fafb;border:1px solid #f0ede8;">
          <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">
            Payment History
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <th style="padding:4px 8px;text-align:left;font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Date</th>
                <th style="padding:4px 8px;text-align:left;font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Reference</th>
                <th style="padding:4px 8px;text-align:left;font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Method</th>
                <th style="padding:4px 8px;text-align:left;font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Note</th>
                <th style="padding:4px 8px;text-align:right;font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in payments" :key="p.id" style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:4px 8px;font-size:11px;color:#374151;font-family:monospace;">{{ String(p.payment_date).slice(0,10) }}</td>
                <td style="padding:4px 8px;font-size:11px;color:#374151;font-family:monospace;">{{ p.payment_number }}</td>
                <td style="padding:4px 8px;font-size:11px;color:#6b7280;">{{ p.payment_method }}</td>
                <td style="padding:4px 8px;font-size:10px;color:#9ca3af;font-style:italic;">{{ p.notes || '—' }}</td>
                <td style="padding:4px 8px;text-align:right;font-size:12px;font-weight:700;color:#16a34a;font-family:monospace;">৳{{ Number(p.amount).toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="border-top:2px solid #e5e7eb;">
                <td colspan="4" style="padding:5px 8px;font-size:12px;font-weight:700;color:#374151;">Total Paid</td>
                <td style="padding:5px 8px;text-align:right;font-size:13px;font-weight:800;color:#16a34a;font-family:monospace;">৳{{ totalPaid.toLocaleString() }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ═══ SIGNATURES + GOODS RECEIPT NOTE (GRN) ═════
             Third column is the customer's GRN counter-signature — the
             invoice doubles as the delivery challan, single page. Kept to
             one compact strip (not a separate box) so orders with a long
             payment history still fit on one A4 page. -->
        <div style="margin:0 40px;padding:10px 0 0;border-top:1px solid #f0ede8;display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:24px;">
          <div style="text-align:center;">
            <div style="height:32px;border-bottom:1.5px solid #d1d5db;margin-bottom:6px;"></div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;">Sales Officer</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:2px;">Signature &amp; Stamp</div>
          </div>
          <div style="text-align:center;">
            <div style="height:32px;border-bottom:1.5px solid #d1d5db;margin-bottom:6px;"></div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;">Accounts &amp; Finance</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:2px;">Signature &amp; Stamp</div>
          </div>
          <div style="text-align:center;padding:6px 10px 4px;border:1.5px solid #d97706;border-radius:8px;background:#fffbeb;">
            <div style="height:26px;border-bottom:1.5px solid #b45309;margin-bottom:5px;"></div>
            <div style="font-size:10px;font-weight:800;color:#92400e;letter-spacing:0.05em;">GRN — Received By (Customer)</div>
            <div style="font-size:8.5px;color:#92400e;margin-top:2px;">
              Qty received: <span style="display:inline-block;min-width:26px;border-bottom:1px solid #b45309;">&nbsp;</span>/{{ totalBags }} bags ·
              Condition: Good ☐ Damaged ☐ · Date: <span style="display:inline-block;min-width:50px;border-bottom:1px solid #b45309;">&nbsp;</span>
            </div>
          </div>
        </div>

        <!-- ═══ FOOTER BAND ══════════════════════════════ -->
        <div style="margin-top:8px;background:#faf8f5;border-top:1px solid #f0ede8;padding:8px 40px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:10px;color:#9ca3af;">
            Generated by Ujjal FMC ERP · {{ generatedAt }}
          </div>
          <div style="font-size:10px;color:#9ca3af;text-align:center;">
            This is a computer-generated invoice and is valid without signature<br>
            when processed through the ERP system.
          </div>
          <!-- QR is only for gate-pass/delivery scanning (spec §2.8) — once the
               order is delivered there's nothing left to scan it for. -->
          <div v-if="!isDelivered" style="text-align:right;">
            <img v-if="qrDataUrl" :src="qrDataUrl"
              style="width:52px;height:52px;border-radius:6px;border:1px solid #e5e7eb;display:block;margin-left:auto;" />
            <div v-else style="width:52px;height:52px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;margin-left:auto;"></div>
            <div style="font-size:7px;color:#9ca3af;margin-top:2px;text-align:center;">Scan for gate pass &amp; delivery</div>
          </div>
        </div>

      </div><!-- end invoice-paper -->
    </div><!-- end A4 wrapper -->

  </div>
</template>

<script setup lang="ts">
// NOTE: qrcode is imported dynamically inside onMounted (client-only).
// A top-level import causes Nitro to try loading it server-side where
// the canvas/PNG renderer may not be available, crashing SSR.
definePageMeta({ layout: false })
const route   = useRoute()
const orderId = computed(() => Number(route.params.id))

const [{ data, error }, { data: settingsData }] = await Promise.all([
  useFetch(() => `/api/credit-sales/${orderId.value}`),
  useFetch('/api/settings/documents'),
])

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

const payments  = computed(() => (data.value?.payments ?? []) as any[])
const totalPaid = computed(() => payments.value.reduce((s: number, p: any) => s + Number(p.amount), 0))

const subtotal      = computed(() => items.value.reduce((s: number, i: any) => s + i.qty * i.price, 0))
const totalDiscount = computed(() => items.value.reduce((s: number, i: any) => s + i.discount, 0))
const totalBags     = computed(() => items.value.reduce((s: number, i: any) => s + i.qty, 0))

// QR is only needed pre-delivery (gate-pass/delivery scanning, spec §2.8) —
// a delivered order has nothing left for the QR to confirm.
const isDelivered = computed(() => ['delivered', 'completed'].includes(order.value?.status ?? ''))

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

// ── QR code (two-stage gate-pass/delivery, spec §2.8) ───────────────────────
const qrDataUrl = ref('')

// ── Role & T&C editor ────────────────────────────────────────────────────────
const { user: sessionUser } = useUserSession()
const isAdmin = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const TC_DEFAULT = [
  'Payment due within 30 days of invoice date.',
  'Goods once sold cannot be returned without prior written approval.',
  'Interest @ 2% per month charged on overdue balances.',
  'All disputes subject to Sirajgonj jurisdiction.',
  'This invoice is valid only with authorised company stamp.',
].join('\n')

const storedTC     = computed(() => (settingsData.value as any)?.settings?.tc_credit_invoice ?? TC_DEFAULT)
const tcDraft      = ref('')
const tcLive       = ref('')
const tcEditorOpen = ref(false)
const tcSaving     = ref(false)
const tcSaveMsg    = ref('')

const tcClauses = computed(() => tcLive.value.split('\n').map((l: string) => l.trim()).filter(Boolean))

function resetTC() { tcDraft.value = TC_DEFAULT }

async function saveTC() {
  tcSaving.value = true
  tcSaveMsg.value = ''
  try {
    await $fetch('/api/settings/documents', {
      method: 'PUT',
      body: { tc_credit_invoice: tcDraft.value },
    })
    tcLive.value    = tcDraft.value
    tcSaveMsg.value = '✓ Saved — changes will appear in all future prints'
  } catch (e: any) {
    tcSaveMsg.value = '✗ ' + (e?.data?.statusMessage ?? 'Failed to save')
  } finally {
    tcSaving.value = false
  }
}

// Auto-print if ?print=1, and generate QR code (client-only via dynamic import)
onMounted(async () => {
  tcLive.value  = storedTC.value
  tcDraft.value = storedTC.value
  if (useRoute().query.print === '1') {
    setTimeout(() => window.print(), 600)
  }
  // Generate QR — dynamic import keeps qrcode out of the SSR bundle entirely.
  // Skipped once delivered: nothing left for the gate-pass/delivery QR to confirm.
  const orderNumber = (data.value?.order as any)?.order_number
  const qrSig       = (data.value?.order as any)?.qr_sig
  if (orderNumber && qrSig && !isDelivered.value) {
    try {
      const { default: QRCode } = await import('qrcode')
      const url = `${window.location.origin}/d/${orderNumber}?sig=${qrSig}`
      qrDataUrl.value = await QRCode.toDataURL(url, {
        width:  96,
        margin: 1,
        color:  { dark: '#111827', light: '#ffffff' },
      })
    } catch (e) {
      console.warn('[invoice] QR generation failed:', e)
    }
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
