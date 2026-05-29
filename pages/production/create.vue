<template>
  <div class="space-y-6">
    <UiPageHeader title="New Production Batch" subtitle="Assign a pending sales order to a machine and shift"
                  :breadcrumb="['Production', 'New Batch']">
      <template #actions>
        <NuxtLink to="/production" class="btn-ghost text-xs">← Production</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Main form -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Step 1: Select order -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                 style="background:linear-gradient(135deg,#f59e0b,#d97706)">1</div>
            <h3 class="text-sm font-semibold text-gray-200">Select Sales Order</h3>
          </div>

          <!-- Search / filter -->
          <div class="flex gap-2">
            <input v-model="orderSearch" type="text" class="field-input flex-1"
                   placeholder="Search by order #, customer, product…" />
            <select v-model="priorityFilter" class="field-input w-36">
              <option value="">All Priority</option>
              <option>High</option>
              <option>Normal</option>
              <option>Low</option>
            </select>
          </div>

          <!-- Order list -->
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="order in filteredOrders" :key="order.id"
                 @click="selectOrder(order)"
                 class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all text-xs"
                 :class="selectedOrder?.id === order.id
                   ? 'border-gold-500/50 bg-gold-500/[0.08]'
                   : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'">
              <div class="flex items-center gap-3">
                <div class="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                     :class="selectedOrder?.id === order.id ? 'border-gold-400 bg-gold-400' : 'border-gray-600'">
                  <div v-if="selectedOrder?.id === order.id" class="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
                <div>
                  <p class="font-mono text-gold-400/80">{{ order.orderNo }}</p>
                  <p class="text-gray-500 mt-0.5">{{ order.customer }} · {{ order.product }}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="font-semibold" :class="order.priority === 'High' ? 'text-red-400' : order.priority === 'Normal' ? 'text-gray-400' : 'text-gray-600'">
                  {{ order.priority }}
                </span>
                <p class="text-gray-600 mt-0.5">Due {{ order.reqDate }}</p>
              </div>
            </div>
            <div v-if="filteredOrders.length === 0" class="text-center text-xs text-gray-600 py-6">
              No pending orders match your search.
            </div>
          </div>

          <!-- Selected order summary -->
          <div v-if="selectedOrder" class="rounded-xl p-3 text-xs space-y-1"
               style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.15)">
            <p class="text-gold-400 font-semibold text-[11px] uppercase tracking-wider">Selected Order</p>
            <p class="text-gray-300"><span class="text-gray-600">Order:</span> {{ selectedOrder.orderNo }}</p>
            <p class="text-gray-300"><span class="text-gray-600">Customer:</span> {{ selectedOrder.customer }}</p>
            <p class="text-gray-300"><span class="text-gray-600">Product:</span> {{ selectedOrder.product }}</p>
            <p class="text-gray-300"><span class="text-gray-600">Weight:</span> {{ selectedOrder.weight }} MT</p>
          </div>
        </div>

        <!-- Step 2: Batch setup -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                 :style="selectedOrder ? 'background:linear-gradient(135deg,#f59e0b,#d97706)' : 'background:#374151'"
                 :class="selectedOrder ? '' : 'opacity-50'">2</div>
            <h3 class="text-sm font-semibold" :class="selectedOrder ? 'text-gray-200' : 'text-gray-600'">
              Batch Configuration
            </h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" :class="!selectedOrder ? 'opacity-40 pointer-events-none' : ''">
            <div>
              <label class="field-label">Machine / Mill <span class="text-red-400">*</span></label>
              <select v-model="form.machine" class="field-input w-full">
                <option value="">Select machine…</option>
                <option v-for="m in machines" :key="m.id" :value="m.id">
                  {{ m.name }} — {{ m.status }}
                </option>
              </select>
            </div>
            <div>
              <label class="field-label">Shift <span class="text-red-400">*</span></label>
              <select v-model="form.shift" class="field-input w-full">
                <option value="">Select shift…</option>
                <option v-for="s in shifts" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">Operator <span class="text-red-400">*</span></label>
              <input v-model="form.operator" type="text" class="field-input w-full"
                     placeholder="Operator full name" />
            </div>
            <div>
              <label class="field-label">Target Bags <span class="text-red-400">*</span></label>
              <input v-model.number="form.targetBags" type="number" min="1" class="field-input w-full"
                     placeholder="e.g. 200" />
              <p v-if="form.targetBags && selectedOrder" class="text-[10px] text-gray-600 mt-1">
                ≈ {{ ((form.targetBags * bagWeight) / 1000).toFixed(2) }} MT output
              </p>
            </div>
            <div>
              <label class="field-label">Bag Weight (kg) <span class="text-red-400">*</span></label>
              <select v-model.number="form.bagWeight" class="field-input w-full">
                <option :value="37">37 kg</option>
                <option :value="50">50 kg</option>
                <option :value="74">74 kg</option>
              </select>
            </div>
            <div>
              <label class="field-label">Raw Material Source <span class="text-red-400">*</span></label>
              <select v-model="form.rawMaterial" class="field-input w-full">
                <option value="">Select silo / source…</option>
                <option v-for="s in silos" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">Scheduled Date *</label>
              <input v-model="form.scheduledDate" type="date" class="field-input w-full" />
            </div>
            <div>
              <label class="field-label">Scheduled Start Time</label>
              <input v-model="form.startTime" type="time" class="field-input w-full" />
            </div>
            <div class="sm:col-span-2">
              <label class="field-label">Instructions / Notes</label>
              <textarea v-model="form.notes" rows="2" class="field-input w-full resize-none"
                        placeholder="Any special instructions for this batch…" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right: summary + submit -->
      <div class="space-y-5">
        <!-- Summary card -->
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">Batch Preview</h3>

          <div v-if="!selectedOrder" class="text-xs text-gray-600 text-center py-4">
            Select an order to preview batch details
          </div>

          <div v-else class="space-y-3 text-xs">
            <div class="text-center p-3 rounded-xl" style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12)">
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">New Batch ID</p>
              <p class="font-mono font-bold text-gold-400 text-sm">BTH-{{ nextBatchNo }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Order</span>
                <span class="font-mono text-gray-300">{{ selectedOrder.orderNo }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Product</span>
                <span class="text-gray-300 text-right max-w-[60%]">{{ selectedOrder.product }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Target</span>
                <span class="text-gray-300">{{ form.targetBags || '—' }} bags</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Output</span>
                <span class="text-emerald-400 font-semibold">
                  {{ form.targetBags ? ((form.targetBags * form.bagWeight)/1000).toFixed(2) + ' MT' : '—' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Machine</span>
                <span class="text-gray-300">{{ form.machine || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Shift</span>
                <span class="text-gray-300 text-right max-w-[55%]">{{ form.shift || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Operator</span>
                <span class="text-gray-300">{{ form.operator || '—' }}</span>
              </div>
            </div>

            <!-- Validation messages -->
            <div v-if="validationMsg" class="text-[11px] text-red-400 p-2 rounded-lg"
                 style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.15)">
              {{ validationMsg }}
            </div>
          </div>
        </div>

        <!-- Machine availability -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Machine Status</h3>
          <div class="space-y-2">
            <div v-for="m in machines" :key="m.id"
                 class="flex items-center justify-between text-xs p-2 rounded-lg"
                 :class="m.status === 'Available' ? 'bg-emerald-500/[0.05]' : m.status === 'Busy' ? 'bg-red-500/[0.05]' : 'bg-yellow-500/[0.05]'">
              <span class="text-gray-300 font-medium">{{ m.name }}</span>
              <span class="font-semibold"
                    :class="m.status === 'Available' ? 'text-emerald-400' : m.status === 'Busy' ? 'text-red-400' : 'text-yellow-400'">
                {{ m.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button @click="submitBatch" :disabled="!canSubmit || saving"
                class="btn-gold text-xs w-full justify-center py-3">
          <span v-if="saving">Creating batch…</span>
          <span v-else>▶ Create & Start Batch</span>
        </button>
        <NuxtLink to="/production" class="btn-ghost text-xs w-full justify-center">Cancel</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

// ── Fetch real pending orders from API ────────────────────
const { data: prodData } = await useFetch('/api/production')
const apiPendingOrders = computed(() => (prodData.value as any)?.pendingOrders ?? [])

// Static reference data (machines not in DB — kept as UI helpers)
const machines = [
  { id: 'Mill-1', name: 'Mill-1', status: 'Available' },
  { id: 'Mill-2', name: 'Mill-2', status: 'Available' },
  { id: 'Mill-3', name: 'Mill-3', status: 'Maintenance' },
  { id: 'Pack-1', name: 'Pack-1', status: 'Busy' },
  { id: 'Pack-2', name: 'Pack-2', status: 'Available' },
  { id: 'Pack-3', name: 'Pack-3', status: 'Available' },
]
const shifts = [
  'Morning (6AM–2PM)',
  'Evening (2PM–10PM)',
  'Night (10PM–6AM)',
]
const silos = [
  'Hard Wheat — Silo A',
  'Hard Wheat — Silo B',
  'Soft Wheat — Silo C',
  'Local Wheat — Store 1',
]

// Map API orders to the shape expected by the template
const pendingOrders = computed(() =>
  apiPendingOrders.value.map((o: any) => ({
    id:       o.id,
    orderNo:  o.order_number,
    customer: o.customer_name,
    product:  '—',    // product detail not available without joining order_items
    weight:   String(Math.round((Number(o.total_weight_kg ?? 0) / 1000) * 10) / 10),
    reqDate:  o.required_date ?? o.order_date ?? '—',
    priority: o.priority ?? 'Normal',
  }))
)

// ── Reactive state ────────────────────────────────────────
const orderSearch    = ref('')
const priorityFilter = ref('')
const selectedOrder  = ref<any>(null)
const saving         = ref(false)
const nextBatchNo    = ref('0001')

const form = reactive({
  machine:       '',
  shift:         '',
  operator:      '',
  targetBags:    200,
  bagWeight:     50,
  rawMaterial:   '',
  scheduledDate: new Date().toISOString().slice(0, 10),
  startTime:     new Date().toTimeString().slice(0, 5),
  notes:         '',
})

// ── Computed ──────────────────────────────────────────────
const filteredOrders = computed(() =>
  pendingOrders.value.filter((o: any) => {
    const q = orderSearch.value.toLowerCase()
    const matchQ = !q || o.orderNo.toLowerCase().includes(q) ||
                   o.customer.toLowerCase().includes(q)
    const matchP = !priorityFilter.value || o.priority === priorityFilter.value
    return matchQ && matchP
  })
)

const bagWeight = computed(() => form.bagWeight)

const validationMsg = computed(() => {
  if (!selectedOrder.value)  return 'Select a sales order.'
  if (!form.machine)         return 'Select a machine.'
  if (!form.shift)           return 'Select a shift.'
  if (!form.operator.trim()) return 'Enter operator name.'
  if (!form.targetBags || form.targetBags < 1) return 'Enter target bag count.'
  return null
})

const canSubmit = computed(() => !validationMsg.value)

// ── Actions ───────────────────────────────────────────────
function selectOrder(order: any) {
  selectedOrder.value = order
  form.targetBags     = Math.ceil((parseFloat(order.weight) * 1000) / form.bagWeight)
}

async function submitBatch() {
  if (!canSubmit.value || !selectedOrder.value) return
  saving.value = true
  try {
    const notes = [
      form.machine     ? `Machine: ${form.machine}`       : '',
      form.shift       ? `Shift: ${form.shift}`           : '',
      form.operator    ? `Operator: ${form.operator}`     : '',
      form.rawMaterial ? `Source: ${form.rawMaterial}`    : '',
      form.notes       ? `Notes: ${form.notes}`           : '',
    ].filter(Boolean).join(' | ')

    await $fetch('/api/production', {
      method: 'POST',
      body: {
        order_id:       selectedOrder.value.id,
        scheduled_date: form.scheduledDate,
        priority_order: selectedOrder.value.priority === 'High' ? 1 : selectedOrder.value.priority === 'Normal' ? 2 : 3,
        notes:          notes || null,
      },
    })
    success(`Production batch scheduled for order ${selectedOrder.value.orderNo} ▶`)
    await navigateTo('/production')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to create batch')
  } finally {
    saving.value = false
  }
}
</script>
