<template>
  <div class="space-y-6">
    <UiPageHeader title="Day-End Reconciliation" subtitle="Bank + Petty Cash + AR + AP, side by side — read-only diagnostic"
                  :breadcrumb="['Accounts', 'Day-End Reconciliation']" />

    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <label class="text-xs text-gray-500">Date</label>
      <input v-model="date" type="date" class="input-glass w-auto text-xs" />
      <button @click="refresh" class="btn-ghost text-xs">↻ Refresh</button>
      <span v-if="data && !data.is_today" class="text-[11px] text-amber-400 ml-2">
        ⚠ Petty Cash / AP cached balances are always live — only the ledger/GL sides are cut off at this date.
      </span>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else-if="data">
      <!-- Bank -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">🏦 Bank</h3>
        <div v-if="!data.bank.length" class="text-xs text-gray-600 text-center py-4">No active bank accounts.</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Account</th>
              <th class="pb-2 text-right text-gray-500">Module Balance</th>
              <th class="pb-2 text-right text-gray-500">GL Balance</th>
              <th class="pb-2 text-right text-gray-500">Variance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in data.bank" :key="b.id" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300">{{ b.bank_name }} — {{ b.account_name }}</td>
              <td class="py-2 text-right font-mono text-gray-300">৳{{ b.module_balance.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono text-gray-300">{{ b.gl_balance === null ? '— no GL link' : '৳' + b.gl_balance.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono font-semibold" :class="varClass(b.variance)">{{ fmtVar(b.variance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Petty Cash -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">💵 Petty Cash</h3>
        <div v-if="!data.petty_cash.length" class="text-xs text-gray-600 text-center py-4">No active petty cash accounts.</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Branch</th>
              <th class="pb-2 text-right text-gray-500">Cached Balance</th>
              <th class="pb-2 text-right text-gray-500">Ledger Balance</th>
              <th class="pb-2 text-right text-gray-500">Variance</th>
              <th class="pb-2 text-right text-gray-500">Day's Cash Count</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in data.petty_cash" :key="p.id" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300">{{ p.branch_name }} <span class="text-gray-600">({{ p.account_name }})</span></td>
              <td class="py-2 text-right font-mono text-gray-300">৳{{ p.cached_balance.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono text-gray-300">৳{{ p.ledger_balance.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono font-semibold" :class="varClass(p.variance)">{{ fmtVar(p.variance) }}</td>
              <td class="py-2 text-right text-gray-400">
                <template v-if="p.day_verification">
                  ৳{{ Number(p.day_verification.actual_cash).toLocaleString() }}
                  <span :class="Number(p.day_verification.variance) === 0 ? 'text-emerald-400' : 'text-amber-400'">
                    ({{ Number(p.day_verification.variance) >= 0 ? '+' : '' }}{{ Number(p.day_verification.variance).toLocaleString() }})
                  </span>
                </template>
                <span v-else class="text-gray-700">not verified</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- AR -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">📗 Accounts Receivable</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-500">Ledger (customer_ledger)</span><span class="font-mono text-gray-200">৳{{ data.ar.ledger_balance.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">GL (Accounts Receivable)</span><span class="font-mono text-gray-200">৳{{ data.ar.gl_balance.toLocaleString() }}</span></div>
            <div class="flex justify-between pt-2 border-t border-white/[0.06]">
              <span class="text-gray-500">Variance</span>
              <span class="font-mono font-semibold" :class="varClass(data.ar.variance)">{{ fmtVar(data.ar.variance) }}</span>
            </div>
          </div>
        </div>

        <!-- AP -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">📕 Accounts Payable</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-500">Cached (suppliers.current_balance)</span><span class="font-mono text-gray-200">৳{{ data.ap.cached_balance.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">GL (Accounts Payable)</span><span class="font-mono text-gray-200">৳{{ data.ap.gl_balance.toLocaleString() }}</span></div>
            <div class="flex justify-between pt-2 border-t border-white/[0.06]">
              <span class="text-gray-500">Variance</span>
              <span class="font-mono font-semibold" :class="varClass(data.ap.variance)">{{ fmtVar(data.ap.variance) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const date = ref(new Date().toISOString().slice(0, 10))
const { data, pending, error, refresh } = await useFetch('/api/accounts/day-end-reconciliation', {
  query: computed(() => ({ date: date.value })),
})

function varClass(v: number | null) {
  if (v === null) return 'text-gray-500'
  if (Math.abs(v) < 0.5) return 'text-emerald-400'
  return 'text-red-400'
}
function fmtVar(v: number | null) {
  if (v === null) return '—'
  return (v >= 0 ? '+' : '') + '৳' + v.toLocaleString()
}
</script>
