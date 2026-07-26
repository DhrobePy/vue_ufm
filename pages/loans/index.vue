<template>
  <div class="space-y-6">
    <UiPageHeader title="Loans & Advances" subtitle="Related-party cash advances — a separate balance from trading dues"
                  :breadcrumb="['Loans']" />

    <!-- Overdue banner -->
    <div v-if="Number(stats.overdue_count) > 0" class="rounded-xl p-3 text-xs text-red-300" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);">
      ⚠ {{ stats.overdue_count }} loan(s) past their expected return date with balance still due.
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Outstanding</p>
        <p class="text-lg font-bold text-orange-400 mt-1">৳{{ Number(stats.outstanding ?? 0).toLocaleString() }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Overdue Loans</p>
        <p class="text-lg font-bold text-red-400 mt-1">{{ stats.overdue_count ?? 0 }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Disbursed (MTD)</p>
        <p class="text-lg font-bold text-gray-200 mt-1">৳{{ Number(stats.disbursed_mtd ?? 0).toLocaleString() }}</p></div>
      <div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Repaid (MTD)</p>
        <p class="text-lg font-bold text-emerald-400 mt-1">৳{{ Number(stats.repaid_mtd ?? 0).toLocaleString() }}</p></div>
    </div>

    <!-- Disburse form -->
    <div class="glass-card p-6 space-y-4 max-w-4xl">
      <h3 class="section-title">Disburse a Loan</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-1.5 md:col-span-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrower * <span class="normal-case text-gray-600">(customer or supplier)</span></label>
          <UiSearchSelect v-model="form.borrower" :options="borrowerOptions" placeholder="Search customers + suppliers…" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount * (৳)</label>
          <input v-model.number="form.amount" type="number" min="0" step="any" class="input-glass font-mono" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Date</label>
          <input v-model="form.loanDate" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Return</label>
          <input v-model="form.expectedReturn" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</label>
          <select v-model="form.method" class="input-glass">
            <option v-for="m in ['Cash','Bank Transfer','Cheque','Mobile Banking']" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div v-if="form.method === 'Cash'" class="space-y-1.5 md:col-span-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Petty Cash Account *</label>
          <UiSearchSelect v-model="form.cashAccountId" :options="cashAccountOptions" placeholder="Cash box…" />
        </div>
        <div v-else class="space-y-1.5 md:col-span-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account *</label>
          <UiSearchSelect v-model="form.bankAccountId" :options="bankAccountOptions" placeholder="Bank account…" />
        </div>
        <div class="space-y-1.5 md:col-span-3">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</label>
          <input v-model="form.purpose" class="input-glass" placeholder="e.g. Tender participation funding…" />
        </div>
      </div>
      <div class="flex justify-end">
        <button @click="disburse" :disabled="!canSubmit || submitting" class="btn-gold text-xs disabled:opacity-50">
          {{ submitting ? 'Disbursing…' : 'Disburse Loan' }}
        </button>
      </div>
    </div>

    <!-- Loan history -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Loan History</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Loan #</th><th class="text-left pr-3">Borrower</th>
            <th class="text-left pr-3">Date</th><th class="text-left pr-3">Expected Return</th>
            <th class="text-right pr-3">Principal</th><th class="text-right pr-3">Repaid</th>
            <th class="text-right pr-3">Due</th><th class="text-left">Status</th>
          </tr></thead>
          <tbody>
            <tr v-for="l in loans" :key="l.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3"><NuxtLink :to="`/loans/${l.id}`" class="font-mono text-gold-400 hover:underline">{{ l.loan_number }}</NuxtLink></td>
              <td class="pr-3 text-gray-200">{{ l.customer_name ?? l.supplier_name }}
                <span class="text-gray-600 text-[10px]">({{ l.customer_name ? 'Customer' : 'Supplier' }})</span></td>
              <td class="pr-3 text-gray-400">{{ String(l.loan_date).slice(0, 10) }}</td>
              <td :class="['pr-3', l.is_overdue ? 'text-red-400 font-semibold' : 'text-gray-400']">
                {{ l.expected_return_date ? String(l.expected_return_date).slice(0, 10) : '—' }}{{ l.is_overdue ? ' ⚠' : '' }}</td>
              <td class="pr-3 text-right font-mono text-gray-200">৳{{ Number(l.principal_amount).toLocaleString() }}</td>
              <td class="pr-3 text-right font-mono text-emerald-400">৳{{ Number(l.amount_repaid).toLocaleString() }}</td>
              <td class="pr-3 text-right font-mono text-orange-400">৳{{ Number(l.balance_due).toLocaleString() }}</td>
              <td><UiStatusBadge :status="l.status" /></td>
            </tr>
            <tr v-if="!loans.length"><td colspan="8" class="py-6 text-center text-gray-600">No loans yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const [{ data, refresh }, { data: custData }, { data: suppData }, { data: bankData }, { data: pettyData }] = await Promise.all([
  useFetch('/api/loans'),
  useFetch('/api/customers', { query: { per: 500, simple: '1' } }),
  useFetch('/api/suppliers', { query: { per: 500 } }),
  useFetch('/api/lookup/bank-accounts'),
  useFetch('/api/lookup/cash-accounts'),
])

const loans = computed<any[]>(() => (data.value as any)?.loans ?? [])
const stats = computed<any>(() => (data.value as any)?.stats ?? {})

// Combined borrower search: customers + suppliers merged, tagged by kind
const borrowerOptions = computed(() => [
  ...(((custData.value as any)?.customers ?? []) as any[]).map((c: any) => ({
    value: `c:${c.id}`, label: c.name, sub: 'Customer' })),
  ...(((suppData.value as any)?.suppliers ?? []) as any[]).map((s: any) => ({
    value: `s:${s.id}`, label: s.company_name, sub: 'Supplier' })),
])
const bankAccountOptions = computed(() => (((bankData.value as any)?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: `${a.bank_name} — AC: ${a.account_number}`, sub: a.branch_name || '' })))
const cashAccountOptions = computed(() => (((pettyData.value as any)?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: a.account_name, sub: a.branch_name || 'Head Office' })))

const form = reactive({
  borrower: '' as string, amount: 0, loanDate: new Date().toISOString().slice(0, 10),
  expectedReturn: '', method: 'Cash', bankAccountId: '' as any, cashAccountId: '' as any, purpose: '',
})
const canSubmit = computed(() =>
  !!form.borrower && form.amount > 0 &&
  (form.method === 'Cash' ? !!form.cashAccountId : !!form.bankAccountId))

const submitting = ref(false)
async function disburse() {
  submitting.value = true
  try {
    const [kind, idStr] = String(form.borrower).split(':')
    const res: any = await $fetch('/api/loans', {
      method: 'POST',
      body: {
        customer_id: kind === 'c' ? Number(idStr) : undefined,
        supplier_id: kind === 's' ? Number(idStr) : undefined,
        amount: form.amount,
        loan_date: form.loanDate,
        expected_return_date: form.expectedReturn || undefined,
        payment_method: form.method,
        bank_account_id: form.bankAccountId || undefined,
        cash_account_id: form.cashAccountId || undefined,
        purpose: form.purpose || undefined,
      },
    })
    success(res.queued ? (res.message ?? 'Loan queued for approval') : `${res.loan_number} disbursed ✓`)
    Object.assign(form, { borrower: '', amount: 0, expectedReturn: '', purpose: '' })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Disbursement failed')
  } finally { submitting.value = false }
}
</script>
