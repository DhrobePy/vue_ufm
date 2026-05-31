<template>
  <div class="space-y-6">
    <UiPageHeader title="Record Goods Received" subtitle="Record inbound wheat delivery against a Purchase Order"
                  :breadcrumb="['Purchase', 'GRN', 'Record GRN']">
      <template #actions>
        <NuxtLink to="/purchase/grn" class="btn-ghost text-xs">← All GRNs</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">
        <!-- PO reference -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Purchase Order Reference</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order # *</label>
              <select v-model="form.poId" class="input-glass" @change="onPoSelect">
                <option value="">— Select PO —</option>
                <option v-for="po in openPOs" :key="po.id" :value="po.id">{{ po.po_number }} — {{ po.supplier_name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">GRN Date *</label>
              <input v-model="form.date" type="date" class="input-glass" />
            </div>
          </div>
          <div v-if="selectedPO" class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-2">
            <div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">{{ selectedPO.supplier_name }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">PO Amount</span><span class="text-gray-300">৳{{ Number(selectedPO.total_order_value).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Ordered Qty</span><span class="text-gray-300">{{ (Number(selectedPO.quantity_kg) / 1000).toFixed(2) }} MT</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Yet to Receive</span>
              <span :class="Number(selectedPO.qty_yet_to_receive) > 0 ? 'text-orange-300' : 'text-emerald-400'">
                {{ (Number(selectedPO.qty_yet_to_receive ?? selectedPO.quantity_kg) / 1000).toFixed(2) }} MT
              </span>
            </div>
          </div>
        </div>

        <!-- Received items -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Items Received</h3>
          <div class="space-y-4">
            <div v-for="(item, i) in form.items" :key="i"
              class="rounded-xl border border-white/[0.07] p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-gray-300">Item {{ i + 1 }}</p>
                <button v-if="form.items.length > 1" @click="removeItem(i)"
                  class="text-xs text-gray-600 hover:text-red-400 transition-colors">Remove</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-gray-500 uppercase">Product</label>
                  <select v-model="item.product" class="input-glass text-xs">
                    <option value="">— Select —</option>
                    <option value="wheat_hard">Hard Wheat (Import)</option>
                    <option value="wheat_soft">Soft Wheat (Local)</option>
                    <option value="wheat_durum">Durum Wheat</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-gray-500 uppercase">Quantity (MT)</label>
                  <input v-model.number="item.qty_mt" type="number" min="0" step="0.5" class="input-glass text-xs font-mono" />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-gray-500 uppercase">Unit Price (৳/MT)</label>
                  <input v-model.number="item.unit_price_per_mt" type="number" min="0" class="input-glass text-xs font-mono" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-gray-500 uppercase">Condition</label>
                  <select v-model="item.condition" class="input-glass text-xs">
                    <option value="good">Good — No damage</option>
                    <option value="minor_damage">Minor damage noted</option>
                    <option value="partial_reject">Partial rejection</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-gray-500 uppercase">Total Value</label>
                  <div class="input-glass text-xs font-mono text-gold-400 font-bold bg-white/[0.02]">
                    ৳{{ (item.qty_mt * item.unit_price_per_mt).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
            <button @click="addItem" class="w-full py-2 rounded-xl border border-dashed border-white/20 text-xs text-gray-500 hover:text-gray-300 hover:border-white/40 transition-all">+ Add Item</button>
          </div>
        </div>

        <!-- Transport & quality -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Transport & Unloading</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unload Point *</label>
              <select v-model="form.unload_point_name" class="input-glass">
                <option value="">— Select —</option>
                <option value="সিরাজগঞ্জ">সিরাজগঞ্জ</option>
                <option value="ডেমরা">ডেমরা</option>
                <option value="রামপুরা">রামপুরা</option>
                <option value="Head Office">Head Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transport Vehicle</label>
              <input v-model="form.vehicle" type="text" class="input-glass" placeholder="Reg. plate / vehicle no." />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver / Transporter</label>
              <input v-model="form.driver" type="text" class="input-glass" placeholder="Name" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality Rating</label>
              <select v-model="form.quality" class="input-glass">
                <option value="A">Grade A — Excellent</option>
                <option value="B">Grade B — Good</option>
                <option value="C">Grade C — Acceptable</option>
                <option value="R">Rejected</option>
              </select>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes / Remarks</label>
            <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Any issues, moisture level, pest inspection remarks…" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
            {{ saving ? 'Saving…' : 'Confirm GRN' }}
          </button>
          <NuxtLink to="/purchase/grn" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">GRN Summary</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">PO Reference</span><span class="font-mono text-gold-400/80">{{ selectedPO?.po_number || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">{{ selectedPO?.supplier_name || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Items</span><span class="text-gray-300">{{ form.items.length }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Total Qty</span><span class="text-gray-300">{{ totalQty.toFixed(2) }} MT</span></div>
            <div class="h-px bg-white/[0.06]" />
            <div class="flex justify-between"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gold-400">৳{{ totalValue.toLocaleString() }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// Load open POs from real API
const { data: poData } = await useFetch('/api/purchase/orders/open')
const openPOs = computed(() => (poData.value?.orders ?? []) as any[])

const form = reactive({
  poId: '' as string | number,
  date: new Date().toISOString().slice(0, 10),
  vehicle: '', driver: '', quality: 'A', notes: '',
  unload_point_name: '',
  items: [{ product: '', qty_mt: 0, unit_price_per_mt: 45000, condition: 'good' }],
})

const saving = ref(false)
const selectedPO = computed(() => openPOs.value.find((p: any) => p.id === Number(form.poId)) ?? null)

function onPoSelect() {
  if (selectedPO.value) {
    // Pre-fill qty from remaining to-receive
    const remainKg = Number(selectedPO.value.qty_yet_to_receive ?? selectedPO.value.quantity_kg)
    form.items[0].qty_mt = remainKg / 1000
    if (selectedPO.value.unit_price_per_kg) {
      form.items[0].unit_price_per_mt = Number(selectedPO.value.unit_price_per_kg) * 1000
    }
  }
}

function addItem() { form.items.push({ product: '', qty_mt: 0, unit_price_per_mt: 45000, condition: 'good' }) }
function removeItem(i: number) { form.items.splice(i, 1) }

const totalQty   = computed(() => form.items.reduce((s, i) => s + (i.qty_mt || 0), 0))
const totalValue = computed(() => form.items.reduce((s, i) => s + i.qty_mt * i.unit_price_per_mt, 0))

const isValid = computed(() =>
  form.poId && form.date &&
  form.items.every(i => i.product && i.qty_mt > 0)
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const result = await $fetch('/api/purchase/grn', {
      method: 'POST',
      body: {
        po_id:              Number(form.poId),
        grn_date:           form.date,
        vehicle:            form.vehicle || null,
        driver:             form.driver  || null,
        quality_grade:      form.quality,
        notes:              form.notes   || null,
        unload_point_name:  form.unload_point_name || null,
        items: form.items.map(i => ({
          product:           i.product,
          qty_mt:            i.qty_mt,
          unit_price_per_mt: i.unit_price_per_mt,
          condition:         i.condition,
        })),
      },
    }) as any
    success(`GRN ${result.grn_number} recorded — ${totalQty.value.toFixed(2)} MT received`)
    navigateTo('/purchase/grn')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record GRN')
  } finally {
    saving.value = false
  }
}
</script>
