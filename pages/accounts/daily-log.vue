<template>
  <div class="space-y-6">
    <UiPageHeader title="Daily Accounts Log" subtitle="All transactions posted today across all accounts"
                  :breadcrumb="['Accounts', 'Daily Log']">
      <template #actions>
        <input v-model="selectedDate" type="date" class="input-glass text-xs py-1.5" />
        <button @click="printLog" class="btn-ghost text-xs">🖨 Print</button>
      </template>
    </UiPageHeader>

    <!-- Day summary KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Entries</p>
        <p class="text-2xl font-bold text-gray-100">{{ entries.length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Debits</p>
        <p class="text-2xl font-bold text-red-400">৳{{ totalDebits.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Credits</p>
        <p class="text-2xl font-bold text-emerald-400">৳{{ totalCredits.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Balance Check</p>
        <p class="text-2xl font-bold" :class="isBalanced ? 'text-emerald-400' : 'text-red-400'">
          {{ isBalanced ? '✓ Balanced' : '✗ Error' }}
        </p>
      </div>
    </div>

    <!-- Entries table -->
    <div id="daily-log-print" class="glass-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">Journal Entries — {{ selectedDate }}</h3>
        <div class="flex gap-2">
          <button v-for="f in typeFilters" :key="f.value"
            @click="typeFilter = f.value"
            :class="['text-xs px-3 py-1 rounded-lg border transition-all',
              typeFilter === f.value
                ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
                : 'border-white/10 text-gray-500 hover:border-white/20']">
            {{ f.label }}
          </button>
        </div>
      </div>

      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Time</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th>
            <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">By</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <template v-for="entry in filteredEntries" :key="entry.id">
            <tr v-for="(line, li) in entry.lines" :key="`${entry.id}-${li}`" class="hover:bg-white/[0.02]">
              <td class="py-2.5 px-3 text-gray-600 font-mono">{{ li === 0 ? entry.time : '' }}</td>
              <td class="py-2.5 px-3">
                <span class="text-gray-300">{{ line.account }}</span>
                <span class="text-gray-600 ml-1">{{ line.code }}</span>
              </td>
              <td class="py-2.5 px-3 text-gray-400">{{ li === 0 ? entry.description : '' }}</td>
              <td class="py-2.5 px-3 text-gray-600 font-mono">{{ li === 0 ? entry.ref : '' }}</td>
              <td class="py-2.5 px-3 text-right font-mono text-red-400">{{ line.debit ? `৳${line.debit.toLocaleString()}` : '' }}</td>
              <td class="py-2.5 px-3 text-right font-mono text-emerald-400">{{ line.credit ? `৳${line.credit.toLocaleString()}` : '' }}</td>
              <td class="py-2.5 px-3 text-center text-gray-600">{{ li === 0 ? entry.postedBy : '' }}</td>
            </tr>
            <tr class="border-b-2 border-white/[0.06]"><td colspan="7" class="py-0" /></tr>
          </template>
        </tbody>
        <tfoot class="border-t-2 border-white/10">
          <tr>
            <td colspan="4" class="pt-3 px-3 text-right font-bold text-gray-600">Totals</td>
            <td class="pt-3 px-3 text-right font-bold text-red-400 font-mono">৳{{ totalDebits.toLocaleString() }}</td>
            <td class="pt-3 px-3 text-right font-bold text-emerald-400 font-mono">৳{{ totalCredits.toLocaleString() }}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { printElement } = usePrint()

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const typeFilter   = ref('all')

const typeFilters = [
  { value: 'all',     label: 'All' },
  { value: 'sales',   label: 'Sales' },
  { value: 'payment', label: 'Payments' },
  { value: 'expense', label: 'Expenses' },
]

// Reactive fetch — re-runs whenever selectedDate changes
const { data, refresh } = await useFetch(
  () => `/api/accounts/daily-log?date=${selectedDate.value}`,
)
watch(selectedDate, () => refresh())

const entries = computed(() => (data.value as any)?.entries ?? [])

const filteredEntries = computed(() =>
  typeFilter.value === 'all'
    ? entries.value
    : entries.value.filter((e: any) => e.type === typeFilter.value),
)

const totalDebits = computed(() =>
  filteredEntries.value.flatMap((e: any) => e.lines).reduce((s: number, l: any) => s + l.debit, 0),
)
const totalCredits = computed(() =>
  filteredEntries.value.flatMap((e: any) => e.lines).reduce((s: number, l: any) => s + l.credit, 0),
)
const isBalanced = computed(() => totalDebits.value === totalCredits.value)

function printLog() {
  printElement('daily-log-print', `Daily Accounts Log — ${selectedDate.value}`)
}
</script>
