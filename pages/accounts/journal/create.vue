<template>
  <div class="space-y-6">
    <UiPageHeader title="New Journal Entry" subtitle="Post a double-entry transaction to the general ledger"
                  :breadcrumb="['Accounts', 'Journal', 'New Entry']">
      <template #actions>
        <NuxtLink to="/accounts/journal" class="btn-ghost text-xs">← All Entries</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="glass-card p-6 space-y-6">
      <!-- Header fields -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry Date *</label>
          <input v-model="form.date" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference</label>
          <input v-model="form.reference" type="text" class="input-glass font-mono" placeholder="Auto-generated if blank" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry Type</label>
          <select v-model="form.type" class="input-glass">
            <option value="general">General Journal</option>
            <option value="adjustment">Adjustment</option>
            <option value="opening">Opening Balance</option>
            <option value="closing">Closing Entry</option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description / Narration *</label>
        <input v-model="form.description" type="text" class="input-glass" placeholder="Describe the transaction…" />
      </div>

      <!-- Journal lines -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-300">Journal Lines</h3>
          <button @click="addLine" class="text-xs px-3 py-1 rounded-lg border border-white/10 text-gray-400 hover:text-gold-400 hover:border-gold-500/40 transition-all">+ Add Line</button>
        </div>

        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[35%]">Account</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider w-32">Debit (৳)</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider w-32">Credit (৳)</th>
              <th class="pb-2 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-for="(line, i) in form.lines" :key="i">
              <td class="py-2 px-3">
                <select v-model="line.account_id" class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50">
                  <option value="">— Select account —</option>
                  <optgroup v-for="g in accountGroups" :key="g.label" :label="g.label">
                    <option v-for="a in g.accounts" :key="a.id" :value="a.id">{{ a.code }} — {{ a.name }}</option>
                  </optgroup>
                </select>
              </td>
              <td class="py-2 px-3">
                <input v-model="line.description" type="text" placeholder="Optional…"
                       class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </td>
              <td class="py-2 px-3">
                <input v-model.number="line.debit" type="number" min="0"
                       class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right font-mono text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                       @input="onDebitInput(line)" />
              </td>
              <td class="py-2 px-3">
                <input v-model.number="line.credit" type="number" min="0"
                       class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                       @input="onCreditInput(line)" />
              </td>
              <td class="py-2 px-3 text-center">
                <button v-if="form.lines.length > 2" @click="removeLine(i)"
                        class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all mx-auto">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t border-white/[0.08]">
            <tr>
              <td colspan="2" class="pt-3 px-3 text-right text-gray-600 font-semibold">Totals</td>
              <td class="pt-3 px-3 text-right font-bold font-mono text-red-400">৳{{ totalDebits.toLocaleString() }}</td>
              <td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400">৳{{ totalCredits.toLocaleString() }}</td>
              <td />
            </tr>
            <tr v-if="!isBalanced">
              <td colspan="5" class="pt-1 px-3 text-right text-xs text-red-400">⚠ Difference: ৳{{ Math.abs(totalDebits - totalCredits).toLocaleString() }} — must balance before posting</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
        <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ saving ? 'Posting…' : 'Post Entry' }}
        </button>
        <button @click="saveDraft" class="btn-ghost">Save Draft</button>
        <NuxtLink to="/accounts/journal" class="btn-ghost text-gray-500">Cancel</NuxtLink>
        <div v-if="isBalanced && form.lines.some(l=>l.account_id)" class="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Balanced
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error, warning } = useToast()

// Fetch real COA accounts
const { data: coaData } = await useFetch('/api/accounts/coa')
const allAccounts = computed(() => (coaData.value as any)?.accounts ?? [])

// Group accounts by account_type_group for <optgroup>
const accountGroups = computed(() => {
  const groups: Record<string, { id: number; code: string; name: string }[]> = {}
  for (const a of allAccounts.value) {
    const g = a.account_type_group ?? 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push({ id: a.id, code: a.account_number, name: a.name })
  }
  return Object.entries(groups).map(([label, accounts]) => ({ label, accounts }))
})

const form = reactive({
  date:        new Date().toISOString().slice(0, 10),
  reference:   '',
  type:        'general',
  description: '',
  lines: [
    { account_id: '' as number | string, description: '', debit: 0, credit: 0 },
    { account_id: '' as number | string, description: '', debit: 0, credit: 0 },
  ]
})

const saving = ref(false)

const totalDebits  = computed(() => form.lines.reduce((s, l) => s + (Number(l.debit)  || 0), 0))
const totalCredits = computed(() => form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0))
const isBalanced   = computed(() => totalDebits.value > 0 && Math.abs(totalDebits.value - totalCredits.value) < 0.01)

const isValid = computed(() =>
  form.description &&
  form.date &&
  isBalanced.value &&
  form.lines.every(l => l.account_id)
)

function addLine() {
  form.lines.push({ account_id: '', description: '', debit: 0, credit: 0 })
}

function removeLine(i: number) {
  form.lines.splice(i, 1)
}

function onDebitInput(line: any) {
  if (line.debit) line.credit = 0
}

function onCreditInput(line: any) {
  if (line.credit) line.debit = 0
}

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/accounts/journal', {
      method: 'POST',
      body: {
        transaction_date: form.date,
        description:      form.description,
        entry_type:       form.type,
        lines: form.lines.map(l => ({
          account_id:    Number(l.account_id),
          debit_amount:  Number(l.debit)  || 0,
          credit_amount: Number(l.credit) || 0,
          description:   l.description || null,
        })),
      },
    })
    success('Journal entry posted successfully')
    navigateTo('/accounts/journal')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to post journal entry')
  } finally {
    saving.value = false
  }
}

async function saveDraft() {
  warning('Draft saved — remember to post before the period closes')
}
</script>
