<template>
  <div class="space-y-6">
    <UiPageHeader title="Commodities" subtitle="Procurement catalog — one commodity per PO, each with its own unit, origins &amp; suppliers"
                  :breadcrumb="['Purchase','Commodities']">
      <template #actions>
        <button @click="openAdd" class="btn-gold text-xs">+ Add Commodity</button>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="c in commodities" :key="c.id" class="glass-card p-5 space-y-3">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-sm font-bold text-gray-100">{{ c.name }}</h3>
            <p class="text-xs text-gray-500">Unit: <span class="font-mono text-gray-300">{{ c.unit }}</span></p>
          </div>
          <button @click="openEdit(c)" class="btn-ghost text-xs py-1 px-2.5">Edit</button>
        </div>
        <div class="text-xs text-gray-500">
          <span class="font-semibold text-gray-400">Origins:</span>
          <span v-if="c.origins.length"> {{ c.origins.join(', ') }}</span>
          <span v-else class="text-gray-600"> none configured</span>
        </div>
        <div class="text-xs text-gray-500">
          <span class="font-semibold text-gray-400">Suppliers:</span>
          <span v-if="c.supplier_ids.length"> {{ c.supplier_ids.length }} linked (scoped)</span>
          <span v-else class="text-gray-600"> none linked — all active suppliers eligible</span>
        </div>
      </div>
      <div v-if="!commodities.length" class="md:col-span-2 glass-card p-10 text-center text-xs text-gray-500">
        No commodities yet — add one to start procuring beyond wheat.
      </div>
    </div>

    <!-- Add / Edit modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4 my-8">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">{{ editingId ? 'Edit Commodity' : 'Add Commodity' }}</h3>
              <button @click="showModal = false" class="text-gray-500 hover:text-gray-200 text-xl leading-none">✕</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name *</label>
                <input v-model="form.name" class="input-glass" placeholder="e.g. Packaging Bags" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit</label>
                <select v-model="form.unit" class="input-glass">
                  <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
              <div v-if="editingId" class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select v-model="form.status" class="input-glass">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Origins (comma-separated)</label>
                <textarea v-model="originsText" rows="2" class="input-glass resize-none" placeholder="e.g. China, India, Local" />
              </div>
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Linked Suppliers <span class="text-gray-600 normal-case font-normal">(leave empty to allow all)</span>
                </label>
                <div class="max-h-40 overflow-y-auto rounded-xl border border-white/[0.08] p-2 space-y-1">
                  <label v-for="s in allSuppliers" :key="s.id" class="flex items-center gap-2 text-xs text-gray-300 py-0.5">
                    <input type="checkbox" :value="s.id" v-model="form.supplier_ids" class="accent-gold-500" />
                    {{ s.company_name }}
                  </label>
                  <p v-if="!allSuppliers.length" class="text-xs text-gray-600 p-1">No suppliers found</p>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button @click="save" :disabled="!form.name.trim() || saving" class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Commodity' }}
              </button>
              <button @click="showModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

const { data, pending, error: fetchError, refresh } = await useFetch('/api/purchase/commodities')
const commodities = computed(() => (data.value?.commodities ?? []) as any[])

const { data: supData } = await useFetch('/api/suppliers', { query: { per: 500 } })
const allSuppliers = computed(() => (supData.value?.suppliers ?? []) as any[])

const units = ['KG', 'MT', 'pcs', 'bag', 'litre', 'ton', 'box']

const showModal = ref(false)
const saving    = ref(false)
const editingId = ref<number | null>(null)
const originsText = ref('')

const emptyForm = () => ({ name: '', unit: 'KG', status: 'active', supplier_ids: [] as number[] })
const form = reactive(emptyForm())

function openAdd() {
  Object.assign(form, emptyForm())
  originsText.value = ''
  editingId.value = null
  showModal.value = true
}

function openEdit(c: any) {
  Object.assign(form, { name: c.name, unit: c.unit, status: c.status, supplier_ids: [...c.supplier_ids] })
  originsText.value = c.origins.join(', ')
  editingId.value = c.id
  showModal.value = true
}

async function save() {
  if (!form.name.trim()) return
  saving.value = true
  const origins = originsText.value.split(',').map(s => s.trim()).filter(Boolean)
  try {
    if (editingId.value) {
      await $fetch(`/api/purchase/commodities/${editingId.value}`, {
        method: 'PATCH',
        body: { name: form.name, unit: form.unit, status: form.status, origins, supplier_ids: form.supplier_ids },
      })
      success('Commodity updated ✓')
    } else {
      await $fetch('/api/purchase/commodities', {
        method: 'POST',
        body: { name: form.name, unit: form.unit, origins, supplier_ids: form.supplier_ids },
      })
      success('Commodity added ✓')
    }
    showModal.value = false
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to save commodity')
  } finally {
    saving.value = false
  }
}
</script>
