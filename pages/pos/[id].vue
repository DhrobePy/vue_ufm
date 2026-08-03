<template>
  <div class="space-y-6 max-w-3xl">
    <UiPageHeader :title="order?.order_number ?? 'POS Sale'" :subtitle="order ? `${order.customer_name ?? 'Walk-in'} · ${order.branch_name}` : ''"
                  :breadcrumb="['POS', 'Sales', order?.order_number ?? '…']" />

    <div v-if="order" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="glass-card p-5 space-y-2 text-xs">
        <h3 class="section-title mb-2">Details</h3>
        <div v-for="row in detailRows" :key="row[0]" class="flex justify-between py-1 border-b border-white/[0.03]">
          <span class="text-gray-500">{{ row[0] }}</span><span class="text-gray-200 font-medium">{{ row[1] }}</span>
        </div>
        <div class="flex gap-2 pt-3">
          <button v-if="isAdminUser" @click="showEdit = !showEdit" class="btn-ghost text-xs">✏️ Correct</button>
          <button v-if="isAdminUser" @click="deleteOrder" class="btn-ghost text-xs text-red-400">🗑 Delete</button>
          <NuxtLink v-if="order.credit_amount > 0" :to="`/pos/exit/${order.id}`" class="btn-ghost text-xs">🚪 Exit Status</NuxtLink>
        </div>
      </div>

      <div class="glass-card p-5 space-y-2 text-xs">
        <h3 class="section-title mb-2">Items</h3>
        <div v-for="it in items" :key="it.id" class="flex justify-between py-1 border-b border-white/[0.03]">
          <span class="text-gray-300">{{ it.base_name }} {{ it.weight_variant }} × {{ it.quantity }}</span>
          <span class="font-mono text-gray-200">৳{{ Number(it.total_amount).toLocaleString() }}</span>
        </div>
        <div v-if="jeLines.length" class="pt-2">
          <p class="text-[10px] text-gray-600 uppercase font-semibold mb-1">Journal Entry</p>
          <div v-for="(l, i) in jeLines" :key="i" class="flex justify-between py-0.5 font-mono text-[11px]">
            <span class="text-gray-400">{{ l.account_name }}</span>
            <span class="text-gray-300">{{ Number(l.debit_amount) > 0 ? `Dr ৳${Number(l.debit_amount).toLocaleString()}` : `Cr ৳${Number(l.credit_amount).toLocaleString()}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEdit && order" class="glass-card p-5 space-y-3 border border-amber-500/20">
      <h3 class="section-title">Correct This Sale</h3>
      <p class="text-[11px] text-gray-600">Quantity/price only — to change products, delete and re-ring the sale.</p>
      <div v-for="(it, i) in editItems" :key="it.item_id" class="grid grid-cols-3 gap-2 items-end">
        <span class="text-xs text-gray-400 col-span-1">{{ items[i]?.base_name }} {{ items[i]?.weight_variant }}</span>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Qty</label>
          <input v-model.number="it.quantity" type="number" min="1" class="input-glass text-xs font-mono" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Unit Price</label>
          <input v-model.number="it.unit_price" type="number" min="0" step="any" class="input-glass text-xs font-mono" /></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Cash Paid</label>
          <input v-model.number="editCash" type="number" min="0" step="any" class="input-glass text-xs font-mono" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Reason *</label>
          <input v-model="editReason" class="input-glass text-xs" placeholder="Why is this correction needed…" /></div>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showEdit = false" class="btn-ghost text-xs">Cancel</button>
        <button @click="submitEdit" :disabled="!editReason.trim() || editing" class="btn-gold text-xs disabled:opacity-50">
          {{ editing ? 'Applying…' : 'Save Correction' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const orderId = computed(() => Number(route.params.id))
const { data, refresh } = await useFetch(() => `/api/pos/${orderId.value}`)
const order    = computed<any>(() => (data.value as any)?.order ?? null)
const items    = computed<any[]>(() => (data.value as any)?.items ?? [])
const jeLines  = computed<any[]>(() => (data.value as any)?.je_lines ?? [])

const detailRows = computed(() => order.value ? [
  ['Customer', order.value.customer_name ?? 'Walk-in'],
  ['Branch', order.value.branch_name ?? '—'],
  ['Date', String(order.value.order_date).slice(0, 16).replace('T', ' ')],
  ['Subtotal', `৳${Number(order.value.subtotal).toLocaleString()}`],
  ['Discount', `৳${Number(order.value.discount_amount).toLocaleString()}`],
  ['Total', `৳${Number(order.value.total_amount).toLocaleString()}`],
  ['Paid Now', `৳${Number(order.value.cash_amount).toLocaleString()} (${order.value.payment_method})`],
  ['On Credit', `৳${Number(order.value.credit_amount).toLocaleString()}`],
  ['Status', order.value.payment_status],
  ['Exit', order.value.exit_status === 'cleared' ? `Cleared${order.value.cleared_by_name ? ` (${order.value.cleared_by_name})` : ''}` : 'Pending Approval'],
] : [])

const showEdit = ref(false)
const editing  = ref(false)
const editItems = ref<Array<{ item_id: number; quantity: number; unit_price: number }>>([])
const editCash = ref(0)
const editReason = ref('')
watch([order, items], ([o, its]) => {
  if (!o || !its.length) return
  editItems.value = its.map((it: any) => ({ item_id: it.id, quantity: Number(it.quantity), unit_price: Number(it.unit_price) }))
  editCash.value = Number(o.cash_amount)
}, { immediate: true })

async function submitEdit() {
  editing.value = true
  try {
    const total = editItems.value.reduce((s, it) => s + it.quantity * it.unit_price, 0) - Number(order.value.discount_amount)
    await $fetch(`/api/pos/${orderId.value}`, {
      method: 'PATCH',
      body: {
        items: editItems.value, discount: Number(order.value.discount_amount),
        cash_amount: editCash.value, credit_amount: Math.max(0, total - editCash.value),
        reason: editReason.value,
      },
    })
    success('Sale corrected ✓')
    showEdit.value = false
    editReason.value = ''
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Correction failed')
  } finally { editing.value = false }
}

async function deleteOrder() {
  const reason = prompt(`Delete ${order.value.order_number}? This reverses stock + ledger (restorable). Reason:`)
  if (!reason?.trim()) return
  try {
    await $fetch(`/api/pos/${orderId.value}`, { method: 'DELETE', body: { reason } })
    success('Sale deleted — restorable from Recycle Bin')
    navigateTo('/pos/reports')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Delete failed')
  }
}
</script>
