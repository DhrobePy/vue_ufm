<template>
  <div class="receipt-wrap">
    <!-- Screen-only toolbar -->
    <div class="no-print flex items-center justify-between mb-4">
      <NuxtLink to="/credit-sales/payments" class="btn-ghost text-xs">← Payments</NuxtLink>
      <button @click="printNow" class="btn-gold text-xs px-5">🖨 Print Receipt</button>
    </div>

    <div v-if="pending" class="no-print glass-card p-10 text-center text-xs text-gray-500">Loading receipt…</div>

    <!-- A4 receipt — pure B&W for print -->
    <div v-else-if="p" class="a4-page">
      <div class="rc-header">
        <div>
          <h1>UJJAL FLOUR MILLS COMPANY</h1>
          <p>Sarghat, Hossenpur, Sirajgonj · Phone: 01912071977</p>
        </div>
        <div class="rc-doc">
          <h2>MONEY RECEIPT</h2>
          <p class="mono">{{ p.payment_number }}</p>
        </div>
      </div>

      <div class="rc-grid">
        <div>
          <p class="rc-label">Received From</p>
          <p class="rc-strong">{{ p.customer_name }}</p>
          <p v-if="p.customer_phone">{{ p.customer_phone }}</p>
          <p v-if="p.customer_address">{{ p.customer_address }}</p>
        </div>
        <div>
          <table class="rc-meta">
            <tbody>
              <tr><td>Date</td><td class="mono">{{ String(p.payment_date).slice(0, 10) }}</td></tr>
              <tr><td>Method</td><td>{{ p.payment_method }}</td></tr>
              <tr v-if="p.bank_account_name"><td>Bank</td><td>{{ p.bank_name }} — {{ p.bank_account_name }}</td></tr>
              <tr v-if="p.cash_account_name"><td>Cash A/c</td><td>{{ p.cash_account_name }}</td></tr>
              <tr v-if="p.cheque_number"><td>Cheque</td><td class="mono">{{ p.cheque_number }} ({{ p.cheque_date ? String(p.cheque_date).slice(0,10) : '' }})</td></tr>
              <tr v-if="p.reference_number"><td>Reference</td><td class="mono">{{ p.reference_number }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rc-amount">
        <span>Amount Received</span>
        <strong>৳ {{ Number(p.amount).toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}</strong>
      </div>
      <p class="rc-words">In words: {{ amountInWords }} taka only</p>

      <table v-if="allocations.length" class="rc-table">
        <thead>
          <tr><th>Applied To</th><th>Type</th><th class="num">Amount (৳)</th></tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in allocations" :key="i">
            <td class="mono">{{ a.order_number }}</td>
            <td>{{ a.as_advance ? 'Advance (pre-dispatch)' : 'Invoice payment' }}</td>
            <td class="num mono">{{ Number(a.allocated_amount).toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}</td>
          </tr>
          <tr v-if="onAccount > 0">
            <td>—</td><td>On account</td>
            <td class="num mono">{{ onAccount.toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="p.direct_order_number" class="rc-note">Applied to order <span class="mono">{{ p.direct_order_number }}</span></p>

      <div class="rc-outstanding">
        Customer outstanding after this payment:
        <strong class="mono">৳ {{ Number(outstanding).toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}</strong>
      </div>

      <div class="rc-sign">
        <div><div class="line"/><p>Received By{{ p.recorded_by ? ` — ${p.recorded_by}` : '' }}</p></div>
        <div><div class="line"/><p>Customer Signature</p></div>
        <div><div class="line"/><p>Authorised Signature</p></div>
      </div>
      <p class="rc-foot">Computer-generated receipt · {{ p.payment_number }} · printed {{ new Date().toLocaleString('en-GB') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const paymentId = Number(route.params.paymentId)

const { data, pending } = await useFetch(`/api/credit-sales/payments/${paymentId}`)
const p           = computed<any>(() => (data.value as any)?.payment ?? null)
const allocations = computed<any[]>(() => (data.value as any)?.allocations ?? [])
const outstanding = computed(() => (data.value as any)?.outstanding ?? 0)
const onAccount   = computed(() => {
  const alloc = allocations.value.reduce((s, a) => s + Number(a.allocated_amount), 0)
  return Math.max(0, Number(p.value?.amount ?? 0) - alloc)
})

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
function two(n: number): string { return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}` }
function words(n: number): string {
  if (n === 0) return 'zero'
  const crore = Math.floor(n / 10000000); n %= 10000000
  const lakh  = Math.floor(n / 100000);   n %= 100000
  const thou  = Math.floor(n / 1000);     n %= 1000
  const hund  = Math.floor(n / 100);      n %= 100
  const parts: string[] = []
  if (crore) parts.push(`${words(crore)} crore`)
  if (lakh)  parts.push(`${two(lakh)} lakh`)
  if (thou)  parts.push(`${two(thou)} thousand`)
  if (hund)  parts.push(`${ONES[hund]} hundred`)
  if (n)     parts.push(two(n))
  return parts.join(' ')
}
const amountInWords = computed(() => {
  const amt = Math.floor(Number(p.value?.amount ?? 0))
  const w = words(amt)
  return w.charAt(0).toUpperCase() + w.slice(1)
})

function printNow() { window.print() }
</script>

<style scoped>
.receipt-wrap { max-width: 800px; margin: 0 auto; }
.a4-page {
  background: #fff; color: #000; padding: 32px 40px; border-radius: 4px;
  font-family: Georgia, 'Times New Roman', serif; font-size: 13px; line-height: 1.45;
}
.mono { font-family: 'Courier New', monospace; }
.rc-header { display: flex; justify-content: space-between; align-items: flex-start;
  border-bottom: 2px solid #000; padding-bottom: 10px; }
.rc-header h1 { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
.rc-header p { margin: 2px 0 0; font-size: 11px; }
.rc-doc { text-align: right; }
.rc-doc h2 { font-size: 14px; margin: 0; border: 1.5px solid #000; padding: 3px 10px; }
.rc-doc p { margin: 4px 0 0; font-size: 12px; font-weight: 700; }
.rc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 14px 0; }
.rc-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px; }
.rc-strong { font-weight: 700; font-size: 14px; margin: 0; }
.rc-meta { width: 100%; font-size: 12px; }
.rc-meta td { padding: 2px 0; }
.rc-meta td:first-child { width: 80px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.rc-amount { display: flex; justify-content: space-between; align-items: center;
  border: 2px solid #000; padding: 10px 16px; margin: 10px 0 4px; }
.rc-amount span { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
.rc-amount strong { font-size: 20px; }
.rc-words { font-size: 11px; font-style: italic; margin: 0 0 12px; }
.rc-table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0 14px; }
.rc-table th, .rc-table td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
.rc-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.rc-table .num { text-align: right; }
.rc-note { font-size: 12px; }
.rc-outstanding { font-size: 12px; border-top: 1px solid #000; padding-top: 8px; }
.rc-sign { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-top: 54px; text-align: center; }
.rc-sign .line { border-top: 1px solid #000; margin-bottom: 4px; }
.rc-sign p { font-size: 10px; margin: 0; }
.rc-foot { font-size: 9px; text-align: center; margin-top: 18px; color: #333; }

@media print {
  .no-print { display: none !important; }
  .receipt-wrap { max-width: none; margin: 0; }
  .a4-page { border-radius: 0; padding: 10mm 14mm; }
  :global(body) { background: #fff !important; }
}
</style>
