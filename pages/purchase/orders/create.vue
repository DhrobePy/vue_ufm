<template>
  <div class="space-y-6 max-w-3xl">
    <UiPageHeader title="Create Purchase Order" :breadcrumb="['Purchase','Create PO']" />
    <div class="glass-card p-6 space-y-5">
      <h3 class="section-title">PO Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commodity *</label>
          <select v-model="form.commodityId" class="input-glass">
            <option value="">Select commodity…</option>
            <option v-for="c in commodities" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <NuxtLink to="/purchase/commodities" class="text-[11px] text-gold-500 hover:text-gold-400">+ Manage catalog</NuxtLink>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier *</label>
          <select v-model="form.supplierId" class="input-glass">
            <option value="">Select supplier…</option>
            <option v-for="s in eligibleSuppliers" :key="s.id" :value="s.id">{{ s.company_name }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Date *</label>
          <input v-model="form.poDate" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin</label>
          <select v-if="originOptions.length" v-model="form.origin" class="input-glass">
            <option value="">Select origin…</option>
            <option v-for="o in originOptions" :key="o" :value="o">{{ o }}</option>
          </select>
          <input v-else v-model="form.origin" class="input-glass" placeholder="Optional — e.g. supplier location" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Delivery</label>
          <input v-model="form.expectedDelivery" type="date" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Terms *</label>
          <select v-model="form.paymentTerms" class="input-glass">
            <option value="Advance">Advance (Pay Before Delivery)</option>
            <option value="Credit 30">Credit — 30 Days</option>
            <option value="Credit 60">Credit — 60 Days</option>
            <option value="Credit 90">Credit — 90 Days</option>
            <option value="Credit 120">Credit — 120 Days</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity ({{ selectedUnit }}) *</label>
          <input v-model.number="form.qty" type="number" min="0" step="0.5" class="input-glass" placeholder="0.000" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price / {{ selectedUnit }} (৳) *</label>
          <input v-model.number="form.unitPrice" type="number" min="0" class="input-glass" placeholder="0.00" />
        </div>
        <div class="md:col-span-2 p-4 rounded-xl" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Total Order Value</span>
            <span class="font-bold text-gold-400 text-lg">৳{{ totalValue.toLocaleString() }}</span>
          </div>
        </div>
        <div class="md:col-span-2 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</label>
          <textarea v-model="form.remarks" rows="2" class="input-glass resize-none" placeholder="Any remarks for this PO…" />
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <NuxtLink to="/purchase/orders" class="btn-ghost">Cancel</NuxtLink>
        <button @click="submit" :disabled="submitting || !isValid" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
          {{ submitting ? 'Submitting…' : 'Submit PO' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const form = reactive({
  commodityId: '' as string | number,
  supplierId: '' as string | number,
  poDate: new Date().toISOString().split('T')[0],
  origin: '', expectedDelivery: '',
  paymentTerms: 'Credit 30',
  qty: 0, unitPrice: 0, remarks: '',
})

const submitting = ref(false)

// Load commodities (each carries its own origin list + supplier scoping) and suppliers
const { data: commData } = await useFetch('/api/purchase/commodities')
const commodities = computed(() => (commData.value?.commodities ?? []) as any[])

const { data: supData } = await useFetch('/api/suppliers', { query: { per: 200 } })
const suppliers = computed(() => (supData.value?.suppliers ?? []) as any[])

const selectedCommodity = computed(() => commodities.value.find(c => c.id === Number(form.commodityId)))
const selectedUnit = computed(() => selectedCommodity.value?.unit ?? 'MT')
const originOptions = computed(() => selectedCommodity.value?.origins ?? [])

// A commodity with zero linked suppliers is unscoped — every active supplier is eligible.
const eligibleSuppliers = computed(() => {
  const ids = selectedCommodity.value?.supplier_ids ?? []
  return ids.length ? suppliers.value.filter(s => ids.includes(s.id)) : suppliers.value
})

// Default to Wheat once the catalog loads, matching prior single-commodity behavior.
watch(commodities, (list) => {
  if (!form.commodityId && list.length) {
    form.commodityId = (list.find(c => c.name === 'Wheat') ?? list[0]).id
  }
}, { immediate: true })

// Reset origin/supplier choices that no longer apply when the commodity changes.
watch(() => form.commodityId, () => {
  if (form.origin && !originOptions.value.includes(form.origin)) form.origin = ''
  if (form.supplierId && !eligibleSuppliers.value.some(s => s.id === Number(form.supplierId))) form.supplierId = ''
})

const totalValue = computed(() => Math.round(form.qty * form.unitPrice))
const isValid = computed(() => form.commodityId && form.supplierId && form.poDate && form.qty > 0 && form.unitPrice > 0)

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  try {
    const result = await $fetch('/api/purchase/orders', {
      method: 'POST',
      body: {
        commodity_id:           Number(form.commodityId),
        supplier_id:            Number(form.supplierId),
        po_date:                form.poDate,
        origin:                 form.origin || null,
        expected_delivery_date: form.expectedDelivery || null,
        payment_terms:          form.paymentTerms,
        quantity:               form.qty,
        unit_price:             form.unitPrice,
        remarks:                form.remarks || null,
      },
    }) as any
    success(`Purchase Order ${result.po_number} created ✓`)
    navigateTo('/purchase/orders')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to create purchase order')
  } finally {
    submitting.value = false
  }
}
</script>
