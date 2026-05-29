<template>
  <div class="space-y-6">
    <UiPageHeader title="Inter-Bank Transfer" subtitle="Transfer funds between company bank accounts"
                  :breadcrumb="['Bank', 'Transfer']">
      <template #actions>
        <NuxtLink to="/bank" class="btn-ghost text-xs">← Bank Dashboard</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="acctPending" class="glass-card p-8 text-center text-xs text-gray-500">Loading accounts…</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">
        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">Transfer Details</h3>

          <!-- From account -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Account *</label>
            <select v-model="form.fromAccount" class="field-input">
              <option :value="null">— Select source account —</option>
              <option v-for="a in accounts" :key="a.id" :value="a.id">
                {{ a.bank_name }} — {{ a.account_name }} · Balance: ৳{{ Number(a.balance||0).toLocaleString() }}
              </option>
            </select>
            <p v-if="fromAccountData" class="text-xs text-gray-500">
              Available: <span class="font-semibold text-gray-300">৳{{ Number(fromAccountData.balance||0).toLocaleString() }}</span>
            </p>
          </div>

          <!-- Swap arrow -->
          <div class="flex justify-center">
            <button @click="swapAccounts"
                    class="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-500 hover:text-gold-400 hover:border-gold-500/40 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
          </div>

          <!-- To account -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Account *</label>
            <select v-model="form.toAccount" class="field-input">
              <option :value="null">— Select destination account —</option>
              <option v-for="a in accounts.filter((a: any) => a.id !== form.fromAccount)" :key="a.id" :value="a.id">
                {{ a.bank_name }} — {{ a.account_name }}
              </option>
            </select>
          </div>

          <!-- Amount -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
              <input v-model.number="form.amount" type="number" min="1" class="field-input pl-8 font-mono text-lg font-bold" placeholder="0" />
            </div>
            <p v-if="form.amount && fromAccountData && Number(form.amount) > Number(fromAccountData.balance||0)"
               class="text-xs text-red-400">⚠ Amount exceeds available balance</p>
          </div>

          <!-- Date & reference -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transfer Date *</label>
              <input v-model="form.date" type="date" class="field-input" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference No.</label>
              <input v-model="form.reference" type="text" class="field-input font-mono" placeholder="BEFTN / IFT ref." />
            </div>
          </div>

          <!-- Purpose -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purpose / Notes</label>
            <textarea v-model="form.notes" rows="3" class="field-input resize-none" placeholder="Why is this transfer being made?" />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button @click="submit" :disabled="!isValid || saving"
                    class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              {{ saving ? 'Processing…' : 'Submit Transfer' }}
            </button>
            <NuxtLink to="/bank" class="btn-ghost">Cancel</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <!-- Account balances -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Account Balances</h3>
          <div v-for="a in accounts" :key="a.id"
               class="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <div>
              <p class="text-xs font-medium text-gray-300">{{ a.bank_name }}</p>
              <p class="text-[11px] text-gray-600 font-mono">{{ a.account_number }}</p>
            </div>
            <span class="font-mono text-xs font-bold text-gray-200">৳{{ Number(a.balance||0).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="glass-card p-5 space-y-2 text-xs text-gray-500">
          <p class="font-semibold text-gray-400">Note</p>
          <p>Transfers are submitted for approval. Balances will update after a maker-checker approves the transaction.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const { data: acctData, pending: acctPending } = await useFetch('/api/bank/dashboard')
const accounts = computed(() => (acctData.value?.accounts ?? []) as any[])

const form = reactive({
  fromAccount: null as number | null,
  toAccount:   null as number | null,
  amount:      null as number | null,
  date:        new Date().toISOString().slice(0, 10),
  reference:   '',
  notes:       '',
})

const saving = ref(false)

const fromAccountData = computed(() =>
  form.fromAccount ? accounts.value.find((a: any) => a.id === form.fromAccount) ?? null : null,
)

const isValid = computed(() =>
  form.fromAccount &&
  form.toAccount &&
  form.fromAccount !== form.toAccount &&
  form.amount &&
  Number(form.amount) > 0 &&
  Number(form.amount) <= Number(fromAccountData.value?.balance || 0),
)

function swapAccounts() {
  const tmp        = form.fromAccount
  form.fromAccount = form.toAccount
  form.toAccount   = tmp
}

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/bank/transfer', {
      method: 'POST',
      body: {
        from_account_id:  form.fromAccount,
        to_account_id:    form.toAccount,
        amount:           form.amount,
        transfer_date:    form.date,
        reference_number: form.reference || undefined,
        notes:            form.notes     || undefined,
      },
    })
    success(`৳${(form.amount || 0).toLocaleString()} transfer submitted — awaiting approval`)
    navigateTo('/bank')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Transfer failed')
  } finally {
    saving.value = false
  }
}
</script>
