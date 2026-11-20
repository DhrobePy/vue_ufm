<template>
  <div class="space-y-4">
  <div class="no-print"><HubTabs hub="accounts" /></div>
  <ReportFrame title="Account Balances (Non-Bank)" subtitle="Every general-ledger account except banks — debit, credit and balance" :period="`as of ${today}`" filename="account-balances" :sheets="sheets">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else>
      <input v-model="search" type="search" placeholder="Search code, name or type…" class="no-print field-input text-xs py-1.5 w-64" />
      <ReportTable :cols="cols" :rows="shown" totals />
      <p class="no-print text-[11px] text-gray-600">Balance follows each account's normal side (assets/expenses: debit − credit; liabilities/equity/income: credit − debit). Open an account's statement from the GL Statement page.</p>
    </template>
  </ReportFrame>
  </div>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const { data, pending } = await useFetch<any>('/api/accounts/all-accounts')
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const search = ref('')
const cols: ReportCol[] = [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Account' }, { key: 'type', label: 'Type' },
  { key: 'debit', label: 'Total debit ৳', fmt: 'money', sum: true }, { key: 'credit', label: 'Total credit ৳', fmt: 'money', sum: true }, { key: 'balance', label: 'Balance ৳', fmt: 'money' }]
const shown = computed(() => { const s = search.value.trim().toLowerCase(); const r = (data.value?.rows ?? []) as any[]; return s ? r.filter(x => `${x.code} ${x.name} ${x.type}`.toLowerCase().includes(s)) : r })
const sheets = computed(() => [{ name: 'Accounts', cols, rows: shown.value, totals: true }])
</script>
