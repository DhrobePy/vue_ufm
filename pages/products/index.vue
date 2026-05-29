<template>
  <div class="space-y-6">
    <UiPageHeader title="Products" subtitle="Flour brands · variants · pricing · inventory"
                  :breadcrumb="['Products']">
      <template #actions>
        <button class="btn-gold text-xs">+ Add Product</button>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Base Products"   :value="String(allProducts.length)"     trend="Active"           trend-up  icon="box"   color="purple" />
      <KpiCard label="Variants"        :value="String(totalVariants)"          trend="All active"       trend-up  icon="list"  color="blue" />
      <KpiCard label="Categories"      :value="String(categories.length - 1)"  trend="Product lines"    trend-up  icon="box"   color="orange" />
      <KpiCard label="Priced Variants" :value="String(pricedVariants)"         trend="Have unit prices" trend-up  icon="chart" color="teal" />
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading products…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Category tabs -->
      <div class="flex gap-2 flex-wrap">
        <button v-for="cat in categories" :key="cat"
          @click="activeCategory = cat"
          :class="['px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
            activeCategory === cat
              ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
              : 'text-gray-500 border-white/[0.07] hover:text-gray-300']">
          {{ cat }}
        </button>
      </div>

      <!-- Product cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="p in filteredProducts" :key="p.id"
             class="glass-card-hover p-5 space-y-4 cursor-pointer">
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                 style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15)">
              🌾
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">active</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-100 text-sm leading-tight">{{ p.base_name }}</h3>
            <p class="text-[10px] text-gray-600 mt-0.5 font-mono">{{ p.base_sku }}</p>
            <p class="text-[11px] text-gray-500 mt-1">{{ p.category }}</p>
          </div>
          <!-- Variants -->
          <div class="space-y-1.5">
            <p class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Variants</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="v in p.variants" :key="v.id"
                class="px-1.5 py-0.5 rounded-md text-[10px] font-mono border bg-white/[0.06] text-gray-400 border-white/[0.08]">
                {{ v.weight_variant }}
              </span>
            </div>
          </div>
          <!-- Price range -->
          <div class="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <div>
              <p class="text-[10px] text-gray-600">Price</p>
              <p class="text-sm font-bold text-gold-400">{{ priceRange(p) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-600">Variants</p>
              <p class="text-sm font-semibold text-gray-300">{{ p.variants.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Price list table -->
      <div class="glass-card p-5">
        <h2 class="section-title mb-4">Current Price List</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Product</th>
                <th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">SKU</th>
                <th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Variant</th>
                <th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Grade</th>
                <th class="text-right py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Unit Price</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <template v-for="p in allProducts" :key="p.id">
                <tr v-for="(v, vi) in p.variants" :key="v.id"
                    class="hover:bg-white/[0.02] transition-colors">
                  <td class="py-2.5 px-3 font-medium text-gray-300">{{ vi === 0 ? p.base_name : '' }}</td>
                  <td class="py-2.5 px-3 font-mono text-gray-600">{{ vi === 0 ? p.base_sku : '' }}</td>
                  <td class="py-2.5 px-3 text-gray-400">{{ v.weight_variant }}</td>
                  <td class="py-2.5 px-3 text-gray-500">{{ v.grade || '—' }}</td>
                  <td class="py-2.5 px-3 text-right font-bold"
                      :class="v.unit_price ? 'text-gold-400' : 'text-gray-600'">
                    {{ v.unit_price ? '৳' + Number(v.unit_price).toLocaleString() : '—' }}
                  </td>
                </tr>
              </template>
              <tr v-if="!allProducts.length">
                <td colspan="5" class="py-8 text-center text-gray-600">No products found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const activeCategory = ref('All')

const { data, pending, error } = await useFetch('/api/products')

const allProducts = computed(() => (data.value?.products ?? []) as any[])

const categories = computed(() => {
  const cats = new Set<string>(allProducts.value.map((p: any) => p.category).filter(Boolean))
  return ['All', ...Array.from(cats).sort()]
})

const filteredProducts = computed(() =>
  activeCategory.value === 'All'
    ? allProducts.value
    : allProducts.value.filter((p: any) => p.category === activeCategory.value)
)

const totalVariants  = computed(() => allProducts.value.reduce((s: number, p: any) => s + (p.variants?.length ?? 0), 0))
const pricedVariants = computed(() => allProducts.value.reduce((s: number, p: any) =>
  s + (p.variants ?? []).filter((v: any) => v.unit_price != null).length, 0))

function priceRange(p: any): string {
  const prices = (p.variants ?? [])
    .map((v: any) => Number(v.unit_price))
    .filter((x: number) => x > 0)
  if (!prices.length) return '—'
  const mn = Math.min(...prices)
  const mx = Math.max(...prices)
  return mn === mx ? `৳${mn.toLocaleString()}` : `৳${mn.toLocaleString()}–৳${mx.toLocaleString()}`
}
</script>
