<template>
  <div class="space-y-6 max-w-4xl">
    <UiPageHeader
      :title="`Edit — ${poNo}`"
      subtitle="Full Edit Mode · All changes are audit-logged"
      :breadcrumb="['Purchase', 'Orders', poNo, 'Edit']"
    >
      <template #actions>
        <NuxtLink :to="`/purchase/orders/${route.params.id}`" class="btn-ghost text-xs">← Back to PO</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <template v-else>
      <!-- Warning banner -->
      <div class="rounded-2xl p-4 flex items-start gap-4"
           style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.25)">
        <span class="text-xl mt-0.5 shrink-0">⚠️</span>
        <div>
          <p class="text-sm font-bold text-amber-400">Full Edit Mode — all fields are editable</p>
          <ul class="text-xs text-gray-500 mt-1.5 space-y-0.5 list-disc list-inside">
            <li>Every change is recorded in the audit trail for compliance</li>
            <li>Editing PO Number or Date may affect related reports and references</li>
            <li>Changes will <strong class="text-gray-400">not</strong> automatically update linked GRNs or payments</li>
            <li>PO Number must remain unique across all purchase orders</li>
          </ul>
        </div>
      </div>

      <!-- Current values snapshot -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Current Values <span class="text-gray-600 font-normal text-xs">(original — before editing)</span></h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div><p class="text-gray-600 mb-0.5">PO Number</p><p class="font-mono font-semibold text-gold-400">{{ original.poNumber }}</p></div>
          <div><p class="text-gray-600 mb-0.5">PO Date</p><p class="text-gray-200">{{ original.poDate }}</p></div>
          <div><p class="text-gray-600 mb-0.5">Supplier</p><p class="text-gray-200">{{ original.supplier }}</p></div>
          <div><p class="text-gray-600 mb-0.5">Origin</p><p class="text-gray-200">{{ original.origin }}</p></div>
          <div><p class="text-gray-600 mb-0.5">Quantity</p><p class="font-mono text-gray-200">{{ Number(original.qty).toLocaleString() }} {{ unitLabel }}</p></div>
          <div><p class="text-gray-600 mb-0.5">Unit Price</p><p class="font-mono text-gray-200">৳{{ fmtPrice(original.unitPrice) }}/{{ unitLabel }}</p></div>
          <div><p class="text-gray-600 mb-0.5">Total Value</p><p class="font-mono font-bold text-gold-400">৳{{ (original.qty * original.unitPrice).toLocaleString() }}</p></div>
          <div><p class="text-gray-600 mb-0.5">Expected Delivery</p><p class="text-gray-200">{{ original.expectedDelivery || 'Not set' }}</p></div>
        </div>
      </div>

      <!-- Live change-diff panel -->
      <Transition name="slide-down">
        <div v-if="changes.length > 0"
             class="rounded-2xl p-4"
             style="background:rgba(99,102,241,0.07);border:1px solid rgba(99,102,241,0.25)">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-sm font-bold text-indigo-400">📝 Changes detected</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {{ changes.length }} change{{ changes.length > 1 ? 's' : '' }}
            </span>
          </div>
          <ul class="space-y-1.5">
            <li v-for="c in changes" :key="c.key" class="flex items-start gap-2 text-xs">
              <span class="text-indigo-500 mt-0.5">→</span>
              <span class="text-gray-400"><strong class="text-gray-300">{{ c.label }}:</strong>
                <span class="line-through text-gray-600 ml-1">{{ c.old }}</span>
                <span class="text-indigo-300 ml-1">{{ c.new }}</span>
              </span>
            </li>
          </ul>
        </div>
      </Transition>

      <!-- ── EDIT FORM ── -->
      <div class="space-y-5">
        <!-- Critical Fields -->
        <div class="glass-card p-5 space-y-4" style="border-color:rgba(245,158,11,0.2)">
          <h3 class="section-title flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] text-amber-400 font-bold">!</span>
            Critical Fields
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                PO Number *
                <span class="text-gray-500 font-normal normal-case ml-1">(changing affects all references)</span>
              </label>
              <input v-model="form.poNumber" type="text" class="input-glass border-amber-500/40" placeholder="e.g. PO-2026-0001" />
              <p v-if="form.poNumber !== original.poNumber" class="text-[11px] text-amber-400">⚠ Original: <strong>{{ original.poNumber }}</strong></p>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                PO Date *
                <span class="text-gray-500 font-normal normal-case ml-1">(affects reporting periods)</span>
              </label>
              <input v-model="form.poDate" type="date" class="input-glass border-amber-500/40" />
              <p v-if="form.poDate !== original.poDate" class="text-[11px] text-amber-400">⚠ Original: <strong>{{ original.poDate }}</strong></p>
            </div>
          </div>
        </div>

        <!-- Supplier & Product -->
        <div class="glass-card p-5 space-y-4">
          <h3 class="section-title">Supplier &amp; Product</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Commodity <span class="text-gray-600 font-normal normal-case ml-1">(fixed at creation)</span>
              </label>
              <div class="input-glass opacity-70 cursor-not-allowed">{{ original.commodityName }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier *</label>
              <UiSearchSelect v-model="form.supplierId" :options="supplierOptions" placeholder="Search supplier…" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin *</label>
              <select v-if="originOptions.length" v-model="form.origin" class="input-glass">
                <option value="">Select origin</option>
                <option v-for="o in originOptions" :key="o" :value="o">{{ o }}</option>
              </select>
              <input v-else v-model="form.origin" class="input-glass" placeholder="Optional" />
            </div>
          </div>
        </div>

        <!-- Pricing & Quantity -->
        <div class="glass-card p-5 space-y-4">
          <h3 class="section-title">Pricing &amp; Quantity</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity ({{ unitLabel }}) *</label>
              <input v-model.number="form.qty" type="number" step="any" min="0.001" class="input-glass font-mono" placeholder="0.00" />
              <p class="text-[11px] text-gray-600">Original: <strong>{{ Number(original.qty).toLocaleString() }} {{ unitLabel }}</strong></p>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price (৳/{{ unitLabel }}) *</label>
              <input v-model.number="form.unitPrice" type="number" step="any" min="0.0001" class="input-glass font-mono" placeholder="0.00" />
              <p class="text-[11px] text-gray-600">Original: <strong>৳{{ fmtPrice(original.unitPrice) }}/{{ unitLabel }}</strong></p>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Delivery</label>
              <input v-model="form.expectedDelivery" type="date" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Order Value</label>
              <div class="input-glass flex items-center justify-between cursor-default"
                   style="background:rgba(245,158,11,0.06);border-color:rgba(245,158,11,0.2)">
                <span class="text-xs text-gray-500">Qty × Unit Price</span>
                <span class="font-bold text-gold-400 font-mono text-base">৳{{ totalValue.toLocaleString() }}</span>
              </div>
              <p v-if="totalChanged" class="text-[11px] text-indigo-400">Was: ৳{{ (original.qty * original.unitPrice).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- Remarks -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="section-title">Remarks / Notes</h3>
          <textarea v-model="form.remarks" rows="3" class="input-glass resize-none" placeholder="Special instructions, terms, quality requirements…" />
        </div>

        <!-- Delivery Lock -->
        <div class="glass-card p-5 space-y-4" :style="original.isLocked ? 'border-color:rgba(239,68,68,0.25)' : 'border-color:rgba(16,185,129,0.15)'">
          <h3 class="section-title flex items-center gap-2">
            <span>{{ original.isLocked ? '🔒' : '🔓' }}</span> Delivery Lock Control
          </h3>
          <div v-if="original.isLocked"
               class="rounded-xl p-3 flex items-start gap-3"
               style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2)">
            <span class="text-red-400 text-lg shrink-0">🔒</span>
            <div class="text-xs">
              <p class="font-bold text-red-400">Delivery is currently LOCKED — no further GRNs can be recorded.</p>
              <p v-if="original.lockReason" class="text-gray-500 mt-0.5">Reason: {{ original.lockReason }}</p>
              <p class="text-gray-600 mt-0.5">Locked by {{ original.lockedBy }} on {{ original.lockedAt }}</p>
            </div>
          </div>
          <div v-else class="rounded-xl p-3 flex items-center gap-3"
               style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15)">
            <span class="text-emerald-400 text-lg">🔓</span>
            <p class="text-xs text-emerald-400 font-medium">Delivery is currently OPEN — GRNs can be recorded normally.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Change Lock Status</label>
              <select v-model="lockAction" class="input-glass">
                <option value="">— No change —</option>
                <option v-if="!original.isLocked" value="lock">🔒 Lock delivery (prevent further GRNs)</option>
                <option v-if="original.isLocked"  value="unlock">🔓 Re-open delivery (allow GRNs again)</option>
              </select>
              <p class="text-[11px] text-gray-600">Locking stops ALL further GRNs regardless of quantity received.</p>
            </div>
            <Transition name="slide-down">
              <div v-if="lockAction" class="space-y-1.5">
                <label class="text-xs font-semibold text-red-400 uppercase tracking-wider">Reason * (required)</label>
                <textarea v-model="lockReason" rows="3" class="input-glass resize-none"
                          style="border-color:rgba(239,68,68,0.35)"
                          placeholder="Mandatory: explain why you are locking / re-opening this PO…" />
              </div>
            </Transition>
          </div>
        </div>

        <!-- Submit row -->
        <div class="flex items-center justify-between pt-2">
          <NuxtLink :to="`/purchase/orders/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
          <button @click="openConfirm" :disabled="!hasChanges" class="btn-gold disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Update Purchase Order
            <span v-if="changes.length > 0" class="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{{ changes.length }}</span>
          </button>
        </div>
      </div>

      <!-- Confirm modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="confirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 class="section-title">Confirm PO Update</h3>
              <p class="text-sm text-gray-400">
                The following <strong class="text-gold-400">{{ changes.length }} change{{ changes.length > 1 ? 's' : '' }}</strong>
                will be saved and logged in the audit trail:
              </p>
              <div class="rounded-xl p-3 space-y-1.5 max-h-48 overflow-y-auto"
                   style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
                <div v-for="c in changes" :key="c.key" class="text-xs flex gap-2">
                  <span class="text-indigo-500 shrink-0">→</span>
                  <span class="text-gray-400">
                    <strong class="text-gray-300">{{ c.label }}:</strong>
                    <span class="line-through text-gray-600 ml-1">{{ c.old }}</span>
                    <span class="text-indigo-300 ml-1">{{ c.new }}</span>
                  </span>
                </div>
              </div>
              <p class="text-[11px] text-gray-600">All changes are permanent and audited. Please verify before confirming.</p>
              <div class="flex gap-3">
                <button @click="confirmModal = false" class="btn-ghost flex-1">Go Back</button>
                <button @click="submit" :disabled="saving" class="btn-gold flex-1 justify-center disabled:opacity-60">
                  <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
                  {{ saving ? 'Saving…' : 'Confirm Update' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()

const poId = Number(route.params.id)

// Load real PO + real suppliers in parallel
const [{ data: poData, pending, error: fetchError }, { data: supData }] = await Promise.all([
  useFetch(() => `/api/purchase/orders/${poId}`),
  useFetch('/api/suppliers', { query: { per: 200 } }),
])

const suppliers = computed(() => (supData.value?.suppliers ?? []) as any[])
const supplierOptions = computed(() => suppliers.value.map((s: any) => ({
  value: s.id, label: s.company_name,
})))

const po    = computed(() => (poData.value?.po ?? {}) as any)
const poNo  = computed(() => po.value.po_number ?? `PO-${poId}`)

// Commodity catalog — used only to resolve this PO's (immutable) commodity's
// origin list; the commodity itself can't change post-creation.
const { data: commData } = await useFetch('/api/purchase/commodities')
const originOptions = computed(() => {
  const c = (commData.value?.commodities ?? []).find((c: any) => c.id === po.value.commodity_id)
  return c?.origins ?? []
})

// MT-quoted commodities (wheat) store/receive in KG; every other commodity
// stores 1:1 in its own catalog unit.
const unitLabel = computed(() => {
  const u = po.value.commodity_unit
  return (!u || u === 'MT') ? 'KG' : u
})

// Build original snapshot once PO loads
const original = computed(() => ({
  poNumber:         po.value.po_number        ?? '',
  poDate:           po.value.po_date          ? String(po.value.po_date).slice(0, 10) : '',
  supplierId:       po.value.supplier_id      ? String(po.value.supplier_id) : '',
  supplier:         po.value.supplier_name    ?? po.value.company_name ?? '',
  origin:           po.value.wheat_origin     ?? '',
  commodityName:    po.value.commodity_name   ?? 'Wheat',
  qty:              Number(po.value.quantity_kg  ?? 0),
  unitPrice:        Number(po.value.unit_price_per_kg ?? 0),
  expectedDelivery: po.value.expected_delivery_date ? String(po.value.expected_delivery_date).slice(0, 10) : '',
  remarks:          po.value.remarks          ?? '',
  isLocked:         Boolean(po.value.is_delivery_locked),
  lockReason:       po.value.delivery_lock_reason ?? '',
  lockedBy:         po.value.locked_by_name   ?? '',
  lockedAt:         po.value.delivery_locked_at ? String(po.value.delivery_locked_at).slice(0, 10) : '',
}))

// Editable form — seeded from original when it loads
const form = reactive({
  poNumber: '', poDate: '', supplierId: '', origin: '',
  qty: 0, unitPrice: 0, expectedDelivery: '', remarks: '',
})

watch(original, (o) => {
  Object.assign(form, {
    poNumber: o.poNumber, poDate: o.poDate,
    supplierId: o.supplierId, origin: o.origin,
    qty: o.qty, unitPrice: o.unitPrice,
    expectedDelivery: o.expectedDelivery, remarks: o.remarks,
  })
}, { immediate: true })

const lockAction = ref('')
const lockReason = ref('')

const totalValue   = computed(() => Math.round((form.qty || 0) * (form.unitPrice || 0)))
const totalChanged = computed(() =>
  Math.abs(totalValue.value - original.value.qty * original.value.unitPrice) > 0.5
)

function fmtPrice(val: number) {
  return val.toFixed(10).replace(/0+$/, '').replace(/\.$/, '.0')
}

const changes = computed(() => {
  const o    = original.value
  const list: { key: string; label: string; old: string; new: string }[] = []

  if (form.poNumber !== o.poNumber)
    list.push({ key: 'poNumber', label: 'PO Number', old: o.poNumber, new: form.poNumber })
  if (form.poDate !== o.poDate)
    list.push({ key: 'poDate', label: 'PO Date', old: o.poDate, new: form.poDate })
  if (form.supplierId !== o.supplierId) {
    const newSup = suppliers.value.find((s: any) => String(s.id) === form.supplierId)?.company_name ?? form.supplierId
    list.push({ key: 'supplier', label: 'Supplier', old: o.supplier, new: newSup })
  }
  if (form.origin !== o.origin)
    list.push({ key: 'origin', label: 'Origin', old: o.origin, new: form.origin })
  if (Math.abs((form.qty || 0) - o.qty) > 0.001)
    list.push({ key: 'qty', label: 'Quantity', old: `${Number(o.qty).toLocaleString()} ${unitLabel.value}`, new: `${Number(form.qty || 0).toLocaleString()} ${unitLabel.value}` })
  if (Math.abs((form.unitPrice || 0) - o.unitPrice) > 1e-9)
    list.push({ key: 'unitPrice', label: 'Unit Price', old: `৳${fmtPrice(o.unitPrice)}/${unitLabel.value}`, new: `৳${fmtPrice(form.unitPrice || 0)}/${unitLabel.value}` })
  if (totalChanged.value)
    list.push({ key: 'total', label: 'Total Value', old: `৳${(o.qty * o.unitPrice).toLocaleString()}`, new: `৳${totalValue.value.toLocaleString()}` })
  if (form.expectedDelivery !== o.expectedDelivery)
    list.push({ key: 'delivery', label: 'Expected Delivery', old: o.expectedDelivery || 'Not set', new: form.expectedDelivery || 'Not set' })
  if (form.remarks !== o.remarks)
    list.push({ key: 'remarks', label: 'Remarks', old: o.remarks || '—', new: form.remarks || '—' })
  if (lockAction.value === 'lock')
    list.push({ key: 'lock', label: 'Delivery Lock', old: 'Open', new: '🔒 Locked' })
  if (lockAction.value === 'unlock')
    list.push({ key: 'lock', label: 'Delivery Lock', old: '🔒 Locked', new: 'Open' })

  return list
})

const hasChanges = computed(() => changes.value.length > 0)

function validate(): string | null {
  if (!form.poNumber.trim()) return 'PO Number is required'
  if (!form.poDate)          return 'PO Date is required'
  if (!form.supplierId)      return 'Supplier is required'
  if (!form.origin)          return 'Origin is required'
  if ((form.qty || 0) <= 0)       return 'Quantity must be greater than zero'
  if ((form.unitPrice || 0) <= 0) return 'Unit price must be greater than zero'
  if (lockAction.value && !lockReason.value.trim()) return 'A reason is required when changing delivery lock status'
  return null
}

const confirmModal = ref(false)
const saving       = ref(false)

function openConfirm() {
  const err = validate()
  if (err) { toastError(err); return }
  confirmModal.value = true
}

async function submit() {
  saving.value = true
  try {
    await $fetch(`/api/purchase/orders/${poId}`, {
      method: 'PATCH',
      body: {
        po_number:              form.poNumber,
        po_date:                form.poDate,
        supplier_id:            form.supplierId ? Number(form.supplierId) : undefined,
        wheat_origin:           form.origin,
        quantity_kg:            form.qty,
        unit_price_per_kg:      form.unitPrice,
        expected_delivery_date: form.expectedDelivery || null,
        remarks:                form.remarks || null,
        lock_action:            lockAction.value || null,
        lock_reason:            lockReason.value || null,
      },
    })
    confirmModal.value = false
    success(`${changes.value.length} change(s) saved to ${poNo.value}`)
    navigateTo(`/purchase/orders/${poId}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update purchase order')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
