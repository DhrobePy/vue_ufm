<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6 print:hidden">
      <NuxtLink to="/hr/payroll/history" class="btn-secondary text-sm">← Back</NuxtLink>
      <button @click="window.print()" class="btn-primary text-sm">🖨 Print Payslip</button>
    </div>

    <div v-if="payroll" class="max-w-2xl mx-auto bg-white text-gray-900 rounded-xl p-8 shadow print:shadow-none print:rounded-none">
      <!-- Header -->
      <div class="flex justify-between items-start border-b-2 border-gray-200 pb-5 mb-5">
        <div>
          <h1 class="text-2xl font-bold">PAYSLIP</h1>
          <p class="text-sm text-gray-500 mt-1">
            Period: {{ fmtDate(payroll.pay_period_start) }} – {{ fmtDate(payroll.pay_period_end) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-xl font-bold text-blue-700">Ujjal FMC</p>
          <p class="text-xs text-gray-500">ERP System</p>
        </div>
      </div>

      <!-- Employee Info -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Employee</p>
          <p class="font-semibold text-gray-800">{{ payroll.first_name }} {{ payroll.last_name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Position</p>
          <p class="text-gray-700">{{ payroll.position_name || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Department</p>
          <p class="text-gray-700">{{ payroll.department_name || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Hire Date</p>
          <p class="text-gray-700">{{ fmtDate(payroll.hire_date) }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Email</p>
          <p class="text-gray-700">{{ payroll.email }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
          <p class="text-gray-700">{{ payroll.phone || '—' }}</p>
        </div>
      </div>

      <!-- Earnings & Deductions -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <!-- Earnings -->
        <div>
          <h3 class="text-sm font-bold text-green-700 border-b border-green-100 pb-1 mb-2">Earnings</h3>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Basic Salary</span>
              <span class="font-medium">৳{{ fmt(payroll.basic_salary || payroll.gross_salary) }}</span>
            </div>
            <div v-if="Number(payroll.house_allowance) > 0" class="flex justify-between">
              <span class="text-gray-600">House Allowance</span>
              <span>৳{{ fmt(payroll.house_allowance) }}</span>
            </div>
            <div v-if="Number(payroll.transport_allowance) > 0" class="flex justify-between">
              <span class="text-gray-600">Transport Allowance</span>
              <span>৳{{ fmt(payroll.transport_allowance) }}</span>
            </div>
            <div v-if="Number(payroll.medical_allowance) > 0" class="flex justify-between">
              <span class="text-gray-600">Medical Allowance</span>
              <span>৳{{ fmt(payroll.medical_allowance) }}</span>
            </div>
            <div v-if="Number(payroll.other_allowances) > 0" class="flex justify-between">
              <span class="text-gray-600">Other Allowances</span>
              <span>৳{{ fmt(payroll.other_allowances) }}</span>
            </div>
            <div v-for="item in allowanceItems" :key="item.id" class="flex justify-between">
              <span class="text-gray-600">{{ item.name }}</span>
              <span>৳{{ fmt(item.amount) }}</span>
            </div>
            <div class="flex justify-between font-bold border-t border-gray-200 pt-1 mt-2">
              <span>Gross Salary</span>
              <span class="text-green-700">৳{{ fmt(payroll.gross_salary) }}</span>
            </div>
          </div>
        </div>

        <!-- Deductions -->
        <div>
          <h3 class="text-sm font-bold text-red-700 border-b border-red-100 pb-1 mb-2">Deductions</h3>
          <div class="space-y-1.5 text-sm">
            <div v-if="Number(payroll.provident_fund) > 0" class="flex justify-between">
              <span class="text-gray-600">Provident Fund</span>
              <span>৳{{ fmt(payroll.provident_fund) }}</span>
            </div>
            <div v-if="Number(payroll.tax_deduction) > 0" class="flex justify-between">
              <span class="text-gray-600">Tax Deduction</span>
              <span>৳{{ fmt(payroll.tax_deduction) }}</span>
            </div>
            <div v-for="item in deductionItems" :key="item.id" class="flex justify-between">
              <span class="text-gray-600">{{ item.name }}</span>
              <span>৳{{ fmt(item.amount) }}</span>
            </div>
            <div v-if="loanInstallments.length" class="flex justify-between">
              <span class="text-gray-600">Loan Repayment</span>
              <span>৳{{ fmt(loanInstallments.reduce((s: number, i: any) => s + Number(i.amount), 0)) }}</span>
            </div>
            <div class="flex justify-between font-bold border-t border-gray-200 pt-1 mt-2">
              <span>Total Deductions</span>
              <span class="text-red-700">৳{{ fmt(payroll.deductions) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Net Salary -->
      <div class="rounded-lg p-4 flex justify-between items-center" style="background: #f0fdf4">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Net Salary Payable</p>
          <p class="text-xs text-gray-400 mt-0.5">Status: <span class="font-medium capitalize">{{ payroll.status?.replace('_', ' ') }}</span></p>
        </div>
        <p class="text-3xl font-bold text-green-700">৳{{ fmt(payroll.net_salary) }}</p>
      </div>

      <!-- Footer -->
      <div class="mt-6 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
        <span>Generated: {{ new Date().toLocaleString('en-GB') }}</span>
        <span>Payroll ID: #{{ payroll.id }}</span>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-20">
      <p>Payroll not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const { data } = await useFetch(`/api/hr/payroll`, {
  query: { view: 'payslip', payrollId: route.params.id },
})

const payroll          = computed(() => (data.value as any)?.payroll ?? null)
const allowanceItems   = computed(() => ((data.value as any)?.items ?? []).filter((i: any) => i.type === 'allowance'))
const deductionItems   = computed(() => ((data.value as any)?.items ?? []).filter((i: any) => i.type === 'deduction'))
const loanInstallments = computed(() => (data.value as any)?.installments ?? [])

const fmt     = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

const window = typeof globalThis !== 'undefined' ? globalThis : ({} as any)
</script>

<style>
@media print {
  body * { visibility: hidden !important; }
  .max-w-2xl, .max-w-2xl * { visibility: visible !important; }
  .max-w-2xl { position: fixed !important; left: 0; top: 0; width: 100%; }
}
</style>
