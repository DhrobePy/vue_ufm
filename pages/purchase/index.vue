<template>
  <div class="space-y-6">
    <UiPageHeader title="Purchase" subtitle="Procure-to-pay · Wheat procurement management" :breadcrumb="['Purchase']">
      <template #actions>
        <NuxtLink to="/purchase/orders/create" class="btn-gold text-xs">+ New PO</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Active POs"     :value="stats.active_pos ?? 0"                              trend="pending/approved"         trend-up  icon="file"   color="orange" />
      <KpiCard label="GRNs Pending"   :value="stats.grns_pending ?? 0"                            trend="Needs receipt"     :trend-up="false" icon="check" color="yellow" />
      <KpiCard label="Total Payable"  :value="`৳${fmtCr(stats.total_payable)}`"                  trend="Outstanding balance" :trend-up="false" icon="money" color="red" />
      <KpiCard label="Wheat Received" :value="`${Number(stats.wheat_received_mt ?? 0).toFixed(1)} MT`" trend="All time"   trend-up  icon="box"    color="teal" />
    </div>

    <!-- Quick-filter status pills -->
    <div class="flex flex-wrap gap-2">
      <NuxtLink v-for="pill in statusPills" :key="pill.label"
        :to="`/purchase/orders?${pill.query}`"
        class="text-xs px-3 py-1.5 rounded-full border transition-colors"
        :style="`border-color:${pill.color}40; background:${pill.color}12; color:${pill.color}`">
        {{ pill.label }}
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Recent Purchase Orders</h2>
          <NuxtLink to="/purchase/orders" class="text-xs text-gold-500 hover:text-gold-400 font-medium">View all →</NuxtLink>
        </div>
        <UiDataTable :columns="poCols" :rows="recentPOs" :per-page="8" search-placeholder="Search POs…">
          <template #cell-po_number="{ value }"><span class="font-mono text-xs text-gold-400/80">{{ value }}</span></template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-payment_status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-value="{ value }"><span class="font-mono text-xs text-gray-300">৳{{ Number(value).toLocaleString() }}</span></template>
        </UiDataTable>
      </div>

      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Top Suppliers</h2>
          <NuxtLink to="/purchase/suppliers" class="text-xs text-gold-500 hover:text-gold-400 font-medium">View all →</NuxtLink>
        </div>
        <div class="space-y-3">
          <div v-for="s in topSuppliers" :key="s.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
            <div class="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">{{ (s.name ?? '?')[0] }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-200 truncate">{{ s.name }}</p>
              <p class="text-xs text-gray-500">{{ s.type }} · {{ s.orders }} orders</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-gold-400">৳{{ fmtCr(s.amount) }}</p>
              <UiStatusBadge :status="s.status" />
            </div>
          </div>
          <p v-if="!topSuppliers.length" class="text-xs text-gray-600 text-center py-4">No suppliers yet</p>
        </div>
      </div>
    </div>

    <!-- Origin Breakdown -->
    <div v-if="originStats.length" class="glass-card p-5">
      <h2 class="section-title mb-4">Wheat Origin Breakdown</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Origin</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">POs</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Received (MT)</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Total Value</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">% of Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in originStats" :key="o.origin" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
              <td class="py-2.5 px-3">
                <span class="font-medium text-gray-200">{{ o.origin }}</span>
              </td>
              <td class="py-2.5 px-3 text-right text-gray-400">{{ o.pos }}</td>
              <td class="py-2.5 px-3 text-right font-mono font-semibold text-teal-400">{{ Number(o.received_mt).toLocaleString() }} MT</td>
              <td class="py-2.5 px-3 text-right font-mono text-gray-200">৳{{ fmtCr(o.total_value) }}</td>
              <td class="py-2.5 px-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div class="h-full rounded-full bg-gold-500/60 transition-all" :style="`width:${originPct(o)}%`" />
                  </div>
                  <span class="text-gray-500 w-8 text-right">{{ originPct(o) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Quick Links</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/purchase/orders" class="btn-ghost text-xs">📋 Purchase Orders</NuxtLink>
        <NuxtLink to="/purchase/grn" class="btn-ghost text-xs">📦 GRN List</NuxtLink>
        <NuxtLink to="/purchase/grn/variance" class="btn-ghost text-xs">📊 Variance Report</NuxtLink>
        <NuxtLink to="/purchase/payments" class="btn-ghost text-xs">💳 Payments</NuxtLink>
        <NuxtLink to="/purchase/adjustments" class="btn-ghost text-xs">⚖ Adjustment Notes</NuxtLink>
        <NuxtLink to="/purchase/suppliers" class="btn-ghost text-xs">🏭 Suppliers</NuxtLink>
        <NuxtLink to="/purchase/suppliers/summary" class="btn-ghost text-xs">📈 Supplier Summary</NuxtLink>
      </div>
    </div>

    <!-- Admin-only: Reconciliation -->
    <div v-if="isAdmin" class="glass-card p-5 space-y-4">
      <div class="flex items-center justify-between cursor-pointer" @click="showRecon = !showRecon">
        <div>
          <h2 class="section-title">Data Integrity Checks</h2>
          <p class="text-xs text-gray-600 mt-0.5">Admin-only reconciliation · click to expand</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="reconLoaded" :class="['text-xs font-semibold px-2 py-0.5 rounded-full',
            totalIssues === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400']">
            {{ totalIssues === 0 ? 'All Clear' : `${totalIssues} issue${totalIssues !== 1 ? 's' : ''}` }}
          </span>
          <button @click.stop="runRecon" :disabled="reconLoading" class="btn-ghost text-xs py-1 px-3">
            {{ reconLoading ? 'Checking…' : 'Run Check' }}
          </button>
          <span class="text-gray-500 text-sm">{{ showRecon ? '▲' : '▼' }}</span>
        </div>
      </div>

      <div v-if="showRecon && reconLoaded" class="space-y-3">
        <div v-for="check in reconChecks" :key="check.key"
             class="rounded-xl p-4 border"
             :style="check.count === 0
               ? 'background:rgba(16,185,129,0.04);border-color:rgba(16,185,129,0.15)'
               : 'background:rgba(239,68,68,0.05);border-color:rgba(239,68,68,0.20)'">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="text-base">{{ check.count === 0 ? '✅' : '⚠️' }}</span>
              <div>
                <p class="text-xs font-semibold text-gray-200">{{ check.label }}</p>
                <p class="text-[11px] text-gray-500 mt-0.5">{{ check.description }}</p>
              </div>
            </div>
            <span :class="['text-sm font-bold', check.count === 0 ? 'text-emerald-400' : 'text-red-400']">
              {{ check.count }}
            </span>
          </div>
          <div v-if="check.count > 0 && check.rows?.length" class="mt-3 space-y-1.5">
            <div v-for="row in check.rows.slice(0,5)" :key="row.id || row.po_id"
                 class="flex items-center gap-3 text-[11px] text-gray-500 border-t border-white/[0.04] pt-1.5">
              <NuxtLink v-if="row.id || row.po_id"
                :to="`/purchase/orders/${row.id ?? row.po_id}`"
                class="font-mono text-gold-400/80 hover:text-gold-300">
                {{ row.po_number || `PO#${row.id ?? row.po_id}` }}
              </NuxtLink>
              <span class="text-gray-600">{{ row.note ?? '' }}</span>
            </div>
            <p v-if="check.rows.length > 5" class="text-[10px] text-gray-600">…and {{ check.rows.length - 5 }} more</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { user: sessionUser } = useUserSession()
const isAdmin = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const poCols = [
  { key: 'po_number',     label: 'PO #',    sortable: true },
  { key: 'supplier_name', label: 'Supplier', sortable: true },
  { key: 'qty_mt',        label: 'Qty (MT)' },
  { key: 'value',         label: 'Value (৳)' },
  { key: 'status',        label: 'Status' },
  { key: 'payment_status', label: 'Payment' },
]

const { data } = await useFetch('/api/purchase/dashboard')

const stats        = computed(() => (data.value as any)?.stats        ?? {})
const recentPOs    = computed(() => (data.value as any)?.recentPOs    ?? [])
const topSuppliers = computed(() => (data.value as any)?.topSuppliers ?? [])
const originStats  = computed(() => (data.value as any)?.originStats  ?? [])

const totalReceivedMT = computed(() =>
  originStats.value.reduce((s: number, o: any) => s + Number(o.received_mt ?? 0), 0),
)
function originPct(o: any): number {
  const total = totalReceivedMT.value
  if (!total) return 0
  return Math.round((Number(o.received_mt) / total) * 100)
}

function fmtCr(v: any) {
  const n = Number(v ?? 0)
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`
  return n.toLocaleString()
}

const statusPills = [
  { label: 'Active POs',        query: 'status=approved',     color: '#f59e0b' },
  { label: 'Pending Delivery',  query: 'delivery_status=partial', color: '#06b6d4' },
  { label: 'Completed',         query: 'status=completed',    color: '#10b981' },
  { label: 'Unpaid',            query: 'payment_status=unpaid', color: '#ef4444' },
  { label: 'Cancelled',         query: 'status=cancelled',    color: '#6b7280' },
]

// Reconciliation
const showRecon     = ref(false)
const reconLoading  = ref(false)
const reconLoaded   = ref(false)
const reconData     = ref<any>(null)

const reconChecks = computed(() => {
  if (!reconData.value) return []
  const d = reconData.value
  return [
    {
      key:         'check1',
      label:       'Balance Payable Accuracy',
      description: 'POs where stored balance_payable differs from computed (paid vs order value) by more than ৳1',
      count:       d.check1?.length ?? 0,
      rows:        d.check1 ?? [],
    },
    {
      key:         'check2',
      label:       'Origin Remarks Consistency',
      description: 'POs with wheat_origin = "Other" but no remarks explaining the origin',
      count:       d.check2?.length ?? 0,
      rows:        d.check2 ?? [],
    },
    {
      key:         'check3',
      label:       'Stale Adjustment Notes',
      description: 'Adjustment notes in draft/approved status older than 7 days (possibly stuck)',
      count:       d.check3?.length ?? 0,
      rows:        d.check3 ?? [],
    },
  ]
})

const totalIssues = computed(() =>
  reconChecks.value.reduce((s, c) => s + c.count, 0),
)

async function runRecon() {
  reconLoading.value = true
  try {
    reconData.value  = await $fetch('/api/purchase/reconcile')
    reconLoaded.value = true
    showRecon.value  = true
  } catch {
    // ignore
  } finally {
    reconLoading.value = false
  }
}
</script>
