<template>
  <div class="space-y-6">
    <UiPageHeader title="Product Pricing" subtitle="Manage selling prices per variant and branch"
                  :breadcrumb="['Products', 'Pricing']" />

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" placeholder="Search product or SKU…"
             class="input-glass w-56 text-xs py-1.5" />
      <select v-model="filterCategory" class="input-glass w-auto text-xs py-1.5">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <div class="ml-auto text-xs text-gray-500">
        {{ filteredVariants.length }} variant(s)
      </div>
    </div>

    <!-- Main price matrix table -->
    <div class="glass-card overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="pb-3 px-3 text-left text-gray-500 font-semibold uppercase tracking-wider min-w-[180px]">Product</th>
            <th class="pb-3 px-3 text-left text-gray-500 font-semibold uppercase tracking-wider">SKU</th>
            <th class="pb-3 px-3 text-left text-gray-500 font-semibold uppercase tracking-wider">Cat.</th>
            <th v-for="b in branches" :key="b.id"
                class="pb-3 px-3 text-right text-gray-500 font-semibold uppercase tracking-wider min-w-[120px]">
              {{ b.code }}
            </th>
            <th class="pb-3 px-3 text-right text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <template v-for="v in filteredVariants" :key="v.id">
            <!-- Main row -->
            <tr class="hover:bg-white/[0.02]">
              <td class="py-3 px-3">
                <p class="font-semibold text-gray-200">{{ v.product_name }}</p>
                <p class="text-gray-600 text-[11px]">{{ v.weight_variant }}{{ v.unit_of_measure }} · Grade {{ v.grade }}</p>
              </td>
              <td class="py-3 px-3 text-gray-400 font-mono text-[11px]">{{ v.sku }}</td>
              <td class="py-3 px-3 text-gray-500">{{ v.category }}</td>

              <!-- Price cell per branch -->
              <td v-for="b in branches" :key="b.id" class="py-3 px-3 text-right">
                <template v-if="priceFor(v, b.id)">
                  <div class="flex flex-col items-end gap-1">
                    <span class="font-mono font-bold text-gold-300">
                      ৳{{ Number(priceFor(v, b.id).unit_price).toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}
                    </span>
                    <span class="text-[10px] text-gray-600">{{ fmtDate(priceFor(v, b.id).effective_date) }}</span>
                    <button @click="openSetPrice(v, b, priceFor(v, b.id))"
                            class="text-[10px] text-blue-400 hover:text-blue-300 underline">
                      Update
                    </button>
                  </div>
                </template>
                <template v-else>
                  <button @click="openSetPrice(v, b, null)"
                          class="text-[11px] text-gray-600 hover:text-gold-400 border border-white/10 hover:border-gold-500/30 rounded px-2 py-0.5 transition-colors">
                    + Set
                  </button>
                </template>
              </td>

              <!-- History toggle -->
              <td class="py-3 px-3 text-right">
                <button @click="toggleHistory(v)"
                        class="text-[11px] text-gray-500 hover:text-gray-300 underline">
                  {{ expandedId === v.id ? 'Hide' : 'History' }}
                </button>
              </td>
            </tr>

            <!-- Expandable history row -->
            <tr v-if="expandedId === v.id" class="bg-white/[0.015]">
              <td :colspan="3 + branches.length + 1" class="px-6 py-4">
                <div v-if="historyLoading" class="text-xs text-gray-500 py-2">Loading history…</div>
                <div v-else-if="!historyRows.length" class="text-xs text-gray-600 py-2">No price history found.</div>
                <table v-else class="w-full text-xs">
                  <thead>
                    <tr class="text-gray-600 border-b border-white/[0.04]">
                      <th class="pb-2 text-left font-medium">Branch</th>
                      <th class="pb-2 text-right font-medium">Price (৳)</th>
                      <th class="pb-2 text-right font-medium">Effective</th>
                      <th class="pb-2 text-center font-medium">State</th>
                      <th class="pb-2 text-right font-medium">Set on</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/[0.02]">
                    <tr v-for="h in historyRows" :key="h.id"
                        :class="h.is_active ? 'text-gray-200' : 'text-gray-600 opacity-60'">
                      <td class="py-1.5">{{ h.branch_name }}</td>
                      <td class="py-1.5 text-right font-mono">{{ Number(h.unit_price).toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}</td>
                      <td class="py-1.5 text-right">{{ fmtDate(h.effective_date) }}</td>
                      <td class="py-1.5 text-center">
                        <span v-if="h.is_active"
                              class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">Active</span>
                        <span v-else
                              class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-gray-500">Archived</span>
                      </td>
                      <td class="py-1.5 text-right text-gray-600">{{ fmtDate(h.created_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>

          <tr v-if="!filteredVariants.length">
            <td :colspan="3 + branches.length + 1" class="py-10 text-center text-gray-600 text-xs">
              No variants found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Set / Update Price Modal ── -->
    <Teleport to="body">
      <div v-if="modal.show"
           class="fixed inset-0 z-50 flex items-center justify-center p-4"
           @click.self="closeModal">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal" />
        <div class="relative glass-card w-full max-w-md p-6 space-y-5 z-10">

          <!-- Header -->
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-base font-bold text-gray-100">
                {{ modal.existing ? 'Update Price' : 'Set New Price' }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ modal.variant?.product_name }} · {{ modal.variant?.sku }}
              </p>
            </div>
            <button @click="closeModal" class="text-gray-600 hover:text-gray-300 text-lg leading-none">✕</button>
          </div>

          <!-- Current active price info -->
          <div v-if="modal.existing"
               class="rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-xs space-y-1">
            <p class="text-gray-500">Current price for <span class="text-gray-300 font-semibold">{{ modal.branch?.name }}</span></p>
            <p class="text-gold-300 font-mono font-bold text-sm">
              ৳{{ Number(modal.existing.unit_price).toLocaleString('en-BD', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-gray-600">Effective: {{ fmtDate(modal.existing.effective_date) }}</p>
            <p class="text-gray-600 text-[11px]">Saving will archive this price and create a new active record.</p>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- Branch (disabled if updating, selectable if adding) -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Branch / Factory</label>
              <select v-if="!modal.existing" v-model="form.branchId"
                      class="input-glass w-full text-xs py-2">
                <option value="" disabled>Select branch…</option>
                <option v-for="b in availableBranches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
              <div v-else class="input-glass w-full text-xs py-2 text-gray-400 cursor-not-allowed opacity-70">
                {{ modal.branch?.name }}
              </div>
            </div>

            <!-- New price -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">New Unit Price (৳)</label>
              <input v-model.number="form.unitPrice" type="number" min="0" step="0.01"
                     class="input-glass w-full text-xs py-2 font-mono"
                     placeholder="e.g. 2250.00" />
            </div>

            <!-- Effective date -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Effective Date</label>
              <input v-model="form.effectiveDate" type="date"
                     class="input-glass w-full text-xs py-2" />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Price Status</label>
              <select v-model="form.status" class="input-glass w-full text-xs py-2">
                <option value="active">Active</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-1">
            <button @click="closeModal"
                    class="px-4 py-2 text-xs rounded-lg border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors">
              Cancel
            </button>
            <button @click="savePrice" :disabled="saving || !canSave"
                    class="btn-gold text-xs px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="saving" class="w-3 h-3 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ saving ? 'Saving…' : (modal.existing ? 'Update Price' : 'Set Price') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// ── Data ────────────────────────────────────────────────────────────────────
const { data, refresh } = await useFetch('/api/products/pricing')

const variants  = computed(() => (data.value as any)?.variants  ?? [])
const branches  = computed(() => (data.value as any)?.branches  ?? [])
const categories = computed(() => {
  const cats = new Set<string>()
  for (const v of variants.value) if (v.category) cats.add(v.category)
  return [...cats].sort()
})

// ── Filters ──────────────────────────────────────────────────────────────────
const search         = ref('')
const filterCategory = ref('')

const filteredVariants = computed(() => {
  let list = variants.value as any[]
  if (filterCategory.value)
    list = list.filter((v: any) => v.category === filterCategory.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((v: any) =>
      v.product_name?.toLowerCase().includes(q) || v.sku?.toLowerCase().includes(q),
    )
  }
  return list
})

// ── Helper: get active price for a variant × branch ──────────────────────────
function priceFor(variant: any, branchId: number) {
  return (variant.prices as any[]).find((p: any) => p.branch_id === branchId) ?? null
}

// ── History panel ─────────────────────────────────────────────────────────
const expandedId     = ref<number | null>(null)
const historyLoading = ref(false)
const historyRows    = ref<any[]>([])

async function toggleHistory(v: any) {
  if (expandedId.value === v.id) {
    expandedId.value = null
    historyRows.value = []
    return
  }
  expandedId.value = v.id
  historyLoading.value = true
  historyRows.value = []
  try {
    const res = await $fetch<{ history: any[] }>(`/api/products/pricing/history?variantId=${v.id}`)
    historyRows.value = res.history ?? []
  } catch {
    historyRows.value = []
  } finally {
    historyLoading.value = false
  }
}

// ── Set Price Modal ───────────────────────────────────────────────────────
const modal = reactive<{
  show: boolean
  variant: any | null
  branch: any | null
  existing: any | null
}>({ show: false, variant: null, branch: null, existing: null })

const form = reactive({
  branchId: '' as number | '',
  unitPrice: 0 as number,
  effectiveDate: new Date().toISOString().slice(0, 10),
  status: 'active',
})

const saving = ref(false)

const canSave = computed(() =>
  (modal.existing ? true : !!form.branchId) && form.unitPrice > 0,
)

// Branches that don't already have an active price for the selected variant
const availableBranches = computed(() => {
  if (!modal.variant) return branches.value
  const priced = new Set((modal.variant.prices as any[]).map((p: any) => p.branch_id))
  return (branches.value as any[]).filter((b: any) => !priced.has(b.id))
})

function openSetPrice(variant: any, branch: any, existing: any | null) {
  modal.variant  = variant
  modal.branch   = branch
  modal.existing = existing
  modal.show     = true

  form.branchId      = existing ? branch.id : ''
  form.unitPrice     = existing ? Number(existing.unit_price) : 0
  form.effectiveDate = new Date().toISOString().slice(0, 10)
  form.status        = existing?.status ?? 'active'
}

function closeModal() {
  modal.show = false
}

async function savePrice() {
  saving.value = true
  try {
    const branchId = modal.existing ? modal.branch!.id : form.branchId
    await $fetch('/api/products/pricing', {
      method: 'POST',
      body: {
        action:        'set_price',
        variantId:     modal.variant!.id,
        branchId,
        unitPrice:     form.unitPrice,
        effectiveDate: form.effectiveDate,
        status:        form.status,
      },
    })
    success(`Price saved for ${modal.branch?.name ?? 'branch'} — old price archived`)
    modal.show = false
    // If history panel is open for this variant, reload it
    if (expandedId.value === modal.variant!.id) await toggleHistory(modal.variant!)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save price')
  } finally {
    saving.value = false
  }
}

// ── Formatting helpers ───────────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
