<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">Employee Loans</h1>
          <p class="text-sm text-gray-400">{{ loans.length }} loans</p>
        </div>
      </div>
      <button @click="showCreate = true" class="btn-primary flex items-center gap-2">
        <span>+</span> New Loan
      </button>
    </div>

    <!-- Status tabs -->
    <div class="flex gap-2">
      <button v-for="tab in ['', 'active', 'paid']" :key="tab"
        @click="filterStatus = tab; reload()"
        :class="['btn-xs', filterStatus === tab ? 'btn-primary' : 'btn-secondary']">
        {{ tab || 'All' }}
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Date</th>
              <th class="th text-right">Loan Amount</th>
              <th class="th text-right">Paid</th>
              <th class="th text-right">Balance</th>
              <th class="th text-center">Installments</th>
              <th class="th text-center">Type</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in loans" :key="loan.id" class="tr">
              <td class="td">
                <p class="font-medium text-gray-200">{{ loan.first_name }} {{ loan.last_name }}</p>
              </td>
              <td class="td text-gray-400">{{ fmtDate(loan.loan_date) }}</td>
              <td class="td text-right text-gray-300">৳{{ fmt(loan.amount) }}</td>
              <td class="td text-right text-green-400">৳{{ fmt(loan.paid_amount) }}</td>
              <td class="td text-right font-medium" :class="Number(loan.amount) - Number(loan.paid_amount) > 0 ? 'text-red-400' : 'text-green-400'">
                ৳{{ fmt(Math.max(0, Number(loan.amount) - Number(loan.paid_amount))) }}
              </td>
              <td class="td text-center text-gray-400">
                {{ loan.installments }}×৳{{ fmt(loan.monthly_payment) }}
              </td>
              <td class="td text-center">
                <span class="badge" :class="loan.installment_type === 'fixed' ? 'badge-blue' : 'badge-yellow'">
                  {{ loan.installment_type }}
                </span>
              </td>
              <td class="td text-center">
                <span :class="loan.status === 'active' ? 'badge-green' : 'badge-gray'" class="badge">{{ loan.status }}</span>
              </td>
              <td class="td text-right">
                <div class="flex justify-end gap-1">
                  <button v-if="loan.status === 'active' && loan.installment_type === 'random'"
                    @click="openInstallment(loan)" class="btn-xs">+ Payment</button>
                  <button v-if="loan.status === 'active'" @click="markPaid(loan.id)" class="btn-xs">Mark Paid</button>
                </div>
              </td>
            </tr>
            <tr v-if="!loans.length">
              <td colspan="9" class="td text-center text-gray-500 py-10">No loans found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Loan Modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-box w-full max-w-md">
          <h2 class="text-lg font-bold text-white mb-5">New Employee Loan</h2>
          <form @submit.prevent="createLoan" class="space-y-4">
            <div>
              <label class="label">Employee *</label>
              <select v-model="cForm.employee_id" required class="input-field w-full">
                <option value="">Select employee</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.first_name }} {{ e.last_name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Loan Amount (৳) *</label>
                <input v-model.number="cForm.amount" type="number" min="1" required class="input-field w-full" @input="calcMonthly" />
              </div>
              <div>
                <label class="label">No. of Installments *</label>
                <input v-model.number="cForm.installments" type="number" min="1" required class="input-field w-full" @input="calcMonthly" />
              </div>
            </div>
            <div>
              <label class="label">Monthly Payment (৳)</label>
              <input v-model.number="cForm.monthly_payment" type="number" min="0" class="input-field w-full" />
              <p class="text-xs text-gray-500 mt-1">Auto-calculated. Override if needed.</p>
            </div>
            <div>
              <label class="label">Installment Type</label>
              <select v-model="cForm.installment_type" class="input-field w-full">
                <option value="fixed">Fixed (auto-deducted each payroll)</option>
                <option value="random">Random (manual per payroll)</option>
              </select>
            </div>
            <div v-if="cErr" class="text-sm text-red-400">{{ cErr }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showCreate = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="cSaving" class="btn-primary">
                {{ cSaving ? 'Creating…' : 'Create Loan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add Installment Modal -->
    <Teleport to="body">
      <div v-if="installmentLoan" class="modal-overlay" @click.self="installmentLoan = null">
        <div class="modal-box w-full max-w-sm">
          <h2 class="text-lg font-bold text-white mb-1">Record Payment</h2>
          <p class="text-sm text-gray-400 mb-4">{{ installmentLoan.first_name }} {{ installmentLoan.last_name }} — Balance ৳{{ fmt(Math.max(0, Number(installmentLoan.amount) - Number(installmentLoan.paid_amount))) }}</p>
          <div class="space-y-4">
            <div>
              <label class="label">Amount (৳) *</label>
              <input v-model.number="iAmount" type="number" min="1" class="input-field w-full" />
            </div>
            <div class="flex justify-end gap-3">
              <button @click="installmentLoan = null" class="btn-secondary">Cancel</button>
              <button @click="addInstallment" :disabled="iSaving" class="btn-primary">
                {{ iSaving ? 'Saving…' : 'Record' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const filterStatus = ref('active')
const { data, refresh } = await useFetch('/api/hr/loans', {
  query: computed(() => filterStatus.value ? { status: filterStatus.value } : {}),
})
const loans     = computed(() => (data.value as any)?.loans     ?? [])
const employees = computed(() => (data.value as any)?.employees ?? [])

async function reload() { await refresh() }

async function markPaid(id: number) {
  if (!confirm('Mark this loan as fully paid?')) return
  await $fetch('/api/hr/loans', { method: 'POST', body: { action: 'mark_paid', id } })
  await refresh()
}

// ── Create Loan ──
const showCreate = ref(false)
const cSaving    = ref(false)
const cErr       = ref('')
const cForm = ref({ employee_id: '', amount: 0, installments: 12, monthly_payment: 0, installment_type: 'fixed' })

function calcMonthly() {
  if (cForm.value.amount > 0 && cForm.value.installments > 0)
    cForm.value.monthly_payment = Math.ceil(cForm.value.amount / cForm.value.installments)
}

async function createLoan() {
  cSaving.value = true; cErr.value = ''
  try {
    await $fetch('/api/hr/loans', { method: 'POST', body: { action: 'create', ...cForm.value } })
    showCreate.value = false
    await refresh()
  } catch (e: any) {
    cErr.value = e?.data?.statusMessage || 'Failed.'
  } finally { cSaving.value = false }
}

// ── Installment ──
const installmentLoan = ref<any>(null)
const iAmount = ref(0)
const iSaving = ref(false)

function openInstallment(loan: any) {
  installmentLoan.value = loan
  iAmount.value = Number(loan.monthly_payment)
}

async function addInstallment() {
  iSaving.value = true
  try {
    await $fetch('/api/hr/loans', {
      method: 'POST',
      body: { action: 'add_installment', loan_id: installmentLoan.value.id, amount: iAmount.value },
    })
    installmentLoan.value = null
    await refresh()
  } finally { iSaving.value = false }
}

const fmt = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
</script>
