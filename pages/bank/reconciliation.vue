<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank Reconciliation"
                  subtitle="Bank-module ledger vs. GL books for the same real-world account"
                  :breadcrumb="['Bank', 'Reconciliation']" />

    <!-- Account selector -->
    <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
      <select v-model="selectedAccount" class="field-input text-xs py-1.5 min-w-[280px]" @change="refresh">
        <option value="">— Select Bank Account —</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">
          {{ a.bank_name }} — {{ a.account_name }}
          <template v-if="a.account_number"> ({{ a.account_number }})</template>
        </option>
      </select>
      <label class="flex items-center gap-2 text-xs text-gray-400 ml-auto">
        <input type="checkbox" v-model="onlyUnreconciled" class="accent-gold-500" />
        Show unreconciled only
      </label>
    </div>

    <div v-if="!selectedAccount" class="glass-card p-14 text-center text-gray-500 text-sm space-y-2">
      <div class="text-4xl">⚖️</div>
      <p>Select a bank account above to reconcile it</p>
    </div>

    <div v-else-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Per Bank Module</p>
          <p class="text-xl font-bold text-gray-100">৳{{ Number(data?.bank_module_balance ?? 0).toLocaleString() }}</p>
          <p class="text-[10px] text-gray-600 mt-0.5">from bank_transactions entries</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Per GL Books</p>
          <p v-if="data?.glMatch" class="text-xl font-bold text-gray-100">৳{{ Number(data.glMatch.balance).toLocaleString() }}</p>
          <p v-else class="text-sm text-gray-600 mt-1.5">No GL-linked account matches this account number</p>
        </div>
        <div class="glass-card p-4" :class="varianceClass">
          <p class="text-xs text-gray-500 mb-1">Variance</p>
          <p v-if="data?.variance !== null" class="text-xl font-bold">
            {{ Number(data?.variance) === 0 ? '৳0 ✓' : `৳${Math.abs(Number(data?.variance)).toLocaleString()} ${Number(data?.variance) > 0 ? '(GL ahead)' : '(Bank ahead)'}` }}
          </p>
          <p v-else class="text-sm text-gray-600 mt-1.5">—</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Unreconciled</p>
          <p class="text-xl font-bold" :class="(data?.unreconciled_count ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'">
            {{ data?.unreconciled_count ?? 0 }}
          </p>
          <p class="text-[10px] text-gray-600 mt-0.5">
            net ৳{{ Number(data?.unreconciled_amount ?? 0).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Transaction list -->
      <div class="glass-card p-5">
        <div class="overflow-x-auto">
          <table class="w-full text-xs min-w-[720px]">
            <thead>
              <tr class="border-b border-white/[0.08]">
                <th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[100px]">Date</th>
                <th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
                <th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[110px]">Status</th>
                <th class="pb-2.5 px-3 text-right text-red-400/70 font-semibold uppercase tracking-wider w-[120px]">Debit</th>
                <th class="pb-2.5 px-3 text-right text-emerald-400/70 font-semibold uppercase tracking-wider w-[120px]">Credit</th>
                <th class="pb-2.5 px-3 text-right text-gray-400/70 font-semibold uppercase tracking-wider w-[130px]">Balance</th>
                <th class="pb-2.5 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider w-[110px]">Reconciled</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.03]">
              <tr v-if="!rows.length">
                <td colspan="7" class="py-10 text-center text-gray-600">No transactions found</td>
              </tr>
              <tr v-for="t in rows" :key="t.id" class="hover:bg-white/[0.025] transition-colors">
                <td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">{{ String(t.transaction_date).slice(0, 10) }}</td>
                <td class="py-2.5 px-3 text-gray-300 max-w-[280px]">
                  <span class="leading-snug">{{ t.description }}</span>
                  <span v-if="t.payee_payer_name" class="text-gray-600 text-[10px] block mt-0.5">{{ t.payee_payer_name }}</span>
                </td>
                <td class="py-2.5 px-3"><UiStatusBadge :status="t.status" /></td>
                <td class="py-2.5 px-3 text-right font-mono">
                  <span v-if="t.entry_type === 'debit'" class="text-red-400">৳{{ Number(t.amount).toLocaleString() }}</span>
                  <span v-else class="text-gray-700">—</span>
                </td>
                <td class="py-2.5 px-3 text-right font-mono">
                  <span v-if="t.entry_type === 'credit'" class="text-emerald-400">৳{{ Number(t.amount).toLocaleString() }}</span>
                  <span v-else class="text-gray-700">—</span>
                </td>
                <td class="py-2.5 px-3 text-right font-mono font-semibold text-gray-200">৳{{ Number(t.balance).toLocaleString() }}</td>
                <td class="py-2.5 px-3 text-center">
                  <button v-if="t.status === 'approved'" @click="toggle(t)" :disabled="togglingId === t.id"
                    :class="['px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors disabled:opacity-40',
                      t.reconciled_at ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'text-gray-500 border-white/[0.1] hover:border-white/[0.2]']">
                    {{ t.reconciled_at ? '✓ Cleared' : 'Mark Cleared' }}
                  </button>
                  <span v-else class="text-gray-700">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()

const selectedAccount  = ref(route.query.account ? Number(route.query.account) : '')
const onlyUnreconciled = ref(false)
const togglingId        = ref<number | null>(null)

const { data, pending, error, refresh } = await useFetch('/api/bank/reconciliation', {
  query: computed(() => ({ account: selectedAccount.value || undefined })),
})

const accounts = computed(() => (data.value?.accounts ?? []) as any[])
const rows = computed(() => {
  const all = (data.value?.transactions ?? []) as any[]
  return onlyUnreconciled.value ? all.filter(t => t.status === 'approved' && !t.reconciled_at) : all
})

const varianceClass = computed(() => {
  const v = data.value?.variance
  if (v === null || v === undefined) return ''
  return Number(v) === 0 ? 'border-emerald-500/20' : 'border-amber-500/30'
})

async function toggle(t: any) {
  togglingId.value = t.id
  try {
    await $fetch(`/api/bank/reconciliation/${t.id}/toggle`, { method: 'POST' })
    success(t.reconciled_at ? 'Marked unreconciled' : 'Marked cleared ✓')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update')
  } finally {
    togglingId.value = null
  }
}
</script>
