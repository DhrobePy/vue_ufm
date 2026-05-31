<template>
  <div class="space-y-6">
    <UiPageHeader title="Edit Payment" subtitle="Update payment details"
                  :breadcrumb="['Purchase','Payments','Edit']">
      <template #actions>
        <NuxtLink :to="`/purchase/payments/${route.params.id}`" class="btn-ghost text-xs">← Back</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="loadPending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="loadError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ loadError.message }}</div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 glass-card p-6 space-y-4">
          <h3 class="section-title">Payment Details</h3>

          <div class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-1">
            <div class="flex justify-between"><span class="text-gray-600">Voucher #</span><span class="font-mono text-gold-400/80">{{ pmt.payment_voucher_number }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">PO #</span><span class="text-gray-300">{{ pmt.po_number }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">{{ pmt.supplier_name }}</span></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label>
              <input v-model="form.payment_date" type="date" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (৳) *</label>
              <input v-model.number="form.amount_paid" type="number" min="1" class="input-glass font-mono" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label>
              <select v-model="form.payment_method" class="input-glass">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer / BEFTN</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Type</label>
              <select v-model="form.payment_type" class="input-glass">
                <option value="regular">Regular</option>
                <option value="advance">Advance</option>
                <option value="partial">Partial</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div v-if="form.payment_method !== 'cash'" class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference / Cheque No.</label>
              <input v-model="form.reference_number" type="text" class="input-glass font-mono" placeholder="BEFTN ref, cheque no." />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Handled By</label>
              <input v-model="form.handled_by_employee" type="text" class="input-glass" placeholder="Employee name" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</label>
            <textarea v-model="form.remarks" rows="3" class="input-glass resize-none" placeholder="Payment notes…" />
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button @click="submit" :disabled="saving || !isValid"
              class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
            <NuxtLink :to="`/purchase/payments/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
          </div>
        </div>

        <!-- Right panel -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">PO Summary</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Total Value</span><span class="text-gray-200">৳{{ Number(pmt.total_order_value || 0).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Received</span><span class="text-gray-200">৳{{ Number(pmt.total_received_value || 0).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Balance Payable</span><span class="text-red-400 font-bold">৳{{ Number(pmt.balance_payable || 0).toLocaleString() }}</span></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()
const saving = ref(false)

const { data: loadData, pending: loadPending, error: loadError } = await useFetch(
  () => `/api/purchase/payments/${route.params.id}`,
)
const pmt = computed(() => (loadData.value?.payment ?? {}) as any)

const form = reactive({
  payment_date:        '',
  amount_paid:         0,
  payment_method:      'cash',
  payment_type:        'regular',
  reference_number:    '',
  handled_by_employee: '',
  remarks:             '',
})

watch(pmt, (p) => {
  if (!p?.id) return
  form.payment_date        = p.payment_date || ''
  form.amount_paid         = Number(p.amount_paid || 0)
  form.payment_method      = p.payment_method || 'cash'
  form.payment_type        = p.payment_type || 'regular'
  form.reference_number    = p.reference_number || ''
  form.handled_by_employee = p.handled_by_employee || ''
  form.remarks             = p.remarks || ''
}, { immediate: true })

const isValid = computed(() => form.payment_date && form.amount_paid > 0)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch(`/api/purchase/payments/${route.params.id}`, {
      method: 'PATCH',
      body: {
        payment_date:        form.payment_date,
        amount_paid:         form.amount_paid,
        payment_method:      form.payment_method,
        payment_type:        form.payment_type,
        reference_number:    form.reference_number || null,
        handled_by_employee: form.handled_by_employee || null,
        remarks:             form.remarks || null,
      },
    })
    success('Payment updated successfully')
    navigateTo(`/purchase/payments/${route.params.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update payment')
  } finally {
    saving.value = false
  }
}
</script>
