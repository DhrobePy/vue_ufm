<template>
  <div class="space-y-6">
    <UiPageHeader title="Product Inventory" subtitle="Real-time stock levels by product and storage location"
                  :breadcrumb="['Products', 'Inventory']">
      <template #actions>
        <button @click="exportCsv" class="btn-ghost text-xs">⬇ Export</button>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total SKUs</p>
          <p class="text-2xl font-bold text-gray-100">{{ variants.length }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">In Stock</p>
          <p class="text-2xl font-bold text-emerald-400">{{ inStockCount }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Low Stock</p>
          <p class="text-2xl font-bold text-yellow-400">{{ lowStockCount }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Out of Stock</p>
          <p class="text-2xl font-bold text-red-400">{{ outOfStockCount }}</p>
        </div>
      </div>

      <!-- Raw material stocks -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Raw Material (Wheat)</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="raw in rawMaterials" :key="raw.id" class="rounded-xl border border-white/[0.07] p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-semibold text-gray-200">{{ raw.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ raw.location }}</p>
              </div>
              <UiStatusBadge :status="Number(raw.stock_mt) > Number(raw.reorder_mt) ? 'active' : 'pending'" />
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-gray-600">In stock</span>
                <span class="font-bold text-gray-200">{{ Number(raw.stock_mt).toLocaleString() }} MT</span>
              </div>
              <div class="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div class="h-full rounded-full transition-all"
                     :class="Number(raw.stock_mt) > Number(raw.reorder_mt) ? 'bg-emerald-500' : Number(raw.stock_mt) > 0 ? 'bg-yellow-500' : 'bg-red-500'"
                     :style="`width:${Math.min(100, Math.round(Number(raw.stock_mt)/Number(raw.capacity_mt)*100))}%`" />
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-gray-600">Capacity: {{ Number(raw.capacity_mt).toLocaleString() }} MT</span>
                <span class="text-gray-600">Reorder: {{ Number(raw.reorder_mt).toLocaleString() }} MT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Finished goods -->
      <div class="glass-card p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="section-title">Finished Goods Stock</h3>
          <select v-model="filterCategory" class="field-input w-auto text-xs py-1.5">
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
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Pack</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">In Stock</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Reserved</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Available</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Reorder Lvl</th>
              <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-if="!filteredVariants.length">
              <td colspan="7" class="py-6 text-center text-gray-600">No data</td>
            </tr>
            <tr v-for="v in filteredVariants" :key="v.id" class="hover:bg-white/[0.02]">
              <td class="py-2.5 px-3">
                <p class="font-medium text-gray-200">{{ v.product_name }}</p>
                <p class="text-gray-600 text-[11px]">{{ v.category }}</p>
              </td>
              <td class="py-2.5 px-3 text-right text-gray-400">{{ v.weight_variant }}</td>
              <td class="py-2.5 px-3 text-right font-mono font-bold text-gray-200">{{ Number(v.stock_qty).toLocaleString() }}</td>
              <td class="py-2.5 px-3 text-right font-mono text-orange-400">{{ Number(v.reserved_qty).toLocaleString() }}</td>
              <td class="py-2.5 px-3 text-right font-mono font-bold"
                  :class="available(v) <= Number(v.reorder_level) ? 'text-yellow-400' : 'text-emerald-400'">
                {{ available(v).toLocaleString() }}
              </td>
              <td class="py-2.5 px-3 text-right text-gray-600">{{ Number(v.reorder_level).toLocaleString() }}</td>
              <td class="py-2.5 px-3 text-center">
                <UiStatusBadge :status="Number(v.stock_qty) === 0 ? 'cancelled' : available(v) <= Number(v.reorder_level) ? 'pending' : 'active'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const filterCategory = ref('')

const { data, pending, error } = await useFetch('/api/products/inventory')

const variants     = computed(() => (data.value?.variants    ?? []) as any[])
const rawMaterials = computed(() => (data.value?.rawMaterials ?? []) as any[])

const filteredVariants = computed(() =>
  filterCategory.value
    ? variants.value.filter((v: any) => v.category === filterCategory.value)
    : variants.value,
)

function available(v: any): number {
  return Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty))
}

const inStockCount   = computed(() => variants.value.filter((v: any) => available(v) > Number(v.reorder_level)).length)
const lowStockCount  = computed(() => variants.value.filter((v: any) => available(v) <= Number(v.reorder_level) && Number(v.stock_qty) > 0).length)
const outOfStockCount = computed(() => variants.value.filter((v: any) => Number(v.stock_qty) === 0).length)

function exportCsv() {
  const rows = filteredVariants.value
  if (!rows.length) return
  const headers = ['Product', 'Category', 'Pack', 'In Stock', 'Reserved', 'Available', 'Reorder Level', 'Status']
  const lines = rows.map((v: any) => [
    v.product_name, v.category, v.weight_variant,
    v.stock_qty, v.reserved_qty, available(v), v.reorder_level,
    Number(v.stock_qty) === 0 ? 'out_of_stock' : available(v) <= Number(v.reorder_level) ? 'low_stock' : 'ok',
  ].join(','))
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'inventory.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
