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
        <div class="flex gap-2">
          <button v-for="s in severities" :key="s"
            @click="severityFilter = s === 'All' ? '' : s; page = 1; refresh()"
            :class="['px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
              (s === 'All' ? !severityFilter : severityFilter === s)
                ? severityActive(s)
                : 'text-gray-600 border-white/[0.07] hover:text-gray-400']">
            {{ s }}
          </button>
        </div>
        <select v-model="userFilter" class="field-input text-xs py-1.5 w-52" @change="page=1;refresh()">
          <option value="">All Users</option>
          <option v-for="u in userNames" :key="u.id" :value="u.id">{{ u.display_name }}</option>
        </select>
        <input type="date" v-model="dateFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()" />
        <button @click="severityFilter=''; userFilter=''; dateFilter=''; page=1; refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
        <span class="text-xs text-gray-600 ml-auto">{{ data?.total ?? 0 }} events</span>
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Log entries -->
      <div class="glass-card overflow-hidden">
        <div class="divide-y divide-white/[0.04]">
          <div v-for="log in logs" :key="log.id"
               class="flex gap-4 p-4 hover:bg-white/[0.02] transition-colors">
            <div class="flex flex-col items-center shrink-0 mt-1.5">
              <div :class="['w-2.5 h-2.5 rounded-full shrink-0', severityDot(log.severity)]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm text-gray-200 leading-snug">{{ log.description }}</p>
                <span class="text-[10px] text-gray-600 shrink-0 font-mono whitespace-nowrap">
                  {{ String(log.created_at).slice(0, 16).replace('T', ' ') }}
                </span>
              </div>
              <div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                <span class="text-[11px] text-gray-500 font-mono">{{ log.user_name || '—' }}</span>
                <span v-if="log.module" class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                  {{ log.module }}
                </span>
                <span v-if="log.ip_address" class="text-[11px] text-gray-700 font-mono">{{ log.ip_address }}</span>
              </div>
            </div>
          </div>
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

const severities     = ['All', 'info', 'warning', 'error']
const severityFilter = ref('')
const userFilter     = ref('')
const dateFilter     = ref('')
const page           = ref(1)
const perPage        = 50

const { data, pending, error, refresh } = await useFetch('/api/admin/audit-logs', {
  query: computed(() => ({
    severity: severityFilter.value || undefined,
    user:     userFilter.value     || undefined,
    date:     dateFilter.value     || undefined,
    page:     page.value,
    per:      perPage,
  })),
})

const logs      = computed(() => (data.value?.logs  ?? []) as any[])
const userNames = computed(() => (data.value?.users ?? []) as { id: number; display_name: string }[])

function severityActive(s: string) {
  return s === 'info'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : s === 'warning'    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    : s === 'error'      ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : 'bg-gold-500/15 text-gold-400 border-gold-500/25'
}
function severityDot(s: string) {
  return s === 'info'    ? 'bg-emerald-400'
    : s === 'warning'    ? 'bg-yellow-400'
    : s === 'error'      ? 'bg-red-400'
    : 'bg-gray-500'
}

function exportCsv() {
  const rows = logs.value
  if (!rows.length) return
  const headers = ['Date', 'User', 'Action', 'Entity', 'Description', 'Severity', 'IP']
  const lines = rows.map((l: any) => [
    String(l.created_at).slice(0, 19),
    l.user_name || '',
    l.action || '',
    l.module || '',
    `"${(l.description || '').replace(/"/g, '""')}"`,
    l.severity || '',
    l.ip_address || '',
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
