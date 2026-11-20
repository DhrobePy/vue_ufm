<template>
  <div class="space-y-5">
    <UiPageHeader title="Customer Balance Reconciliation" subtitle="Stored customer balances that differ from what their ledger adds up to" :breadcrumb="['Admin', 'Reconciliation']" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else-if="data">
      <div class="glass-card p-4 text-xs text-gray-400">
        Checked {{ data.checked }} customers ·
        <strong :class="data.mismatches.length ? 'text-amber-400' : 'text-emerald-400'">{{ data.mismatches.length ? data.mismatches.length + ' out of step' : 'all balances match their ledgers' }}</strong>.
        The ledger is the truth; “Reconcile” sets the stored balance to the ledger total and keeps a history you can undo.
      </div>

      <div v-if="data.mismatches.length" class="glass-card overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-right">Stored ৳</th><th class="px-3 py-2 text-right">Ledger ৳</th><th class="px-3 py-2 text-right">Difference ৳</th><th class="px-3 py-2 text-right">Ledger lines</th><th class="px-3 py-2" />
          </tr></thead>
          <tbody>
            <tr v-for="m in data.mismatches" :key="m.id" class="border-b border-white/[0.04]">
              <td class="px-3 py-2"><NuxtLink :to="`/customers/${m.id}`" class="text-gold-400 hover:underline">{{ m.name }}</NuxtLink><span v-if="m.business_name" class="text-gray-600"> · {{ m.business_name }}</span></td>
              <td class="px-3 py-2 text-right font-mono">{{ n2(m.stored) }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ n2(m.ledger) }}</td>
              <td class="px-3 py-2 text-right font-mono" :class="m.diff > 0 ? 'text-red-400' : 'text-amber-400'">{{ n2(m.diff) }}</td>
              <td class="px-3 py-2 text-right text-gray-500">{{ m.line_count }}</td>
              <td class="px-3 py-2 text-right"><button class="btn-gold text-[11px] px-3 py-1" :disabled="busy" @click="act({ action: 'reconcile', customer_id: m.id })">Reconcile</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="glass-card overflow-x-auto">
        <h3 class="section-title px-4 pt-4">History</h3>
        <table class="w-full text-xs">
          <thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2 text-left">When</th><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-right">Was ৳</th><th class="px-3 py-2 text-right">Now ৳</th><th class="px-3 py-2 text-left">By</th><th class="px-3 py-2 text-left">Status</th><th class="px-3 py-2" />
          </tr></thead>
          <tbody>
            <tr v-for="h in data.history" :key="h.id" class="border-b border-white/[0.04]">
              <td class="px-3 py-2 text-gray-500">{{ String(h.reconciled_at).slice(0, 16) }}</td><td class="px-3 py-2">{{ h.customer }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ n2(h.old_balance) }}</td><td class="px-3 py-2 text-right font-mono">{{ n2(h.new_balance) }}</td>
              <td class="px-3 py-2 text-gray-500">{{ h.reconciled_by ?? '—' }}</td>
              <td class="px-3 py-2"><span :class="h.status === 'active' ? 'text-emerald-400' : 'text-gray-500'">{{ h.status === 'active' ? 'applied' : 'undone' }}</span></td>
              <td class="px-3 py-2 text-right"><button v-if="h.status === 'active'" class="btn-ghost text-[11px] px-3 py-1" :disabled="busy" @click="act({ action: 'undo', history_id: h.id })">Undo</button></td>
            </tr>
            <tr v-if="!data.history.length"><td colspan="7" class="px-3 py-6 text-center text-gray-600">No reconciliations yet</td></tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { data, pending, refresh } = await useFetch<any>('/api/admin/customer-reconciliation')
const n2 = (v: number) => Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const busy = ref(false)
async function act(body: any) {
  if (!confirm(body.action === 'undo' ? 'Undo this reconciliation and restore the old stored balance?' : 'Set this customer\'s stored balance to the ledger total?')) return
  busy.value = true
  try { const r: any = await $fetch('/api/admin/customer-reconciliation', { method: 'POST', body }); success(r.message); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
</script>
