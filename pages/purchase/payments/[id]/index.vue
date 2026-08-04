<template>
  <div class="space-y-6">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader :title="`Payment — ${pmt.payment_voucher_number}`"
                    :subtitle="`${pmt.supplier_name} · ${pmt.payment_date}`"
                    :breadcrumb="['Purchase','Payments', pmt.payment_voucher_number]">
        <template #actions>
          <NuxtLink :to="`/purchase/payments/${route.params.id}/print`" class="btn-ghost text-xs">🖨 Print</NuxtLink>
          <NuxtLink :to="`/purchase/payments/${route.params.id}/edit`" class="btn-ghost text-xs">✏ Edit</NuxtLink>
          <NuxtLink to="/purchase/payments" class="btn-ghost text-xs">← All Payments</NuxtLink>
        </template>
      </UiPageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 glass-card p-6 space-y-5">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 class="text-xl font-bold font-mono text-gold-400">{{ pmt.payment_voucher_number }}</h2>
              <p class="text-xs text-gray-500 mt-0.5">Date: {{ pmt.payment_date }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {{ pmt.payment_type || 'regular' }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="space-y-2">
              <div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-200 font-semibold">{{ pmt.supplier_name }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">PO #</span>
                <NuxtLink :to="`/purchase/orders/${pmt.purchase_order_id}`" class="font-mono text-gold-400/80 hover:underline">{{ pmt.po_number }}</NuxtLink>
              </div>
              <div class="flex justify-between"><span class="text-gray-500">Payment Method</span><span class="text-gray-200 uppercase font-medium">{{ pmt.payment_method }}</span></div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between"><span class="text-gray-500">Bank</span><span class="text-gray-200">{{ pmt.bank_name || pmt.po_supplier_name || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Reference</span><span class="text-gray-200">{{ pmt.reference_number || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Handled By</span><span class="text-gray-200">{{ pmt.handled_by_employee || '—' }}</span></div>
            </div>
          </div>

          <!-- Amount box -->
          <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
            <p class="text-xs text-gray-500 mb-1">AMOUNT PAID</p>
            <p class="text-3xl font-bold text-emerald-400">৳{{ Number(pmt.amount_paid).toLocaleString() }}</p>
          </div>

          <div v-if="pmt.remarks" class="text-xs text-gray-500 border-t border-white/[0.06] pt-3">
            <span class="font-semibold text-gray-600">Remarks: </span>{{ pmt.remarks }}
          </div>
        </div>

        <!-- Right panel -->
        <div class="space-y-5">
          <div class="glass-card p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-300">PO Summary</h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between"><span class="text-gray-600">Total Value</span><span class="text-gray-200">৳{{ Number(pmt.total_order_value || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Received Value</span><span class="text-gray-200">৳{{ Number(pmt.total_received_value || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Balance</span><span class="text-red-400 font-bold">৳{{ Number(pmt.balance_payable || 0).toLocaleString() }}</span></div>
            </div>
          </div>

          <div class="glass-card p-5 space-y-2">
            <h3 class="text-sm font-semibold text-gray-300">Actions</h3>
            <NuxtLink :to="`/purchase/payments/${route.params.id}/edit`" class="btn-ghost text-xs w-full justify-start gap-2">✏ Edit Payment</NuxtLink>
            <NuxtLink :to="`/purchase/payments/${route.params.id}/print`" class="btn-ghost text-xs w-full justify-start gap-2">🖨 Print Receipt</NuxtLink>
            <button v-if="isSuperadmin" @click="deletePayment" :disabled="deleting"
              class="btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:border-red-500/30"
              :class="deleting ? 'opacity-50 cursor-not-allowed' : ''">
              {{ deleting ? 'Deleting…' : '✕ Delete Payment' }}
            </button>
            <p v-else class="text-[11px] text-gray-600 italic px-1">Only a Superadmin can delete a payment</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route  = useRoute()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isSuperadmin = computed(() => (sessionUser.value?.role ?? '').toLowerCase() === 'superadmin')
const deleting = ref(false)

const { data, pending, error, refresh } = await useFetch(
  () => `/api/purchase/payments/${route.params.id}`,
)
const pmt = computed(() => (data.value?.payment ?? {}) as any)

async function deletePayment() {
  if (!confirm(`Delete payment ${pmt.value.payment_voucher_number}? This action may not be reversible.`)) return
  deleting.value = true
  try {
    await $fetch(`/api/purchase/payments/${route.params.id}`, { method: 'DELETE' })
    success('Payment deleted')
    navigateTo('/purchase/payments')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete payment')
  } finally {
    deleting.value = false
  }
}
</script>
