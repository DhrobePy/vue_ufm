<template>
  <div class="space-y-6">
    <UiPageHeader title="Product Variants" subtitle="Size, pack weight and barcode management"
                  :breadcrumb="['Products', 'Variants']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ New Variant</button>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="glass-card p-5">
      <div class="flex flex-wrap gap-3 mb-4">
        <select v-model="filterProduct" class="field-input w-auto text-xs py-1.5" @change="refresh()">
          <option value="">All Products</option>
          <option v-for="p in baseProducts" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="filterCategory" class="field-input w-auto text-xs py-1.5" @change="refresh()">
          <option value="">All Categories</option>
          <option value="Flour">Flour</option>
          <option value="Atta">Atta</option>
          <option value="Bran">Bran</option>
        </select>
      </div>

      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Category</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Pack Weight</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Bags/MT</th>
            <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Unit Price</th>
            <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Barcode</th>
            <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-if="!variants.length">
            <td colspan="7" class="py-6 text-center text-gray-600">No variants found</td>
          </tr>
          <tr v-for="v in variants" :key="v.id" class="hover:bg-white/[0.02]">
            <td class="py-2.5 px-3 font-semibold text-gray-200">{{ v.product_name }}</td>
            <td class="py-2.5 px-3 text-gray-400">{{ v.category }}</td>
            <td class="py-2.5 px-3 text-right font-mono text-gray-300">{{ v.weight_variant }}</td>
            <td class="py-2.5 px-3 text-right text-gray-400">{{ bagsPerMT(v.weight_variant) }}</td>
            <td class="py-2.5 px-3 text-right font-mono text-gray-300">৳{{ Number(v.unit_price).toLocaleString() }}</td>
            <td class="py-2.5 px-3 font-mono text-gray-600 text-[11px]">{{ v.barcode || '—' }}</td>
            <td class="py-2.5 px-3 text-center"><UiStatusBadge :status="v.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add variant modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal"
             class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">New Variant</h3>
              <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Product *</label>
                <select v-model="newVariant.productId" class="field-input">
                  <option value="">— Select —</option>
                  <option v-for="p in baseProducts" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pack Weight *</label>
                <select v-model="newVariant.packWeight" class="field-input">
                  <option value="37kg">37kg</option>
                  <option value="50kg">50kg</option>
                  <option value="55kg">55kg</option>
                  <option value="74kg">74kg</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Barcode</label>
                <input v-model="newVariant.barcode" type="text" class="field-input font-mono" placeholder="EAN-13 or custom" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit Price (৳)</label>
                <input v-model.number="newVariant.unitPrice" type="number" min="0" class="field-input" placeholder="0" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addVariant"
                      :disabled="!newVariant.productId || saving"
                      class="btn-gold text-xs flex-1 disabled:opacity-50">
                {{ saving ? 'Adding…' : 'Add Variant' }}
              </button>
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

const showAddModal   = ref(false)
const filterProduct  = ref('')
const filterCategory = ref('')
const saving         = ref(false)

const { data, pending, error, refresh } = await useFetch('/api/products/variants', {
  query: computed(() => ({
    product:  filterProduct.value  || undefined,
    category: filterCategory.value || undefined,
  })),
})

const variants     = computed(() => (data.value?.variants ?? []) as any[])
const baseProducts = computed(() => (data.value?.products  ?? []) as any[])

function bagsPerMT(weight: string): number {
  const kg = parseInt(weight)
  if (!kg) return 0
  return Math.round(1000 / kg)
}

const newVariant = reactive({
  productId:   '',
  packWeight:  '50kg',
  barcode:     '',
  unitPrice:   0,
})

async function addVariant() {
  if (!newVariant.productId) return
  saving.value = true
  try {
    await $fetch('/api/products/variants', {
      method: 'POST',
      body: {
        product_id:     Number(newVariant.productId),
        weight_variant: newVariant.packWeight,
        barcode:        newVariant.barcode   || undefined,
        unit_price:     newVariant.unitPrice || undefined,
      },
    })
    success('Variant added ✓')
    showAddModal.value = false
    Object.assign(newVariant, { productId: '', packWeight: '50kg', barcode: '', unitPrice: 0 })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add variant')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
