<template>
  <div class="space-y-6">
    <UiPageHeader title="Purchase Payments" subtitle="Supplier payment records"
                  :breadcrumb="['Purchase','Payments']">
      <template #actions>
        <NuxtLink to="/purchase/payments/record" class="btn-gold text-xs">+ Record Payment</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-3 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-xs text-gray-500 mb-1">Total Paid (Page)</p>
        <p class="text-xl font-bold text-emerald-400">৳{{ pageTotalPaid.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-xs text-gray-500 mb-1">Records (Total)</p>
        <p class="text-xl font-bold text-gold-400">{{ data?.total ?? 0 }}</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-xs text-gray-500 mb-1">Page</p>
        <p class="text-xl font-bold text-gray-300">{{ page }} / {{ Math.ceil((data?.total ?? 0) / perPage) || 1 }}</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search voucher #, supplier, PO…" />
      <button @click="search='';page=1;refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <UiDataTable v-else :columns="cols" :rows="rows" :per-page="perPage" exportable search-placeholder="">
      <template #cell-payment_voucher_number="{ row }">
        <NuxtLink :to="`/purchase/payments/${row.id}`" class="font-mono text-xs text-gold-400/80 hover:underline">{{ row.payment_voucher_number }}</NuxtLink>
      </template>
      <template #cell-amount_paid="{ value }">
        <span class="font-semibold text-emerald-400 font-mono text-xs">৳{{ Number(value).toLocaleString() }}</span>
      </template>
      <template #cell-payment_type="{ value }">
        <span :class="`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeStyles[value] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`">
          {{ typeLabels[value] ?? value ?? '—' }}
        </span>
      </template>
      <template #cell-payment_method="{ value }">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-400 border border-white/10">
          {{ value === 'contra' ? 'Contra Adj.' : value }}
        </span>
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

const { data, pending, error, refresh } = await useFetch('/api/purchase/payments', {
  query: computed(() => ({
    search: search.value,
    page:   page.value,
    per:    perPage,
  })),
})

function fmtDate(val: any): string {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const rows = computed(() =>
  (data.value?.payments ?? []).map((p: any) => ({
    ...p,
    payment_date: fmtDate(p.payment_date),
  })) as any[]
)

const pageTotalPaid = computed(() =>
  rows.value.reduce((s: number, p: any) => s + Number(p.amount_paid ?? 0), 0)
)

const cols = [
  { key: 'payment_voucher_number', label: 'Voucher #',  sortable: true },
  { key: 'payment_date',           label: 'Date',        sortable: true },
  { key: 'supplier_name',          label: 'Supplier',    sortable: true },
  { key: 'po_number',              label: 'PO #' },
  { key: 'amount_paid',            label: 'Amount',      sortable: true },
  { key: 'payment_type',           label: 'Type' },
  { key: 'payment_method',         label: 'Method' },
  { key: 'reference_number',       label: 'Reference' },
]

const typeStyles: Record<string, string> = {
  advance:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  credit:           'bg-blue-500/10   text-blue-400   border-blue-500/20',
  against_delivery: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  contra:           'bg-rose-500/10   text-rose-400   border-rose-500/20',
}
const typeLabels: Record<string, string> = {
  advance:          'Advance',
  credit:           'Credit',
  against_delivery: 'Delivery',
  contra:           'Contra',
}
</script>
