<template>
  <div class="print-page" v-if="trip">
    <!-- Print controls (hidden on print) -->
    <div class="no-print mb-4 flex gap-3">
      <button @click="window.print()" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">🖨 Print / Save PDF</button>
      <NuxtLink :to="`/fleet/trips/${id}`" class="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg">← Back</NuxtLink>
    </div>

    <!-- Trip Sheet Document -->
    <div class="trip-sheet">
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <h1>TRIP SHEET</h1>
          <p class="company-name">FMC Transport Fleet Management</p>
        </div>
        <div class="trip-number-box">
          <span class="label">Trip No</span>
          <span class="value">{{ trip.trip_number }}</span>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <span class="status-pill" :class="`status-${trip.trip_status}`">{{ trip.trip_status?.replace('_', ' ').toUpperCase() }}</span>
        <span class="status-pill status-report">{{ trip.report_status?.toUpperCase() }}</span>
        <span class="date-info">Date: {{ trip.trip_date }}</span>
      </div>

      <!-- Section: Vehicle & Driver -->
      <div class="two-col-section">
        <div class="info-box">
          <div class="box-title">VEHICLE</div>
          <table class="info-table">
            <tr><td class="label">Reg No</td><td class="value">{{ trip.vehicle_no }}</td></tr>
            <tr><td class="label">Type</td><td class="value">{{ trip.vehicle_type }}</td></tr>
            <tr><td class="label">Make/Model</td><td class="value">{{ trip.make }} {{ trip.model }}</td></tr>
          </table>
        </div>
        <div class="info-box">
          <div class="box-title">DRIVER</div>
          <table class="info-table">
            <tr><td class="label">Name</td><td class="value">{{ trip.driver_name }}</td></tr>
            <tr><td class="label">Mobile</td><td class="value">{{ trip.driver_mobile || '—' }}</td></tr>
          </table>
        </div>
      </div>

      <!-- Section: Route & Cargo -->
      <div class="info-box full-width">
        <div class="box-title">ROUTE &amp; CARGO DETAILS</div>
        <div class="grid-4">
          <div class="field">
            <span class="field-label">Origin</span>
            <span class="field-value">{{ trip.origin || '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Destination</span>
            <span class="field-value">{{ trip.destination || '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Departure</span>
            <span class="field-value">{{ trip.departure_time || '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Est. Duration</span>
            <span class="field-value">{{ trip.estimated_duration ? trip.estimated_duration + ' hrs' : '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Goods</span>
            <span class="field-value">{{ trip.goods_description || '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Quantity</span>
            <span class="field-value">{{ trip.quantity ? Number(trip.quantity).toLocaleString() : '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Weight (kg)</span>
            <span class="field-value">{{ trip.weight_kg ? Number(trip.weight_kg).toLocaleString() : '—' }}</span>
          </div>
          <div class="field">
            <span class="field-label">Customer</span>
            <span class="field-value">{{ trip.customer_name || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Section: Financial -->
      <div class="two-col-section">
        <!-- Advances -->
        <div class="info-box">
          <div class="box-title">ADVANCES</div>
          <table class="data-table" v-if="advances.length">
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Given By</th>
                <th class="amount">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in advances" :key="a.id">
                <td>{{ a.purpose || 'Advance' }}</td>
                <td>{{ a.given_by || '—' }}</td>
                <td class="amount">{{ Number(a.amount).toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2">Total Advances</td>
                <td class="amount">{{ fmt(settlement.total_advance) }}</td>
              </tr>
            </tfoot>
          </table>
          <p class="empty-msg" v-else>No advances recorded</p>
        </div>

        <!-- Expenses -->
        <div class="info-box">
          <div class="box-title">EXPENSES</div>
          <table class="data-table" v-if="expenses.length">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th class="amount">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in expenses" :key="e.id">
                <td>{{ e.category || 'Expense' }}</td>
                <td>{{ e.description || '—' }}</td>
                <td class="amount">{{ Number(e.amount).toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2">Total Expenses</td>
                <td class="amount">{{ fmt(settlement.total_expense) }}</td>
              </tr>
            </tfoot>
          </table>
          <p class="empty-msg" v-else>No expenses recorded</p>
        </div>
      </div>

      <!-- Section: Settlement Summary -->
      <div class="settlement-box">
        <div class="box-title">SETTLEMENT SUMMARY</div>
        <div class="settlement-grid">
          <div class="settlement-row income">
            <span>Trip Charge (Revenue)</span>
            <span>৳{{ fmt(settlement.revenue) }}</span>
          </div>
          <div class="settlement-row deduct">
            <span>Less: Total Advances</span>
            <span>– ৳{{ fmt(settlement.total_advance) }}</span>
          </div>
          <div class="settlement-row deduct">
            <span>Less: Total Expenses</span>
            <span>– ৳{{ fmt(settlement.total_expense) }}</span>
          </div>
          <div class="settlement-row balance" :class="settlement.final_balance < 0 ? 'negative' : ''">
            <span>Balance Due to Company</span>
            <span>৳{{ fmt(settlement.final_balance) }}</span>
          </div>
        </div>
      </div>

      <!-- Signature Section -->
      <div class="signature-section">
        <div class="sig-box">
          <div class="sig-line"></div>
          <p class="sig-label">Driver Signature</p>
          <p class="sig-name">{{ trip.driver_name }}</p>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <p class="sig-label">Supervisor Signature</p>
          <p class="sig-name">&nbsp;</p>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <p class="sig-label">Accounts Signature</p>
          <p class="sig-name">&nbsp;</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="doc-footer">
        <span>Printed: {{ printDate }}</span>
        <span>{{ trip.trip_number }} · FMC Fleet Management System</span>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center text-gray-500">
    Loading trip data…
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const id    = Number(route.params.id)

const { data } = await useFetch(`/api/fleet/trips/${id}`)

const trip       = computed(() => (data.value as any)?.trip       ?? null)
const advances   = computed(() => (data.value as any)?.advances   ?? [])
const expenses   = computed(() => (data.value as any)?.expenses   ?? [])
const settlement = computed(() => (data.value as any)?.settlement ?? { revenue: 0, total_advance: 0, total_expense: 0, final_balance: 0 })

const printDate = new Date().toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }

const window = process.client ? globalThis.window : null
</script>

<style scoped>
/* Reset for print */
* { box-sizing: border-box; margin: 0; padding: 0; }

.print-page {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #1a1a1a;
  background: #fff;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.trip-sheet {
  border: 2px solid #1a1a2e;
  padding: 0;
  background: #fff;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #1a1a2e;
  color: #fff;
}
.company-info h1 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #f59e0b;
}
.company-info .company-name {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
.trip-number-box {
  text-align: right;
}
.trip-number-box .label {
  display: block;
  font-size: 9px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.trip-number-box .value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  color: #f59e0b;
  margin-top: 2px;
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
}
.status-pill {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.status-scheduled  { background: #fef3c7; color: #92400e; }
.status-in_progress { background: #dbeafe; color: #1e40af; }
.status-completed  { background: #d1fae5; color: #065f46; }
.status-cancelled  { background: #fee2e2; color: #991b1b; }
.status-closed     { background: #f3f4f6; color: #374151; }
.status-report     { background: #ede9fe; color: #5b21b6; }
.date-info {
  margin-left: auto;
  font-size: 11px;
  color: #6b7280;
}

/* Sections */
.two-col-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
}
.info-box {
  padding: 14px 20px;
  border-right: 1px solid #e5e7eb;
}
.info-box.full-width {
  border-right: none;
  border-bottom: 1px solid #e5e7eb;
}
.two-col-section .info-box:last-child {
  border-right: none;
}
.box-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #374151;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 6px;
  margin-bottom: 10px;
}

/* Info Table */
.info-table { width: 100%; border-collapse: collapse; }
.info-table td { padding: 3px 0; font-size: 12px; }
.info-table td.label { color: #6b7280; width: 35%; }
.info-table td.value { font-weight: 600; color: #111827; }

/* Grid 4 */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.field { display: flex; flex-direction: column; gap: 2px; }
.field-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; }
.field-value { font-size: 12px; font-weight: 600; color: #111827; }

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.data-table th {
  background: #f3f4f6;
  padding: 5px 8px;
  text-align: left;
  font-size: 10px;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.data-table th.amount, .data-table td.amount { text-align: right; }
.data-table td {
  padding: 5px 8px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}
.data-table tfoot .total-row td {
  font-weight: 700;
  padding: 6px 8px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
}
.empty-msg { color: #9ca3af; font-style: italic; font-size: 11px; padding: 8px 0; }

/* Settlement */
.settlement-box {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.settlement-grid { margin-top: 10px; }
.settlement-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 12px;
  font-size: 12px;
  border-bottom: 1px dashed #e5e7eb;
}
.settlement-row.income { color: #065f46; font-weight: 600; }
.settlement-row.deduct { color: #374151; }
.settlement-row.balance {
  font-size: 14px;
  font-weight: 800;
  color: #1e40af;
  border-bottom: none;
  border-top: 2px solid #1a1a2e;
  margin-top: 4px;
  padding-top: 8px;
  background: #eff6ff;
  border-radius: 4px;
}
.settlement-row.balance.negative { color: #991b1b; background: #fef2f2; }

/* Signatures */
.signature-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.sig-box { text-align: center; padding: 0 10px; }
.sig-line {
  border-top: 1px solid #374151;
  margin: 40px 20px 8px;
}
.sig-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.sig-name { font-size: 11px; font-weight: 600; color: #374151; margin-top: 2px; }

/* Footer */
.doc-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 20px;
  background: #1a1a2e;
  color: #9ca3af;
  font-size: 10px;
}

/* No-print */
.no-print {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 16px;
}

@media print {
  .no-print { display: none !important; }
  .print-page { padding: 0; }
  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .header { background: #1a1a2e !important; }
  .doc-footer { background: #1a1a2e !important; }
}
</style>
