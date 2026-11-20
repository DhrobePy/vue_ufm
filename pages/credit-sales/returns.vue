<template>
  <div class="space-y-4">
    <div class="no-print"><HubTabs hub="returns" /></div>
    <ReportFrame title="Goods Returns" subtitle="Every return across orders — a different authorised user must approve each one" :period="period" filename="goods-returns" :sheets="sheets">
      <template #filters>
        <div class="glass-card p-4 flex flex-wrap items-center gap-2">
          <select v-model="status" class="field-input text-xs py-1.5 w-40"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
          <input v-model="from" type="date" class="field-input text-xs py-1.5 w-36" /><span class="text-xs text-gray-600">to</span><input v-model="to" type="date" class="field-input text-xs py-1.5 w-36" />
          <input v-model="search" type="search" placeholder="Return #, order #, customer…" class="field-input text-xs py-1.5 w-56" />
          <span class="text-[11px] text-gray-600 ml-auto">To record a return, open the order → “Return”.</span>
        </div>
      </template>
      <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
      <template v-else-if="data">
        <div class="grid grid-cols-3 gap-3">
          <div v-for="k in kpis" :key="k.l" class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">{{ k.l }}</p><p class="text-lg font-bold font-mono" :class="k.cls">{{ k.n }} <span class="text-xs text-gray-600">· ৳{{ n0(k.v) }}</span></p></div>
        </div>
        <div class="glass-card overflow-x-auto">
          <table class="w-full text-xs">
            <thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500">
              <th class="px-3 py-2 text-left">Return</th><th class="px-3 py-2 text-left">Date</th><th class="px-3 py-2 text-left">Order</th><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-left">Items</th>
              <th class="px-3 py-2 text-right">Qty</th><th class="px-3 py-2 text-right">Value ৳</th><th class="px-3 py-2 text-left">Status</th><th class="px-3 py-2 text-left no-print">Actions</th>
            </tr></thead>
            <tbody>
              <tr v-for="r in data.returns" :key="r.id" class="border-b border-white/[0.04] align-top">
                <td class="px-3 py-2 font-mono">{{ r.return_number }}<div class="text-[10px] text-gray-600">{{ r.return_type }}{{ r.return_reason ? ' · ' + r.return_reason : '' }}</div></td>
                <td class="px-3 py-2 whitespace-nowrap">{{ String(r.return_date).slice(0, 10) }}</td>
                <td class="px-3 py-2"><NuxtLink :to="`/credit-sales/${r.order_id}`" class="text-gold-400 hover:underline">{{ r.order_number }}</NuxtLink></td>
                <td class="px-3 py-2">{{ r.customer }}</td>
                <td class="px-3 py-2 text-gray-400"><div v-for="(i, k) in r.items" :key="k">{{ i.product }} {{ i.variant }} × {{ i.qty }}</div></td>
                <td class="px-3 py-2 text-right font-mono">{{ n0(r.qty) }}</td><td class="px-3 py-2 text-right font-mono">{{ n0(r.amount) }}</td>
                <td class="px-3 py-2"><span :class="stCls(r.status)">{{ r.status }}</span><div class="text-[10px] text-gray-600">by {{ r.created_by ?? '—' }}{{ r.approved_by ? ' · decided by ' + r.approved_by : '' }}</div></td>
                <td class="px-3 py-2 no-print whitespace-nowrap">
                  <template v-if="r.status === 'pending'">
                    <button class="btn-gold text-[11px] px-2.5 py-1 mr-1" :disabled="busy" @click="decide(r, 'approve')">Approve</button>
                    <button class="btn-ghost text-[11px] px-2.5 py-1" :disabled="busy" @click="decide(r, 'reject')">Reject</button>
                  </template>
                  <button v-if="canDelete" class="btn-ghost text-[11px] px-2.5 py-1 text-red-400 ml-1" :disabled="busy" @click="remove(r)">Delete</button>
                </td>
              </tr>
              <tr v-if="!data.returns.length"><td colspan="9" class="px-3 py-8 text-center text-gray-600">No returns match</td></tr>
            </tbody>
          </table>
        </div>
      </template>
    </ReportFrame>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user } = useUserSession()
const canDelete = computed(() => ['admin', 'superadmin'].includes(String((user.value as any)?.role ?? '').toLowerCase()))
const status = ref(''), from = ref(''), to = ref(''), search = ref('')
const { data, pending, error, refresh } = await useFetch<any>('/api/credit-sales/returns', { query: computed(() => ({ status: status.value || undefined, from: from.value || undefined, to: to.value || undefined, search: search.value || undefined })), watch: [status, from, to, search] })
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const stCls = (s: string) => s === 'approved' ? 'text-emerald-400' : s === 'pending' ? 'text-amber-400' : 'text-gray-500'
const period = computed(() => `${from.value || 'all dates'} to ${to.value || 'today'}${status.value ? ' · ' + status.value : ''}`)
const kpis = computed(() => { const s = data.value?.summary; return s ? [{ l: 'Pending', ...s.pending, cls: 'text-amber-400' }, { l: 'Approved', ...s.approved, cls: 'text-emerald-400' }, { l: 'Rejected', ...s.rejected, cls: 'text-gray-400' }] : [] })
const busy = ref(false)
async function decide(r: any, action: 'approve' | 'reject') {
  const notes = action === 'reject' ? (prompt('Reason for rejecting this return:') ?? '').trim() : ''
  if (action === 'reject' && !notes) return
  if (action === 'approve' && !confirm(`Approve ${r.return_number} (৳${n0(r.amount)})? The invoice and customer ledger are adjusted.`)) return
  busy.value = true
  try { await $fetch(`/api/credit-sales/returns/${r.id}/status`, { method: 'PATCH', body: { action, notes } }); success(`${r.return_number} ${action === 'approve' ? 'approved' : 'rejected'}`); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
async function remove(r: any) {
  if (!confirm(`Delete ${r.return_number}?${r.status === 'approved' ? ' Its effect on the invoice and ledger is reversed.' : ''} It goes to the Recycle Bin.`)) return
  busy.value = true
  try { await $fetch(`/api/credit-sales/returns/${r.id}`, { method: 'DELETE' }); success('Return deleted'); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
const sheets = computed(() => [{ name: 'Returns', cols: [{ key: 'return_number', label: 'Return #' }, { key: 'return_date', label: 'Date' }, { key: 'order_number', label: 'Order #' }, { key: 'customer', label: 'Customer' }, { key: 'return_type', label: 'Type' }, { key: 'return_reason', label: 'Reason' },
  { key: 'qty', label: 'Qty', fmt: 'qty' as const, sum: true }, { key: 'amount', label: 'Value ৳', fmt: 'money' as const, sum: true }, { key: 'status', label: 'Status' }, { key: 'created_by', label: 'Recorded by' }, { key: 'approved_by', label: 'Decided by' }],
  rows: (data.value?.returns ?? []).map((r: any) => ({ ...r, return_date: String(r.return_date).slice(0, 10) })), totals: true }])
</script>
