<template>
  <div class="space-y-6">
    <HubTabs hub="accounts" />
    <UiPageHeader title="Account Transfer" subtitle="Transfer between ledger accounts"
                  :breadcrumb="['Accounts', 'Transfer']">
      <template #actions>
        <NuxtLink to="/accounts/journal/create" class="btn-ghost text-xs">← Use Journal Entry</NuxtLink>
      </template>
    </UiPageHeader>
    <!-- Redirect hint — this module uses the bank transfer page for bank accounts -->
    <div class="glass-card p-6 space-y-4">
      <h3 class="section-title">Ledger Account Transfer</h3>
      <p class="text-sm text-gray-400">Use this form to transfer a balance between two ledger accounts (e.g. re-classify an expense or move a prepayment).</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Account * <span class="normal-case text-gray-600">(money leaves)</span></label>
          <select v-model="form.from" class="input-glass">
            <option value="">— Select —</option>
            <optgroup v-for="g in accountGroups" :key="g.label" :label="g.label">
              <option v-for="a in g.accounts" :key="a.id" :value="a.id">{{ a.account_number }} — {{ a.name }}</option>
            </optgroup>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Account * <span class="normal-case text-gray-600">(money arrives)</span></label>
          <select v-model="form.to" class="input-glass">
            <option value="">— Select —</option>
            <optgroup v-for="g in accountGroups" :key="g.label" :label="g.label">
              <option v-for="a in g.accounts" :key="a.id" :value="a.id">{{ a.account_number }} — {{ a.name }}</option>
            </optgroup>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (৳) *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
            <input v-model.number="form.amount" type="number" min="1" class="input-glass pl-8 font-mono font-bold" placeholder="0" />
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date *</label>
          <input v-model="form.date" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Responsible Employee *</label>
          <select v-model="form.employee" class="input-glass mb-3">
            <option value="">— Select employee —</option>
            <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Narration *</label>
          <input v-model="form.narration" type="text" class="input-glass" placeholder="Reason for transfer / re-classification" />
        </div>
      </div>
      <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
        <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
          {{ saving ? 'Posting…' : 'Post Transfer' }}
        </button>
        <NuxtLink to="/accounts" class="btn-ghost">Cancel</NuxtLink>
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

const accountGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const a of allAccounts.value) {
    const g = a.account_type_group ?? 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(a)
  }
  return Object.entries(groups).map(([label, accounts]) => ({ label, accounts }))
})

const form = reactive({
  from:     '' as number | string,
  to:       '' as number | string,
  amount:   null as number | null,
  date:     new Date().toISOString().slice(0, 10),
  narration: '',
  employee:  '' as number | string,
})
const { data: empData } = await useFetch('/api/accounts/transfer')
const employees = computed(() => (empData.value as any)?.employees ?? [])
const saving = ref(false)

const isValid = computed(() =>
  form.from && form.to && form.from !== form.to &&
  form.amount && form.amount > 0 && form.narration && form.employee
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/accounts/transfer', {
      method: 'POST',
      body: { from_account_id: Number(form.from), to_account_id: Number(form.to), amount: form.amount, transfer_date: form.date, memo: form.narration, responsible_employee_id: Number(form.employee) },
    })
    success('Account transfer posted successfully')
    navigateTo('/accounts')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to post transfer')
  } finally {
    saving.value = false
  }
}
</script>
