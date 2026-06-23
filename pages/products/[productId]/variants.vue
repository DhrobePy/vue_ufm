<template>
  <div class="space-y-5">

    <UiPageHeader :title="product?.base_name ?? 'Variants'"
                  subtitle="Manage pack sizes, grades, and SKUs for this product"
                  :breadcrumb="['Products', 'Base Products', product?.base_name ?? '…', 'Variants']">
      <template #actions>
        <div class="flex items-center gap-2">
          <NuxtLink to="/products/base" class="btn-ghost text-xs">← Back</NuxtLink>
          <button @click="openAdd" class="btn-gold text-xs flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add Variant
          </button>
        </div>
      </template>
    </UiPageHeader>

    <!-- Product info strip -->
    <div v-if="product" class="glass-card px-5 py-3.5 flex items-center gap-4 flex-wrap">
      <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">
        {{ catIcon(product.category) }}
      </div>
      <div>
        <p class="font-bold text-gray-200">{{ product.base_name }}</p>
        <p class="text-[11px] text-gray-500">
          Category: <span class="text-gray-400">{{ product.category }}</span>
          <span v-if="product.base_sku" class="ml-3 font-mono text-gold-400/80">SKU: {{ product.base_sku }}</span>
        </p>
      </div>
      <div class="ml-auto flex items-center gap-3 text-[11px]">
        <span class="text-gray-600">{{ variants.length }} variant{{ variants.length !== 1 ? 's' : '' }}</span>
        <span class="px-2 py-0.5 rounded-full border text-[10px] font-semibold"
              :class="product.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'">
          {{ product.status }}
        </span>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading variants…</p>
    </div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <!-- Variants Table -->
    <div v-else class="glass-card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06] text-[10px] text-gray-600 uppercase tracking-wider">
              <th class="px-4 py-3 text-left font-semibold">SKU</th>
              <th class="px-3 py-3 text-left font-semibold">Weight / Pack</th>
              <th class="px-3 py-3 text-center font-semibold">Grade</th>
              <th class="px-3 py-3 text-center font-semibold">Weight kg</th>
              <th class="px-3 py-3 text-center font-semibold">UOM</th>
              <th class="px-3 py-3 text-center font-semibold">Stock</th>
              <th class="px-3 py-3 text-center font-semibold">Status</th>
              <th class="px-3 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.03]">
            <tr v-if="!variants.length">
              <td colspan="8" class="py-10 text-center text-gray-600 italic">No variants yet — add one above</td>
            </tr>
            <tr v-for="v in variants" :key="v.id"
                class="hover:bg-white/[0.025] transition-colors group">
              <td class="px-4 py-3 font-mono text-gray-300 text-[11px]">{{ v.sku || '—' }}</td>
              <td class="px-3 py-3">
                <span class="px-2 py-0.5 rounded-md text-[11px] font-bold"
                      :class="packBadge(v.weight_variant)">
                  {{ v.weight_variant }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <span v-if="v.grade"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border shadow-sm"
                      :class="gradeBadge(v.grade)">
                  {{ v.grade }}
                </span>
                <span v-else class="text-gray-700 text-[10px]">—</span>
              </td>
              <td class="px-3 py-3 text-center text-gray-400 font-mono">
                {{ v.weight_kg ? Number(v.weight_kg).toFixed(2) : '—' }}
              </td>
              <td class="px-3 py-3 text-center">
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500">{{ v.unit_of_measure ?? 'bag' }}</span>
              </td>
              <td class="px-3 py-3 text-center font-mono text-gray-300">
                {{ Number(v.stock_qty || 0).toLocaleString() }}
              </td>
              <td class="px-3 py-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                      :class="v.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'">
                  {{ v.status }}
                </span>
              </td>
              <td class="px-3 py-3 text-center">
                <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NuxtLink :to="`/products/${productId}/${v.id}/pricing`"
                            class="px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                    Pricing
                  </NuxtLink>
                  <button @click="openEdit(v)"
                          class="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button v-if="isProd" @click="confirmDelete(v)"
                          class="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Variant Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAdd"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="showAdd = false">
          <div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Add Variant</h3>
              <button @click="showAdd = false" class="text-gray-500 hover:text-gray-200 text-lg">✕</button>
            </div>

            <!-- SKU preview -->
            <div v-if="skuPreview" class="rounded-lg bg-gold-500/10 border border-gold-500/20 px-4 py-2.5 flex items-center gap-2">
              <span class="text-[10px] text-gray-500 uppercase tracking-wider">SKU preview:</span>
              <span class="font-mono font-bold text-gold-300 text-sm">{{ skuPreview }}</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pack Weight *</label>
                <input v-model="addForm.weight_variant" class="input-glass text-xs"
                       placeholder="e.g. 50kg" @input="updateSkuPreview" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Grade</label>
                <select v-model="addForm.grade" class="input-glass text-xs" @change="updateSkuPreview">
                  <option value="">— None —</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="R">Grade R</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom SKU</label>
                <input v-model="addForm.sku" class="input-glass text-xs font-mono"
                       placeholder="Auto-generated or custom" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit of Measure</label>
                <select v-model="addForm.unit_of_measure" class="input-glass text-xs">
                  <option value="bag">bag</option>
                  <option value="kg">kg</option>
                  <option value="gm">gm</option>
                  <option value="litre">litre</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                <input v-model.number="addForm.weight_kg" type="number" step="0.01" min="0"
                       class="input-glass text-xs" placeholder="e.g. 50.00" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Barcode</label>
                <input v-model="addForm.barcode" class="input-glass text-xs font-mono"
                       placeholder="EAN-13 or custom" />
              </div>
            </div>
            <div class="flex gap-3 pt-1">
              <button @click="submitAdd" :disabled="!addForm.weight_variant || saving"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Adding…' : 'Add Variant' }}
              </button>
              <button @click="showAdd = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Variant Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEdit"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="showEdit = false">
          <div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Edit Variant</h3>
              <button @click="showEdit = false" class="text-gray-500 hover:text-gray-200 text-lg">✕</button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pack Weight *</label>
                <input v-model="editForm.weight_variant" class="input-glass text-xs" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Grade</label>
                <select v-model="editForm.grade" class="input-glass text-xs">
                  <option value="">— None —</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="R">Grade R</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">SKU</label>
                <input v-model="editForm.sku" class="input-glass text-xs font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit of Measure</label>
                <select v-model="editForm.unit_of_measure" class="input-glass text-xs">
                  <option value="bag">bag</option>
                  <option value="kg">kg</option>
                  <option value="gm">gm</option>
                  <option value="litre">litre</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                <input v-model.number="editForm.weight_kg" type="number" step="0.01" min="0"
                       class="input-glass text-xs" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select v-model="editForm.status" class="input-glass text-xs">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 pt-1">
              <button @click="submitEdit" :disabled="!editForm.weight_variant || saving"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
              <button @click="showEdit = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget"
             class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="deleteTarget = null">
          <div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-red-500/20 p-6 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-100">Deactivate Variant?</h3>
                <p class="text-xs text-gray-400 mt-1">
                  "<strong>{{ deleteTarget?.weight_variant }}</strong>
                  {{ deleteTarget?.grade ? `Grade ${deleteTarget.grade}` : '' }}" will be set to inactive.
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="doDelete" :disabled="deleting"
                      class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 disabled:opacity-50 transition-colors">
                {{ deleting ? 'Deactivating…' : 'Yes, Deactivate' }}
              </button>
              <button @click="deleteTarget = null" class="btn-ghost text-xs px-4 py-2">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route      = useRoute()
const productId  = Number(route.params.productId)
const { user }   = useUserSession()
const { success, error: toastError } = useToast()
const { generateSku } = useSkuGenerator()

const isProd = computed(() => {
  const r = (user.value?.role ?? '').toLowerCase()
  return ['admin', 'superadmin', 'production manager-srg', 'production manager-demra'].includes(r)
})

// ── Data ──────────────────────────────────────────────────────────────────────
const { data, pending, error: fetchError, refresh } = await useFetch(
  `/api/products/variants?product=${productId}`,
)

const variants = computed(() => (data.value?.variants ?? []) as any[])
const product  = computed(() => {
  const prods = (data.value?.products ?? []) as any[]
  return prods.find((p: any) => p.id === productId) ?? null
})

// Base SKU from product for SKU auto-gen
const productBaseSku = computed(() => product.value?.base_sku ?? '')

// ── SKU preview (add form only) ───────────────────────────────────────────────
const skuPreview = ref('')
function updateSkuPreview() {
  if (!addForm.weight_variant || !addForm.grade) { skuPreview.value = ''; return }
  const base = productBaseSku.value || 'SKU'
  skuPreview.value = generateSku(base, addForm.weight_variant, addForm.grade)
}

// ── Add ───────────────────────────────────────────────────────────────────────
const showAdd  = ref(false)
const saving   = ref(false)
const addForm  = reactive({
  weight_variant:  '',
  grade:           '',
  sku:             '',
  unit_of_measure: 'bag',
  weight_kg:       null as number | null,
  barcode:         '',
})

function openAdd() {
  Object.assign(addForm, { weight_variant: '', grade: '', sku: '', unit_of_measure: 'bag', weight_kg: null, barcode: '' })
  skuPreview.value = ''
  showAdd.value = true
}

async function submitAdd() {
  if (!addForm.weight_variant) return
  saving.value = true
  const autoSku = addForm.sku || (
    (productBaseSku.value && addForm.grade)
      ? generateSku(productBaseSku.value, addForm.weight_variant, addForm.grade)
      : ''
  )
  try {
    await $fetch('/api/products/variants', {
      method: 'POST',
      body: {
        product_id:     productId,
        weight_variant: addForm.weight_variant,
        sku:            autoSku || null,
        grade:          addForm.grade || null,
        unit_of_measure: addForm.unit_of_measure,
        weight_kg:      addForm.weight_kg || null,
        barcode:        addForm.barcode || null,
      },
    })
    success('Variant added ✓')
    showAdd.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add variant')
  } finally {
    saving.value = false
  }
}

// ── Edit ──────────────────────────────────────────────────────────────────────
const showEdit   = ref(false)
const editTarget = ref<any | null>(null)
const editForm   = reactive({
  weight_variant:  '',
  grade:           '',
  sku:             '',
  unit_of_measure: 'bag',
  weight_kg:       null as number | null,
  status:          'active',
})

function openEdit(v: any) {
  editTarget.value = v
  Object.assign(editForm, {
    weight_variant:  v.weight_variant,
    grade:           v.grade ?? '',
    sku:             v.sku ?? '',
    unit_of_measure: v.unit_of_measure ?? 'bag',
    weight_kg:       v.weight_kg ?? null,
    status:          v.status,
  })
  showEdit.value = true
}

async function submitEdit() {
  if (!editForm.weight_variant || !editTarget.value) return
  saving.value = true
  try {
    await $fetch(`/api/products/variants/${editTarget.value.id}`, {
      method: 'PUT',
      body: {
        weight_variant:  editForm.weight_variant,
        grade:           editForm.grade || null,
        sku:             editForm.sku || null,
        unit_of_measure: editForm.unit_of_measure,
        weight_kg:       editForm.weight_kg || null,
        status:          editForm.status,
      },
    })
    success('Variant updated ✓')
    showEdit.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update')
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget = ref<any | null>(null)
const deleting     = ref(false)

function confirmDelete(v: any) { deleteTarget.value = v }

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/products/variants/${deleteTarget.value.id}`, { method: 'DELETE' })
    success('Variant deactivated ✓')
    deleteTarget.value = null
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to deactivate')
  } finally {
    deleting.value = false
  }
}

// ── Design helpers ────────────────────────────────────────────────────────────
function gradeBadge(g: string) {
  const m: Record<string, string> = {
    A: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    B: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    C: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    R: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }
  return m[g] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

function packBadge(w: string) {
  const n = parseInt(w)
  if (n === 50) return 'bg-blue-500/15 text-blue-300'
  if (n === 74) return 'bg-purple-500/15 text-purple-300'
  if (n === 37) return 'bg-rose-500/15 text-rose-300'
  return 'bg-amber-500/15 text-amber-300'
}

function catIcon(cat: string) {
  const m: Record<string, string> = { Flour: '🌾', Atta: '🫓', Bran: '🌿', Semolina: '✨' }
  return m[cat] ?? '📦'
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
