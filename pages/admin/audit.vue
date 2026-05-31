<template>
  <div class="space-y-6">
    <UiPageHeader title="Audit Trail" subtitle="All system events · user actions · login history" :breadcrumb="['Admin','Audit Trail']">
      <template #actions>
        <button @click="exportCsv" class="btn-ghost text-xs">📊 Export CSV</button>
      </template>
    </UiPageHeader>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex gap-2 flex-wrap">
          <button v-for="s in severities" :key="s"
            @click="severityFilter = s === 'All' ? '' : s; page = 1; refresh()"
            :class="['px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
              (s === 'All' ? !severityFilter : severityFilter === s)
                ? severityActive(s)
                : 'text-gray-600 border-white/[0.07] hover:text-gray-400']">
            {{ s }}
          </button>
        </div>
        <select v-model="userFilter" class="field-input text-xs py-1.5 w-44" @change="page=1;refresh()">
          <option value="">All Users</option>
          <option v-for="u in userNames" :key="u.id" :value="u.id">{{ u.display_name }}</option>
        </select>
        <select v-model="moduleFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()">
          <option value="">All Modules</option>
          <option value="credit_order">Credit Sales</option>
          <option value="expense">Expenses</option>
          <option value="purchase">Purchase</option>
          <option value="supplier">Suppliers</option>
          <option value="customer_payment">Payments</option>
          <option value="authentication">Auth</option>
        </select>
        <input type="date" v-model="dateFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()" />
        <button @click="severityFilter=''; userFilter=''; moduleFilter=''; dateFilter=''; page=1; refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
        <span class="text-xs text-gray-600 ml-auto">{{ data?.total ?? 0 }} events</span>
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Log entries -->
      <div class="glass-card overflow-hidden">
        <div class="divide-y divide-white/[0.04]">
          <component
            :is="routeFor(log) ? 'NuxtLink' : 'div'"
            v-for="log in logs"
            :key="log.id"
            :to="routeFor(log) || undefined"
            class="flex gap-4 p-4 transition-colors group"
            :class="routeFor(log)
              ? 'hover:bg-white/[0.04] cursor-pointer'
              : 'hover:bg-white/[0.02]'"
          >
            <!-- Severity dot -->
            <div class="flex flex-col items-center shrink-0 mt-1.5">
              <div :class="['w-2.5 h-2.5 rounded-full shrink-0', severityDot(log.severity)]" />
            </div>

            <!-- Body -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <p class="text-sm text-gray-200 leading-snug">{{ log.description }}</p>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[10px] text-gray-600 font-mono whitespace-nowrap">
                    {{ String(log.created_at).slice(0, 16).replace('T', ' ') }}
                  </span>
                  <!-- View link — visible on hover when a route exists -->
                  <span v-if="routeFor(log)"
                        class="text-[10px] text-gold-400/60 group-hover:text-gold-400 transition-colors whitespace-nowrap font-medium">
                    View →
                  </span>
                  <!-- Deleted badge — no link possible -->
                  <span v-else-if="log.action === 'deleted'"
                        class="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5 whitespace-nowrap">
                    🗑 deleted
                  </span>
                </div>
              </div>

              <!-- Meta row -->
              <div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                <span class="text-[11px] text-gray-500 font-mono">{{ log.user_name || '—' }}</span>

                <!-- Module chip -->
                <span v-if="log.module" :class="['text-[10px] px-1.5 py-0.5 rounded border font-medium', moduleChip(log.module)]">
                  {{ moduleLabel(log.module) }}
                </span>

                <!-- Action chip -->
                <span :class="['text-[10px] px-1.5 py-0.5 rounded border font-medium', actionChip(log.action)]">
                  {{ log.action }}
                </span>

                <!-- Reference number -->
                <span v-if="log.reference_number" class="text-[11px] text-gold-400/80 font-mono">
                  {{ log.reference_number }}
                </span>

                <!-- Severity badge (only warning/critical) -->
                <span v-if="log.severity !== 'info'" :class="['text-[10px] font-medium px-1.5 py-0.5 rounded',
                  log.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400']">
                  {{ log.severity }}
                </span>

                <!-- IP -->
                <span v-if="log.ip_address" class="text-[11px] text-gray-700 font-mono">{{ log.ip_address }}</span>
              </div>
            </div>
          </component>

          <div v-if="!logs.length" class="py-12 text-center">
            <p class="text-2xl mb-2">🔍</p>
            <p class="text-sm text-gray-600">No events match the current filters</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="(data?.total ?? 0) > perPage" class="flex justify-center gap-2 items-center">
        <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1.5" :class="page<=1?'opacity-40':''">← Prev</button>
        <span class="text-xs text-gray-500">Page {{ page }} of {{ Math.ceil((data?.total ?? 0) / perPage) }}</span>
        <button :disabled="page >= Math.ceil((data?.total??0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1.5">Next →</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const severities     = ['All', 'info', 'warning', 'critical']
const severityFilter = ref('')
const userFilter     = ref('')
const moduleFilter   = ref('')
const dateFilter     = ref('')
const page           = ref(1)
const perPage        = 50

const { data, pending, error, refresh } = await useFetch('/api/admin/audit-logs', {
  query: computed(() => ({
    severity: severityFilter.value || undefined,
    user:     userFilter.value     || undefined,
    module:   moduleFilter.value   || undefined,
    date:     dateFilter.value     || undefined,
    page:     page.value,
    per:      perPage,
  })),
})

const logs      = computed(() => (data.value?.logs  ?? []) as any[])
const userNames = computed(() => (data.value?.users ?? []) as { id: number; display_name: string }[])

// ── Route resolution ──────────────────────────────────────────────────────────
// Returns the target route for a log entry, or null if unroutable
// (deleted records, auth events, or entries without a record_id)
function routeFor(log: any): string | null {
  if (log.action === 'deleted') return null   // record is gone
  if (!log.record_id)           return null

  const m = log.module as string
  const t = log.record_type as string

  // Credit orders and anything derived from them (returns, deliveries, payments)
  if (m === 'credit_order' || m === 'credit_sales') {
    if (t === 'credit_order' || t === 'credit_order_return') {
      return `/credit-sales/${log.record_id}`
    }
    return `/credit-sales/${log.record_id}`
  }

  if (m === 'customer_payment') return '/credit-sales/payments'

  if (m === 'expense') return `/expenses/${log.record_id}`

  if (m === 'purchase') return `/purchase/orders/${log.record_id}`

  if (m === 'supplier') return `/purchase/suppliers/${log.record_id}/ledger`

  // 'authentication' and unknown modules → no route
  return null
}

// ── Display helpers ───────────────────────────────────────────────────────────
function moduleLabel(m: string): string {
  const MAP: Record<string, string> = {
    credit_order:     'Credit Sales',
    credit_sales:     'Credit Sales',
    customer_payment: 'Payments',
    expense:          'Expenses',
    purchase:         'Purchase',
    supplier:         'Supplier',
    authentication:   'Auth',
  }
  return MAP[m] ?? m
}

function moduleChip(m: string): string {
  if (m === 'credit_order' || m === 'credit_sales') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (m === 'customer_payment')                      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (m === 'expense')                               return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  if (m === 'purchase')                              return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  if (m === 'supplier')                              return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  if (m === 'authentication')                        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  return 'bg-white/5 text-gray-500 border-white/10'
}

function actionChip(a: string): string {
  if (a === 'deleted'  || a === 'cancelled' || a === 'rejected') return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (a === 'approved' || a === 'paid'      || a === 'created')  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (a === 'updated'  || a === 'status_changed')                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  return 'bg-white/5 text-gray-500 border-white/10'
}

function severityActive(s: string) {
  return s === 'info'     ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : s === 'warning'     ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    : s === 'critical'    ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : 'bg-gold-500/15 text-gold-400 border-gold-500/25'
}

function severityDot(s: string) {
  return s === 'info'     ? 'bg-emerald-400'
    : s === 'warning'     ? 'bg-yellow-400'
    : s === 'critical'    ? 'bg-red-400'
    : 'bg-gray-500'
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCsv() {
  const rows = logs.value
  if (!rows.length) return
  const headers = ['Date', 'User', 'Module', 'Action', 'Ref#', 'Description', 'Severity', 'IP']
  const lines = rows.map((l: any) => [
    String(l.created_at).slice(0, 19),
    l.user_name          || '',
    l.module             || '',
    l.action             || '',
    l.reference_number   || '',
    `"${(l.description || '').replace(/"/g, '""')}"`,
    l.severity           || '',
    l.ip_address         || '',
  ].join(','))
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'audit-log.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
