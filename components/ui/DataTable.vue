<template>
  <div class="glass-card overflow-hidden">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/[0.06]">
      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder || 'Search…'"
          class="input-glass pl-9 pr-3 py-2 text-xs w-60"
        />
      </div>
      <div class="flex items-center gap-2">
        <slot name="toolbar" />
        <button v-if="exportable" @click="exportCSV" class="btn-ghost text-xs py-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/[0.05]">
            <th
              v-for="col in columns" :key="col.key"
              @click="col.sortable && toggleSort(col.key)"
              :class="['px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap select-none',
                       col.sortable ? 'cursor-pointer hover:text-gray-400 transition-colors' : '']"
            >
              <span class="flex items-center gap-1.5">
                {{ col.label }}
                <span v-if="col.sortable" class="flex flex-col gap-0.5">
                  <svg :class="['w-2.5 h-2.5 transition-colors', sortKey === col.key && sortDir === 'asc' ? 'text-gold-400' : 'text-gray-700']" viewBox="0 0 10 6" fill="currentColor"><path d="M0 6l5-6 5 6H0z"/></svg>
                  <svg :class="['w-2.5 h-2.5 transition-colors', sortKey === col.key && sortDir === 'desc' ? 'text-gold-400' : 'text-gray-700']" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6H0z"/></svg>
                </span>
              </span>
            </th>
            <th v-if="$slots.actions" class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="i in 6" :key="i">
              <td v-for="col in columns" :key="col.key" class="px-4 py-3.5">
                <div class="skeleton h-3.5 rounded" :style="`width: ${50 + Math.random()*40}%`" />
              </td>
              <td v-if="$slots.actions" class="px-4 py-3.5">
                <div class="skeleton h-3.5 w-16 rounded ml-auto" />
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else-if="paginatedRows.length">
            <tr
              v-for="(row, i) in paginatedRows" :key="i"
              @click="$emit('row-click', row)"
              :class="['transition-colors duration-100 group', onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : '']"
            >
              <td v-for="col in columns" :key="col.key" class="px-4 py-3.5 text-sm">
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  <span class="text-gray-300">{{ row[col.key] ?? '—' }}</span>
                </slot>
              </td>
              <td v-if="$slots.actions" class="px-4 py-3.5">
                <div class="flex items-center justify-end gap-1.5">
                  <slot name="actions" :row="row" />
                </div>
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else>
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-16 text-center">
              <div class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-1">
                  <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <p class="text-sm font-medium text-gray-500">No records found</p>
                <p class="text-xs text-gray-700">{{ search ? 'Try a different search term' : 'Nothing here yet' }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && filteredRows.length > perPage" class="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
      <span class="text-xs text-gray-600">
        Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredRows.length) }} of {{ filteredRows.length }}
      </span>
      <div class="flex items-center gap-1">
        <button @click="currentPage--" :disabled="currentPage === 1" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          v-for="p in pageNumbers" :key="p"
          @click="currentPage = p"
          :class="['w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150',
                   p === currentPage ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.07]']"
        >{{ p }}</button>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  columns: { key: string; label: string; sortable?: boolean }[]
  rows: Record<string, any>[]
  loading?: boolean
  searchPlaceholder?: string
  exportable?: boolean
  perPage?: number
  onRowClick?: boolean
}>()

const emit = defineEmits(['row-click'])

const search    = ref('')
const sortKey   = ref('')
const sortDir   = ref<'asc'|'desc'>('asc')
const currentPage = ref(1)
const perPage   = computed(() => props.perPage ?? 10)

function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
  currentPage.value = 1
}

const filteredRows = computed(() => {
  let rows = props.rows ?? []
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)))
  }
  if (sortKey.value) {
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey.value] ?? ''
      const bv = b[sortKey.value] ?? ''
      return sortDir.value === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }
  return rows
})

const totalPages  = computed(() => Math.ceil(filteredRows.value.length / perPage.value))
const paginatedRows = computed(() => filteredRows.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value))
const pageNumbers   = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 3)   return [1, 2, 3, 4, 5]
  if (cur >= total - 2) return [total-4, total-3, total-2, total-1, total]
  return [cur-2, cur-1, cur, cur+1, cur+2]
})

watch(search, () => { currentPage.value = 1 })

function exportCSV() {
  const headers = props.columns.map(c => c.label).join(',')
  const rows    = filteredRows.value.map(r => props.columns.map(c => `"${r[c.key] ?? ''}"`).join(',')).join('\n')
  const blob    = new Blob([headers + '\n' + rows], { type: 'text/csv' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>
