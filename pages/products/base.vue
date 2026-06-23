<template>
  <div class="space-y-5">

    <UiPageHeader title="Base Products" subtitle="Master list of all product families"
                  :breadcrumb="['Products', 'Base Products']">
      <template #actions>
        <button @click="openAdd" class="btn-gold text-xs flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          New Product
        </button>
      </template>
    </UiPageHeader>

    <!-- Loading / error -->
    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading…</p>
    </div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">
      ⚠ {{ fetchError.message }}
    </div>

    <div v-else class="glass-card p-0 overflow-hidden">

      <!-- Search bar -->
      <div class="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 min-w-[180px] max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input v-model="search" placeholder="Search name or SKU…"
                 class="input-glass pl-9 pr-3 py-1.5 text-xs w-full" />
        </div>
        <select v-model="filterCat" class="input-glass py-1.5 text-xs w-auto">
          <option value="">All Categories</option>
          <option value="Flour">Flour</option>
          <option value="Atta">Atta</option>
          <option value="Bran">Bran</option>
          <option value="Semolina">Semolina</option>
        </select>
        <span class="text-[11px] text-gray-600 ml-auto">{{ filtered.length }} product{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06] text-[10px] text-gray-600 uppercase tracking-wider">
              <th class="px-4 py-3 text-left font-semibold">Name</th>
              <th class="px-3 py-3 text-left font-semibold">Base SKU</th>
              <th class="px-3 py-3 text-left font-semibold">Category</th>
              <th class="px-3 py-3 text-center font-semibold">Variants</th>
              <th class="px-3 py-3 text-center font-semibold">Status</th>
              <th class="px-3 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.03]">
            <tr v-if="!filtered.length">
              <td colspan="6" class="py-10 text-center text-gray-600 text-xs italic">No products match your filter</td>
            </tr>

            <template v-for="p in filtered" :key="p.id">
              <!-- Normal row -->
              <tr v-if="editingId !== p.id"
                  class="hover:bg-white/[0.025] transition-colors group">
                <td class="px-4 py-2.5 font-semibold text-gray-200">{{ p.base_name }}</td>
                <td class="px-3 py-2.5 font-mono text-gray-400 text-[11px]">{{ p.base_sku || '—' }}</td>
                <td class="px-3 py-2.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        :class="catPill(p.category)">{{ p.category }}</span>
                </td>
                <td class="px-3 py-2.5 text-center text-gray-400">{{ p.variant_count }}</td>
                <td class="px-3 py-2.5 text-center">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                        :class="p.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'">
                    {{ p.status }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <NuxtLink :to="`/products/${p.id}/variants`"
                              class="px-2 py-1 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors">
                      Variants
                    </NuxtLink>
                    <button @click="startEdit(p)"
                            class="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-all">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    </button>
                    <button v-if="isAdmin" @click="confirmDelete(p)"
                            class="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Inline edit row -->
              <tr v-else class="bg-white/[0.04]">
                <td class="px-3 py-2">
                  <input v-model="editForm.base_name" class="input-glass py-1.5 text-xs w-full" placeholder="Product name *" />
                </td>
                <td class="px-3 py-2">
                  <input v-model="editForm.base_sku" class="input-glass py-1.5 text-xs w-full font-mono" placeholder="UFF" />
                </td>
                <td class="px-3 py-2">
                  <select v-model="editForm.category" class="input-glass py-1.5 text-xs w-full">
                    <option value="Flour">Flour</option>
                    <option value="Atta">Atta</option>
                    <option value="Bran">Bran</option>
                    <option value="Semolina">Semolina</option>
                  </select>
                </td>
                <td class="px-3 py-2 text-center text-gray-500">{{ p.variant_count }}</td>
                <td class="px-3 py-2">
                  <select v-model="editForm.status" class="input-glass py-1.5 text-xs w-full">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td class="px-3 py-2">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="saveInlineEdit" :disabled="saving || !editForm.base_name"
                            class="px-3 py-1 rounded text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
                      {{ saving ? '…' : 'Save' }}
                    </button>
                    <button @click="cancelEdit"
                            class="px-3 py-1 rounded text-[11px] text-gray-500 border border-white/[0.08] hover:text-gray-300 transition-colors">
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAdd"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             @click.self="showAdd = false">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">New Base Product</h3>
              <button @click="showAdd = false" class="text-gray-500 hover:text-gray-200 text-lg">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name *</label>
                <input v-model="addForm.base_name" type="text" class="input-glass"
                       placeholder="e.g. 2Hati Moida" @keyup.enter="submitAdd" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base SKU</label>
                <input v-model="addForm.base_sku" type="text" class="input-glass font-mono uppercase"
                       placeholder="e.g. UFF" />
                <p class="text-[10px] text-gray-600">Used for auto-generating variant SKUs (e.g. UFF-50KG-A)</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label>
                <select v-model="addForm.category" class="input-glass">
                  <option value="Flour">Flour (Moida)</option>
                  <option value="Atta">Atta</option>
                  <option value="Bran">Bran (Vushi)</option>
                  <option value="Semolina">Semolina (Sooji)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="addForm.description" rows="2" class="input-glass resize-none" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="submitAdd" :disabled="!addForm.base_name || saving"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Adding…' : 'Add Product' }}
              </button>
              <button @click="showAdd = false" class="btn-ghost text-xs">Cancel</button>
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
                <h3 class="text-base font-bold text-gray-100">Delete Product?</h3>
                <p class="text-xs text-gray-400 mt-1">
                  "<strong>{{ deleteTarget?.base_name }}</strong>" will be soft-deleted. Variants and prices are preserved.
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="doDelete" :disabled="deleting"
                      class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 disabled:opacity-50 transition-colors">
                {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
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

const { user } = useUserSession()
const { success, error: toastError } = useToast()

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()),
)

// ── Data ──────────────────────────────────────────────────────────────────────
const { data, pending, error: fetchError, refresh } = await useFetch('/api/products/base')
const products = computed(() => (data.value?.products ?? []) as any[])

// ── Filters ───────────────────────────────────────────────────────────────────
const search    = ref('')
const filterCat = ref('')

const filtered = computed(() => {
  let list = products.value
  if (filterCat.value) list = list.filter((p: any) => p.category === filterCat.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((p: any) =>
      p.base_name.toLowerCase().includes(q) ||
      (p.base_sku ?? '').toLowerCase().includes(q),
    )
  }
  return list
})

// ── Inline Edit ───────────────────────────────────────────────────────────────
const editingId = ref<number | null>(null)
const editForm  = reactive({ base_name: '', base_sku: '', category: 'Flour', description: '', status: 'active' })
const saving    = ref(false)

function startEdit(p: any) {
  editingId.value = p.id
  Object.assign(editForm, {
    base_name:   p.base_name,
    base_sku:    p.base_sku ?? '',
    category:    p.category,
    description: p.description ?? '',
    status:      p.status,
  })
}

function cancelEdit() {
  editingId.value = null
}

async function saveInlineEdit() {
  if (!editForm.base_name || !editingId.value) return
  saving.value = true
  try {
    await $fetch(`/api/products/base/${editingId.value}`, {
      method: 'PUT',
      body: {
        base_name:   editForm.base_name,
        base_sku:    editForm.base_sku || null,
        category:    editForm.category,
        description: editForm.description || null,
        status:      editForm.status,
      },
    })
    success('Product updated ✓')
    editingId.value = null
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update')
  } finally {
    saving.value = false
  }
}

// ── Add ───────────────────────────────────────────────────────────────────────
const showAdd = ref(false)
const addForm = reactive({ base_name: '', base_sku: '', category: 'Flour', description: '' })

function openAdd() {
  Object.assign(addForm, { base_name: '', base_sku: '', category: 'Flour', description: '' })
  showAdd.value = true
}

async function submitAdd() {
  if (!addForm.base_name) return
  saving.value = true
  try {
    await $fetch('/api/products/base', {
      method: 'POST',
      body: {
        base_name:   addForm.base_name,
        base_sku:    addForm.base_sku || null,
        category:    addForm.category,
        description: addForm.description || null,
      },
    })
    success(`"${addForm.base_name}" added ✓`)
    showAdd.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add')
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget = ref<any | null>(null)
const deleting     = ref(false)

function confirmDelete(p: any) {
  deleteTarget.value = p
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/products/base/${deleteTarget.value.id}`, { method: 'DELETE' })
    success(`"${deleteTarget.value.base_name}" deleted`)
    deleteTarget.value = null
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete')
  } finally {
    deleting.value = false
  }
}

// ── Design helpers ────────────────────────────────────────────────────────────
function catPill(cat: string) {
  const m: Record<string, string> = {
    Flour:    'bg-amber-500/15 text-amber-400',
    Atta:     'bg-orange-500/15 text-orange-400',
    Bran:     'bg-green-500/15 text-green-400',
    Semolina: 'bg-sky-500/15 text-sky-400',
  }
  return m[cat] ?? 'bg-gray-500/15 text-gray-400'
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
</style>
