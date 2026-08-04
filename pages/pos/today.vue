<template>
  <div class="space-y-6">
    <UiPageHeader title="Today's POS Sales" subtitle="All counter transactions for today"
                  :breadcrumb="['POS', `Today's Sales`]">
      <template #actions>
        <NuxtLink to="/pos" class="btn-gold text-xs">🛒 Open POS</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Transactions</p>
        <p class="text-2xl font-bold text-gray-100">{{ stats.total_orders ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Revenue</p>
        <p class="text-2xl font-bold text-gold-400">৳{{ Number(stats.total_revenue ?? 0).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Cash</p>
        <p class="text-2xl font-bold text-emerald-400">৳{{ Number(stats.cash_total ?? 0).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Other Methods</p>
        <p class="text-2xl font-bold text-blue-400">৳{{ Number(stats.mobile_total ?? 0).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Transactions table -->
    <div class="glass-card p-5">
      <UiDataTable :columns="cols" :rows="orders" :per-page="15" search-placeholder="Search transactions…">
        <template #cell-order_number="{ value }">
          <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
        </template>
        <template #cell-total_amount="{ value }">
          <span class="font-mono text-xs font-bold text-gray-200">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-payment_method="{ value }">
          <span class="text-xs text-gray-400">{{ value }}</span>
        </template>
        <template #cell-order_status="{ value }">
          <UiStatusBadge :status="value?.toLowerCase()" />
        </template>
        <template #cell-exit="{ row }">
          <NuxtLink v-if="Number(row.credit_amount) > 0" :to="`/pos/exit/${row.id}`"
                    class="text-[11px] font-medium"
                    :class="row.exit_status === 'cleared' ? 'text-emerald-400' : 'text-red-400 animate-pulse'">
            {{ row.exit_status === 'cleared' ? '✅ Cleared' : '⏳ Pending Gate' }}
          </NuxtLink>
          <span v-else class="text-[11px] text-gray-600">—</span>
        </template>
        <template #actions="{ row }">
          <div class="flex gap-1.5">
            <button @click="navigateTo(`/pos/${row.id}`)" class="btn-ghost text-xs py-1 px-2">View</button>
            <button @click="reprint(row)" :disabled="printingId === row.id" class="btn-ghost text-xs py-1 px-2 disabled:opacity-40">
              {{ printingId === row.id ? '…' : '🖨' }}
            </button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const cols = [
  { key: 'order_number',   label: 'Receipt #',  sortable: true },
  { key: 'order_date',     label: 'Time',        sortable: true },
  { key: 'customer_name',  label: 'Customer' },
  { key: 'item_count',     label: 'Items' },
  { key: 'payment_method', label: 'Method' },
  { key: 'total_amount',   label: 'Amount',      sortable: true },
  { key: 'order_status',   label: 'Status' },
  { key: 'exit',           label: 'Gate' },
]

const { error: toastError } = useToast()
const { data, pending } = await useFetch('/api/pos/today')

const orders = computed(() => (data.value as any)?.orders ?? [])
const stats  = computed(() => (data.value as any)?.stats  ?? {})

const printingId = ref<number | null>(null)
async function reprint(row: any) {
  printingId.value = row.id
  try {
    const detail = await $fetch(`/api/pos/${row.id}`) as any
    const items = (detail.items ?? []).map((it: any) => ({
      name: `${it.base_name} ${it.weight_variant ?? ''}`.trim(),
      qty: Number(it.quantity),
      price: Number(it.unit_price),
    }))
    const ok = printPosReceiptCopies({
      receiptNo: detail.order.order_number,
      total: Number(detail.order.total_amount),
      subtotal: Number(detail.order.subtotal),
      discount: Number(detail.order.discount_amount),
      cashAmount: Number(detail.order.cash_amount),
      creditAmount: Number(detail.order.credit_amount),
      paymentMethod: detail.order.payment_method,
      customerName: detail.order.customer_name ?? '',
      items,
      verifyUrl: detail.verify_url,
    })
    if (!ok) toastError('Allow popups to print all copies.')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to load receipt for printing')
  } finally {
    printingId.value = null
  }
}
</script>
