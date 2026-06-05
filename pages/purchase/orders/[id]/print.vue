<template>
  <!-- No ERP shell — this page IS the purchase order document -->
  <div style="min-height:100vh;background:#e8e4dd;font-family:'Inter',sans-serif;">

    <!-- ── Screen toolbar (hidden on print) ─────────────── -->
    <div class="no-print" style="position:sticky;top:0;z-index:100;background:rgba(14,12,10,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);padding:12px 24px;display:flex;align-items:center;gap:12px;">
      <NuxtLink :to="`/purchase/orders/${route.params.id}`"
        style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);color:#9ca3af;font-size:12px;font-weight:500;text-decoration:none;"
        onmouseover="this.style.color='#e5e7eb';this.style.borderColor='rgba(255,255,255,0.22)'"
        onmouseout="this.style.color='#9ca3af';this.style.borderColor='rgba(255,255,255,0.12)'"
      >← Back to PO</NuxtLink>
      <div style="flex:1;text-align:center;">
        <span style="font-size:13px;color:#d1d5db;font-weight:600;">{{ po.poNo }}</span>
        <span style="font-size:11px;color:#6b7280;margin-left:8px;">Purchase Order Preview</span>
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
            <span style="font-size:13px;font-weight:700;color:#f59e0b;">Purchase Order — Terms &amp; Conditions</span>
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

    <!-- ── A4 Paper ──────────────────────────────────────── -->
    <div style="max-width:794px;margin:32px auto;padding-bottom:48px;" class="no-print-margin">
      <div style="background:#fff;box-shadow:0 4px 32px rgba(0,0,0,0.18);border-radius:4px;overflow:hidden;">

        <!-- ═══ HEADER BAND ══════════════════════════════ -->
        <div style="background:linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%);padding:28px 40px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
          <!-- Company identity -->
          <div style="display:flex;align-items:flex-start;gap:16px;">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;color:#000;flex-shrink:0;box-shadow:0 4px 16px rgba(245,158,11,0.4);">U</div>
            <div>
              <div style="font-size:19px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Ujjal Flour Mills Co.</div>
              <div style="font-size:11px;color:#f59e0b;font-weight:600;margin-top:3px;letter-spacing:0.05em;">PREMIUM WHEAT PRODUCTS</div>
              <div style="font-size:10.5px;color:#9ca3af;margin-top:5px;line-height:1.7;">
                Sirajgonj Sadar, Sirajgonj-6700 · Demra, Dhaka-1361<br>
                📞 +880 1711-000000 · ✉ purchase@ujjalfmc.com<br>
                Trade Lic: TL-SRG-2018-4821 · BIN: 002148694
              </div>
            </div>
          </div>
          <!-- PO badge -->
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:10px;font-weight:700;color:#f59e0b;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Purchase Order</div>
            <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;font-family:monospace;">{{ po.poNo }}</div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Issue Date</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ po.poDate }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Expected Delivery</span>
                <span style="font-size:11px;color:#f87171;font-weight:700;">{{ po.expectedDelivery }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Created By</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ po.createdBy }}</span>
              </div>
              <div style="margin-top:6px;">
                <span :style="`font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${statusStyle}`">
                  {{ po.status.replace(/_/g,' ').toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ BUYER / SUPPLIER BLOCK ═══════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #f0ede8;">
          <!-- Buyer -->
          <div style="padding:22px 40px;border-right:1px solid #f0ede8;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Buyer</div>
            <div style="font-size:15px;font-weight:800;color:#111;margin-bottom:4px;">Ujjal Flour Mills Co.</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div>Sirajgonj Sadar, Sirajgonj-6700, Bangladesh</div>
              <div>BIN: 002148694 · Trade Lic: TL-SRG-2018-4821</div>
              <div style="margin-top:6px;">Delivery to: <span style="font-weight:700;color:#374151;">{{ po.deliveryTo }}</span></div>
            </div>
          </div>
          <!-- Supplier -->
          <div style="padding:22px 40px;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Supplier / Vendor</div>
            <div style="font-size:15px;font-weight:800;color:#111;margin-bottom:4px;">{{ po.supplier }}</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div>{{ po.supplierAddress }}</div>
              <div>📞 {{ po.supplierPhone }}</div>
              <div style="margin-top:6px;">Payment Terms: <span style="font-weight:700;color:#374151;">{{ po.paymentTermsLabel }}</span></div>
            </div>
          </div>
        </div>

        <!-- ═══ LINE ITEMS TABLE ═══════════════════════════ -->
        <div style="padding:0 40px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#faf8f5;border-bottom:2px solid #f0ede8;">
                <th style="padding:11px 10px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">#</th>
                <th style="padding:11px 10px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Product Description</th>
                <th style="padding:11px 10px;text-align:center;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Origin</th>
                <th style="padding:11px 10px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Quantity (MT)</th>
                <th style="padding:11px 10px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Unit Price/MT</th>
                <th style="padding:11px 10px;text-align:right;font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in po.items" :key="item.product"
                  :style="`border-bottom:1px solid #f5f3f0;background:${i%2===0?'#fff':'#fefcfa'}`">
                <td style="padding:12px 10px;font-size:11px;color:#9ca3af;font-weight:600;">{{ i + 1 }}</td>
                <td style="padding:12px 10px;">
                  <div style="font-size:13px;font-weight:700;color:#111;">{{ item.product }}</div>
                  <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Wheat flour raw material · Ujjal FMC procurement</div>
                </td>
                <td style="padding:12px 10px;text-align:center;font-size:12px;color:#374151;font-weight:600;">{{ po.origin }}</td>
                <td style="padding:12px 10px;text-align:right;font-size:13px;font-weight:700;color:#374151;font-family:monospace;">{{ item.qty.toLocaleString() }}</td>
                <td style="padding:12px 10px;text-align:right;font-size:13px;color:#374151;font-family:monospace;">৳{{ item.unitPrice.toLocaleString() }}</td>
                <td style="padding:12px 10px;text-align:right;font-size:13px;font-weight:800;color:#111;font-family:monospace;">৳{{ (item.qty * item.unitPrice).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ TOTALS + TERMS ════════════════════════════ -->
        <div style="display:grid;grid-template-columns:1fr 280px;border-top:2px solid #f0ede8;margin:0 40px;padding:22px 0;">
          <!-- Terms -->
          <div style="padding-right:28px;">
            <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Terms &amp; Conditions</div>
            <div style="font-size:11px;color:#6b7280;line-height:1.8;">
              <div v-if="po.notes" style="margin-bottom:8px;font-style:italic;color:#374151;padding:8px 10px;background:#faf8f5;border-radius:6px;border-left:3px solid #f59e0b;">
                📝 {{ po.notes }}
              </div>
              <div v-for="(clause, ci) in tcClauses" :key="ci">• {{ clause }}</div>
            </div>
          </div>
          <!-- Totals block -->
          <div style="background:#faf8f5;border-radius:12px;padding:18px;border:1px solid #f0ede8;align-self:start;">
            <div v-for="item in po.items" :key="item.product"
                 style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid #f0ede8;margin-bottom:4px;">
              <span style="color:#6b7280;">{{ item.qty }} MT × ৳{{ item.unitPrice.toLocaleString() }}</span>
              <span style="font-family:monospace;color:#374151;">৳{{ (item.qty * item.unitPrice).toLocaleString() }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;">
              <span style="color:#6b7280;">VAT / Tax</span>
              <span style="font-family:monospace;color:#374151;">৳0</span>
            </div>
            <div style="border-top:1px solid #e5e0d8;margin:10px 0;"></div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:16px;font-weight:900;">
              <span style="color:#111;">PO Total</span>
              <span style="font-family:monospace;color:#b45309;">৳{{ po.totalAmount.toLocaleString() }}</span>
            </div>
            <div style="margin-top:10px;padding:10px 12px;background:linear-gradient(135deg,#fef3c7,#fef9ee);border-radius:8px;border:1px solid #fcd34d;">
              <div style="font-size:10px;color:#92400e;font-weight:700;margin-bottom:4px;">PAYMENT TERMS</div>
              <div style="font-size:12px;font-weight:700;color:#b45309;">{{ po.paymentTermsLabel }} after delivery</div>
              <div v-if="dueDate !== '—'" style="font-size:10px;color:#b45309;opacity:0.8;margin-top:2px;">Due by: {{ dueDate }}</div>
            </div>
          </div>
        </div>

        <!-- ═══ DELIVERY PROGRESS (if GRNs exist) ════════ -->
        <div v-if="po.grns.length > 0"
             style="margin:0 40px;padding:18px 20px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;margin-bottom:20px;">
          <div style="font-size:9px;font-weight:800;color:#166534;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Delivery Progress</div>
          <div style="display:flex;gap:32px;margin-bottom:12px;">
            <div><div style="font-size:10px;color:#6b7280;">Ordered</div><div style="font-size:16px;font-weight:800;color:#111;font-family:monospace;">{{ totalOrdered }} MT</div></div>
            <div><div style="font-size:10px;color:#6b7280;">Received</div><div style="font-size:16px;font-weight:800;color:#16a34a;font-family:monospace;">{{ totalReceived }} MT</div></div>
            <div><div style="font-size:10px;color:#6b7280;">Pending</div><div style="font-size:16px;font-weight:800;color:#ca8a04;font-family:monospace;">{{ totalOrdered - totalReceived }} MT</div></div>
            <div><div style="font-size:10px;color:#6b7280;">Completion</div><div style="font-size:16px;font-weight:800;color:#374151;font-family:monospace;">{{ Math.round(totalReceived/totalOrdered*100) }}%</div></div>
          </div>
          <!-- Progress bar -->
          <div style="height:6px;background:#dcfce7;border-radius:9999px;overflow:hidden;">
            <div :style="`width:${Math.round(totalReceived/totalOrdered*100)}%;height:100%;background:#16a34a;border-radius:9999px;`"></div>
          </div>
          <!-- GRN list -->
          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <thead>
              <tr style="border-bottom:1px solid #bbf7d0;">
                <th style="padding:4px 8px;text-align:left;font-size:9px;color:#166534;font-weight:700;text-transform:uppercase;">GRN No.</th>
                <th style="padding:4px 8px;text-align:left;font-size:9px;color:#166534;font-weight:700;text-transform:uppercase;">Date</th>
                <th style="padding:4px 8px;text-align:right;font-size:9px;color:#166534;font-weight:700;text-transform:uppercase;">Qty (MT)</th>
                <th style="padding:4px 8px;text-align:center;font-size:9px;color:#166534;font-weight:700;text-transform:uppercase;">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="grn in po.grns" :key="grn.id" style="border-bottom:1px solid #dcfce7;">
                <td style="padding:5px 8px;font-size:11px;font-family:monospace;color:#111;font-weight:600;">{{ grn.grnNo }}</td>
                <td style="padding:5px 8px;font-size:11px;color:#374151;">{{ grn.date }}</td>
                <td style="padding:5px 8px;font-size:11px;text-align:right;font-family:monospace;color:#16a34a;font-weight:700;">{{ grn.qty }}</td>
                <td style="padding:5px 8px;font-size:11px;text-align:center;font-weight:700;color:#374151;">{{ grn.grade }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ PAYMENT STATUS ══════════════════════════ -->
        <div style="margin:0 40px 20px;padding:18px 20px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;">
          <div style="font-size:9px;font-weight:800;color:#1e40af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Payment Status</div>

          <!-- Summary row -->
          <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:12px;">
            <div>
              <div style="font-size:10px;color:#6b7280;">Total Billed</div>
              <div style="font-size:15px;font-weight:800;color:#111;font-family:monospace;">৳{{ po.totalBilled.toLocaleString() }}</div>
            </div>
            <div>
              <div style="font-size:10px;color:#6b7280;">Paid</div>
              <div style="font-size:15px;font-weight:800;color:#16a34a;font-family:monospace;">৳{{ po.totalPaid.toLocaleString() }}</div>
            </div>
            <div>
              <div style="font-size:10px;color:#6b7280;">Outstanding</div>
              <div style="font-size:15px;font-weight:800;font-family:monospace;"
                   :style="po.balanceDue > 0 ? 'color:#dc2626;' : 'color:#16a34a;'">
                ৳{{ po.balanceDue.toLocaleString() }}
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:#6b7280;">Paid %</div>
              <div style="font-size:15px;font-weight:800;color:#374151;font-family:monospace;">{{ paymentPct }}%</div>
            </div>
            <div style="margin-left:auto;display:flex;align-items:center;">
              <span :style="`font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;` +
                (po.paymentStatus === 'paid'    ? 'background:#dcfce7;color:#166534;border:1px solid #86efac;' :
                 po.paymentStatus === 'partial' ? 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;' :
                                                  'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;')">
                {{ po.paymentStatus.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Payment bar -->
          <div style="height:6px;background:#dbeafe;border-radius:9999px;overflow:hidden;margin-bottom:12px;">
            <div :style="`width:${paymentPct}%;height:100%;border-radius:9999px;` +
              (paymentPct >= 100 ? 'background:#16a34a;' : paymentPct > 0 ? 'background:#3b82f6;' : 'background:transparent;')">
            </div>
          </div>

          <!-- Payment history table (if any payments) -->
          <template v-if="po.payments.length > 0">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid #bfdbfe;">
                  <th style="padding:4px 8px;text-align:left;font-size:9px;color:#1e40af;font-weight:700;text-transform:uppercase;">Voucher</th>
                  <th style="padding:4px 8px;text-align:left;font-size:9px;color:#1e40af;font-weight:700;text-transform:uppercase;">Date</th>
                  <th style="padding:4px 8px;text-align:left;font-size:9px;color:#1e40af;font-weight:700;text-transform:uppercase;">Method</th>
                  <th style="padding:4px 8px;text-align:left;font-size:9px;color:#1e40af;font-weight:700;text-transform:uppercase;">Reference</th>
                  <th style="padding:4px 8px;text-align:right;font-size:9px;color:#1e40af;font-weight:700;text-transform:uppercase;">Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pmt in po.payments" :key="pmt.id" style="border-bottom:1px solid #dbeafe;">
                  <td style="padding:5px 8px;font-size:11px;font-family:monospace;color:#111;font-weight:600;">{{ pmt.voucherNo }}</td>
                  <td style="padding:5px 8px;font-size:11px;color:#374151;">{{ pmt.date }}</td>
                  <td style="padding:5px 8px;font-size:11px;color:#374151;text-transform:capitalize;">
                    {{ pmt.method }}<span v-if="pmt.bank"> · {{ pmt.bank }}</span>
                  </td>
                  <td style="padding:5px 8px;font-size:11px;color:#6b7280;">{{ pmt.ref || '—' }}</td>
                  <td style="padding:5px 8px;font-size:11px;text-align:right;font-family:monospace;color:#16a34a;font-weight:700;">
                    ৳{{ pmt.amount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="po.balanceDue > 0">
                <tr style="border-top:2px solid #bfdbfe;background:#dbeafe;">
                  <td colspan="4" style="padding:6px 8px;font-size:11px;font-weight:800;color:#1e40af;text-align:right;">Balance Outstanding</td>
                  <td style="padding:6px 8px;font-size:13px;text-align:right;font-family:monospace;font-weight:900;color:#dc2626;">
                    ৳{{ po.balanceDue.toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </template>
          <div v-else style="font-size:11px;color:#6b7280;text-align:center;padding:8px 0;">
            No payments recorded yet.
          </div>
        </div>

        <!-- ═══ SIGNATURE STRIP ════════════════════════ -->
        <div style="margin:0 40px;padding:24px 0 0;border-top:1px solid #f0ede8;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;">
          <div v-for="sig in ['Prepared By', 'Authorised By', 'Supplier Acceptance']" :key="sig" style="text-align:center;">
            <div style="height:48px;border-bottom:1.5px solid #d1d5db;margin-bottom:8px;"></div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;">{{ sig }}</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:3px;">Signature &amp; Stamp</div>
          </div>
        </div>

        <!-- ═══ FOOTER ═════════════════════════════════ -->
        <div style="margin-top:24px;background:#faf8f5;border-top:1px solid #f0ede8;padding:14px 40px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:10px;color:#9ca3af;">
            Generated by Ujjal FMC ERP · {{ generatedAt }}
          </div>
          <div style="font-size:10px;color:#9ca3af;text-align:center;">
            This is a computer-generated Purchase Order.<br>
            Valid only with authorised signature and company stamp.
          </div>
          <!-- Mini QR -->
          <div style="text-align:right;">
            <div style="width:44px;height:44px;background:#111;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-left:auto;">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
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

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()

const id = Number(route.params.id)

// Load PO data and document settings in parallel
const [{ data: apiData, error: loadError }, { data: settingsData }] = await Promise.all([
  useFetch(`/api/purchase/orders/${id}`),
  useFetch('/api/settings/documents'),
])

if (loadError.value || !(apiData.value as any)?.po) {
  throw createError({ statusCode: 404, message: 'Purchase order not found' })
}

const rawPo       = (apiData.value as any).po
const rawGrns     = ((apiData.value as any).grns     ?? []) as any[]
const rawPayments = ((apiData.value as any).payments ?? []) as any[]

// Map API fields → template-expected shape
const po = computed(() => {
  const qtyMT        = Number(rawPo.quantity_kg || 0) / 1000
  const pricePerMT   = Number(rawPo.unit_price_per_kg || 0) * 1000
  // payment_terms may be a non-numeric string like 'COD' or 'Net 30' — guard carefully
  const rawTermsStr      = String(rawPo.supplier_payment_terms ?? rawPo.payment_terms ?? '')
  const termsParsed      = parseInt(rawTermsStr, 10)
  const paymentTerms     = Number.isNaN(termsParsed) ? 0 : termsParsed
  const paymentTermsLabel = paymentTerms > 0 ? `Net ${paymentTerms} days` : (rawTermsStr || 'COD')
  return {
    poNo:             rawPo.po_number ?? `PO-${id}`,
    poDate:           rawPo.po_date   ?? '',
    supplier:         rawPo.company_name  ?? rawPo.supplier_name ?? '—',
    supplierAddress:  rawPo.supplier_address ?? rawPo.address ?? '—',
    supplierPhone:    rawPo.phone ?? '—',
    status:           rawPo.po_status ?? 'draft',
    createdBy:        rawPo.created_by_name ?? '—',
    expectedDelivery: rawPo.expected_delivery_date ?? '—',
    deliveryTo:       rawPo.branch_name ?? rawPo.unload_point_name ?? 'Sirajgonj Mill',
    paymentTerms,
    paymentTermsLabel,
    origin:           rawPo.wheat_origin ?? '—',
    notes:            rawPo.remarks ?? '',
    totalAmount:      Number(rawPo.total_order_value || 0),
    paid:             Number(rawPo.total_paid || 0),
    items: [{
      product:   `Wheat (${rawPo.wheat_origin ?? 'Imported'})`,
      qty:       qtyMT,
      unitPrice: pricePerMT,
    }],
    grns: rawGrns.map((g: any) => ({
      id:    g.id,
      grnNo: g.grn_number,
      date:  g.grn_date,
      qty:   +(Number(g.quantity_received_kg || 0) / 1000).toFixed(2),
      grade: g.grn_status === 'verified' || g.grn_status === 'posted' ? 'A' : '—',
    })).filter((g: any) => g.qty > 0),
    payments: rawPayments.map((p: any) => ({
      id:        p.id,
      voucherNo: p.payment_voucher_number,
      date:      p.payment_date,
      amount:    Number(p.amount_paid || 0),
      method:    p.payment_method ?? p.payment_mode ?? '—',
      bank:      p.bank_name ?? '',
      ref:       p.reference_number ?? '',
    })),
    // Billed = sum of GRN values (expected qty × price), falls back to PO total if no GRNs
    totalBilled:  Number(rawPo.total_received_value || 0) || Number(rawPo.total_order_value || 0),
    totalPaid:    Number(rawPo.total_paid || 0),
    balanceDue:   Number(rawPo.balance_payable || 0),
    paymentStatus: rawPo.payment_status ?? 'unpaid',
  }
})

const statusStyle = computed(() => {
  const s = po.value.status
  if (s === 'completed' || s === 'delivered')         return 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0;'
  if (s === 'partial' || s === 'partial_delivery' || s === 'in_transit') return 'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;'
  if (s === 'cancelled')                              return 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;'
  return 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;'
})

const totalOrdered  = computed(() => po.value.items.reduce((s: number, i: any) => s + i.qty, 0))
const totalReceived = computed(() => po.value.grns.reduce((s: number, g: any) => s + g.qty, 0))
const paymentPct    = computed(() => {
  const billed = po.value.totalBilled
  if (!billed) return 0
  return Math.min(100, Math.round((po.value.totalPaid / billed) * 100))
})

// Due date = expectedDelivery + paymentTerms days
// paymentTerms can be 0 (COD) — in that case no due date applies
const dueDate = computed(() => {
  if (!po.value.paymentTerms) return '—'
  const d = new Date(po.value.expectedDelivery)
  if (isNaN(d.getTime())) return '—'
  d.setDate(d.getDate() + po.value.paymentTerms)
  if (isNaN(d.getTime())) return '—'
  return d.toISOString().split('T')[0]
})

const generatedAt = new Date().toLocaleString('en-BD', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

// ── Role & T&C editor ────────────────────────────────────────────────────────
const { user: sessionUser } = useUserSession()
const isAdmin = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const TC_DEFAULT = [
  'Goods must conform to specified quality standards upon delivery.',
  'Moisture content must not exceed 13% for wheat.',
  'Supplier must provide phytosanitary certificate for imported wheat.',
  'Payment terms as stated above from GRN acceptance.',
  'Any short delivery must be notified before unloading.',
  'Subject to Sirajgonj jurisdiction.',
].join('\n')

// Stored T&C from API (falls back to default)
const storedTC  = computed(() => (settingsData.value as any)?.settings?.tc_purchase_order ?? TC_DEFAULT)
const tcDraft   = ref('')        // editor draft (populated on mount)
const tcLive    = ref('')        // what's actually rendered in the document
const tcEditorOpen = ref(false)
const tcSaving  = ref(false)
const tcSaveMsg = ref('')

// Clauses rendered in the document = one line per bullet
const tcClauses = computed(() => tcLive.value.split('\n').map(l => l.trim()).filter(Boolean))

function resetTC() {
  tcDraft.value = TC_DEFAULT
}

async function saveTC() {
  tcSaving.value = true
  tcSaveMsg.value = ''
  try {
    await $fetch('/api/settings/documents', {
      method: 'PUT',
      body: { tc_purchase_order: tcDraft.value },
    })
    tcLive.value   = tcDraft.value
    tcSaveMsg.value = '✓ Saved — changes will appear in all future prints'
  } catch (e: any) {
    tcSaveMsg.value = '✗ ' + (e?.data?.statusMessage ?? 'Failed to save')
  } finally {
    tcSaving.value = false
  }
}

onMounted(() => {
  tcLive.value  = storedTC.value
  tcDraft.value = storedTC.value
  if (useRoute().query.print === '1') setTimeout(() => window.print(), 600)
})
</script>

<style>
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; margin: 0; padding: 0; }
  .no-print-margin { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
  @page { margin: 0; size: A4 portrait; }
}
</style>
