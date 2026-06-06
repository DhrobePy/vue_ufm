<template>
  <div class="space-y-6">
    <UiPageHeader title="Base Products" subtitle="Master list of all product families"
                  :breadcrumb="['Products', 'Base Products']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ New Product</button>
      </template>
    </UiPageHeader>

    <div class="glass-card p-5">
      <UiDataTable :columns="cols" :rows="products" :per-page="15" search-placeholder="Search products…">
        <template #cell-name="{ row }">
          <div>
            <p class="text-sm font-semibold text-gray-200">{{ (row as any).name }}</p>
            <p class="text-xs text-gray-500">{{ (row as any).nameEn }}</p>
          </div>
        </template>
        <template #cell-category="{ value }">
          <span class="text-xs capitalize text-gray-400">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-1.5">
            <button @click="openEdit(row as any)" class="btn-ghost text-xs py-1 px-2">Edit</button>
            <NuxtLink to="/products/variants" class="btn-ghost text-xs py-1 px-2">Variants</NuxtLink>
          </div>
        </template>
      </UiDataTable>
    </div>

    <!-- Edit modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Edit Product</h3>
              <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name *</label>
                <input v-model="editForm.name" type="text" class="input-glass" placeholder="e.g. 2Hati Moida" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label>
                <select v-model="editForm.category" class="input-glass">
                  <option value="Flour">Flour (Moida)</option>
                  <option value="Atta">Atta</option>
                  <option value="Bran">Bran (Vushi)</option>
                  <option value="Semolina">Semolina (Sooji)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="editForm.description" rows="2" class="input-glass resize-none" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select v-model="editForm.status" class="input-glass">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="saveEdit" :disabled="!editForm.name || saving" class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
              <button @click="showEditModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">New Base Product</h3>
              <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name *</label>
                <input v-model="newProduct.name" type="text" class="input-glass" placeholder="e.g. 2Hati Moida" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label>
                <select v-model="newProduct.category" class="input-glass">
                  <option value="Flour">Flour (Moida)</option>
                  <option value="Atta">Atta</option>
                  <option value="Bran">Bran (Vushi)</option>
                  <option value="Semolina">Semolina (Sooji)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea v-model="newProduct.description" rows="2" class="input-glass resize-none" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addProduct" :disabled="!newProduct.name || saving" class="btn-gold text-xs flex-1 disabled:opacity-50">Add Product</button>
              <button @click="showAddModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const showAddModal  = ref(false)
const showEditModal = ref(false)
const saving        = ref(false)

const editForm = reactive({ id: 0, name: '', category: 'Flour', description: '', status: 'active' })

function openEdit(row: any) {
  Object.assign(editForm, {
    id:          row.id,
    name:        row.name,
    category:    row.category.charAt(0).toUpperCase() + row.category.slice(1),
    description: row.description || '',
    status:      row.status,
  })
  showEditModal.value = true
}

async function saveEdit() {
  if (!editForm.name) return
  saving.value = true
  try {
    await $fetch(`/api/products/base/${editForm.id}`, {
      method: 'PUT',
      body: {
        base_name:   editForm.name,
        category:    editForm.category,
        description: editForm.description || null,
        status:      editForm.status,
      },
    })
    success('Product updated ✓')
    showEditModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update product')
  } finally {
    saving.value = false
  }
}

const { data, pending, error, refresh } = await useFetch('/api/products/base')

const products = computed(() =>
  (data.value?.products ?? []).map((p: any) => ({
    id:          p.id,
    name:        p.base_name,
    nameEn:      '',
    category:    (p.category ?? '').toLowerCase(),
    description: p.description ?? '',
    variants:    Number(p.variant_count ?? 0),
    status:      p.status ?? 'active',
  }))
)

const cols = [
  { key: 'name',     label: 'Product',  sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'variants', label: 'Variants' },
  { key: 'status',   label: 'Status' },
]

const newProduct = reactive({ name: '', category: 'Flour', description: '' })

async function addProduct() {
  if (!newProduct.name) return
  saving.value = true
  try {
    await $fetch('/api/products/base', {
      method: 'POST',
      body: { base_name: newProduct.name, category: newProduct.category, description: newProduct.description },
    })
    success(`Product "${newProduct.name}" added`)
    showAddModal.value = false
    Object.assign(newProduct, { name: '', category: 'Flour', description: '' })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add product')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
