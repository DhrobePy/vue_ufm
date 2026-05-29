<template>
  <div class="space-y-6">
    <UiPageHeader title="Goods Received Notes" subtitle="Record and confirm wheat deliveries"
                  :breadcrumb="['Purchase','GRNs']">
      <template #actions>
        <NuxtLink to="/purchase/grn/create" class="btn-gold text-xs">+ Record GRN</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search GRN #, supplier, PO…" />
      <button @click="search='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> records
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <UiDataTable v-else :columns="cols" :rows="rows" :per-page="perPage" exportable search-placeholder="">
      <template #cell-grn_number="{ value }">
        <span class="font-mono text-xs text-gold-400/80 font-medium">{{ value }}</span>
      </template>
      <template #cell-quantity_received_kg="{ value }">
        <span class="font-mono text-xs text-gray-300">{{ Number(value).toLocaleString() }} kg</span>
      </template>
      <template #cell-total_value="{ value }">
        <span class="font-mono text-xs text-gray-200 font-semibold">৳{{ Number(value).toLocaleString() }}</span>
      </template>
      <template #cell-weight_variance="{ value }">
        <span :class="['text-xs font-medium', Number(value) > 0 ? 'text-emerald-400' : Number(value) < 0 ? 'text-red-400' : 'text-gray-500']">
          {{ Number(value) > 0 ? '+' : '' }}{{ Number(value).toLocaleString() }} kg
        </span>
      </template>
      <template #cell-grn_status="{ value }">
        <UiStatusBadge :status="value" />
      </template>
    </UiDataTable>

    <!-- Pagination -->
    <div v-if="(data?.total ?? 0) > perPage" class="flex items-center justify-between text-xs text-gray-500">
      <span>Page {{ page }} of {{ Math.ceil((data?.total ?? 0) / perPage) }}</span>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--; refresh()" class="btn-ghost text-xs py-1 px-3" :class="page<=1 ? 'opacity-40':''">← Prev</button>
        <button :disabled="page >= Math.ceil((data?.total??0)/perPage)" @click="page++; refresh()" class="btn-ghost text-xs py-1 px-3">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search  = ref('')
const page    = ref(1)
const perPage = 25

const { data, pending, error, refresh } = await useFetch('/api/purchase/grn', {
  query: computed(() => ({
    search: search.value,
    page:   page.value,
    per:    perPage,
  })),
})

const rows = computed(() => (data.value?.grns ?? []) as any[])

const cols = [
  { key: 'grn_number',           label: 'GRN #',           sortable: true },
  { key: 'po_number',            label: 'PO #',            sortable: true },
  { key: 'supplier_name',        label: 'Supplier',        sortable: true },
  { key: 'grn_date',             label: 'Date',            sortable: true },
  { key: 'quantity_received_kg', label: 'Received (kg)' },
  { key: 'total_value',          label: 'Value' },
  { key: 'weight_variance',      label: 'Variance' },
  { key: 'unload_branch_name',   label: 'Unload Point' },
  { key: 'grn_status',           label: 'Status' },
]
</script>
