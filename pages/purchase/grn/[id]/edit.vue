<template>
  <div class="space-y-6">
    <UiPageHeader title="Edit GRN" subtitle="Update goods received note details"
                  :breadcrumb="['Purchase','GRNs','Edit']">
      <template #actions>
        <NuxtLink :to="`/purchase/grn/${route.params.id}`" class="btn-ghost text-xs">← Back</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="loadPending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="loadError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ loadError.message }}</div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">

          <div class="glass-card p-6 space-y-4">
            <h3 class="section-title">GRN Details</h3>

            <div class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-1">
              <div class="flex justify-between"><span class="text-gray-600">GRN #</span><span class="font-mono text-gold-400/80">{{ grn.grn_number }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">PO #</span><span class="text-gray-300">{{ grn.po_number }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">{{ grn.supplier_name }}</span></div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">GRN Date *</label>
                <input v-model="form.grn_date" type="date" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transport Vehicle</label>
                <input v-model="form.truck_number" type="text" class="input-glass" placeholder="Reg. plate / vehicle no." />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity Received (kg)</label>
                <input v-model.number="form.quantity_received_kg" type="number" min="0" step="0.01" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unload Point</label>
                <select v-model="form.unload_point_name" class="input-glass">
                  <option value="">— Select —</option>
                  <option value="সিরাজগঞ্জ">সিরাজগঞ্জ</option>
                  <option value="ডেমরা">ডেমরা</option>
                  <option value="রামপুরা">রামপুরা</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</label>
              <textarea v-model="form.remarks" rows="3" class="input-glass resize-none" placeholder="Any notes…" />
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button @click="submit" :disabled="saving || !isValid"
                class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
              <NuxtLink :to="`/purchase/grn/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Right panel: computed value -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Value Preview</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Qty</span><span class="font-mono text-gray-300">{{ form.quantity_received_kg.toLocaleString() }} kg</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Unit Price</span><span class="font-mono text-gray-300">৳{{ Number(grn.unit_price_per_kg || 0).toLocaleString() }}/kg</span></div>
            <div class="h-px bg-white/[0.06]" />
            <div class="flex justify-between"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gold-400">৳{{ previewValue.toLocaleString() }}</span></div>
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
  () => `/api/purchase/grn/${route.params.id}`,
)
const grn = computed(() => (loadData.value?.grn ?? {}) as any)

const form = reactive({
  grn_date:             '',
  truck_number:         '',
  quantity_received_kg: 0,
  unload_point_name:    '',
  remarks:              '',
})

watch(grn, (g) => {
  if (!g?.id) return
  form.grn_date             = g.grn_date || ''
  form.truck_number         = g.truck_number || ''
  form.quantity_received_kg = Number(g.quantity_received_kg || 0)
  form.unload_point_name    = g.unload_point_name || ''
  form.remarks              = g.remarks || ''
}, { immediate: true })

const previewValue = computed(() =>
  Math.round(form.quantity_received_kg * Number(grn.value.unit_price_per_kg || 0)),
)
const isValid = computed(() => form.grn_date && form.quantity_received_kg > 0)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch(`/api/purchase/grn/${route.params.id}`, {
      method: 'PATCH',
      body: {
        grn_date:             form.grn_date,
        truck_number:         form.truck_number || null,
        quantity_received_kg: form.quantity_received_kg,
        unload_point_name:    form.unload_point_name || null,
        remarks:              form.remarks || null,
      },
    })
    success('GRN updated successfully')
    navigateTo(`/purchase/grn/${route.params.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update GRN')
  } finally {
    saving.value = false
  }
}
</script>
