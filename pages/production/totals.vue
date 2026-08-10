<template>
  <div class="space-y-6">
    <UiPageHeader title="Production Totals" subtitle="Actual output grouped by date and by product"
                  :breadcrumb="['Production', 'Totals']" />

    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <label class="text-xs text-gray-500">From</label>
      <input v-model="from" type="date" class="input-glass w-auto text-xs" />
      <label class="text-xs text-gray-500">To</label>
      <input v-model="to" type="date" class="input-glass w-auto text-xs" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">By Date</h3>
        <div v-if="!byDate.length" class="text-xs text-gray-600 text-center py-8">No completed batches in this range.</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Date</th>
              <th class="pb-2 text-right text-gray-500">Bags</th>
              <th class="pb-2 text-right text-gray-500">KG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in byDate" :key="r.date" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300">{{ r.date }}</td>
              <td class="py-2 text-right font-mono text-gray-200">{{ r.bags.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono text-gray-400">{{ r.kg ? r.kg.toLocaleString() + ' kg' : '—' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-white/[0.08] font-semibold">
              <td class="py-2 text-gray-400">Total</td>
              <td class="py-2 text-right font-mono text-gold-400">{{ totalBags.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono text-gold-400">{{ totalKg.toLocaleString() }} kg</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="glass-card p-5">
        <h3 class="section-title mb-4">By Product</h3>
        <div v-if="!byProduct.length" class="text-xs text-gray-600 text-center py-8">No completed batches in this range.</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Product</th>
              <th class="pb-2 text-right text-gray-500">Bags</th>
              <th class="pb-2 text-right text-gray-500">KG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in byProduct" :key="r.product" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300">{{ r.product }}</td>
              <td class="py-2 text-right font-mono text-gray-200">{{ r.bags.toLocaleString() }}</td>
              <td class="py-2 text-right font-mono text-gray-400">{{ r.kg ? r.kg.toLocaleString() + ' kg' : '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p class="text-[10px] text-gray-600 mt-3">
          A batch covering multiple products distributes its completion proportionally across each line item — production isn't tracked per-product internally, only per batch.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const from = ref(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
const to   = ref(new Date().toISOString().slice(0, 10))

const { data } = await useFetch('/api/production/totals', {
  query: computed(() => ({ from: from.value, to: to.value })),
})

const byDate    = computed(() => (data.value as any)?.by_date ?? [])
const byProduct = computed(() => (data.value as any)?.by_product ?? [])
const totalBags = computed(() => byDate.value.reduce((s: number, r: any) => s + r.bags, 0))
const totalKg    = computed(() => byDate.value.reduce((s: number, r: any) => s + r.kg, 0))
</script>
