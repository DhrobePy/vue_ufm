<template>
  <div class="space-y-6">
    <UiPageHeader title="Goods Received Notes" subtitle="Complete list of all GRN records"
                  :breadcrumb="['Purchase','GRNs']">
      <template #actions>
        <NuxtLink to="/purchase/grn/variance" class="btn-ghost text-xs">📊 Variance</NuxtLink>
        <NuxtLink to="/purchase/grn/create" class="btn-gold text-xs">+ Record GRN</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 border-l-2 border-blue-500/40">
        <p class="text-xs text-gray-500 mb-1">Total GRNs</p>
        <p class="text-2xl font-bold text-gray-200">{{ stats.total_grns ?? 0 }}</p>
        <p class="text-[10px] text-gray-600 mt-1">
          <span class="text-emerald-400">{{ stats.posted_count ?? 0 }} Posted</span> ·
          <span class="text-yellow-400">{{ stats.verified_count ?? 0 }} Verified</span> ·
          <span class="text-gray-500">{{ stats.draft_count ?? 0 }} Draft</span>
        </p>
      </div>
      <div class="glass-card p-4 border-l-2 border-purple-500/40">
        <p class="text-xs text-gray-500 mb-1">Expected Qty</p>
        <p class="text-2xl font-bold text-purple-400">{{ Number(stats.total_expected_qty ?? 0).toLocaleString() }}</p>
        <p class="text-[10px] text-gray-600 mt-1">KG</p>
      </div>
      <div class="glass-card p-4 border-l-2 border-emerald-500/40">
        <p class="text-xs text-gray-500 mb-1">Received Qty</p>
        <p class="text-2xl font-bold text-emerald-400">{{ Number(stats.total_received_qty ?? 0).toLocaleString() }}</p>
        <p class="text-[10px] mt-1"
           :class="Number(stats.total_variance_qty ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'">
          Variance: {{ Number(stats.total_variance_qty ?? 0) > 0 ? '+' : '' }}{{ Number(stats.total_variance_qty ?? 0).toLocaleString() }} KG
        </p>
      </div>
      <div class="glass-card p-4 border-l-2 border-orange-500/40">
        <p class="text-xs text-gray-500 mb-1">Total Value</p>
        <p class="text-2xl font-bold text-orange-400">৳{{ fmtCompact(stats.total_value ?? 0) }}</p>
        <p class="text-[10px] text-gray-600 mt-1">All filtered GRNs</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Date range -->
        <div class="flex items-center gap-2">
          <label class="text-[10px] text-gray-500 uppercase">From</label>
          <input v-model="filters.date_from" type="date" class="field-input text-xs py-1.5 w-36" />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-[10px] text-gray-500 uppercase">To</label>
          <input v-model="filters.date_to" type="date" class="field-input text-xs py-1.5 w-36" />
        </div>
        <!-- Supplier -->
        <select v-model="filters.supplier_id" class="field-input text-xs py-1.5 w-44">
          <option value="">All Suppliers</option>
          <option v-for="s in dropdowns.suppliers" :key="s.id" :value="s.id">{{ s.company_name }}</option>
        </select>
        <!-- Origin -->
        <select v-model="filters.wheat_origin" class="field-input text-xs py-1.5 w-36">
          <option value="">All Origins</option>
          <option v-for="o in dropdowns.origins" :key="o.wheat_origin" :value="o.wheat_origin">{{ o.wheat_origin }}</option>
        </select>
        <!-- Status -->
        <select v-model="filters.grn_status" class="field-input text-xs py-1.5 w-32">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="verified">Verified</option>
          <option value="posted">Posted</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <!-- Unload Point -->
        <select v-model="filters.unload_point" class="field-input text-xs py-1.5 w-36">
          <option value="">All Locations</option>
          <option v-for="u in dropdowns.unloadPoints" :key="u.unload_point_name" :value="u.unload_point_name">{{ u.unload_point_name }}</option>
        </select>
        <!-- Truck Number -->
        <input v-model="filters.truck_number" type="text" class="field-input text-xs py-1.5 w-32" placeholder="Truck #…" />
        <!-- Search -->
        <input v-model="filters.search" type="text" class="field-input text-xs py-1.5 w-44" placeholder="GRN#, PO#, Truck#…" />
      </div>
      <div class="flex items-center gap-3">
        <button @click="applyFilters" class="btn-gold text-xs py-1.5 px-4">Apply Filters</button>
        <button @click="resetFilters" class="btn-ghost text-xs py-1.5">Reset</button>
        <!-- Per page -->
        <div class="ml-auto flex items-center gap-2 text-xs text-gray-500">
          Show
          <select v-model.number="perPage" @change="page=1;refresh()" class="field-input text-xs py-1 w-16">
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
            <option :value="500">500</option>
          </select>
          per page &nbsp;·&nbsp;
          <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> records
        </div>
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <!-- Table -->
    <div v-if="!pending && !error" class="glass-card overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.08]">
            <th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">GRN #</th>
            <th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Date</th>
            <th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">PO #</th>
            <th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Supplier</th>
            <th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Origin</th>
            <th class="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Truck</th>
            <th class="px-3 py-3 text-right text-[10px] font-semibold text-purple-400 uppercase">Expected</th>
            <th class="px-3 py-3 text-right text-[10px] font-semibold text-emerald-400 uppercase">Received</th>
            <th class="px-3 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Variance</th>
            <th class="px-3 py-3 text-right text-[10px] font-semibold text-orange-400 uppercase">Value</th>
            <th class="px-3 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th>
            <th class="px-3 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-if="!rows.length">
            <td colspan="12" class="px-4 py-10 text-center text-gray-600">No GRNs found.</td>
          </tr>
          <tr v-for="g in rows" :key="g.id" class="hover:bg-white/[0.02] transition-colors">
            <!-- GRN # -->
            <td class="px-3 py-3">
              <NuxtLink :to="`/purchase/grn/${g.id}`"
                class="font-mono text-gold-400/80 font-semibold hover:underline">{{ g.grn_number }}</NuxtLink>
            </td>
            <!-- Date -->
            <td class="px-3 py-3 text-gray-400 whitespace-nowrap">{{ fmtDate(g.grn_date) }}</td>
            <!-- PO # -->
            <td class="px-3 py-3">
              <NuxtLink :to="`/purchase/orders/${g.purchase_order_id}`"
                class="font-mono text-indigo-400/80 hover:underline text-[11px]">{{ g.po_number }}</NuxtLink>
            </td>
            <!-- Supplier -->
            <td class="px-3 py-3 text-gray-300 max-w-[140px] truncate">{{ g.supplier_name }}</td>
            <!-- Origin -->
            <td class="px-3 py-3">
              <span v-if="g.wheat_origin" class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">{{ g.wheat_origin }}</span>
              <span v-else class="text-gray-700">—</span>
            </td>
            <!-- Truck -->
            <td class="px-3 py-3 text-gray-400 font-mono">{{ g.truck_number || '—' }}</td>
            <!-- Expected -->
            <td class="px-3 py-3 text-right font-mono text-purple-400">
              {{ Number(g.expected_quantity ?? 0).toLocaleString() }}
            </td>
            <!-- Received -->
            <td class="px-3 py-3 text-right font-mono text-emerald-400 font-semibold">
              {{ Number(g.quantity_received_kg).toLocaleString() }}
            </td>
            <!-- Variance -->
            <td class="px-3 py-3 text-right font-mono">
              <template v-if="Number(g.expected_quantity) > 0">
                <span :class="varianceColor(g)">{{ varianceSign(g) }}{{ varianceKg(g).toLocaleString() }}</span>
                <br>
                <span class="text-[10px]" :class="varianceColor(g)">({{ varianceSign(g) }}{{ Math.abs(variancePct(g)).toFixed(1) }}%)</span>
              </template>
              <span v-else class="text-gray-700">—</span>
            </td>
            <!-- Value -->
            <td class="px-3 py-3 text-right font-mono font-semibold text-gray-200">৳{{ Number(g.total_value).toLocaleString() }}</td>
            <!-- Status -->
            <td class="px-3 py-3 text-center"><UiStatusBadge :status="g.grn_status" /></td>
            <!-- Actions -->
            <td class="px-3 py-3 text-center">
              <div class="flex items-center justify-center gap-3">
                <NuxtLink :to="`/purchase/grn/${g.id}`" class="text-blue-400 hover:text-blue-300 text-xs" title="View">👁</NuxtLink>
                <NuxtLink :to="`/purchase/grn/${g.id}/print`" target="_blank"
                  class="text-gray-400 hover:text-gray-300 text-xs" title="Print">🖨</NuxtLink>
                <NuxtLink v-if="g.grn_status !== 'cancelled'" :to="`/purchase/grn/${g.id}/edit`"
                  class="text-orange-400 hover:text-orange-300 text-xs" title="Edit">✏</NuxtLink>
                <button v-if="g.grn_status !== 'cancelled'" @click="openDeleteModal(g)"
                  class="text-red-500 hover:text-red-400 text-xs" title="Delete">🗑</button>
              </div>
            </td>
          </tr>
        </tbody>
        <!-- Totals Footer -->
        <tfoot v-if="rows.length" class="border-t-2 border-white/[0.12] bg-white/[0.02] font-bold">
          <tr>
            <td colspan="6" class="px-3 py-3 text-xs text-gray-500 uppercase tracking-wider">
              Filtered Totals ({{ stats.total_grns ?? 0 }} GRNs, all pages)
            </td>
            <td class="px-3 py-3 text-right font-mono text-purple-400">{{ Number(stats.total_expected_qty ?? 0).toLocaleString() }}</td>
            <td class="px-3 py-3 text-right font-mono text-emerald-400">{{ Number(stats.total_received_qty ?? 0).toLocaleString() }}</td>
            <td class="px-3 py-3 text-right font-mono"
                :class="Number(stats.total_variance_qty ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'">
              {{ Number(stats.total_variance_qty ?? 0) > 0 ? '+' : '' }}{{ Number(stats.total_variance_qty ?? 0).toLocaleString() }}
            </td>
            <td class="px-3 py-3 text-right font-mono text-orange-400">৳{{ Number(stats.total_value ?? 0).toLocaleString() }}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between text-xs text-gray-500">
      <span>Showing {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, data?.total ?? 0) }} of {{ data?.total ?? 0 }}</span>
      <div class="flex items-center gap-1">
        <button :disabled="page <= 1" @click="goPage(1)" class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">«</button>
        <button :disabled="page <= 1" @click="goPage(page - 1)" class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">‹ Prev</button>
        <template v-for="p in pageRange" :key="p">
          <button @click="goPage(p)"
            class="btn-ghost text-xs py-1 px-2.5"
            :class="p === page ? 'bg-gold-500/20 text-gold-400 border-gold-500/30' : ''">{{ p }}</button>
        </template>
        <button :disabled="page >= totalPages" @click="goPage(page + 1)" class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">Next ›</button>
        <button :disabled="page >= totalPages" @click="goPage(totalPages)" class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">»</button>
      </div>
      <div class="flex items-center gap-2">
        Go to:
        <input v-model.number="jumpPage" type="number" :min="1" :max="totalPages"
          class="field-input text-xs py-1 w-14 text-center"
          @keydown.enter="goPage(jumpPage)" />
        <span>of {{ totalPages }}</span>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="deleteModal.show"
         class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
         @click.self="closeDeleteModal">
      <div class="glass-card p-6 max-w-md w-full mx-4 space-y-4">
        <h3 class="text-base font-bold text-gray-200 flex items-center gap-2">
          ⚠ Delete GRN <span class="text-red-400 font-mono">{{ deleteModal.grn?.grn_number }}</span>
        </h3>
        <p class="text-xs text-gray-400">This will cancel the GRN and recalculate PO totals. This action cannot be undone.</p>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase">Reason <span class="text-red-500">*</span></label>
          <textarea v-model="deleteModal.reason" rows="3" class="field-input text-xs resize-none w-full"
            placeholder="Please provide a reason for deleting this GRN…" />
        </div>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteModal" class="btn-ghost text-xs">Cancel</button>
          <button @click="confirmDelete" :disabled="!deleteModal.reason.trim() || deleteModal.loading"
            class="px-4 py-2 rounded-xl bg-red-600/80 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50">
            {{ deleteModal.loading ? 'Deleting…' : '🗑 Delete GRN' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const filters = reactive({
  date_from:    '',
  date_to:      '',
  supplier_id:  '',
  wheat_origin: '',
  grn_status:   '',
  unload_point: '',
  truck_number: '',
  search:       '',
})

const page    = ref(1)
const perPage = ref(50)
const jumpPage = ref(1)

// Applied filters (sent to API)
const applied = reactive({ ...filters })

const { data, pending, error, refresh } = await useFetch('/api/purchase/grn', {
  query: computed(() => ({
    ...applied,
    page:  page.value,
    per:   perPage.value,
  })),
})

function fmtDate(val: any): string {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const rows    = computed(() => (data.value?.grns ?? []) as any[])
const stats   = computed(() => (data.value?.stats ?? {}) as any)
const dropdowns = computed(() => ({
  suppliers:    (data.value?.suppliers    ?? []) as any[],
  origins:      (data.value?.origins      ?? []) as any[],
  unloadPoints: (data.value?.unloadPoints ?? []) as any[],
}))

const totalPages = computed(() => Math.ceil((data.value?.total ?? 0) / perPage.value))
const pageRange  = computed(() => {
  const start = Math.max(1, page.value - 2)
  const end   = Math.min(totalPages.value, page.value + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function applyFilters() {
  Object.assign(applied, filters)
  page.value = 1
  refresh()
}
function resetFilters() {
  Object.assign(filters, { date_from:'', date_to:'', supplier_id:'', wheat_origin:'', grn_status:'', unload_point:'', truck_number:'', search:'' })
  Object.assign(applied, filters)
  page.value = 1
  refresh()
}
function goPage(p: number) {
  page.value = Math.max(1, Math.min(p, totalPages.value))
  jumpPage.value = page.value
  refresh()
}

// Variance helpers
function varianceKg(g: any) { return Math.abs(Number(g.quantity_received_kg) - Number(g.expected_quantity)) }
function variancePct(g: any) {
  const exp = Number(g.expected_quantity)
  if (!exp) return 0
  return ((Number(g.quantity_received_kg) - exp) / exp) * 100
}
function varianceSign(g: any) { return Number(g.quantity_received_kg) >= Number(g.expected_quantity) ? '+' : '-' }
function varianceColor(g: any) {
  const pct = Math.abs(variancePct(g))
  if (pct > 1) return 'text-red-400'
  if (pct > 0.5) return 'text-yellow-400'
  return 'text-emerald-400'
}

function fmtCompact(v: any) {
  const n = Number(v ?? 0)
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`
  return n.toLocaleString()
}

// Delete modal
const deleteModal = reactive({
  show:    false,
  grn:     null as any,
  reason:  '',
  loading: false,
})
function openDeleteModal(g: any) { deleteModal.grn = g; deleteModal.reason = ''; deleteModal.show = true }
function closeDeleteModal()      { deleteModal.show = false; deleteModal.grn = null }

async function confirmDelete() {
  if (!deleteModal.reason.trim()) return
  deleteModal.loading = true
  try {
    await $fetch(`/api/purchase/grn/${deleteModal.grn.id}`, {
      method: 'DELETE',
      body: { reason: deleteModal.reason },
    })
    success(`GRN ${deleteModal.grn.grn_number} deleted`)
    closeDeleteModal()
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete GRN')
  } finally {
    deleteModal.loading = false
  }
}
</script>
