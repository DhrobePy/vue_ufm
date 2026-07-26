<template>
  <div class="space-y-6 max-w-3xl">
    <UiPageHeader :title="loan?.loan_number ?? 'Loan'" :subtitle="loan ? `${borrowerName} · ৳${Number(loan.principal_amount).toLocaleString()}` : ''"
                  :breadcrumb="['Loans', loan?.loan_number ?? '…']" />

    <div v-if="loan" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="glass-card p-5 space-y-2 text-xs">
        <h3 class="section-title mb-2">Details</h3>
        <div v-for="row in detailRows" :key="row[0]" class="flex justify-between py-1 border-b border-white/[0.03]">
          <span class="text-gray-500">{{ row[0] }}</span><span class="text-gray-200 font-medium">{{ row[1] }}</span>
        </div>
        <div v-if="isAdminUser && Number(loan.amount_repaid) <= 0.005" class="pt-3">
          <button @click="deleteLoan" class="btn-ghost text-xs text-red-400">🗑 Delete Loan</button>
        </div>
      </div>

      <div class="glass-card p-5 space-y-3 text-xs">
        <h3 class="section-title mb-1">Balance</h3>
        <div class="grid grid-cols-3 gap-2">
          <div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">Principal</p>
            <p class="font-bold font-mono text-gray-200">৳{{ Number(loan.principal_amount).toLocaleString() }}</p></div>
          <div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">Repaid</p>
            <p class="font-bold font-mono text-emerald-400">৳{{ Number(loan.amount_repaid).toLocaleString() }}</p></div>
          <div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">Due</p>
            <p class="font-bold font-mono text-orange-400">৳{{ Number(loan.balance_due).toLocaleString() }}</p></div>
        </div>
        <div v-if="jeLines.length" class="pt-1">
          <p class="text-[10px] text-gray-600 uppercase font-semibold mb-1">Disbursement Journal</p>
          <div v-for="(l, i) in jeLines" :key="i" class="flex justify-between py-0.5 font-mono text-[11px]">
            <span class="text-gray-400">{{ l.account_name }}</span>
            <span class="text-gray-300">{{ Number(l.debit_amount) > 0 ? `Dr ৳${Number(l.debit_amount).toLocaleString()}` : `Cr ৳${Number(l.credit_amount).toLocaleString()}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Repay -->
    <div v-if="loan && loan.status === 'active'" class="glass-card p-5 space-y-3">
      <h3 class="section-title">Record Repayment</h3>
      <div class="flex flex-wrap items-end gap-3">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount</label>
          <input v-model.number="repay.amount" type="number" step="any" class="input-glass text-xs font-mono w-32" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Method</label>
          <select v-model="repay.method" class="input-glass text-xs w-36">
            <option v-for="m in ['Cash','Bank Transfer','Cheque','Mobile Banking']" :key="m" :value="m">{{ m }}</option>
          </select></div>
        <div v-if="repay.method === 'Cash'" class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Petty Cash</label>
          <UiSearchSelect v-model="repay.cashAccountId" :options="cashAccountOptions" placeholder="Cash box…" /></div>
        <div v-else class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Bank Account</label>
          <UiSearchSelect v-model="repay.bankAccountId" :options="bankAccountOptions" placeholder="Bank account…" /></div>
        <button @click="doRepay" :disabled="!(repay.amount > 0) || repaying" class="btn-gold text-xs py-2 disabled:opacity-50">
          {{ repaying ? 'Posting…' : 'Record Repayment' }}
        </button>
      </div>
    </div>

    <!-- Repayment history -->
    <div v-if="repayments.length" class="glass-card p-5">
      <h3 class="section-title mb-3">Repayment History</h3>
      <div v-for="r in repayments" :key="r.id" class="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.03]">
        <span class="font-mono text-gold-400">{{ r.repayment_number }}</span>
        <span class="text-gray-400">{{ String(r.repayment_date).slice(0, 10) }}</span>
        <span class="text-gray-400">{{ r.payment_method }}</span>
        <span class="flex-1" />
        <span class="font-mono text-emerald-400">৳{{ Number(r.amount).toLocaleString() }}</span>
        <button v-if="isAdminUser" @click="reverseRepayment(r)" class="btn-ghost text-[10px] py-0.5 text-red-400">Reverse</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const loanId = computed(() => Number(route.params.id))
const [{ data, refresh }, { data: bankData }, { data: pettyData }] = await Promise.all([
  useFetch(() => `/api/loans/${loanId.value}`),
  useFetch('/api/lookup/bank-accounts'),
  useFetch('/api/lookup/cash-accounts'),
])

const loan       = computed<any>(() => (data.value as any)?.loan ?? null)
const jeLines    = computed<any[]>(() => (data.value as any)?.je_lines ?? [])
const repayments = computed<any[]>(() => (data.value as any)?.repayments ?? [])
const borrowerName = computed(() => loan.value?.customer_name ?? loan.value?.supplier_name ?? '—')

const detailRows = computed(() => loan.value ? [
  ['Borrower', `${borrowerName.value} (${loan.value.customer_name ? 'Customer' : 'Supplier'})`],
  ['Loan Date', String(loan.value.loan_date).slice(0, 10)],
  ['Expected Return', loan.value.expected_return_date ? String(loan.value.expected_return_date).slice(0, 10) : '—'],
  ['Method', loan.value.payment_method],
  ['Purpose', loan.value.purpose ?? '—'],
  ['Status', loan.value.status],
  ['Disbursed by', loan.value.created_by ?? '—'],
] : [])

const bankAccountOptions = computed(() => (((bankData.value as any)?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: `${a.bank_name} — AC: ${a.account_number}`, sub: a.branch_name || '' })))
const cashAccountOptions = computed(() => (((pettyData.value as any)?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: a.account_name, sub: a.branch_name || 'Head Office' })))

const repay = reactive({ amount: 0, method: 'Cash', bankAccountId: '' as any, cashAccountId: '' as any })
const repaying = ref(false)
async function doRepay() {
  repaying.value = true
  try {
    const res: any = await $fetch(`/api/loans/${loanId.value}/repay`, {
      method: 'POST',
      body: {
        amount: repay.amount, payment_method: repay.method,
        bank_account_id: repay.bankAccountId || undefined,
        cash_account_id: repay.cashAccountId || undefined,
      },
    })
    success(res.queued ? (res.message ?? 'Repayment queued') : `${res.repayment_number} posted ✓${res.closed ? ' — loan fully repaid & closed' : ''}`)
    repay.amount = 0
    await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Repayment failed') }
  finally { repaying.value = false }
}

async function reverseRepayment(r: any) {
  const reason = prompt(`Reverse ${r.repayment_number} (৳${Number(r.amount).toLocaleString()})? Reason:`)
  if (!reason?.trim()) return
  try {
    await $fetch(`/api/loans/repayments/${r.id}`, { method: 'DELETE', body: { reason } })
    success('Repayment reversed — restorable from Recycle Bin')
    await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Reverse failed') }
}

async function deleteLoan() {
  const reason = prompt(`Delete ${loan.value.loan_number}? Money returns to source (restorable). Reason:`)
  if (!reason?.trim()) return
  try {
    await $fetch(`/api/loans/${loanId.value}`, { method: 'DELETE', body: { reason } })
    success('Loan deleted — restorable from Recycle Bin')
    navigateTo('/loans')
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Delete failed') }
}
</script>
