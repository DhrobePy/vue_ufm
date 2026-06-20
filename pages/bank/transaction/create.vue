<template>
  <div class="space-y-6 max-w-2xl">
    <UiPageHeader :title="editMode ? 'Edit Transaction' : 'New Bank Transaction'"
                  :subtitle="editMode ? `Editing: ${editTx?.transaction_number}` : 'Transaction will be submitted for maker-checker approval'"
                  :breadcrumb="['Bank', editMode ? 'Edit Transaction' : 'New Transaction']">
      <template #actions>
        <NuxtLink to="/bank" class="btn-ghost text-xs">← Back</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="loadingEdit" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>

    <div v-else class="glass-card p-6 space-y-5">
      <!-- Credit / Debit toggle -->
      <div v-if="!editMode" class="flex gap-3">
        <label v-for="t in ['credit','debit']" :key="t"
               :class="['flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all duration-150 text-sm font-semibold capitalize',
                 form.type===t
                   ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
                   : 'border-white/[0.08] text-gray-500 hover:border-white/[0.14]']">
          <input type="radio" v-model="form.type" :value="t" class="sr-only" />
          <span :class="['w-2 h-2 rounded-full', t==='credit' ? 'bg-emerald-400' : 'bg-red-400']" />
          {{ t === 'credit' ? 'Deposit (Credit)' : 'Withdrawal (Debit)' }}
        </label>
      </div>
      <div v-else class="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <span :class="['w-2.5 h-2.5 rounded-full', form.type==='credit' ? 'bg-emerald-400' : 'bg-red-400']" />
        <span class="text-sm font-semibold text-gray-300 capitalize">{{ form.type === 'credit' ? 'Deposit (Credit)' : 'Withdrawal (Debit)' }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Bank Account -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account *</label>
          <select v-model="form.accountId" class="field-input" :disabled="editMode">
            <option value="">Select account…</option>
            <option v-for="a in accounts" :key="a.id" :value="a.id">
              {{ a.bank_name }} — {{ a.account_name }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Date *</label>
          <input v-model="form.date" type="date" class="field-input" />
        </div>

        <!-- Amount -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (৳) *</label>
          <input v-model.number="form.amount" type="number" min="1" class="field-input text-lg font-bold" placeholder="0.00" />
        </div>

        <!-- Category -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
          <select v-model="form.category" class="field-input">
            <option value="receipt">Customer Receipt</option>
            <option value="payment">Supplier Payment</option>
            <option value="salary">Salary / Wages</option>
            <option value="utility">Utility / Bill</option>
            <option value="transfer">Internal Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Reference No. -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference No.</label>
          <input v-model="form.reference" class="field-input font-mono" placeholder="BEFTN / bKash TrxID" />
        </div>

        <!-- Cheque No. -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cheque No.</label>
          <input v-model="form.cheque_number" class="field-input font-mono" placeholder="Leave blank if not a cheque" />
        </div>

        <!-- Payee / Payer -->
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payee / Payer Name</label>
          <input v-model="form.payee_payer_name" class="field-input" placeholder="Who sent / received the funds" />
        </div>

        <!-- Description -->
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description *</label>
          <textarea v-model="form.description" rows="2" class="field-input resize-none"
                    placeholder="e.g. Customer payment — Rahim Traders" />
        </div>

        <!-- Notes / Special Note -->
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Note</label>
          <textarea v-model="form.notes" rows="2" class="field-input resize-none" placeholder="Internal remarks…" />
        </div>
      </div>

      <div v-if="!editMode" class="rounded-xl p-3.5" style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12);">
        <p class="text-xs text-gray-500">⚠ This transaction will be submitted for maker-checker approval before posting to the account balance.</p>
      </div>

      <div class="flex justify-end gap-3">
        <NuxtLink to="/bank" class="btn-ghost">Cancel</NuxtLink>
        <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50">
          <svg v-if="saving" class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ saving ? 'Saving…' : editMode ? 'Save Changes' : 'Submit Transaction' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const route = useRoute()

const editId   = route.query.edit ? Number(route.query.edit) : null
const editMode = !!editId
const editTx   = ref<any>(null)
const loadingEdit = ref(editMode)

const { data: acctData } = await useFetch('/api/bank/dashboard')
const accounts = computed(() => (acctData.value?.accounts ?? []) as any[])

const form = reactive({
  type:             'credit' as 'credit' | 'debit',
  accountId:        '' as any,
  date:             new Date().toISOString().slice(0, 10),
  amount:           null as number | null,
  category:         'receipt',
  reference:        '',
  cheque_number:    '',
  payee_payer_name: '',
  description:      '',
  notes:            '',
})

if (editMode) {
  try {
    const res = await $fetch(`/api/bank/transactions/${editId}`) as any
    editTx.value = res.transaction
    const t = res.transaction
    Object.assign(form, {
      type:             t.entry_type,
      accountId:        t.bank_tx_account_id,
      date:             String(t.transaction_date).slice(0, 10),
      amount:           Number(t.amount),
      reference:        t.reference_number || '',
      cheque_number:    t.cheque_number    || '',
      payee_payer_name: t.payee_payer_name || '',
      description:      t.description      || '',
      notes:            t.special_note     || '',
    })
  } catch (e: any) {
    toastError('Failed to load transaction')
  } finally {
    loadingEdit.value = false
  }
}

const saving = ref(false)

const isValid = computed(() =>
  form.accountId &&
  form.date &&
  form.amount &&
  Number(form.amount) > 0 &&
  form.description.trim(),
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    if (editMode) {
      await $fetch(`/api/bank/transactions/${editId}`, {
        method: 'PATCH',
        body: {
          action:           'update',
          transaction_date:  form.date,
          description:       form.description.trim(),
          amount:            form.amount,
          reference_number:  form.reference    || undefined,
          cheque_number:     form.cheque_number || undefined,
          payee_payer_name:  form.payee_payer_name || undefined,
          special_note:      form.notes         || undefined,
        },
      })
      success('Transaction updated ✓')
    } else {
      await $fetch('/api/bank/transactions', {
        method: 'POST',
        body: {
          bank_tx_account_id: Number(form.accountId),
          transaction_date:   form.date,
          description:        form.description.trim(),
          entry_type:         form.type,
          amount:             form.amount,
          reference_number:   form.reference        || undefined,
          cheque_number:      form.cheque_number     || undefined,
          payee_payer_name:   form.payee_payer_name  || undefined,
          special_note:       form.notes             || undefined,
        },
      })
      success('Transaction submitted — pending approval')
    }
    navigateTo('/bank')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed')
  } finally {
    saving.value = false
  }
}
</script>
