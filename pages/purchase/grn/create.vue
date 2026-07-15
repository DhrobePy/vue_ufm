<template>
  <div class="space-y-6">
    <UiPageHeader title="Record Goods Received" subtitle="Record inbound wheat delivery against a Purchase Order"
                  :breadcrumb="['Purchase', 'GRN', 'Record GRN']">
      <template #actions>
        <NuxtLink to="/purchase/grn" class="btn-ghost text-xs">← All GRNs</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-5">
        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">GRN Details</h3>

          <!-- PO Selection -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Purchase Order <span class="text-red-500">*</span>
            </label>
            <select v-model="form.po_id" class="input-glass" @change="onPoSelect">
              <option value="">— Select Purchase Order —</option>
              <option v-for="po in openPOs" :key="po.id" :value="po.id">
                PO #{{ po.po_number }} — {{ po.supplier_name }} — {{ po.commodity_name ?? 'Wheat' }} ({{ po.wheat_origin }})
                (Pending: {{ Number(po.qty_yet_to_receive).toLocaleString() }} {{ po.commodity_unit ?? 'KG' }})
              </option>
            </select>
          </div>

          <!-- PO Summary Panel -->
          <div v-if="selectedPO" class="rounded-xl bg-blue-500/[0.05] border border-blue-500/20 p-4 text-xs space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1.5">
                <div class="flex justify-between"><span class="text-gray-500">Commodity</span><span class="text-gray-200">{{ selectedPO.commodity_name ?? 'Wheat' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-200">{{ selectedPO.supplier_name }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Origin</span><span class="text-gray-200">{{ selectedPO.wheat_origin || '—' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Unit Price</span><span class="text-gray-200 font-mono">৳{{ Number(selectedPO.unit_price_per_kg).toLocaleString() }}/{{ unitLabel }}</span></div>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between"><span class="text-gray-500">Ordered</span><span class="text-gray-200 font-mono">{{ Number(selectedPO.quantity_kg).toLocaleString() }} {{ unitLabel }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Already Received</span><span class="text-gray-200 font-mono">{{ Number(selectedPO.total_received_qty ?? 0).toLocaleString() }} {{ unitLabel }}</span></div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Yet to Receive</span>
                  <span class="font-mono font-semibold" :class="Number(selectedPO.qty_yet_to_receive) > 0 ? 'text-orange-300' : 'text-emerald-400'">
                    {{ Number(selectedPO.qty_yet_to_receive).toLocaleString() }} {{ unitLabel }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Date & Truck -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                GRN Date <span class="text-red-500">*</span>
              </label>
              <input v-model="form.grn_date" type="date" class="input-glass" :max="today" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Truck Number</label>
              <input v-model="form.truck_number" type="text" class="input-glass" placeholder="e.g., 1234" maxlength="20" />
            </div>
          </div>

          <!-- Qty Received & Expected -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quantity Received ({{ unitLabel }}) <span class="text-red-500">*</span>
              </label>
              <input v-model.number="form.quantity_received_kg" type="number" step="0.01" min="0.01"
                class="input-glass font-mono text-lg" @input="onQtyChange" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expected Quantity ({{ unitLabel }})</label>
              <input v-model.number="form.expected_quantity" type="number" step="0.01" min="0"
                class="input-glass font-mono" @input="onQtyChange" />
              <p class="text-[10px] text-gray-600">Optional — for variance tracking (as per truck challan)</p>
            </div>
          </div>

          <!-- Variance Display -->
          <div v-if="showVariance" class="rounded-xl px-4 py-3 text-xs font-semibold border"
               :class="varianceBg">
            <span class="font-bold">Variance:</span>
            {{ varianceKg > 0 ? '+' : '' }}{{ varianceKg.toFixed(2) }} {{ unitLabel }}
            ({{ varianceKg > 0 ? '+' : '' }}{{ variancePct.toFixed(2) }}%)
          </div>

          <!-- Over-delivery Warning -->
          <div v-if="overDelivery.show" class="rounded-xl p-4 bg-orange-500/[0.08] border-2 border-orange-400/40 space-y-3">
            <div class="flex items-start gap-3">
              <span class="text-orange-400 text-lg">⚠</span>
              <div class="flex-1 space-y-1">
                <p class="font-semibold text-orange-300 text-sm">Over-Delivery Detected</p>
                <p class="text-xs text-orange-200/80">
                  Remaining on PO: <strong>{{ overDelivery.pending.toFixed(2) }}</strong> {{ unitLabel }} |
                  Recording: <strong>{{ form.quantity_received_kg.toFixed(2) }}</strong> {{ unitLabel }} |
                  Excess: <strong class="text-red-400">{{ overDelivery.excess.toFixed(2) }}</strong> {{ unitLabel }}
                </p>
                <p class="text-xs text-orange-200/70">How would you like to handle the excess?</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" @click="setOverDeliveryAction('accept_with_dan')"
                class="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                :class="form.over_delivery_action === 'accept_with_dan'
                  ? 'bg-orange-500 text-white' : 'bg-white/[0.08] text-orange-300 hover:bg-orange-500/30'">
                📄 Accept All + Auto-Draft Debit Note (DAN)
              </button>
              <button type="button" @click="setOverDeliveryAction('as_is')"
                class="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                :class="form.over_delivery_action === 'as_is'
                  ? 'bg-gray-600 text-white' : 'bg-white/[0.08] text-gray-300 hover:bg-gray-600/40'">
                ✔ Record As-Is (handle manually later)
              </button>
            </div>
            <p v-if="overDelivery.choiceConfirmed" class="text-xs text-emerald-400 font-semibold">
              {{ form.over_delivery_action === 'accept_with_dan'
                ? '✔ Choice: Accept all + Auto-draft Debit Note for excess. Click Record GRN to confirm.'
                : '✔ Choice: Record as-is. You can create an adjustment note manually later.' }}
            </p>
          </div>

          <!-- Calculated Value -->
          <div class="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4">
            <p class="text-xs text-gray-500 mb-1">Calculated Value (Expected Qty × Unit Price)</p>
            <p class="text-3xl font-bold text-gold-400 font-mono">৳{{ calculatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
          </div>

          <!-- Unload Location -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Unload Location <span class="text-red-500">*</span>
            </label>
            <select v-model="form.unload_point_name" class="input-glass">
              <option value="">— Select Location —</option>
              <option value="সিরাজগঞ্জ">সিরাজগঞ্জ (Sirajganj)</option>
              <option value="ডেমরা">ডেমরা (Demra)</option>
              <option value="রামপুরা">রামপুরা (Rampura)</option>
              <option value="Head Office">Head Office</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Remarks -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</label>
            <textarea v-model="form.remarks" rows="3" class="input-glass resize-none"
              placeholder="Any notes about this delivery…" />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <button @click="submit" :disabled="!isValid || saving"
              class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
              </svg>
              {{ saving ? 'Saving…' : 'Record GRN' }}
            </button>
            <NuxtLink to="/purchase/grn" class="btn-ghost">Cancel</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Right Panel: Instructions -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Instructions</h3>
          <ol class="list-decimal list-inside space-y-1.5 text-xs text-gray-500">
            <li>Select the purchase order</li>
            <li>Enter the date goods were received</li>
            <li>Enter truck number (optional)</li>
            <li>Enter actual quantity received</li>
            <li>Enter expected quantity (for variance tracking)</li>
            <li>Select unload location</li>
            <li>Add any remarks if needed</li>
            <li>Review calculated value</li>
            <li>Click "Record GRN"</li>
          </ol>
          <div class="h-px bg-white/[0.06]" />
          <p class="text-[10px] text-gray-600">
            If actual weight differs from expected by more than 0.5%, a variance record will be automatically created.
          </p>
        </div>

        <div v-if="selectedPO" class="glass-card p-5 space-y-2 text-xs">
          <h3 class="text-sm font-semibold text-gray-300">GRN Summary</h3>
          <div class="flex justify-between"><span class="text-gray-600">PO #</span><span class="font-mono text-gold-400/80">{{ selectedPO.po_number }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">{{ selectedPO.supplier_name }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Unit Price</span><span class="font-mono text-gray-300">৳{{ Number(selectedPO.unit_price_per_kg).toLocaleString() }}/{{ unitLabel }}</span></div>
          <div class="h-px bg-white/[0.06]" />
          <div class="flex justify-between">
            <span class="text-gray-600 font-semibold">Expected Value</span>
            <span class="font-bold text-gold-400">৳{{ calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const today = new Date().toISOString().slice(0, 10)

const { data: poData } = await useFetch('/api/purchase/orders/open')
const openPOs = computed(() => (poData.value?.orders ?? []) as any[])

const form = reactive({
  po_id:                '' as string | number,
  grn_date:             today,
  truck_number:         '',
  quantity_received_kg: 0,
  expected_quantity:    0,
  unload_point_name:    '',
  remarks:              '',
  over_delivery_action: 'as_is' as 'as_is' | 'accept_with_dan',
  excess_qty:           0,
})

const saving = ref(false)
const selectedPO = computed(() => openPOs.value.find((p: any) => p.id === Number(form.po_id)) ?? null)

// MT-quoted commodities (wheat) are physically weighed and stored in KG at
// the gate regardless of the PO's unit; every other commodity is received
// 1:1 in its own catalog unit.
const unitLabel = computed(() => {
  const u = selectedPO.value?.commodity_unit
  return (!u || u === 'MT') ? 'KG' : u
})

function onPoSelect() {
  if (!selectedPO.value) return
  // Pre-fill expected_quantity with remaining pending qty
  const pending = Number(selectedPO.value.qty_yet_to_receive ?? 0)
  if (pending > 0) form.expected_quantity = pending
  resetOverDelivery()
}

// Variance
const showVariance = computed(() =>
  form.expected_quantity > 0 && form.quantity_received_kg > 0,
)
const varianceKg  = computed(() => form.quantity_received_kg - form.expected_quantity)
const variancePct = computed(() =>
  form.expected_quantity > 0 ? (varianceKg.value / form.expected_quantity) * 100 : 0,
)
const varianceBg = computed(() => {
  const pct = Math.abs(variancePct.value)
  if (pct > 1)   return 'bg-red-500/[0.08] border-red-400/40 text-red-300'
  if (pct > 0.5) return 'bg-yellow-500/[0.08] border-yellow-400/40 text-yellow-300'
  return 'bg-emerald-500/[0.08] border-emerald-400/40 text-emerald-300'
})

// Calculated value = expected qty × unit price
const calculatedValue = computed(() => {
  const unitPrice = Number(selectedPO.value?.unit_price_per_kg ?? 0)
  const expected  = form.expected_quantity || 0
  return unitPrice * expected
})

// Over-delivery detection
const overDelivery = reactive({ show: false, pending: 0, excess: 0, choiceConfirmed: false })

function onQtyChange() {
  checkOverDelivery()
}

function checkOverDelivery() {
  if (!selectedPO.value || form.quantity_received_kg <= 0) {
    resetOverDelivery(); return
  }
  const pending = Number(selectedPO.value.qty_yet_to_receive ?? 0)
  if (pending >= 0 && form.quantity_received_kg > pending + 0.01) {
    overDelivery.pending = pending
    overDelivery.excess  = form.quantity_received_kg - pending
    form.excess_qty      = overDelivery.excess
    overDelivery.show    = true
  } else {
    resetOverDelivery()
  }
}

function resetOverDelivery() {
  overDelivery.show            = false
  overDelivery.choiceConfirmed = false
  form.over_delivery_action    = 'as_is'
  form.excess_qty              = 0
}

function setOverDeliveryAction(action: 'as_is' | 'accept_with_dan') {
  form.over_delivery_action    = action
  overDelivery.choiceConfirmed = true
}

const isValid = computed(() =>
  !!form.po_id &&
  !!form.grn_date &&
  form.quantity_received_kg > 0 &&
  !!form.unload_point_name,
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const result = await $fetch('/api/purchase/grn', {
      method: 'POST',
      body: {
        po_id:                Number(form.po_id),
        grn_date:             form.grn_date,
        truck_number:         form.truck_number || null,
        quantity_received_kg: form.quantity_received_kg,
        expected_quantity:    form.expected_quantity || null,
        unload_point_name:    form.unload_point_name || null,
        remarks:              form.remarks || null,
        over_delivery_action: form.over_delivery_action,
        excess_qty:           form.excess_qty,
      },
    }) as any
    success(`GRN ${result.grn_number} recorded successfully`)
    navigateTo('/purchase/grn')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record GRN')
  } finally {
    saving.value = false
  }
}
</script>
