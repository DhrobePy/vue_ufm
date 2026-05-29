<template>
  <div class="space-y-6">
    <UiPageHeader title="Expense Vouchers" subtitle="Approved expense vouchers ready for payment"
                  :breadcrumb="['Expenses', 'Vouchers']">
      <template #actions>
        <NuxtLink to="/expenses/create" class="btn-gold text-xs">+ New Voucher</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="glass-card p-5">
      <UiDataTable :columns="cols" :rows="rows" :per-page="15"
                   search-placeholder="Search vouchers…" exportable>
        <template #cell-voucher_number="{ value }">
          <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
        </template>
        <template #cell-total_amount="{ value }">
          <span class="font-mono text-xs font-bold text-red-400">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-1.5">
            <NuxtLink :to="`/expenses/${row.id}`" class="btn-ghost text-xs py-1 px-2">View</NuxtLink>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, pending, error } = await useFetch('/api/expenses', {
  query: { status: 'approved', per: 50 },
})

const rows = computed(() => (data.value?.expenses ?? []) as any[])

const cols = [
  { key: 'voucher_number',  label: 'Voucher #',  sortable: true },
  { key: 'expense_date',    label: 'Date',        sortable: true },
  { key: 'category_name',   label: 'Category' },
  { key: 'remarks',         label: 'Description' },
  { key: 'total_amount',    label: 'Amount',      sortable: true },
  { key: 'payment_method',  label: 'Method' },
  { key: 'status',          label: 'Status' },
]
</script>
