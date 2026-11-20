<template>
  <div class="space-y-4">
    <UiPageHeader title="DB Viewer" subtitle="Read-only look at the database — Superadmin only" :breadcrumb="['Admin', 'DB Viewer']" />
    <div class="glass-card p-3 text-xs text-gray-500">Read-only by design: edits and deletes made here would skip the ledger, balances and audit trail, so they are not offered. Password and token columns are hidden.</div>

    <div v-if="!table" class="space-y-3">
      <input v-model="filter" type="search" placeholder="Find a table…" class="field-input text-xs py-1.5 w-64" />
      <div v-if="listPending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <button v-for="t in shownTables" :key="t.name" class="glass-card px-3 py-2 text-left hover:border-gold-500/30" @click="open(t.name)">
          <p class="text-xs font-mono text-gray-200 truncate">{{ t.name }}<span v-if="t.view" class="text-gray-600"> (view)</span></p><p class="text-[10px] text-gray-600">≈ {{ t.rows.toLocaleString() }} rows</p>
        </button>
      </div>
    </div>

    <template v-else>
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn-ghost text-xs" @click="close">← All tables</button>
        <strong class="font-mono text-sm text-gray-100">{{ table }}</strong>
        <input v-model="q" type="search" placeholder="Search this table…" class="field-input text-xs py-1.5 w-64" @keyup.enter="page = 1; reload()" />
        <button class="btn-ghost text-xs" @click="page = 1; reload()">Search</button>
        <button class="btn-ghost text-xs ml-auto" :disabled="!data?.rows?.length" @click="exportCsv">Export this page (CSV)</button>
      </div>
      <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
      <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
      <template v-else-if="data?.rows">
        <p class="text-[11px] text-gray-600">{{ data.total.toLocaleString() }} rows · page {{ data.page }} of {{ Math.max(1, Math.ceil(data.total / data.per)) }}<span v-if="data.hidden.length"> · hidden columns: {{ data.hidden.join(', ') }}</span></p>
        <div class="glass-card overflow-auto max-h-[70vh]">
          <table class="w-full text-[11px]">
            <thead class="sticky top-0 bg-[var(--bg-card,#14110d)]"><tr class="text-gray-500 uppercase tracking-wide"><th v-for="c in data.columns" :key="c.name" class="px-2 py-1.5 text-left whitespace-nowrap">{{ c.name }}<span v-if="c.pk" class="text-gold-400"> 🔑</span></th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in data.rows" :key="i" class="border-t border-white/[0.04] hover:bg-white/[0.02]">
                <td v-for="c in data.columns" :key="c.name" class="px-2 py-1 font-mono text-gray-300 whitespace-nowrap max-w-[22rem] truncate" :title="String(r[c.name] ?? '')">{{ r[c.name] === null ? '∅' : r[c.name] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost text-xs" :disabled="page <= 1" @click="page--; reload()">‹ Prev</button>
          <button class="btn-ghost text-xs" :disabled="page * data.per >= data.total" @click="page++; reload()">Next ›</button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const table = ref(''), q = ref(''), page = ref(1), filter = ref('')
const { data: list, pending: listPending } = await useFetch<any>('/api/admin/db-viewer')
const shownTables = computed(() => ((list.value?.tables ?? []) as any[]).filter(t => t.name.toLowerCase().includes(filter.value.toLowerCase())))
const { data, pending, error, refresh } = await useFetch<any>('/api/admin/db-viewer', { query: computed(() => ({ table: table.value || undefined, q: q.value || undefined, page: page.value })), immediate: false, watch: false })
const open = (t: string) => { table.value = t; q.value = ''; page.value = 1; refresh() }
const close = () => { table.value = ''; data.value = null }
const reload = () => refresh()
function exportCsv() {
  const cols = data.value.columns.map((c: any) => c.name)
  const esc = (v: any) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const blob = new Blob(['﻿' + [cols.join(','), ...data.value.rows.map((r: any) => cols.map((c: string) => esc(r[c])).join(','))].join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${table.value}_page${page.value}.csv`; a.click()
}
</script>
