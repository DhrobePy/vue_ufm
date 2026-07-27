<template>
  <div class="space-y-5">
    <UiPageHeader title="Recycle Bin" subtitle="Deleted records — full snapshots, restorable until purged"
                  :breadcrumb="['Admin', 'Recycle Bin']" />

    <div class="flex gap-2">
      <button v-for="t in tabs" :key="t.value" @click="statusFilter = t.value; refresh()"
              :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border',
                statusFilter === t.value
                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
                  : 'text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]']">
        {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading…</p>
    </div>

    <div v-else-if="!items.length" class="glass-card p-14 text-center space-y-2">
      <div class="text-5xl">🗑️</div>
      <p class="text-gray-400 font-semibold">Nothing here</p>
      <p class="text-xs text-gray-600">Deleted records will appear here, fully recoverable until purged</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="b in items" :key="b.id" class="glass-card p-5">
        <div class="flex items-start gap-4 flex-wrap">
          <div class="min-w-[220px] flex-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white/[0.06] text-gray-400 border border-white/[0.08]">{{ entityLabel(b.entity_type) }}</span>
            <span class="text-sm font-bold text-gray-200 ml-2">{{ b.label }}</span>
            <p class="text-xs text-gray-500 mt-1">
              {{ b.customer_name ? `${b.customer_name} · ` : '' }}{{ b.item_count }} row(s) captured
              · deleted by {{ b.deleted_by_name ?? '—' }} · {{ timeAgo(b.deleted_at) }}
            </p>
            <p v-if="b.status === 'restored'" class="text-[11px] text-emerald-400 mt-1">✓ Restored {{ timeAgo(b.restored_at) }}</p>
            <p v-if="b.status === 'purged'" class="text-[11px] text-red-400 mt-1">✗ Permanently purged {{ timeAgo(b.purged_at) }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button @click="toggleDetail(b)" class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-gray-300 hover:border-white/[0.15] transition-colors">
              {{ expanded === b.id ? 'Hide' : 'View' }} contents
            </button>
            <template v-if="b.status === 'active'">
              <button @click="doRestore(b)" :disabled="acting === b.id"
                class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
                {{ acting === b.id ? '…' : '♻️ Restore' }}
              </button>
              <button v-if="isSuperadmin" @click="doPurge(b)" :disabled="acting === b.id"
                class="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 transition-colors">
                Purge
              </button>
            </template>
          </div>
        </div>

        <!-- Content breakdown -->
        <div v-if="expanded === b.id" class="mt-4 pt-4 border-t border-white/[0.06]">
          <div v-if="detailLoading" class="text-xs text-gray-500">Loading…</div>
          <table v-else class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 text-left text-gray-600 font-semibold uppercase tracking-wider">Table</th>
                <th class="pb-2 text-left text-gray-600 font-semibold uppercase tracking-wider">Change</th>
                <th class="pb-2 text-right text-gray-600 font-semibold uppercase tracking-wider">Rows</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="row in detailItems" :key="row.table_name + row.op">
                <td class="py-1.5 font-mono text-gray-400">{{ row.table_name }}</td>
                <td class="py-1.5 text-gray-500">{{ row.op === 'delete' ? 'deleted' : 'modified' }}</td>
                <td class="py-1.5 text-right text-gray-300 font-semibold">{{ row.row_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user } = useUserSession()
const isSuperadmin = computed(() => ((user.value as any)?.role ?? '').toLowerCase() === 'superadmin')

const tabs = [
  { value: 'active',   label: 'Active' },
  { value: 'restored', label: 'Restored' },
  { value: 'purged',   label: 'Purged' },
]
const statusFilter = ref('active')

const { data, pending, refresh } = await useFetch('/api/admin/recycle-bin', {
  query: computed(() => ({ status: statusFilter.value })),
})
const items = computed<any[]>(() => (data.value as any)?.batches ?? [])

const expanded      = ref<number | null>(null)
const detailLoading  = ref(false)
const detailItems    = ref<any[]>([])

async function toggleDetail(b: any) {
  if (expanded.value === b.id) { expanded.value = null; return }
  expanded.value = b.id
  detailLoading.value = true
  try {
    const res: any = await $fetch(`/api/admin/recycle-bin/${b.id}`)
    detailItems.value = res.items ?? []
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to load contents')
  } finally {
    detailLoading.value = false
  }
}

const acting = ref<number | null>(null)

async function doRestore(b: any) {
  if (!confirm(`Restore "${b.label}"? This will re-insert all ${b.item_count} captured row(s) exactly as they were.`)) return
  acting.value = b.id
  try {
    const res: any = await $fetch(`/api/admin/recycle-bin/${b.id}/restore`, { method: 'POST' })
    success(`Restored — ${res.restored} row(s) put back`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to restore')
  } finally {
    acting.value = null
  }
}

async function doPurge(b: any) {
  if (!confirm(`Permanently purge "${b.label}"? This deletes the snapshot itself — it can never be restored after this.`)) return
  acting.value = b.id
  try {
    await $fetch(`/api/admin/recycle-bin/${b.id}/purge`, { method: 'POST' })
    success('Purged')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to purge')
  } finally {
    acting.value = null
  }
}

function entityLabel(t: string) {
  return ({
    credit_order:       'Credit Order',
    credit_order_return: 'Return',
    journal_entry:       'Journal Entry',
    bank_transaction:    'Bank Transaction',
    expense_voucher:     'Expense Voucher',
    maintenance_rule:    'Maintenance Rule',
    purchase_order:      'Purchase Order',
    purchase_payment:    'Purchase Payment',
    customer:            'Customer',
    commodity_sale:      'Trading Sale',
    commodity_payment:   'Trading Payment',
    loan:                'Loan',
    loan_repayment:      'Loan Repayment',
  } as Record<string, string>)[t] ?? t.replace(/_/g, ' ')
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
</script>
