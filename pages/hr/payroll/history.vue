<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">Payroll History</h1>
        <p class="text-sm text-gray-400">{{ filtered.length }} records</p>
      </div>
      <NuxtLink to="/hr/payroll" class="btn-secondary text-sm">← Back to Payroll</NuxtLink>
    </div>

    <div class="flex flex-wrap gap-3">
      <input v-model="search" placeholder="Search employee…" class="input-field w-48 text-sm" />
      <select v-model="filterStatus" class="input-field text-sm">
        <option value="">All Status</option>
        <option value="pending_approval">Pending</option>
        <option value="approved">Approved</option>
        <option value="paid">Paid</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Pay Period</th>
              <th class="th text-right">Gross</th>
              <th class="th text-right">Deductions</th>
              <th class="th text-right text-green-400">Net</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Payslip</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id" class="tr">
              <td class="td">
                <p class="font-medium text-gray-200">{{ p.first_name }} {{ p.last_name }}</p>
                <p class="text-xs text-gray-500">{{ p.position_name }}</p>
              </td>
              <td class="td text-gray-400 text-xs">
                {{ fmtDate(p.pay_period_start) }} – {{ fmtDate(p.pay_period_end) }}
              </td>
              <td class="td text-right text-gray-300">৳{{ fmt(p.gross_salary) }}</td>
              <td class="td text-right text-red-400">৳{{ fmt(p.deductions) }}</td>
              <td class="td text-right font-semibold text-green-400">৳{{ fmt(p.net_salary) }}</td>
              <td class="td text-center">
                <span :class="statusBadge(p.status)" class="badge">{{ p.status }}</span>
              </td>
              <td class="td text-right">
                <NuxtLink :to="`/hr/payslip/${p.id}`" class="btn-xs">View</NuxtLink>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="td text-center text-gray-500 py-10">No records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data } = await useFetch('/api/hr/payroll', { query: { view: 'history' } })
const payrolls = computed(() => (data.value as any)?.payrolls ?? [])

const search       = ref('')
const filterStatus = ref('')

const filtered = computed(() => payrolls.value.filter((p: any) => {
  const q = search.value.toLowerCase()
  return (!q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q))
      && (!filterStatus.value || p.status === filterStatus.value)
}))

const fmt     = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const statusBadge = (s: string) => ({
  pending_approval: 'badge-yellow',
  approved:         'badge-blue',
  paid:             'badge-green',
  rejected:         'badge-red',
} as Record<string, string>)[s] || 'badge-gray'
</script>
