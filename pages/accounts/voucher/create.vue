<template>
  <div class="space-y-6">
    <UiPageHeader title="New Debit Voucher" subtitle="Authorise a cash / bank payment"
                  :breadcrumb="['Accounts', 'Voucher', 'New']">
      <template #actions>
        <NuxtLink to="/accounts/voucher" class="btn-ghost text-xs">← All Vouchers</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 space-y-5">
        <h3 class="section-title">Voucher Details</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Voucher Date *</label>
            <input v-model="form.date" type="date" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label>
            <select v-model="form.method" class="input-glass">
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer / Cheque</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pay To *</label>
          <input v-model="form.payTo" type="text" class="input-glass" placeholder="Payee name or company" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expense Account *</label>
            <select v-model="form.expense_account_id" class="input-glass">
              <option value="">— Select expense account —</option>
              <optgroup v-for="g in expenseAccountGroups" :key="g.label" :label="g.label">
                <option v-for="a in g.accounts" :key="a.id" :value="a.id">{{ a.account_number }} — {{ a.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Account (Bank/Cash) *</label>
            <select v-model="form.payment_account_id" class="input-glass">
              <option value="">— Select payment account —</option>
              <option v-for="a in paymentAccounts" :key="a.id" :value="a.id">{{ a.account_number }} — {{ a.name }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (৳) *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
            <input v-model.number="form.amount" type="number" min="1" class="input-glass pl-8 font-mono text-lg font-bold" placeholder="0" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purpose / Narration *</label>
          <textarea v-model="form.purpose" rows="3" class="input-glass resize-none" placeholder="Describe what this payment is for…" />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cheque / Reference No.</label>
          <input v-model="form.reference_number" type="text" class="input-glass font-mono" placeholder="Cheque #, BEFTN ref., or bill number" />
        </div>

        <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Creating…' : 'Create Voucher' }}
          </button>
          <NuxtLink to="/accounts/voucher" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Preview -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="text-sm font-semibold text-gray-300">Voucher Preview</h3>
        <div class="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3 text-xs">
          <div class="text-center border-b border-white/[0.06] pb-3">
            <p class="font-bold text-gray-200 text-sm">DEBIT VOUCHER</p>
            <p class="text-gray-500 mt-0.5">Ujjal Flour Mills Company</p>
          </div>
          <div class="space-y-1.5">
            <div class="flex justify-between"><span class="text-gray-600">Date</span><span class="text-gray-300">{{ form.date || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Pay To</span><span class="text-gray-300">{{ form.payTo || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Method</span><span class="text-gray-300 capitalize">{{ form.method }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Ref.</span><span class="text-gray-300 font-mono">{{ form.reference_number || '—' }}</span></div>
          </div>
          <div class="border-t border-white/[0.06] pt-3">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-300">Amount</span>
              <span class="text-lg font-bold font-mono text-gold-400">৳{{ (form.amount || 0).toLocaleString() }}</span>
            </div>
          </div>
          <div class="border-t border-white/[0.06] pt-3 space-y-3">
            <div class="flex justify-between text-[11px] text-gray-600">
              <div class="text-center">
                <div class="h-8 border-b border-dashed border-white/20 w-20" />
                <p class="mt-1">Prepared by</p>
              </div>
              <div class="text-center">
                <div class="h-8 border-b border-dashed border-white/20 w-20" />
                <p class="mt-1">Approved by</p>
              </div>
              <div class="text-center">
                <div class="h-8 border-b border-dashed border-white/20 w-20" />
                <p class="mt-1">Received by</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

// Fetch real COA accounts
const { data: coaData } = await useFetch('/api/accounts/coa')
const allAccounts = computed(() => (coaData.value as any)?.accounts ?? [])

// Expense accounts: Expense group
const expenseAccountGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const a of allAccounts.value) {
    if (!['Expense', 'Liability'].includes(a.account_type_group ?? '')) continue
    const g = a.account_type_group ?? 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(a)
  }
  return Object.entries(groups).map(([label, accounts]) => ({ label, accounts }))
})

// Payment accounts: Asset group (cash + banks)
const paymentAccounts = computed(() =>
  allAccounts.value.filter((a: any) => a.account_type_group === 'Asset')
)

const form = reactive({
  date:               new Date().toISOString().slice(0, 10),
  method:             'cash',
  payTo:              '',
  expense_account_id: '' as number | string,
  payment_account_id: '' as number | string,
  amount:             null as number | null,
  purpose:            '',
  reference_number:   '',
})

const saving = ref(false)

const isValid = computed(() =>
  form.date && form.payTo && form.expense_account_id && form.payment_account_id &&
  form.amount && form.amount > 0 && form.purpose
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const result: any = await $fetch('/api/accounts/vouchers', {
      method: 'POST',
      body: {
        voucher_date:        form.date,
        expense_account_id:  Number(form.expense_account_id),
        payment_account_id:  Number(form.payment_account_id),
        amount:              form.amount,
        paid_to:             form.payTo,
        description:         form.purpose,
        reference_number:    form.reference_number || null,
      },
    })
    success(`Debit voucher ${result.voucher_number} created successfully`)
    navigateTo('/accounts/voucher')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to create voucher')
  } finally {
    saving.value = false
  }
}
</script>
