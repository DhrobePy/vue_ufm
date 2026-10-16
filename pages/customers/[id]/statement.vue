<template>
  <div style="min-height:100vh;background:#e8e4dd;font-family:'Inter',sans-serif;color:#111;">
    <!-- toolbar (hidden when printing) -->
    <div class="no-print" style="position:sticky;top:0;z-index:50;background:rgba(14,12,10,0.95);padding:12px 24px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
      <NuxtLink :to="`/customers/${route.params.id}?tab=ledger`" style="padding:7px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);color:#9ca3af;font-size:12px;text-decoration:none;">← Back to profile</NuxtLink>
      <label style="color:#9ca3af;font-size:12px;">From <input v-model="from" type="date" style="margin-left:4px;padding:5px 8px;border-radius:8px;border:1px solid #444;background:#1c1917;color:#eee;" /></label>
      <label style="color:#9ca3af;font-size:12px;">To <input v-model="to" type="date" style="margin-left:4px;padding:5px 8px;border-radius:8px;border:1px solid #444;background:#1c1917;color:#eee;" /></label>
      <button style="padding:7px 14px;border-radius:10px;background:#f59e0b;color:#000;font-size:12px;font-weight:700;border:0;cursor:pointer;" @click="refresh()">Apply</button>
      <span style="flex:1" />
      <button style="padding:7px 18px;border-radius:10px;background:#f59e0b;color:#000;font-size:12px;font-weight:700;border:0;cursor:pointer;" @click="print">🖨️ Print</button>
    </div>

    <div v-if="pending" style="padding:40px;text-align:center;color:#666;">Loading…</div>
    <div v-else-if="error" style="padding:40px;text-align:center;color:#b91c1c;">{{ (error as any).statusMessage ?? 'Could not load the statement' }}</div>

    <div v-else-if="d" id="statement" style="max-width:820px;margin:24px auto;background:#fff;padding:36px 40px;box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;">
        <div>
          <h1 style="font-size:20px;font-weight:800;margin:0;">Ujjal Flour Mills</h1>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16px;font-weight:800;margin:0;letter-spacing:0.04em;">ACCOUNT STATEMENT</h2>
          <p style="font-size:11px;color:#555;margin:3px 0 0;">{{ day(d.from) }} – {{ day(d.to) }}</p>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin:16px 0;font-size:12px;line-height:1.6;">
        <div>
          <strong style="font-size:14px;">{{ d.customer.name }}</strong>
          <div v-if="d.customer.business_name">{{ d.customer.business_name }}</div>
          <div v-if="d.customer.business_address">{{ d.customer.business_address }}</div>
          <div v-if="d.customer.phone_number">Phone: {{ d.customer.phone_number }}</div>
        </div>
        <div style="text-align:right;">
          <div>Credit limit: <strong>৳{{ money(d.customer.credit_limit) }}</strong></div>
          <div>Statement date: {{ day(new Date().toISOString()) }}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
        <thead><tr style="background:#111;color:#fff;">
          <th style="padding:7px 8px;text-align:left;">Date</th><th style="padding:7px 8px;text-align:left;">Reference</th><th style="padding:7px 8px;text-align:left;">Description</th>
          <th style="padding:7px 8px;text-align:right;">Debit</th><th style="padding:7px 8px;text-align:right;">Credit</th><th style="padding:7px 8px;text-align:right;">Balance</th></tr></thead>
        <tbody>
          <tr style="background:#f5f3ef;font-weight:700;"><td colspan="5" style="padding:6px 8px;">Opening balance</td><td style="padding:6px 8px;text-align:right;">৳{{ money(d.openingBalance) }}</td></tr>
          <tr v-for="(l, i) in d.lines" :key="i" style="border-bottom:1px solid #e7e3dc;">
            <td style="padding:6px 8px;white-space:nowrap;">{{ day(l.date) }}</td>
            <td style="padding:6px 8px;font-family:monospace;">{{ l.ref }}</td>
            <td style="padding:6px 8px;color:#444;">{{ l.description }}</td>
            <td style="padding:6px 8px;text-align:right;">{{ l.debit ? money(l.debit) : '' }}</td>
            <td style="padding:6px 8px;text-align:right;color:#15803d;">{{ l.credit ? money(l.credit) : '' }}</td>
            <td style="padding:6px 8px;text-align:right;font-weight:600;">{{ money(l.balance) }}</td>
          </tr>
          <tr v-if="!d.lines.length"><td colspan="6" style="padding:18px;text-align:center;color:#888;">No transactions in this period</td></tr>
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid #111;font-weight:700;"><td colspan="3" style="padding:8px;">Period totals</td>
            <td style="padding:8px;text-align:right;">{{ money(d.totalDebit) }}</td><td style="padding:8px;text-align:right;">{{ money(d.totalCredit) }}</td><td></td></tr>
          <tr style="background:#fef3c7;font-weight:800;font-size:13px;"><td colspan="5" style="padding:9px 8px;">Closing balance (amount due)</td><td style="padding:9px 8px;text-align:right;">৳{{ money(d.closingBalance) }}</td></tr>
        </tfoot>
      </table>
      <p style="font-size:10px;color:#777;margin-top:18px;">This is a computer-generated statement. Please report any discrepancy within 7 days.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const today = new Date().toISOString().slice(0, 10)
const from = ref(`${today.slice(0, 4)}-01-01`)
const to = ref(today)
const { data: d, pending, error, refresh } = await useFetch<any>(() => `/api/customers/${route.params.id}/statement`, { query: { from, to }, watch: false })
const money = (v: any) => Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
const day = (v: any) => { const m = String(v ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }
const print = () => window.print()
</script>

<style>
@media print { .no-print { display: none !important; } body { background: #fff !important; } #statement { box-shadow: none !important; margin: 0 auto !important; } }
</style>
