<template>
  <div class="space-y-6">
    <UiPageHeader title="Record Adjustment Note" subtitle="Create a DAN or CAN for a purchase order"
                  :breadcrumb="['Purchase','Adjustments','New']">
      <template #actions>
        <NuxtLink to="/purchase/adjustments" class="btn-ghost text-xs">← All Notes</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 space-y-5">

        <!-- Note Type selector -->
        <div class="space-y-3">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Note Type *</label>
          <div class="grid grid-cols-2 gap-4">
            <label class="cursor-pointer rounded-xl border-2 p-4 transition-all"
              :class="form.note_type === 'debit' ? 'border-orange-500 bg-orange-500/10' : 'border-white/[0.08] hover:border-orange-500/40'">
              <input type="radio" v-model="form.note_type" value="debit" class="sr-only" />
              <p class="font-semibold text-orange-400 text-sm">▲ Debit Note (DAN)</p>
              <p class="text-xs text-gray-500 mt-1">We owe the supplier <strong class="text-gray-400">more</strong>.<br>Over-delivery, price adjustment (upward).</p>
            </label>
            <label class="cursor-pointer rounded-xl border-2 p-4 transition-all"
              :class="form.note_type === 'credit' ? 'border-blue-500 bg-blue-500/10' : 'border-white/[0.08] hover:border-blue-500/40'">
              <input type="radio" v-model="form.note_type" value="credit" class="sr-only" />
              <p class="font-semibold text-blue-400 text-sm">▼ Credit Note (CAN)</p>
              <p class="text-xs text-gray-500 mt-1">Supplier owes us a <strong class="text-gray-400">reduction</strong>.<br>Short delivery, quality deduction, return.</p>
            </label>
          </div>
        </div>

        <!-- Reason -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason *</label>
          <select v-model="form.reason_type" class="input-glass" :disabled="!form.note_type">
            <option value="">— Select reason —</option>
            <template v-if="form.note_type === 'debit'">
              <option value="over_delivery">Over-Delivery (extra goods received)</option>
              <option value="price_dispute">Price Dispute / Upward Price Adjustment</option>
              <option value="other">Other (Debit)</option>
            </template>
            <template v-if="form.note_type === 'credit'">
              <option value="under_delivery_closure">Under-Delivery Closure (PO closed short)</option>
              <option value="quality_deduction">Quality / Weight Deduction</option>
              <option value="return">Goods Return</option>
              <option value="other">Other (Credit)</option>
            </template>
          </select>
        </div>

        <!-- Purchase Order -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order *</label>
          <select v-model="form.purchase_order_id" class="input-glass" @change="onPOChange">
            <option value="">— Select Purchase Order —</option>
            <option v-for="po in allPOs" :key="po.id" :value="po.id"
              :data-supplier="po.supplier_name"
              :data-balance="po.balance_payable"
              :data-unit-price="po.unit_price_per_kg">
              PO #{{ po.po_number }} — {{ po.supplier_name }}
              (Bal: ৳{{ Number(po.balance_payable ?? 0).toLocaleString() }})
            </option>
          </select>
        </div>

        <!-- PO Summary -->
        <div v-if="selectedPO" class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-1">
          <div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">{{ selectedPO.supplier_name }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Ordered (kg)</span><span class="text-gray-300">{{ Number(selectedPO.quantity_kg).toLocaleString() }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Balance Due</span><span class="text-red-400 font-bold">৳{{ Number(selectedPO.balance_payable ?? 0).toLocaleString() }}</span></div>
        </div>

        <!-- Qty & Price & Amount -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity (kg) <span class="text-gray-600 font-normal">optional</span></label>
            <input v-model.number="form.quantity_kg" type="number" min="0" step="0.01" class="input-glass font-mono" @input="autoCalcAmount" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit Price / kg <span class="text-gray-600 font-normal">optional</span></label>
            <input v-model.number="form.unit_price_per_kg" type="number" min="0" step="0.0001" class="input-glass font-mono" @input="autoCalcAmount" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Amount (৳) *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
              <input v-model.number="form.amount" type="number" min="0.01" step="0.01" class="input-glass pl-8 font-mono" placeholder="0.00" />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description / Details *</label>
          <textarea v-model="form.description" rows="4" class="input-glass resize-none"
                    placeholder="Explain the reason for this adjustment in detail…" />
        </div>

        <!-- Amount preview banner -->
        <div v-if="form.amount > 0 && form.note_type" class="rounded-xl p-4 text-center"
          :class="form.note_type === 'debit' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-blue-500/10 border border-blue-500/30'">
          <p class="text-xs text-gray-500 mb-1">Adjustment Amount</p>
          <p class="text-3xl font-bold" :class="form.note_type === 'debit' ? 'text-orange-400' : 'text-blue-400'">
            ৳{{ Number(form.amount).toLocaleString() }}
          </p>
          <p class="text-xs mt-1" :class="form.note_type === 'debit' ? 'text-orange-400/70' : 'text-blue-400/70'">
            {{ form.note_type === 'debit'
              ? 'DAN — This amount will be ADDED to PO balance payable when posted.'
              : 'CAN — This amount will be DEDUCTED from PO balance payable when posted.' }}
          </p>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button @click="submit" :disabled="saving || !isValid"
            class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
            {{ saving ? 'Creating…' : 'Create as Draft' }}
          </button>
          <NuxtLink to="/purchase/adjustments" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right: Workflow info -->
      <div class="space-y-4">
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Workflow</h3>
          <div class="space-y-3 text-xs text-gray-400">
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px] font-bold">1</span>
              <div><strong class="text-gray-300">Create (Draft)</strong><br>No financial effect yet.</div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">2</span>
              <div><strong class="text-gray-300">Approve</strong><br>Admin reviews and approves.</div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
              <div><strong class="text-gray-300">Post</strong><br>Financial effect applies:<br>
                <ul class="list-disc ml-4 mt-1">
                  <li>DAN → increases PO balance</li>
                  <li>CAN → decreases PO balance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card p-4 border border-orange-500/20 text-xs text-gray-400">
          <p class="font-semibold text-orange-400 mb-1">⚠ Important</p>
          <p>Creating a note does <strong class="text-gray-300">NOT</strong> affect payments or balances until it is approved and posted.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const saving = ref(false)

// Load all active POs for dropdown
const { data: poData } = await useFetch('/api/purchase/orders', { query: { per: 500 } })
const allPOs = computed(() => (poData.value as any)?.orders ?? [])

const form = reactive({
  note_type:         '' as 'debit' | 'credit' | '',
  reason_type:       '',
  purchase_order_id: '' as number | '',
  quantity_kg:       0,
  unit_price_per_kg: 0,
  amount:            0,
  description:       '',
})

const selectedPO = computed(() => form.purchase_order_id ? allPOs.value.find((p: any) => p.id === Number(form.purchase_order_id)) : null)

function onPOChange() {
  if (selectedPO.value) {
    form.unit_price_per_kg = Number(selectedPO.value.unit_price_per_kg || 0)
    autoCalcAmount()
  }
}

function autoCalcAmount() {
  if (form.quantity_kg > 0 && form.unit_price_per_kg > 0) {
    form.amount = Math.round(form.quantity_kg * form.unit_price_per_kg * 100) / 100
  }
}

const isValid = computed(() =>
  form.note_type && form.reason_type && form.purchase_order_id &&
  form.amount > 0 && form.description,
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const result = await $fetch('/api/purchase/adjustments', {
      method: 'POST',
      body: {
        note_type:         form.note_type,
        reason_type:       form.reason_type,
        purchase_order_id: Number(form.purchase_order_id),
        quantity_kg:       form.quantity_kg > 0 ? form.quantity_kg : null,
        unit_price_per_kg: form.unit_price_per_kg > 0 ? form.unit_price_per_kg : null,
        amount:            form.amount,
        description:       form.description,
      },
    }) as any
    success(`Adjustment Note ${result.note_number} created as draft`)
    navigateTo(`/purchase/adjustments/${result.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to create adjustment note')
  } finally {
    saving.value = false
  }
}
</script>
