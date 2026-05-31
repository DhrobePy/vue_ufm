<template>
  <div class="space-y-6">
    <UiPageHeader title="Weight Variance Report" subtitle="GRN vs ordered quantity analysis"
                  :breadcrumb="['Purchase','GRNs','Variance Report']">
      <template #actions>
        <NuxtLink to="/purchase/grn" class="btn-ghost text-xs">← All GRNs</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-5 text-center space-y-1">
          <p class="text-2xl font-bold text-gray-200">{{ variances.length }}</p>
          <p class="text-xs text-gray-500">Total Variances</p>
        </div>
        <div class="glass-card p-5 text-center space-y-1">
          <p class="text-2xl font-bold text-red-400">{{ lossCount }}</p>
          <p class="text-xs text-gray-500">Losses</p>
          <p class="text-[11px] text-red-400/70">৳{{ lossValue.toLocaleString() }}</p>
        </div>
        <div class="glass-card p-5 text-center space-y-1">
          <p class="text-2xl font-bold text-emerald-400">{{ gainCount }}</p>
          <p class="text-xs text-gray-500">Gains</p>
          <p class="text-[11px] text-emerald-400/70">৳{{ gainValue.toLocaleString() }}</p>
        </div>
        <div class="glass-card p-5 text-center space-y-1">
          <p class="text-2xl font-bold" :class="netVariance >= 0 ? 'text-emerald-400' : 'text-red-400'">
            {{ netVariance >= 0 ? '+' : '' }}৳{{ Math.abs(netVariance).toLocaleString() }}
          </p>
          <p class="text-xs text-gray-500">Net Variance</p>
          <p class="text-[11px]" :class="netVariance >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'">{{ netVariance >= 0 ? 'Gain' : 'Loss' }}</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
        <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
               placeholder="Search PO #, supplier, GRN…" />
        <select v-model="typeFilter" class="field-input text-xs py-1.5 w-36">
          <option value="">All Types</option>
          <option value="loss">Loss</option>
          <option value="gain">Gain</option>
          <option value="normal">Normal</option>
        </select>
        <button @click="search='';typeFilter=''" class="btn-ghost text-xs py-1.5">Reset</button>
        <div class="ml-auto text-xs text-gray-500">{{ filtered.length }} records</div>
      </div>

      <!-- Table -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-white/[0.06] text-xs">
            <thead>
              <tr class="text-gray-500 uppercase text-[10px] tracking-wider">
                <th class="px-4 py-3 text-left">GRN Date</th>
                <th class="px-4 py-3 text-left">GRN #</th>
                <th class="px-4 py-3 text-left">PO #</th>
                <th class="px-4 py-3 text-left">Supplier</th>
                <th class="px-4 py-3 text-left">Truck</th>
                <th class="px-4 py-3 text-right">Ordered (kg)</th>
                <th class="px-4 py-3 text-right">Received (kg)</th>
                <th class="px-4 py-3 text-right">Variance (kg)</th>
                <th class="px-4 py-3 text-center">Variance %</th>
                <th class="px-4 py-3 text-right">Value Impact</th>
                <th class="px-4 py-3 text-center">Type</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-if="!filtered.length">
                <td colspan="11" class="px-4 py-8 text-center text-gray-500">No variances found</td>
              </tr>
              <tr v-for="row in filtered" :key="row.id" class="hover:bg-white/[0.02]">
                <td class="px-4 py-3 text-gray-400">{{ row.grn_date }}</td>
                <td class="px-4 py-3 font-mono text-gold-400/80">{{ row.grn_number }}</td>
                <td class="px-4 py-3 text-gray-300">{{ row.po_number }}</td>
                <td class="px-4 py-3 text-gray-300">{{ row.supplier_name }}</td>
                <td class="px-4 py-3 text-gray-400">{{ row.truck_number || '—' }}</td>
                <td class="px-4 py-3 text-right font-mono text-gray-300">{{ Number(row.ordered_quantity).toLocaleString() }}</td>
                <td class="px-4 py-3 text-right font-mono text-gray-300">{{ Number(row.received_quantity).toLocaleString() }}</td>
                <td class="px-4 py-3 text-right font-mono" :class="Number(row.variance) >= 0 ? 'text-emerald-400' : 'text-red-400'">
                  {{ Number(row.variance) > 0 ? '+' : '' }}{{ Number(row.variance).toLocaleString() }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium"
                    :class="Math.abs(Number(row.variance_percentage)) > 1 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'">
                    {{ Number(row.variance_percentage) > 0 ? '+' : '' }}{{ Number(row.variance_percentage).toFixed(2) }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-mono" :class="Number(row.variance_value) >= 0 ? 'text-emerald-400' : 'text-red-400'">
                  {{ Number(row.variance_value) >= 0 ? '+' : '' }}৳{{ Math.abs(Number(row.variance_value)).toLocaleString() }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold"
                    :class="{
                      'bg-red-500/20 text-red-400':     row.variance_type === 'loss',
                      'bg-emerald-500/20 text-emerald-400': row.variance_type === 'gain',
                      'bg-gray-500/20 text-gray-400':   row.variance_type === 'normal',
                    }">
                    {{ row.variance_type.charAt(0).toUpperCase() + row.variance_type.slice(1) }}
                  </span>
                </td>
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

const search     = ref('')
const typeFilter = ref('')

const { data, pending, error } = await useFetch('/api/purchase/grn/variance')
const variances = computed(() => (data.value?.variances ?? []) as any[])

const filtered = computed(() => {
  let list = variances.value
  if (typeFilter.value) list = list.filter((r: any) => r.variance_type === typeFilter.value)
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter((r: any) =>
      (r.grn_number  ?? '').toLowerCase().includes(s) ||
      (r.po_number   ?? '').toLowerCase().includes(s) ||
      (r.supplier_name ?? '').toLowerCase().includes(s) ||
      (r.truck_number  ?? '').toLowerCase().includes(s),
    )
  }
  return list
})

const lossCount   = computed(() => filtered.value.filter((r: any) => r.variance_type === 'loss').length)
const gainCount   = computed(() => filtered.value.filter((r: any) => r.variance_type === 'gain').length)
const lossValue   = computed(() => filtered.value.filter((r: any) => r.variance_type === 'loss').reduce((s: number, r: any) => s + Math.abs(Number(r.variance_value)), 0))
const gainValue   = computed(() => filtered.value.filter((r: any) => r.variance_type === 'gain').reduce((s: number, r: any) => s + Number(r.variance_value), 0))
const netVariance = computed(() => gainValue.value - lossValue.value)
</script>
