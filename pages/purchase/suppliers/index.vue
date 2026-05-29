<template>
  <div class="space-y-6">
    <UiPageHeader title="Suppliers" subtitle="All registered wheat suppliers"
                  :breadcrumb="['Purchase','Suppliers']" />

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search company, code, phone…" />
      <button @click="search='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> suppliers
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <UiDataTable v-else :columns="cols" :rows="rows" :per-page="perPage" exportable search-placeholder=""
                 @row-click="r => navigateTo(`/purchase/suppliers/${r.id}/ledger`)">
      <template #cell-supplier_code="{ value }">
        <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
      </template>
      <template #cell-current_balance="{ value }">
        <span :class="['font-semibold font-mono text-xs', Number(value) > 0 ? 'text-red-400' : 'text-emerald-400']">
          ৳{{ Number(Math.abs(value)).toLocaleString() }}
        </span>
      </template>
      <template #cell-status="{ value }">
        <UiStatusBadge :status="value" />
      </template>
      <template #actions="{ row }">
        <NuxtLink :to="`/purchase/suppliers/${row.id}/ledger`" class="btn-ghost text-xs py-1 px-2.5">Ledger</NuxtLink>
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

const { data, pending, error, refresh } = await useFetch('/api/suppliers', {
  query: computed(() => ({
    search: search.value,
    page:   page.value,
    per:    perPage,
  })),
})

const rows = computed(() => (data.value?.suppliers ?? []) as any[])

const cols = [
  { key: 'supplier_code',   label: 'Code',        sortable: true },
  { key: 'company_name',    label: 'Company',     sortable: true },
  { key: 'contact_person',  label: 'Contact' },
  { key: 'phone',           label: 'Phone' },
  { key: 'city',            label: 'City' },
  { key: 'supplier_type',   label: 'Type' },
  { key: 'total_pos',       label: 'POs' },
  { key: 'current_balance', label: 'Balance (৳)', sortable: true },
  { key: 'status',          label: 'Status' },
]
</script>
