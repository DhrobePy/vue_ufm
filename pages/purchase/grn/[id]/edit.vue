<template>
  <div class="space-y-6">
    <UiPageHeader :title="`Edit GRN${grn.grn_number ? ` — ${grn.grn_number}` : ''}`"
                  subtitle="Superadmin — modify goods received note"
                  :breadcrumb="['Purchase','GRNs','Edit']">
      <template #actions>
        <NuxtLink :to="`/purchase/grn/${route.params.id}`" class="btn-ghost text-xs">← Back</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="loadPending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="loadError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ loadError.message }}</div>

    <template v-else>
      <!-- Posted + journal warning -->
      <div v-if="grn.grn_status === 'posted' && grn.journal_entry_id"
           class="glass-card p-4 border-l-4 border-amber-500/60 bg-amber-500/[0.05]">
        <p class="text-xs text-amber-300">
          ⚠ <strong>Note:</strong> This GRN is already posted.
          Editing will automatically reverse the old journal entry and generate a new one upon saving.
        </p>
      </div>

      <div class="max-w-4xl">
        <!-- GRN info header -->
        <div class="glass-card p-4 mb-5 flex flex-wrap items-center gap-4 text-xs">
          <div><span class="text-gray-500">GRN #</span> <span class="font-mono text-gold-400/80 font-semibold ml-1">{{ grn.grn_number }}</span></div>
          <div><span class="text-gray-500">PO #</span> <span class="text-gray-300 font-mono ml-1">{{ grn.po_number }}</span></div>
          <div><span class="text-gray-500">Supplier</span> <span class="text-gray-300 ml-1">{{ grn.supplier_name }}</span></div>
          <div class="ml-auto"><UiStatusBadge :status="grn.grn_status" /></div>
        </div>

        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title flex items-center gap-2">✏ Modification Form</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <!-- Left Column -->
            <div class="space-y-5">
              <!-- GRN Date -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  GRN Date <span class="text-red-500">*</span>
                </label>
                <input v-model="form.grn_date" type="date" class="input-glass" required />
              </div>

              <!-- Truck Number -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Truck Number <span class="text-red-500">*</span>
                </label>
                <input v-model="form.truck_number" type="text" class="input-glass font-mono" maxlength="20"
                  placeholder="e.g., 1234" />
              </div>

              <!-- Unload Point (Branch) -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Unload Point (Branch) <span class="text-red-500">*</span>
                </label>
                <select v-model="form.unload_point_branch_id" class="input-glass">
                  <option value="">Select Branch</option>
                  <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
                <p class="text-[10px] text-gray-600">Or manually:</p>
                <select v-model="form.unload_point_name" class="input-glass text-xs">
                  <option value="">— Select Location —</option>
                  <option value="সিরাজগঞ্জ">সিরাজগঞ্জ (Sirajganj)</option>
                  <option value="ডেমরা">ডেমরা (Demra)</option>
                  <option value="রামপুরা">রামপুরা (Rampura)</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Variance Remarks -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variance Remarks</label>
                <input v-model="form.variance_remarks" type="text" class="input-glass"
                  placeholder="e.g., 35kg loss during transit" />
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-5">
              <!-- Quantity Received -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Quantity Received (KG) <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input v-model.number="form.quantity_received_kg" type="number" step="0.01" min="0.01"
                    class="input-glass font-black text-xl w-full pr-12" required @input="recalcValue" />
                  <span class="absolute inset-y-0 right-4 flex items-center text-gray-500 text-xs font-bold">KG</span>
                </div>
                <p class="text-[10px] text-gray-500">
                  Unit Price: <span class="text-gray-300">৳{{ Number(grn.unit_price_per_kg || 0).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) }}/KG</span>
                </p>
              </div>

              <!-- Calculated Value (auto) -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Calculated Total Value</label>
                <div class="relative">
                  <input :value="`৳${previewValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
                    readonly class="input-glass font-black text-xl text-blue-400 bg-blue-500/[0.05] border-blue-500/20 w-full pr-12" />
                  <span class="absolute inset-y-0 right-4 flex items-center text-blue-500 text-xs">⚙</span>
                </div>
                <p class="text-[10px] text-blue-500/70 italic">Quantity × Unit Price (Auto-updated)</p>
              </div>

              <!-- Expected Quantity -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Quantity (KG)</label>
                <input v-model.number="form.expected_quantity" type="number" step="0.01" min="0"
                  class="input-glass font-mono" placeholder="As per truck challan" />
                <p class="text-[10px] text-gray-600 italic">As per truck challan</p>
              </div>

              <!-- Remarks -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remarks</label>
                <textarea v-model="form.remarks" rows="2" class="input-glass resize-none" />
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
            <p class="text-[10px] text-gray-600 uppercase tracking-wider">⚠ Superadmin Access Required</p>
            <div class="flex items-center gap-3">
              <NuxtLink :to="`/purchase/grn/${route.params.id}`" class="btn-ghost text-xs">Cancel</NuxtLink>
              <button @click="submit" :disabled="saving || !isValid"
                class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                {{ saving ? 'Saving…' : 'Update Goods Received Note' }}
              </button>
            </div>
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

const [{ data: loadData, pending: loadPending, error: loadError }, { data: branchData }] = await Promise.all([
  useFetch(() => `/api/purchase/grn/${route.params.id}`),
  useFetch('/api/branches'),
])

const grn      = computed(() => (loadData.value?.grn ?? {}) as any)
const branches = computed(() => (branchData.value?.branches ?? []) as any[])

const form = reactive({
  grn_date:               '',
  truck_number:           '',
  quantity_received_kg:   0,
  expected_quantity:      0,
  unload_point_name:      '',
  unload_point_branch_id: '' as string | number,
  variance_remarks:       '',
  remarks:                '',
})

watch(grn, (g) => {
  if (!g?.id) return
  form.grn_date               = g.grn_date || ''
  form.truck_number           = g.truck_number || ''
  form.quantity_received_kg   = Number(g.quantity_received_kg || 0)
  form.expected_quantity      = Number(g.expected_quantity || 0)
  form.unload_point_name      = g.unload_point_name || ''
  form.unload_point_branch_id = g.unload_point_branch_id || ''
  form.variance_remarks       = g.variance_remarks || ''
  form.remarks                = g.remarks || ''
}, { immediate: true })

const previewValue = computed(() =>
  Math.round(form.quantity_received_kg * Number(grn.value?.unit_price_per_kg || 0) * 100) / 100,
)
function recalcValue() { /* previewValue is computed */ }

const isValid = computed(() => !!form.grn_date && form.quantity_received_kg > 0)

async function submit() {
  if (!isValid.value) return
  if (!confirm('CRITICAL ACTION:\nAre you sure you want to modify this GRN?\nThis will impact inventory and ledger balances.')) return
  saving.value = true
  try {
    await $fetch(`/api/purchase/grn/${route.params.id}`, {
      method: 'PATCH',
      body: {
        grn_date:               form.grn_date,
        truck_number:           form.truck_number || null,
        quantity_received_kg:   form.quantity_received_kg,
        expected_quantity:      form.expected_quantity || null,
        unload_point_name:      form.unload_point_name || null,
        unload_point_branch_id: form.unload_point_branch_id || null,
        variance_remarks:       form.variance_remarks || null,
        remarks:                form.remarks || null,
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
