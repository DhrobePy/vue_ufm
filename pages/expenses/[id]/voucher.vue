<template>
  <!-- No ERP shell – dedicated print voucher page -->
  <div style="min-height:100vh;background:#e8e4dd;font-family:'Inter',sans-serif;">

    <!-- ── Print toolbar ──────────────────────────── -->
    <div class="no-print" style="position:sticky;top:0;z-index:100;background:rgba(14,12,10,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);padding:12px 24px;display:flex;align-items:center;gap:12px;">
      <NuxtLink :to="`/expenses/${route.params.id}`"
        style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);color:#9ca3af;font-size:12px;font-weight:500;text-decoration:none;"
        onmouseover="this.style.color='#e5e7eb';this.style.borderColor='rgba(255,255,255,0.22)'"
        onmouseout="this.style.color='#9ca3af';this.style.borderColor='rgba(255,255,255,0.12)'"
      >← Back to Expense</NuxtLink>
      <div style="flex:1;text-align:center;">
        <span style="font-size:13px;color:#d1d5db;font-weight:600;">{{ expense?.expNo }}</span>
        <span style="font-size:11px;color:#6b7280;margin-left:8px;">Expense Voucher Preview</span>
      </div>
      <button onclick="window.print()"
        style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:12px;font-weight:700;border:none;cursor:pointer;">
        🖨️ Print / Save PDF
      </button>
    </div>

    <!-- ── A4 Paper ──────────────────────────────── -->
    <div style="max-width:794px;margin:32px auto;padding-bottom:48px;" class="no-print-margin">
      <div style="background:#fff;box-shadow:0 4px 32px rgba(0,0,0,0.18);border-radius:4px;overflow:hidden;">

        <!-- ═══ HEADER BAND ═══════════════════════════ -->
        <div style="background:linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%);padding:28px 40px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
          <div style="display:flex;align-items:flex-start;gap:16px;">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;color:#000;flex-shrink:0;box-shadow:0 4px 16px rgba(245,158,11,0.4);">U</div>
            <div>
              <div style="font-size:19px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Ujjal Flour Mills Co.</div>
              <div style="font-size:11px;color:#f59e0b;font-weight:600;margin-top:3px;letter-spacing:0.05em;">PREMIUM WHEAT PRODUCTS</div>
              <div style="font-size:10.5px;color:#9ca3af;margin-top:5px;line-height:1.7;">
                Sirajgonj Sadar, Sirajgonj-6700 · Demra, Dhaka-1361<br>
                📞 +880 1711-000000 · ✉ accounts@ujjalfmc.com
              </div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:10px;font-weight:700;color:#f59e0b;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Expense Voucher</div>
            <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">{{ expense?.expNo }}</div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Date</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ expense?.date }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span style="font-size:10px;color:#6b7280;">Branch</span>
                <span style="font-size:11px;color:#e5e7eb;font-weight:600;">{{ expense?.branch }}</span>
              </div>
              <div style="margin-top:6px;">
                <span :style="`font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${statusStyle}`">
                  {{ (expense?.status ?? '').toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ AMOUNT HERO ════════════════════════════ -->
        <div style="background:linear-gradient(135deg,#fffbf0,#fef9ee);border-bottom:1px solid #f0ede8;padding:28px 40px;text-align:center;">
          <div style="font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Total Amount</div>
          <div style="font-size:48px;font-weight:900;color:#b45309;font-family:monospace;letter-spacing:-1px;">৳{{ Number(expense?.amount ?? 0).toLocaleString() }}</div>
          <div style="font-size:12px;color:#92400e;margin-top:8px;font-weight:600;">{{ expense?.amountInWords }}</div>
        </div>

        <!-- ═══ EXPENSE DETAILS ════════════════════════ -->
        <div style="padding:28px 40px;border-bottom:1px solid #f0ede8;">
          <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">Expense Details</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
            <div>
              <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Voucher No.</div>
              <div style="font-size:13px;font-weight:700;color:#111;font-family:monospace;">{{ expense?.expNo }}</div>
            </div>
            <div>
              <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Category</div>
              <div style="font-size:13px;font-weight:700;color:#111;">{{ expense?.category }}</div>
            </div>
            <div>
              <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Sub-category</div>
              <div style="font-size:13px;font-weight:700;color:#374151;">{{ expense?.subcategory || '—' }}</div>
            </div>
            <div>
              <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Payment Method</div>
              <div style="font-size:13px;font-weight:700;color:#111;">{{ expense?.method }}</div>
            </div>
            <div>
              <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Submitted By</div>
              <div style="font-size:13px;font-weight:700;color:#111;">{{ expense?.submittedBy }}</div>
            </div>
            <div>
              <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">GL Account</div>
              <div style="font-size:12px;font-weight:600;color:#374151;font-family:monospace;">{{ expense?.glAccount }}</div>
            </div>
          </div>
        </div>

        <!-- Payment account info (if bank) -->
        <div v-if="expense?.bankInfo || expense?.paymentRef"
             style="padding:16px 40px;border-bottom:1px solid #f0ede8;background:#fffdf8;display:flex;gap:32px;flex-wrap:wrap;">
          <div v-if="expense?.bankInfo">
            <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Payment Account</div>
            <div style="font-size:12px;font-weight:600;color:#374151;">{{ expense.bankInfo }}</div>
          </div>
          <div v-if="expense?.paymentRef">
            <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Reference / Cheque No.</div>
            <div style="font-size:12px;font-weight:700;color:#374151;font-family:monospace;">{{ expense.paymentRef }}</div>
          </div>
        </div>

        <!-- Quantity breakdown (if applicable) -->
        <div v-if="expense?.qty > 0" style="padding:20px 40px;border-bottom:1px solid #f0ede8;background:#faf8f5;">
          <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Quantity Breakdown</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid #e5e0d8;">
                <th style="padding:8px 10px;text-align:left;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Description</th>
                <th style="padding:8px 10px;text-align:right;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Qty</th>
                <th style="padding:8px 10px;text-align:right;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Unit</th>
                <th style="padding:8px 10px;text-align:right;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Unit Cost</th>
                <th style="padding:8px 10px;text-align:right;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:10px 10px;font-size:13px;color:#111;font-weight:600;">{{ expense?.subcategory || expense?.category }}</td>
                <td style="padding:10px 10px;text-align:right;font-size:13px;color:#374151;font-family:monospace;">{{ expense?.qty }}</td>
                <td style="padding:10px 10px;text-align:right;font-size:13px;color:#374151;">{{ expense?.unit }}</td>
                <td style="padding:10px 10px;text-align:right;font-size:13px;color:#374151;font-family:monospace;">৳{{ (expense?.unitCost ?? 0).toLocaleString() }}</td>
                <td style="padding:10px 10px;text-align:right;font-size:13px;font-weight:800;color:#b45309;font-family:monospace;">৳{{ Number(expense?.amount ?? 0).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ REMARKS ════════════════════════════════ -->
        <div style="padding:24px 40px;border-bottom:1px solid #f0ede8;">
          <div style="font-size:9px;font-weight:800;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">Remarks / Description</div>
          <div style="font-size:13px;color:#374151;line-height:1.7;font-style:italic;">{{ expense?.remarks }}</div>
        </div>

        <!-- ═══ ACCOUNTING INFO ════════════════════════ -->
        <div style="padding:20px 40px;border-bottom:1px solid #f0ede8;background:#faf8f5;display:flex;gap:32px;align-items:center;">
          <div>
            <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Cost Centre</div>
            <div style="font-size:12px;font-weight:700;color:#374151;">{{ expense?.branch ?? '—' }}</div>
          </div>
          <div>
            <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Journal Entry</div>
            <div style="font-size:12px;font-weight:700;color:#374151;font-family:monospace;">
              {{ expense?.status === 'approved' ? `JE-${expense.expNo}` : 'Pending Approval' }}
            </div>
          </div>
          <div>
            <div style="font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">GL Account</div>
            <div style="font-size:12px;font-weight:700;color:#374151;font-family:monospace;">{{ expense?.glAccount }}</div>
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div style="font-size:22px;font-weight:900;color:#b45309;font-family:monospace;">৳{{ (expense?.amount ?? 0).toLocaleString() }}</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:2px;">TOTAL AMOUNT</div>
          </div>
        </div>

        <!-- ═══ SIGNATURE STRIP ════════════════════════ -->
        <div style="padding:28px 40px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;">
          <!-- Submitted By -->
          <div style="text-align:center;">
            <div style="height:48px;border-bottom:1.5px solid #d1d5db;margin-bottom:8px;"></div>
            <div style="font-size:11px;font-weight:700;color:#374151;">{{ expense?.submittedBy }}</div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;margin-top:2px;">Submitted By</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:3px;">Signature &amp; Stamp</div>
          </div>
          <!-- Approved By -->
          <div style="text-align:center;">
            <div style="height:48px;border-bottom:1.5px solid #d1d5db;margin-bottom:8px;"></div>
            <div v-if="expense?.approvedBy" style="font-size:11px;font-weight:700;color:#374151;">{{ expense.approvedBy }}</div>
            <div v-else style="font-size:11px;color:#9ca3af;font-style:italic;">Pending</div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;margin-top:2px;">Approved By</div>
            <div v-if="expense?.approvedAt" style="font-size:9px;color:#9ca3af;margin-top:3px;">{{ expense.approvedAt }}</div>
            <div v-else style="font-size:9px;color:#9ca3af;margin-top:3px;">Signature &amp; Stamp</div>
          </div>
          <!-- Accounts -->
          <div style="text-align:center;">
            <div style="height:48px;border-bottom:1.5px solid #d1d5db;margin-bottom:8px;"></div>
            <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.05em;">Accounts &amp; Finance</div>
            <div style="font-size:9px;color:#9ca3af;margin-top:3px;">Signature &amp; Stamp</div>
          </div>
        </div>

        <!-- ═══ FOOTER BAND ════════════════════════════ -->
        <div style="margin-top:28px;background:#faf8f5;border-top:1px solid #f0ede8;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:10px;color:#9ca3af;">
            Generated by Ujjal FMC ERP · {{ generatedAt }}
          </div>
          <div style="font-size:10px;color:#9ca3af;text-align:center;">
            This is a system-generated expense voucher.<br>
            Please retain original receipts for audit purposes.
          </div>
          <div style="text-align:right;">
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

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route     = useRoute()
const expenseId = computed(() => Number(route.params.id))

const { data } = await useFetch(() => `/api/expenses/${expenseId.value}`)

const raw = computed(() => data.value?.expense as any)

// Convert number to words (Bengali Taka)
function amountInWords(n: number): string {
  if (!n || n === 0) return 'Zero Taka Only'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  function toWords(num: number): string {
    if (num === 0) return ''
    if (num < 20) return ones[num] + ' '
    if (num < 100) return tens[Math.floor(num / 10)] + ' ' + ones[num % 10] + ' '
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred ' + toWords(num % 100)
    if (num < 100000) return toWords(Math.floor(num / 1000)) + 'Thousand ' + toWords(num % 1000)
    if (num < 10000000) return toWords(Math.floor(num / 100000)) + 'Lakh ' + toWords(num % 100000)
    return toWords(Math.floor(num / 10000000)) + 'Crore ' + toWords(num % 10000000)
  }
  const integer = Math.floor(n)
  const decimal = Math.round((n - integer) * 100)
  let result = toWords(integer).trim() + ' Taka'
  if (decimal > 0) result += ' and ' + toWords(decimal).trim() + ' Paisa'
  return result + ' Only'
}

// Map API fields to template-expected field names
const expense = computed(() => {
  const e = raw.value
  if (!e) return null

  // GL Account: use joined chart_of_accounts data, or derive from category code
  const glCode = e.gl_account_code ?? e.category_code ?? ''
  const glName = e.gl_account_name ?? e.category_name ?? ''
  const glAccount = glCode ? `${glCode} — ${glName}` : (glName || '—')

  // Bank info
  let bankInfo = ''
  if (e.bank_name) {
    bankInfo = `${e.bank_name} · ${e.bank_account_name ?? ''} (${e.account_number ?? ''})`
  } else if (e.payment_account_name) {
    bankInfo = e.payment_account_name
  }

  return {
    expNo:        e.voucher_number,
    date:         String(e.expense_date).slice(0, 10),
    category:     e.category_name     ?? '—',
    subcategory:  e.subcategory_name  ?? '',
    amount:       Number(e.total_amount ?? 0),
    amountInWords: amountInWords(Number(e.total_amount ?? 0)),
    branch:       e.branch_name       ?? '—',
    method:       e.payment_method    ?? '—',
    submittedBy:  e.created_by_name   ?? e.handled_by_person ?? '—',
    qty:          Number(e.unit_quantity ?? 0),
    unit:         e.unit_type         ?? '',
    unitCost:     Number(e.per_unit_cost ?? 0),
    status:       e.status            ?? 'pending',
    remarks:      e.remarks           ?? '',
    approvedBy:   e.approved_by_name  ?? '',
    approvedAt:   e.approved_at ? String(e.approved_at).slice(0, 10) : '',
    glAccount,
    bankInfo,
    paymentRef:   e.payment_reference ?? '',
  }
})

const statusStyle = computed(() => {
  const s = expense.value?.status ?? ''
  if (s === 'approved') return 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0;'
  if (s === 'rejected') return 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;'
  return 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;'
})

const generatedAt = new Date().toLocaleString('en-BD', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

onMounted(() => {
  if (useRoute().query.print === '1') {
    setTimeout(() => window.print(), 600)
  }
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
