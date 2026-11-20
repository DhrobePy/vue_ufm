<template>
  <div class="space-y-4">
    <!-- account picker -->
    <template v-if="!uuid">
      <UiPageHeader title="Bank Statement" subtitle="Pick a bank account to see its ledger, with the purchase payments made from it" :breadcrumb="['Purchase', 'Bank Statement']" />
      <input v-model="find" type="search" placeholder="Find an account…" class="field-input text-xs py-1.5 w-64" />
      <div v-if="listPending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button v-for="a in shownAccounts" :key="a.uuid" class="glass-card p-4 text-left hover:border-gold-500/30" @click="pick(a.uuid)">
          <div class="flex items-start justify-between"><p class="font-semibold text-gray-100">{{ a.account_name }}</p>
            <span v-if="a.purchase_payments" class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">{{ a.purchase_payments }} payments</span><span v-else class="text-[10px] text-gray-600">no purchases</span></div>
          <p class="text-xs text-gray-500">{{ a.bank_name }}</p><p class="font-mono text-[11px] text-gray-600 mt-1">{{ a.account_number }}</p>
          <p class="text-xs font-mono mt-2" :class="a.balance < 0 ? 'text-red-400' : 'text-gray-300'">Ledger balance ৳{{ n0(a.balance) }}</p>
        </button>
      </div>
    </template>

    <!-- statement -->
    <ReportFrame v-else :title="`Bank Statement — ${data?.account?.account_name ?? ''}`" :subtitle="data ? `${data.account.bank_name}${data.account.branch_name ? ' · ' + data.account.branch_name : ''} · ${data.account.account_number}` : ''" :period="`${from || 'beginning'} to ${to || 'today'}`" :filename="`bank-statement_${data?.account?.account_number ?? ''}`" :sheets="sheets">
      <template #filters>
        <div class="glass-card p-4 flex flex-wrap items-center gap-2">
          <button class="btn-ghost text-xs" @click="back">← Accounts</button>
          <input v-model="from" type="date" class="field-input text-xs py-1.5 w-36" /><span class="text-xs text-gray-600">to</span><input v-model="to" type="date" class="field-input text-xs py-1.5 w-36" />
          <select v-model="type" class="field-input text-xs py-1.5 w-44"><option value="all">All entries</option><option value="purchase">Purchase payments only</option><option value="transfer">Internal transfers only</option></select>
        </div>
      </template>
      <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
      <template v-else-if="data">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="k in tiles" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono text-gray-100">৳{{ n0(k.v) }}</p></div>
        </div>
        <ReportTable :cols="cols" :rows="data.lines" />
      </template>
    </ReportFrame>
  </div>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
definePageMeta({ layout: 'default' })
const route = useRoute(), router = useRouter()
const uuid = ref(String(route.query.uuid ?? ''))
const from = ref(''), to = ref(''), type = ref('all'), find = ref('')
const { data: list, pending: listPending } = await useFetch<any>('/api/purchase/bank-statement', { immediate: !uuid.value })
const shownAccounts = computed(() => ((list.value?.accounts ?? []) as any[]).filter(a => `${a.account_name} ${a.bank_name} ${a.account_number}`.toLowerCase().includes(find.value.toLowerCase())))
const { data, pending, error, refresh } = await useFetch<any>('/api/purchase/bank-statement', { query: computed(() => ({ uuid: uuid.value || undefined, from: from.value || undefined, to: to.value || undefined, type: type.value })), immediate: !!uuid.value, watch: [from, to, type] })
const pick = (u: string) => { uuid.value = u; router.replace({ query: { uuid: u } }); refresh() }
const back = () => { uuid.value = ''; data.value = null; router.replace({ query: {} }) }
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const tiles = computed(() => data.value ? [{ l: 'Opening balance', v: data.value.opening }, { l: 'Total debits', v: data.value.totals.debit }, { l: 'Total credits', v: data.value.totals.credit }, { l: 'Closing balance', v: data.value.totals.closing }] : [])
const T = (key: string, label: string, extra: Partial<ReportCol> = {}): ReportCol => ({ key, label, ...extra })
const cols: ReportCol[] = [T('date', 'Date'), T('type', 'Type'), T('description', 'Description'), T('voucher', 'Voucher'), T('po', 'PO #'), T('supplier', 'Supplier'), T('reference', 'Reference'), T('method', 'Method'), T('debit', 'Debit ৳', { fmt: 'money' }), T('credit', 'Credit ৳', { fmt: 'money' }), T('balance', 'Balance ৳', { fmt: 'money' })]
const sheets = computed(() => data.value ? [{ name: 'Statement', cols: cols.map((c, i) => i >= 8 && i <= 9 ? { ...c, sum: true } : c), rows: data.value.lines, totals: true }] : [])
</script>
