<template>
  <ReportFrame title="Ledger Repair — Health Check" subtitle="Where the books and the customer ledgers disagree — Superadmin only" :period="today" filename="ledger-health-check" :sheets="sheets">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Checking…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="d">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div v-for="c in checks" :key="c.l" class="glass-card p-3" :class="c.n ? 'border-l-2 border-l-amber-500/60' : 'border-l-2 border-l-emerald-500/40'">
          <p class="text-[10px] uppercase tracking-wider text-gray-500">{{ c.l }}</p><p class="text-xl font-bold" :class="c.n ? 'text-amber-400' : 'text-emerald-400'">{{ c.n ? c.n : '✓ OK' }}</p>
        </div>
      </div>

      <div class="no-print glass-card p-4 flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[16rem] text-xs text-gray-400">
          <strong class="text-gray-200">Rebuild running balances</strong> — puts each ledger line's “balance after” back in date order for the {{ d.chain.length }} customer(s) listed under check 2. No debit, credit or total changes.
        </div>
        <button class="btn-gold text-xs" :disabled="!d.chain.length || busy" @click="rebuild(0)">{{ busy ? 'Working…' : 'Rebuild all' }}</button>
        <NuxtLink to="/admin/customer-reconciliation" class="btn-ghost text-xs">Customer balance reconciliation →</NuxtLink>
      </div>

      <section v-for="s in sections" :key="s.title" class="space-y-1">
        <h2 class="text-sm font-bold text-gray-200 mt-3">{{ s.title }} <span class="text-gray-600 font-normal">({{ s.rows.length }})</span></h2>
        <p class="text-[11px] text-gray-600">{{ s.help }}</p>
        <ReportTable :cols="s.cols" :rows="s.rows" :totals="false" />
      </section>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const { data: d, pending, error, refresh } = await useFetch<any>('/api/admin/ledger-repair')
const T = (key: string, label: string, fmt?: 'money'): ReportCol => ({ key, label, fmt })
const checks = computed(() => d.value ? [
  { l: '1 · Stored balance ≠ ledger', n: d.value.balanceMismatch.length }, { l: '2 · Running balance out of order', n: d.value.chain.length },
  { l: '3 · Dispatched, no ledger invoice', n: d.value.noLedger.length }, { l: '4 · Dispatched, no journal entry', n: d.value.noJe.length }, { l: '5 · Unbalanced journal entries', n: d.value.unbalanced.length }] : [])
const sections = computed(() => { const x = d.value; if (!x) return []; return [
  { title: '1 · Stored balance differs from the ledger', help: 'Fix on the Customer Balance Reconciliation screen (reversible).', cols: [T('name', 'Customer'), T('stored', 'Stored ৳', 'money'), T('ledger', 'Ledger ৳', 'money')], rows: x.balanceMismatch },
  { title: '2 · Running balance out of date order', help: 'Caused by back-dated entries. Use “Rebuild running balances” above.', cols: [T('name', 'Customer'), T('rows_off', 'Lines out of order')], rows: x.chain },
  { title: '3 · Dispatched orders with no customer-ledger invoice line', help: 'The customer was never charged on the ledger. Post through the order\'s own flow or the Ledger Review screen — not fixed automatically.', cols: [T('order_number', 'Order #'), T('customer', 'Customer'), T('status', 'Status'), T('amount', 'Amount ৳', 'money')], rows: x.noLedger },
  { title: '4 · Dispatched orders with no journal entry', help: 'Revenue / receivable never reached the general ledger.', cols: [T('order_number', 'Order #'), T('customer', 'Customer'), T('status', 'Status'), T('amount', 'Amount ৳', 'money')], rows: x.noJe },
  { title: '5 · Unbalanced journal entries', help: 'Debits ≠ credits. These need a correcting entry from Accounts; they are never edited silently.', cols: [T('id', 'Entry #'), T('date', 'Date'), T('description', 'Description'), T('line_count', 'Lines'), T('debit', 'Debit ৳', 'money'), T('credit', 'Credit ৳', 'money')], rows: x.unbalanced },
] })
const sheets = computed(() => sections.value.map(s => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows })))
const busy = ref(false)
async function rebuild(customer_id: number) {
  if (!confirm('Rebuild the running-balance column in date order? No amounts or totals change.')) return
  busy.value = true
  try { const r: any = await $fetch('/api/admin/ledger-repair', { method: 'POST', body: { action: 'rebuild_running_balances', customer_id: customer_id || undefined } }); success(r.message); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
</script>
