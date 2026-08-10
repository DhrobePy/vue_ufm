<template>
  <div class="space-y-6">
    <UiPageHeader title="Production Floor" subtitle="Live production queue · batch tracking · shift output"
                  :breadcrumb="['Production']">
      <template #actions>
        <NuxtLink to="/production/requirement" class="btn-ghost text-xs">📋 Today's Requirement</NuxtLink>
        <NuxtLink to="/production/totals" class="btn-ghost text-xs">📊 Production Totals</NuxtLink>
        <NuxtLink to="/production/create" class="btn-gold text-xs">+ New Batch</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Active Batches"   :value="String(activeBatches.filter(b => b.status === 'running').length)"
               trend="Running now" trend-up icon="factory" color="blue" />
      <KpiCard label="Today's Output"   :value="todayOutputMT + ' MT'"
               trend="vs 12.1MT target" trend-up icon="chart" color="teal" />
      <KpiCard label="Pending Orders"   :value="String(pendingQueue.length)"
               trend="Awaiting production" :trend-up="false" icon="list" color="orange" />
      <KpiCard label="Shift Completion" :value="shiftPct + '%'"
               trend="On track" trend-up icon="check" color="gold" />
    </div>

    <!-- ── Active batches ───────────────────────────────── -->
    <div class="glass-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title">Active Batches</h2>
        <span class="text-xs text-gray-600">Tap a row to open batch detail</span>
      </div>

      <div v-if="activeBatches.length === 0" class="text-xs text-gray-600 text-center py-8">
        No active batches. <NuxtLink to="/production/create" class="text-gold-400 underline">Start one →</NuxtLink>
      </div>

      <div class="space-y-3">
        <div v-for="batch in activeBatches" :key="batch.id"
             @click="navigateTo(`/production/${batch.id}`)"
             class="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
             :class="batch.status === 'paused' ? 'opacity-60' : ''">

          <!-- Status dot -->
          <div class="shrink-0">
            <div class="w-2.5 h-2.5 rounded-full"
                 :class="batch.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'" />
          </div>

          <!-- Meta grid -->
          <div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Batch #</p>
              <p class="text-sm font-mono font-semibold text-gold-400">{{ batch.id }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Product</p>
              <p class="text-sm font-medium text-gray-200 truncate">{{ batch.product }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Order</p>
              <p class="text-sm font-mono text-gray-400">{{ batch.orderId }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Target</p>
              <p class="text-sm text-gray-300">{{ batch.targetBags }} bags</p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="w-28 shrink-0 space-y-1">
            <div class="flex justify-between text-[10px]">
              <span class="text-gray-600">Progress</span>
              <span class="text-gray-400">{{ batch.doneBags }}/{{ batch.targetBags }}</span>
            </div>
            <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :class="pct(batch) >= 100 ? 'bg-emerald-500' : 'bg-gold-500/70'"
                   :style="`width:${Math.min(pct(batch),100)}%`" />
            </div>
            <p class="text-[10px] text-right"
               :class="pct(batch) >= 80 ? 'text-emerald-400' : 'text-gray-600'">
              {{ pct(batch) }}%
            </p>
          </div>

          <!-- Actions (stop propagation so row click doesn't fire) -->
          <div class="flex gap-2 shrink-0" @click.stop>
            <button v-if="batch.status === 'running'"
                    @click="openUpdate(batch)"
                    class="btn-ghost text-xs py-1 px-2.5">📝 Update</button>
            <button v-if="batch.status === 'paused'"
                    @click="resumeBatch(batch)"
                    class="btn-ghost text-xs py-1 px-2.5 text-yellow-400">▶ Resume</button>
            <button @click="openReady(batch)"
                    class="btn-gold text-xs py-1 px-2.5">✓ Ready</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Pending queue ────────────────────────────────── -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Pending Production Queue</h2>
      <UiDataTable :columns="queueCols" :rows="pendingQueue" :per-page="10" search-placeholder="Search orders…">
        <template #cell-orderNo="{ value }">
          <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
        <template #cell-weight="{ value }">
          <span class="text-xs text-gray-400">{{ value }} MT</span>
        </template>
        <template #cell-priority="{ value }">
          <span class="text-xs font-medium" :class="value === 'High' ? 'text-red-400' : value === 'Normal' ? 'text-gray-400' : 'text-gray-600'">
            {{ value }}
          </span>
        </template>
        <template #actions="{ row }">
          <button class="btn-gold text-xs py-1 px-2.5" @click.stop="openStart(row)">▶ Start</button>
        </template>
      </UiDataTable>
    </div>

    <!-- ── Completed today ──────────────────────────────── -->
    <div v-if="completedToday.length" class="glass-card p-5">
      <h2 class="section-title mb-4">Completed Today</h2>
      <div class="space-y-2">
        <div v-for="batch in completedToday" :key="batch.id"
             @click="navigateTo(`/production/${batch.id}`)"
             class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="text-emerald-400 text-sm">✓</span>
            <div>
              <p class="text-xs font-mono text-gold-400/80">{{ batch.id }}</p>
              <p class="text-[11px] text-gray-500">{{ batch.product }} · {{ batch.doneBags }} / {{ batch.targetBags }} bags</p>
            </div>
          </div>
          <div class="text-right">
            <UiStatusBadge status="completed" />
            <p class="text-[10px] text-gray-600 mt-1">{{ batch.completedAt }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════ UPDATE PROGRESS MODAL ══════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="updateModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="updateModal.open = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-sm font-semibold text-gray-200">Update Progress</h3>
                <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ updateModal.batch?.id }} · {{ updateModal.batch?.product }}</p>
              </div>
              <button @click="updateModal.open = false" class="text-gray-600 hover:text-gray-300 text-lg leading-none">✕</button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="field-label">Bags Completed</label>
                <input v-model.number="updateModal.doneBags" type="number"
                       :min="updateModal.batch?.doneBags || 0"
                       :max="updateModal.batch?.targetBags || 9999"
                       class="field-input w-full" placeholder="e.g. 160" />
                <p class="text-[10px] text-gray-600 mt-1">
                  Current: {{ updateModal.batch?.doneBags }} / {{ updateModal.batch?.targetBags }} bags
                  ({{ pct(updateModal.batch) }}%)
                </p>
              </div>
              <div>
                <label class="field-label">Note (optional)</label>
                <input v-model="updateModal.note" type="text" class="field-input w-full"
                       placeholder="e.g. Shift change handover" />
              </div>

              <!-- mini progress preview -->
              <div class="space-y-1">
                <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div class="h-full rounded-full bg-gold-500/70 transition-all duration-300"
                       :style="`width:${Math.min(Math.round((updateModal.doneBags/(updateModal.batch?.targetBags||1))*100),100)}%`" />
                </div>
                <p class="text-[10px] text-right text-gray-500">
                  {{ Math.min(Math.round((updateModal.doneBags/(updateModal.batch?.targetBags||1))*100),100) }}% after update
                </p>
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <button @click="updateModal.open = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="submitUpdate" class="btn-gold text-xs flex-1 justify-center"
                      :disabled="updateModal.doneBags <= (updateModal.batch?.doneBags || 0)">
                Save Update
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════ MARK READY MODAL ══════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="readyModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="readyModal.open = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <h3 class="text-sm font-semibold text-gray-200">Mark Batch as Complete?</h3>
            <div class="rounded-xl p-3 space-y-1 text-xs" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15)">
              <p class="text-gray-400">Batch: <span class="text-gray-200 font-mono">{{ readyModal.batch?.id }}</span></p>
              <p class="text-gray-400">Product: <span class="text-gray-200">{{ readyModal.batch?.product }}</span></p>
              <p class="text-gray-400">Output: <span class="text-gray-200 font-semibold">{{ readyModal.batch?.doneBags }} / {{ readyModal.batch?.targetBags }} bags</span></p>
            </div>
            <div>
              <label class="field-label">Final bag count</label>
              <input v-model.number="readyModal.finalBags" type="number"
                     :min="0" :max="readyModal.batch?.targetBags || 9999"
                     class="field-input w-full" />
            </div>
            <div class="flex gap-2">
              <button @click="readyModal.open = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="completeBatch" class="btn-gold text-xs flex-1 justify-center bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30">
                ✓ Mark Complete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════ START BATCH MODAL ══════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="startModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="startModal.open = false">
          <div class="glass-card p-6 w-full max-w-md space-y-4" @click.stop>
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-sm font-semibold text-gray-200">Start Production</h3>
                <p class="text-xs text-gray-500 mt-0.5">
                  Order <span class="font-mono text-gold-400/80">{{ startModal.row?.orderNo }}</span>
                  — {{ startModal.row?.product }}
                </p>
              </div>
              <button @click="startModal.open = false" class="text-gray-600 hover:text-gray-300 text-lg leading-none">✕</button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Machine / Mill</label>
                <select v-model="startForm.machine" class="field-input w-full">
                  <option value="">Select…</option>
                  <option v-for="m in machines" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div>
                <label class="field-label">Shift</label>
                <select v-model="startForm.shift" class="field-input w-full">
                  <option value="">Select…</option>
                  <option>Morning (6AM–2PM)</option>
                  <option>Evening (2PM–10PM)</option>
                  <option>Night (10PM–6AM)</option>
                </select>
              </div>
              <div>
                <label class="field-label">Operator</label>
                <input v-model="startForm.operator" type="text" class="field-input w-full" placeholder="Operator name" />
              </div>
              <div>
                <label class="field-label">Target Bags</label>
                <input v-model.number="startForm.targetBags" type="number" class="field-input w-full"
                       :placeholder="`${startModal.row?.defaultBags || 200}`" />
              </div>
              <div class="col-span-2">
                <label class="field-label">Raw Material Source</label>
                <select v-model="startForm.rawMaterial" class="field-input w-full">
                  <option value="">Select silo / source…</option>
                  <option v-for="s in silos" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="field-label">Notes (optional)</label>
                <input v-model="startForm.notes" type="text" class="field-input w-full"
                       placeholder="Any special instructions…" />
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <button @click="startModal.open = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="submitStart"
                      :disabled="!startForm.machine || !startForm.shift || !startForm.operator"
                      class="btn-gold text-xs flex-1 justify-center">
                ▶ Start Batch
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, info, error: toastError } = useToast()

// ── Types ────────────────────────────────────────────────
interface Batch {
  id: string
  dbId: number
  product: string
  orderId: string
  customer: string
  targetBags: number
  doneBags: number
  status: 'running' | 'paused' | 'completed'
  shift: string
  machine: string
  operator: string
  completedAt?: string
}

interface QueueRow {
  id: number
  orderNo: string
  customer: string
  product: string
  weight: string
  reqDate: string
  priority: string
  status: string
  defaultBags: number
}

// ── API data ─────────────────────────────────────────────
const { data: apiData, refresh: refreshApi } = await useFetch('/api/production')

function parseNotes(notes: string | null | undefined) {
  const parts: Record<string, string> = {}
  for (const part of (notes ?? '').split('|')) {
    const sep = part.indexOf(':')
    if (sep > 0) parts[part.slice(0, sep).trim()] = part.slice(sep + 1).trim()
  }
  return parts
}

function scheduleTooBatch(s: any): Batch {
  const kg = Number(s.total_weight_kg ?? 0)
  const notes = parseNotes(s.notes)
  return {
    id:         `PS-${s.id}`,
    dbId:       s.id,
    product:    notes['Product'] ?? s.order_number ?? '—',
    orderId:    s.order_number ?? '—',
    customer:   s.customer_name ?? '—',
    targetBags: Number(s.target_bags) || (kg > 0 ? Math.round(kg / 50) : 200),
    doneBags:   Number(s.bags_completed) || 0,
    status:     s.status === 'in_progress' ? 'running' : s.status === 'completed' ? 'completed' : 'paused',
    shift:      notes['Shift'] ?? '—',
    machine:    notes['Machine'] ?? '—',
    operator:   notes['Operator'] ?? s.manager_name ?? '—',
  }
}

function pendingToQueueRow(o: any): QueueRow {
  const kg = Number(o.total_weight_kg ?? 0)
  return {
    id:          o.id,
    orderNo:     o.order_number ?? '—',
    customer:    o.customer_name ?? '—',
    product:     '—',
    weight:      kg > 0 ? (kg / 1000).toFixed(1) : '—',
    reqDate:     o.required_date ?? '—',
    priority:    o.priority ?? 'normal',
    status:      'approved',
    defaultBags: kg > 0 ? Math.round(kg / 50) : 200,
  }
}

// ── Reactive data (seeded from API, mutations work in-place) ─
const activeBatches = ref<Batch[]>(
  (apiData.value?.schedule ?? []).map(scheduleTooBatch),
)

const completedToday = ref<Batch[]>([])

// ── KPI computed ─────────────────────────────────────────
const todayOutputMT = computed(() => {
  const bags = completedToday.value.reduce((s, b) => s + b.doneBags, 0)
  // rough 50kg avg bag weight
  return (bags * 50 / 1000).toFixed(1)
})
const shiftPct = computed(() => {
  const all = activeBatches.value
  if (!all.length) return '0'
  const total = all.reduce((s, b) => s + b.targetBags, 0)
  const done  = all.reduce((s, b) => s + b.doneBags, 0)
  return Math.round((done / total) * 100)
})

// ── Pending queue ─────────────────────────────────────────
const queueCols = [
  { key: 'orderNo',  label: 'Order #',  sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'product',  label: 'Product',  sortable: true },
  { key: 'weight',   label: 'Weight' },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'reqDate',  label: 'Required', sortable: true },
  { key: 'status',   label: 'Status' },
]

const pendingQueue = ref<QueueRow[]>(
  (apiData.value?.pendingOrders ?? []).map(pendingToQueueRow),
)

// ── Helpers ───────────────────────────────────────────────
function pct(batch: Batch | null | undefined) {
  if (!batch) return 0
  return Math.round((batch.doneBags / batch.targetBags) * 100)
}

const machines = ['Mill-1', 'Mill-2', 'Mill-3', 'Pack-1', 'Pack-2', 'Pack-3']
const silos    = ['Hard Wheat — Silo A', 'Hard Wheat — Silo B', 'Soft Wheat — Silo C', 'Local Wheat — Store 1']

// ── Update modal ──────────────────────────────────────────
const updateModal = reactive({
  open: false,
  batch: null as Batch | null,
  doneBags: 0,
  note: '',
})
function openUpdate(batch: Batch) {
  updateModal.batch    = batch
  updateModal.doneBags = batch.doneBags
  updateModal.note     = ''
  updateModal.open     = true
}
async function submitUpdate() {
  if (!updateModal.batch) return
  const batch = updateModal.batch
  try {
    await $fetch(`/api/production/${batch.id}`, {
      method: 'PATCH',
      body: { bags_completed: updateModal.doneBags, notes: updateModal.note || undefined },
    })
    batch.doneBags = updateModal.doneBags
    updateModal.open = false
    success(`Batch ${batch.id} updated — ${updateModal.doneBags} bags done`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update batch')
  }
}

// ── Ready / Complete modal ────────────────────────────────
const readyModal = reactive({
  open: false,
  batch: null as Batch | null,
  finalBags: 0,
})
function openReady(batch: Batch) {
  readyModal.batch     = batch
  readyModal.finalBags = batch.doneBags
  readyModal.open      = true
}
async function completeBatch() {
  if (!readyModal.batch) return
  const batch = readyModal.batch
  try {
    const res: any = await $fetch(`/api/production/${batch.id}`, {
      method: 'PATCH',
      body: { status: 'completed', bags_completed: readyModal.finalBags },
    })
    batch.doneBags  = readyModal.finalBags
    batch.status    = 'completed'
    batch.completedAt = new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })
    // move to completed list
    const idx = activeBatches.value.indexOf(batch)
    if (idx !== -1) completedToday.value.unshift(activeBatches.value.splice(idx, 1)[0])
    readyModal.open = false
    success(`Batch ${batch.id} marked complete ✓${res?.orderAdvanced ? ' — order moved to Ready to Ship' : ''}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to complete batch')
  }
}

// ── Resume paused batch ───────────────────────────────────
async function resumeBatch(batch: Batch) {
  try {
    await $fetch(`/api/production/${batch.id}`, { method: 'PATCH', body: { status: 'running' } })
    batch.status = 'running'
    info(`Batch ${batch.id} resumed`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to resume batch')
  }
}

// ── Start modal ───────────────────────────────────────────
const startModal = reactive({
  open: false,
  row: null as QueueRow | null,
})
const startForm = reactive({
  machine: '',
  shift: '',
  operator: '',
  targetBags: 0,
  rawMaterial: '',
  notes: '',
})
function openStart(row: QueueRow) {
  startModal.row      = row
  startForm.machine   = ''
  startForm.shift     = ''
  startForm.operator  = ''
  startForm.targetBags = row.defaultBags
  startForm.rawMaterial = ''
  startForm.notes     = ''
  startModal.open     = true
}
async function submitStart() {
  if (!startModal.row) return
  const row = startModal.row
  const notesStr = [
    `Machine: ${startForm.machine}`,
    `Shift: ${startForm.shift}`,
    `Operator: ${startForm.operator}`,
    startForm.rawMaterial ? `Raw Material: ${startForm.rawMaterial}` : '',
    startForm.notes ? `Notes: ${startForm.notes}` : '',
  ].filter(Boolean).join(' | ')

  try {
    const res: any = await $fetch('/api/production', {
      method: 'POST',
      body: {
        order_id: row.id,
        scheduled_date: new Date().toISOString().slice(0, 10),
        notes: notesStr,
        target_bags: startForm.targetBags || row.defaultBags,
        start_immediately: true,
      },
    })
    activeBatches.value.push({
      id: `PS-${res.id}`,
      dbId: res.id,
      product: row.product,
      orderId: row.orderNo,
      customer: row.customer,
      targetBags: startForm.targetBags || row.defaultBags,
      doneBags: 0,
      status: 'running',
      shift: startForm.shift,
      machine: startForm.machine,
      operator: startForm.operator,
    })
    // remove from pending
    const idx = pendingQueue.value.findIndex(r => r.id === row.id)
    if (idx !== -1) pendingQueue.value.splice(idx, 1)
    startModal.open = false
    success(`Batch PS-${res.id} started for ${row.orderNo} ▶`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to start batch')
  }
}
</script>
