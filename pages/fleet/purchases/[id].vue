<template>
  <div class="space-y-6" v-if="po">
    <UiPageHeader
      :title="po.po_number"
      :subtitle="`${po.supplier_name || 'No supplier'} · ${po.purchase_date}`"
      :breadcrumb="['Fleet','Purchases', po.po_number]"
    >
      <template #actions>
        <UiStatusBadge :status="po.status" />
      </template>
    </UiPageHeader>

    <!-- Workflow -->
    <div class="flex gap-2 flex-wrap">
      <button v-if="po.status === 'pending'"   @click="doAction('approved')"  class="btn-gold text-xs">✓ Approve</button>
      <button v-if="po.status === 'approved'"  @click="doAction('received')"  class="btn-secondary text-xs border-emerald-500/30 text-emerald-400">📦 Mark Received</button>
      <button v-if="po.status !== 'cancelled' && po.status !== 'received'" @click="doAction('cancelled')" class="btn-secondary text-xs border-red-500/30 text-red-400">✕ Cancel</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Items Table -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">Purchase Items</h3>
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 text-left text-gray-500">#</th>
                <th class="pb-2 text-left text-gray-500">Item</th>
                <th class="pb-2 text-right text-gray-500">Qty</th>
                <th class="pb-2 text-right text-gray-500">Rate ৳</th>
                <th class="pb-2 text-right text-gray-500">Amount ৳</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in items" :key="item.id" class="border-b border-white/[0.03]">
                <td class="py-2 text-gray-600">{{ i + 1 }}</td>
                <td class="py-2">
                  <p class="text-gray-200 font-medium">{{ item.item_name }}</p>
                  <p class="text-gray-600 font-mono text-[10px]" v-if="item.item_code">{{ item.item_code }}</p>
                </td>
                <td class="py-2 text-right text-gray-300">{{ Number(item.quantity).toFixed(2) }}</td>
                <td class="py-2 text-right text-gray-400">৳{{ Number(item.unit_rate || 0).toFixed(2) }}</td>
                <td class="py-2 text-right font-medium text-gray-200">৳{{ Number(item.amount || 0).toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-white/[0.07]">
                <td colspan="4" class="pt-3 text-right text-gray-500 font-medium">Total</td>
                <td class="pt-3 text-right font-bold text-gold-400">৳{{ fmt(po.total_amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Notes -->
        <div v-if="po.notes" class="glass-card p-5">
          <h3 class="section-title mb-2">Notes</h3>
          <p class="text-sm text-gray-400">{{ po.notes }}</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Summary -->
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Summary</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Total Amount</span>
              <span class="font-medium text-gray-200">৳{{ fmt(po.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Paid</span>
              <span class="text-emerald-400 font-medium">৳{{ fmt(po.paid_amount) }}</span>
            </div>
            <div class="flex justify-between border-t border-white/[0.06] pt-2">
              <span class="font-semibold text-gray-300">Outstanding</span>
              <span class="font-bold" :class="outstanding > 0 ? 'text-red-400' : 'text-emerald-400'">
                ৳{{ fmt(outstanding) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Record Payment -->
        <div v-if="po.status !== 'cancelled'" class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Record Payment</h4>
          <form @submit.prevent="recordPayment" class="space-y-3">
            <div>
              <label class="form-label">Amount Paid ৳</label>
              <input v-model="paymentAmt" type="number" step="0.01" class="form-input" placeholder="0.00" required />
            </div>
            <button type="submit" class="btn-gold text-xs w-full" :disabled="payLoading">
              {{ payLoading ? 'Saving…' : 'Record Payment' }}
            </button>
          </form>
        </div>

        <!-- Supplier Info -->
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supplier</h4>
          <p class="text-sm text-gray-200">{{ po.supplier_name || '—' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id    = Number(route.params.id)

const { data, refresh } = await useFetch(`/api/fleet/purchases/${id}`)

const po    = computed(() => (data.value as any)?.purchase ?? null)
const items = computed(() => (data.value as any)?.items    ?? [])

const outstanding = computed(() =>
  Number(po.value?.total_amount || 0) - Number(po.value?.paid_amount || 0)
)

const paymentAmt = ref('')
const payLoading = ref(false)

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }

async function doAction(status: string) {
  await $fetch(`/api/fleet/purchases/${id}`, { method: 'PATCH', body: { status } })
  refresh()
}

async function recordPayment() {
  payLoading.value = true
  try {
    const newPaid = Number(po.value?.paid_amount || 0) + Number(paymentAmt.value)
    await $fetch(`/api/fleet/purchases/${id}`, { method: 'PATCH', body: { paid_amount: newPaid } })
    paymentAmt.value = ''
    refresh()
  } finally {
    payLoading.value = false
  }
}
</script>
