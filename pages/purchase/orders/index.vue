<template>
  <div class="space-y-6">
    <UiPageHeader title="Purchase Orders" subtitle="All wheat procurement orders" :breadcrumb="['Purchase','All POs']">
      <template #actions>
        <NuxtLink to="/purchase/orders/create" class="btn-gold text-xs">+ Create PO</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Filter bar -->
    <div class="glass-card p-4 space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
               placeholder="Search PO #, supplier…" />
        <select v-model="statusFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="partial">Partial</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="deliveryFilter" class="field-input text-xs py-1.5 w-40" @change="page=1;refresh()">
          <option value="">All Delivery</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="closed">Closed</option>
        </select>
        <select v-model="paymentFilter" class="field-input text-xs py-1.5 w-40" @change="page=1;refresh()">
          <option value="">All Payment</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        <select v-model="originFilter" class="field-input text-xs py-1.5 w-36" @change="page=1;refresh()">
          <option value="">All Origins</option>
          <option value="India">India</option>
          <option value="Ukraine">Ukraine</option>
          <option value="Russia">Russia</option>
          <option value="Australia">Australia</option>
          <option value="Local">Local</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span>From:</span>
          <input v-model="dateFrom" type="date" class="field-input text-xs py-1 w-36" @change="page=1;refresh()" />
          <span>To:</span>
          <input v-model="dateTo" type="date" class="field-input text-xs py-1 w-36" @change="page=1;refresh()" />
        </div>
        <button @click="resetFilters" class="btn-ghost text-xs py-1.5">Reset</button>
        <div class="ml-auto text-xs text-gray-500">
          <span class="font-medium text-gray-300">{{ data?.total ?? 0 }}</span> orders
        </div>
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <UiDataTable v-else :columns="cols" :rows="rows" :per-page="perPage" exportable search-placeholder=""
                 @row-click="r => navigateTo(`/purchase/orders/${r.id}`)">
      <template #cell-po_number="{ value }">
        <span class="font-mono text-xs text-gold-400/80 font-medium">{{ value }}</span>
      </template>
      <template #cell-quantity_kg="{ value }">
        <span class="font-mono text-xs text-gray-300">{{ Number(value).toLocaleString() }} kg</span>
      </template>
      <template #cell-total_order_value="{ value }">
        <span class="font-mono text-xs text-gray-200 font-semibold">৳{{ Number(value).toLocaleString() }}</span>
      </template>
      <template #cell-po_status="{ value }"><UiStatusBadge :status="value" /></template>
      <template #cell-delivery_status="{ value }"><UiStatusBadge :status="value" /></template>
      <template #cell-payment_status="{ value }"><UiStatusBadge :status="value" /></template>
      <template #actions="{ row }">
        <NuxtLink :to="`/purchase/orders/${row.id}`" class="btn-ghost text-xs py-1 px-2.5">View</NuxtLink>
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
const route = useRoute()

const search         = ref((route.query.search as string) || '')
const statusFilter   = ref((route.query.status as string) || '')
const deliveryFilter = ref((route.query.delivery_status as string) || '')
const paymentFilter  = ref((route.query.payment_status as string) || '')
const originFilter   = ref((route.query.origin as string) || '')
const dateFrom       = ref('')
const dateTo         = ref('')
const page           = ref(1)
const perPage        = 25

const { data, pending, error, refresh } = await useFetch('/api/purchase/orders', {
  query: computed(() => ({
    search:          search.value,
    status:          statusFilter.value,
    delivery_status: deliveryFilter.value,
    payment_status:  paymentFilter.value,
    origin:          originFilter.value,
    date_from:       dateFrom.value,
    date_to:         dateTo.value,
    page:            page.value,
    per:             perPage,
  })),
})

function resetFilters() {
  search.value         = ''
  statusFilter.value   = ''
  deliveryFilter.value = ''
  paymentFilter.value  = ''
  originFilter.value   = ''
  dateFrom.value       = ''
  dateTo.value         = ''
  page.value           = 1
  refresh()
}

function fmtDate(val: any): string {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const rows = computed(() =>
  (data.value?.orders ?? []).map((o: any) => ({
    ...o,
    po_date:                fmtDate(o.po_date),
    expected_delivery_date: fmtDate(o.expected_delivery_date),
  }))
)

const cols = [
  { key: 'po_number',         label: 'PO #',         sortable: true },
  { key: 'supplier_name',     label: 'Supplier',     sortable: true },
  { key: 'po_date',           label: 'Date',         sortable: true },
  { key: 'wheat_origin',      label: 'Origin' },
  { key: 'quantity_kg',       label: 'Qty (kg)' },
  { key: 'total_order_value', label: 'Total Value',  sortable: true },
  { key: 'po_status',         label: 'PO Status' },
  { key: 'delivery_status',   label: 'Delivery' },
  { key: 'payment_status',    label: 'Payment' },
]
</script>
