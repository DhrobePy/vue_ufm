<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">Payroll</h1>
        <p class="text-sm text-gray-400">Prepare · Approve · Disburse</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/hr/payroll/history" class="btn-secondary text-sm">History</NuxtLink>
        <button @click="showPrepare = true" class="btn-primary flex items-center gap-2">
          <span>+</span> Prepare Payroll
        </button>
      </div>
    </div>

    <!-- Pending payrolls table -->
    <div v-if="payrolls.length" class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-200">
          Pending Approval — {{ payrolls.length }} records
        </h2>
        <div class="flex gap-2">
          <button @click="selectAll = !selectAll" class="btn-xs btn-secondary">
            {{ selectAll ? 'Deselect All' : 'Select All' }}
          </button>
          <button v-if="selected.length" @click="bulkApprove" :disabled="acting" class="btn-xs badge-green text-xs px-2 py-1 rounded">
            Approve {{ selected.length }} ✓
          </button>
          <button v-if="selected.length" @click="bulkReject" :disabled="acting" class="btn-xs badge-red text-xs px-2 py-1 rounded">
            Reject {{ selected.length }}
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th w-8"><input type="checkbox" v-model="selectAll" class="accent-current" /></th>
              <th class="th">Employee</th>
              <th class="th">Period</th>
              <th class="th text-right">Gross</th>
              <th class="th text-right">Absence Ded.</th>
              <th class="th text-right">Advance Ded.</th>
              <th class="th text-right">Loan Ded.</th>
              <th class="th text-right text-green-400">Net Salary</th>
              <th class="th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="p in payrolls" :key="p.id">
              <tr class="tr">
                <td class="td">
                  <input type="checkbox" :value="p.id" v-model="selected" class="accent-current" />
                </td>
                <td class="td">
                  <p class="font-medium text-gray-200">{{ p.first_name }} {{ p.last_name }}</p>
                  <p class="text-xs text-gray-500">{{ p.position_name }}</p>
                </td>
                <td class="td text-gray-400 text-xs">
                  {{ fmtDate(p.pay_period_start) }} – {{ fmtDate(p.pay_period_end) }}
                </td>
                <td class="td text-right text-gray-300">৳{{ fmt(p.gross_salary) }}</td>
                <td class="td text-right text-red-400">
                  {{ p.absent_days > 0 ? `৳${fmt(p.absence_deduction)} (${p.absent_days}d)` : '—' }}
                </td>
                <td class="td text-right text-red-400">
                  {{ Number(p.advance_deduction) > 0 ? `৳${fmt(p.advance_deduction)}` : '—' }}
                </td>
                <td class="td text-right text-red-400">
                  {{ Number(p.loan_deduction) > 0 ? `৳${fmt(p.loan_deduction)}` : '—' }}
                </td>
                <td class="td text-right font-semibold text-green-400">৳{{ fmt(p.net_salary) }}</td>
                <td class="td text-right">
                  <div class="flex justify-end gap-1">
                    <button @click="openEdit(p)" class="btn-xs">Edit</button>
                    <button @click="approveSingle(p.id)" :disabled="acting" class="btn-xs badge-green text-xs px-2 py-0.5 rounded">✓</button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot>
            <tr class="border-t border-white/[0.08]">
              <td colspan="7" class="td text-right text-sm font-semibold text-gray-300">Total Net:</td>
              <td class="td text-right font-bold text-green-400">
                ৳{{ fmt(payrolls.reduce((s: number, p: any) => s + Number(p.net_salary), 0)) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Approved payrolls ready for disburse -->
    <div v-if="approved.length" class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 class="text-sm font-semibold text-blue-400">Approved — Ready to Disburse ({{ approved.length }})</h2>
        <button @click="disburseAll" :disabled="acting" class="btn-primary text-sm">
          Disburse All ৳{{ fmt(approved.reduce((s: number, p: any) => s + Number(p.net_salary), 0)) }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Period</th>
              <th class="th text-right">Gross</th>
              <th class="th text-right">Deductions</th>
              <th class="th text-right text-green-400">Net</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in approved" :key="p.id" class="tr">
              <td class="td text-gray-200">{{ p.first_name }} {{ p.last_name }}</td>
              <td class="td text-gray-400 text-xs">{{ fmtDate(p.pay_period_start) }} – {{ fmtDate(p.pay_period_end) }}</td>
              <td class="td text-right text-gray-300">৳{{ fmt(p.gross_salary) }}</td>
              <td class="td text-right text-red-400">৳{{ fmt(p.deductions) }}</td>
              <td class="td text-right font-semibold text-green-400">৳{{ fmt(p.net_salary) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!payrolls.length && !approved.length" class="card p-12 text-center">
      <p class="text-gray-500 mb-4">No pending payrolls. Click "Prepare Payroll" to begin.</p>
      <NuxtLink to="/hr/payroll/history" class="btn-secondary text-sm">View History</NuxtLink>
    </div>

    <!-- Prepare Modal -->
    <Teleport to="body">
      <div v-if="showPrepare" class="modal-overlay" @click.self="showPrepare = false">
        <div class="modal-box w-full max-w-md">
          <h2 class="text-lg font-bold text-white mb-5">Prepare Payroll</h2>
          <form @submit.prevent="preparePayroll" class="space-y-4">
            <div>
              <label class="label">Pay Period Start *</label>
              <input v-model="pForm.start" type="date" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Pay Period End *</label>
              <input v-model="pForm.end" type="date" required class="input-field w-full" />
            </div>
            <p class="text-xs text-gray-500">
              This will prepare payrolls for all active employees, auto-calculating
              absence deductions, approved advances, and fixed loan installments.
            </p>
            <div v-if="prepareErr" class="rounded-lg p-3 text-sm text-red-400 bg-red-500/10">{{ prepareErr }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showPrepare = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="preparing" class="btn-primary">
                {{ preparing ? 'Preparing…' : 'Prepare' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Edit Single Payroll Modal -->
    <Teleport to="body">
      <div v-if="editPayroll" class="modal-overlay" @click.self="editPayroll = null">
        <div class="modal-box w-full max-w-lg">
          <h2 class="text-lg font-bold text-white mb-1">Edit Payroll</h2>
          <p class="text-sm text-gray-400 mb-5">{{ editPayroll.first_name }} {{ editPayroll.last_name }}</p>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Gross Salary</label>
                <input v-model.number="eForm.gross_salary" type="number" class="input-field w-full" @input="calcNet" />
              </div>
              <div>
                <label class="label">Absence Deduction</label>
                <input v-model.number="eForm.absence_deduction" type="number" class="input-field w-full" @input="calcNet" />
              </div>
              <div>
                <label class="label">Advance Deduction</label>
                <input v-model.number="eForm.advance_deduction" type="number" class="input-field w-full" @input="calcNet" />
              </div>
              <div>
                <label class="label">Loan Deduction</label>
                <input v-model.number="eForm.loan_deduction" type="number" class="input-field w-full" @input="calcNet" />
              </div>
              <div v-if="editPayroll.random_loan_id">
                <label class="label">Random Loan Repayment</label>
                <input v-model.number="eForm.other_loan_repayment" type="number" class="input-field w-full" @input="calcNet" />
                <p class="text-xs text-gray-500 mt-1">Balance: ৳{{ fmt(editPayroll.random_loan_balance) }}</p>
              </div>
            </div>
            <div class="rounded-lg p-3 flex justify-between" style="background: rgba(var(--accent-glow),0.06)">
              <span class="text-sm text-gray-400">Net Salary</span>
              <span class="font-bold text-green-400">৳{{ fmt(eNetSalary) }}</span>
            </div>
            <div class="flex justify-end gap-3">
              <button @click="editPayroll = null" class="btn-secondary">Cancel</button>
              <button @click="saveEdit" :disabled="acting" class="btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: pendingData, refresh: refreshPending } = await useFetch('/api/hr/payroll', { query: { view: 'pending' } })
const { data: approvedData, refresh: refreshApproved } = await useFetch('/api/hr/payroll', {
  query: { view: 'approved' },
})

const payrolls = computed(() => (pendingData.value as any)?.payrolls ?? [])
const approved = computed(() => (approvedData.value as any)?.payrolls ?? [])

const selected  = ref<number[]>([])
const selectAll = computed({
  get: () => payrolls.value.length > 0 && selected.value.length === payrolls.value.length,
  set: (v: boolean) => { selected.value = v ? payrolls.value.map((p: any) => p.id) : [] },
})

const acting = ref(false)

async function bulkApprove() {
  if (!selected.value.length) return
  acting.value = true
  try {
    await $fetch('/api/hr/payroll', { method: 'POST', body: { action: 'approve', payroll_ids: selected.value } })
    selected.value = []
    await Promise.all([refreshPending(), refreshApproved()])
  } finally { acting.value = false }
}

async function bulkReject() {
  if (!selected.value.length || !confirm('Reject selected payrolls?')) return
  acting.value = true
  try {
    await $fetch('/api/hr/payroll', { method: 'POST', body: { action: 'reject', payroll_ids: selected.value } })
    selected.value = []
    await Promise.all([refreshPending(), refreshApproved()])
  } finally { acting.value = false }
}

async function approveSingle(id: number) {
  acting.value = true
  try {
    await $fetch('/api/hr/payroll', { method: 'POST', body: { action: 'approve', payroll_ids: [id] } })
    await Promise.all([refreshPending(), refreshApproved()])
  } finally { acting.value = false }
}

async function disburseAll() {
  if (!approved.value.length || !confirm(`Pay ${approved.value.length} payrolls?`)) return
  acting.value = true
  try {
    await $fetch('/api/hr/payroll', {
      method: 'POST',
      body: { action: 'pay', payroll_ids: approved.value.map((p: any) => p.id) },
    })
    await Promise.all([refreshPending(), refreshApproved()])
  } finally { acting.value = false }
}

// ── Prepare ──
const showPrepare = ref(false)
const preparing   = ref(false)
const prepareErr  = ref('')
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
const lastDay  = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)
const pForm = ref({ start: firstDay, end: lastDay })

async function preparePayroll() {
  preparing.value = true
  prepareErr.value = ''
  try {
    const res = await $fetch<any>('/api/hr/payroll', {
      method: 'POST',
      body: { action: 'prepare', pay_period_start: pForm.value.start, pay_period_end: pForm.value.end },
    })
    showPrepare.value = false
    await Promise.all([refreshPending(), refreshApproved()])
  } catch (e: any) {
    prepareErr.value = e?.data?.statusMessage || 'Failed to prepare payroll.'
  } finally { preparing.value = false }
}

// ── Edit single ──
const editPayroll = ref<any>(null)
const eForm = ref({ gross_salary: 0, absence_deduction: 0, advance_deduction: 0, loan_deduction: 0, other_loan_repayment: 0 })
const eNetSalary = ref(0)

function openEdit(p: any) {
  editPayroll.value = p
  eForm.value = {
    gross_salary:         Number(p.gross_salary),
    absence_deduction:    Number(p.absence_deduction),
    advance_deduction:    Number(p.advance_deduction),
    loan_deduction:       Number(p.loan_deduction),
    other_loan_repayment: 0,
  }
  calcNet()
}

function calcNet() {
  const f = eForm.value
  eNetSalary.value = Math.max(0, f.gross_salary - f.absence_deduction - f.advance_deduction - f.loan_deduction - f.other_loan_repayment)
}

async function saveEdit() {
  acting.value = true
  try {
    await $fetch('/api/hr/payroll', {
      method: 'POST',
      body: {
        action: 'update_record',
        payroll_id: editPayroll.value.id,
        random_loan_id: editPayroll.value.random_loan_id,
        ...eForm.value,
      },
    })
    editPayroll.value = null
    await refreshPending()
  } finally { acting.value = false }
}

const fmt     = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
</script>
