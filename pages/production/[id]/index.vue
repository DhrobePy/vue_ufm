<template>
  <div class="space-y-6">
    <UiPageHeader :title="batch.id" :subtitle="`${batch.product} · ${batch.customer}`"
                  :breadcrumb="['Production', batch.id]">
      <template #actions>
        <UiStatusBadge :status="batch.status" />
        <button v-if="batch.status === 'running'" @click="pauseModal = true"
                class="btn-ghost text-xs text-yellow-400">⏸ Pause</button>
        <button v-if="batch.status === 'paused'"  @click="resumeBatch"
                class="btn-ghost text-xs text-emerald-400">▶ Resume</button>
        <button v-if="batch.status !== 'completed' && batch.status !== 'cancelled'"
                @click="completeModal = true" class="btn-gold text-xs">✓ Mark Complete</button>
        <NuxtLink to="/production" class="btn-ghost text-xs">← Production</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: main info -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Batch info card -->
        <div class="glass-card p-6 space-y-5">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Sales Order</p>
              <p class="font-mono text-gold-400/80">{{ batch.orderId }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Customer</p>
              <p class="text-gray-200">{{ batch.customer }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Shift</p>
              <p class="text-gray-300">{{ batch.shift }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Machine</p>
              <p class="text-gray-200 font-semibold">{{ batch.machine }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Operator</p>
              <p class="text-gray-200">{{ batch.operator }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Started</p>
              <p class="text-gray-300">{{ batch.startDate }} {{ batch.startTime }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Raw Material</p>
              <p class="text-gray-300">{{ batch.rawMaterial }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Bag Weight</p>
              <p class="text-gray-300">{{ batch.bagWeightKg }} kg</p>
            </div>
          </div>

          <!-- Big progress -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Output Progress</span>
              <span class="font-mono font-semibold text-gray-200">{{ batch.doneBags }} / {{ batch.targetBags }} bags</span>
            </div>
            <div class="h-3 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="completionPct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-gold-600 to-gold-400'"
                   :style="`width:${Math.min(completionPct,100)}%`" />
            </div>
            <div class="flex justify-between text-[11px]">
              <span :class="completionPct >= 80 ? 'text-emerald-400 font-semibold' : 'text-gray-500'">
                {{ completionPct }}% complete
              </span>
              <span class="text-gray-600">{{ batch.targetBags - batch.doneBags }} bags remaining</span>
            </div>
          </div>

          <!-- MT equivalent -->
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="rounded-xl p-3" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Ordered (MT)</p>
              <p class="text-lg font-bold font-mono text-gray-200">{{ orderedMT }}</p>
            </div>
            <div class="rounded-xl p-3" style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.12)">
              <p class="text-[10px] text-emerald-600 uppercase tracking-wider">Produced (MT)</p>
              <p class="text-lg font-bold font-mono text-emerald-400">{{ producedMT }}</p>
            </div>
            <div class="rounded-xl p-3" style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12)">
              <p class="text-[10px] text-yellow-600 uppercase tracking-wider">Remaining (MT)</p>
              <p class="text-lg font-bold font-mono text-yellow-400">{{ remainingMT }}</p>
            </div>
          </div>
        </div>

        <!-- Update log -->
        <div class="glass-card p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="section-title">Activity Log</h3>
            <button v-if="batch.status !== 'completed'" @click="logModal = true"
                    class="btn-ghost text-xs">+ Log Update</button>
          </div>
          <div class="space-y-2">
            <div v-for="(log, i) in batch.updates" :key="i"
                 class="flex gap-3 text-xs">
              <div class="flex flex-col items-center">
                <div class="w-2 h-2 rounded-full mt-0.5 shrink-0"
                     :class="log.type === 'start' ? 'bg-gold-400' : log.type === 'complete' ? 'bg-emerald-400' : log.type === 'pause' ? 'bg-yellow-400' : 'bg-blue-400'" />
                <div v-if="i < batch.updates.length - 1" class="w-px flex-1 bg-white/[0.06] mt-1 mb-0" />
              </div>
              <div class="pb-3 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-gray-300">{{ log.note }}</p>
                  <span class="text-gray-600 shrink-0">{{ log.time }}</span>
                </div>
                <p v-if="log.doneBags !== undefined" class="text-gray-600 mt-0.5">
                  Progress: {{ log.doneBags }} / {{ batch.targetBags }} bags ({{ Math.round(log.doneBags/batch.targetBags*100) }}%)
                </p>
                <p class="text-gray-600 mt-0.5">By: {{ log.by }}</p>
              </div>
            </div>
            <div v-if="batch.updates.length === 0" class="text-xs text-gray-600 text-center py-4">No activity logged yet.</div>
          </div>
        </div>

        <!-- Quality checks -->
        <div class="glass-card p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="section-title">Quality Checks</h3>
            <button @click="qcModal = true" class="btn-ghost text-xs">+ Add Check</button>
          </div>
          <div v-if="batch.qualityChecks.length === 0" class="text-xs text-gray-600 text-center py-4">No QC entries yet.</div>
          <table v-else class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 text-left text-gray-600 font-semibold uppercase tracking-wider">Time</th>
                <th class="pb-2 text-center text-gray-600 font-semibold uppercase tracking-wider">Moisture %</th>
                <th class="pb-2 text-center text-gray-600 font-semibold uppercase tracking-wider">Grade</th>
                <th class="pb-2 text-center text-gray-600 font-semibold uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="(qc, i) in batch.qualityChecks" :key="i">
                <td class="py-2 text-gray-500">{{ qc.time }}</td>
                <td class="py-2 text-center font-mono" :class="qc.moisture > 13 ? 'text-red-400' : 'text-gray-300'">
                  {{ qc.moisture }}%
                </td>
                <td class="py-2 text-center text-gray-300">{{ qc.grade }}</td>
                <td class="py-2 text-center">
                  <span class="text-xs font-semibold" :class="qc.passed ? 'text-emerald-400' : 'text-red-400'">
                    {{ qc.passed ? '✓ Pass' : '✗ Fail' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">

        <!-- Quick update -->
        <div v-if="batch.status !== 'completed'" class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Quick Update</h3>
          <div class="space-y-2">
            <label class="field-label">Bags Completed</label>
            <input v-model.number="quickBags" type="number" class="field-input w-full"
                   :min="batch.doneBags" :max="batch.targetBags"
                   :placeholder="String(batch.doneBags)" />
            <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full bg-gold-500/70 transition-all"
                   :style="`width:${Math.min(Math.round((quickBags/batch.targetBags)*100),100)}%`" />
            </div>
          </div>
          <button @click="saveQuickUpdate"
                  :disabled="quickBags <= batch.doneBags"
                  class="btn-gold text-xs w-full justify-center">
            Save Progress
          </button>
        </div>

        <!-- Summary stats -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Batch Summary</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-600">Status</span>
              <UiStatusBadge :status="batch.status" />
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Machine</span>
              <span class="text-gray-200 font-semibold">{{ batch.machine }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Operator</span>
              <span class="text-gray-300">{{ batch.operator }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shift</span>
              <span class="text-gray-300">{{ batch.shift }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">QC Checks</span>
              <span :class="batch.qualityChecks.some(q=>!q.passed) ? 'text-red-400 font-semibold' : 'text-emerald-400'">
                {{ batch.qualityChecks.filter(q=>q.passed).length }} / {{ batch.qualityChecks.length }} pass
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="glass-card p-5 space-y-2">
          <h3 class="text-sm font-semibold text-gray-300">Actions</h3>
          <NuxtLink :to="`/credit-sales/${batch.creditOrderId || batch.orderId}`" class="btn-ghost text-xs w-full justify-start gap-2">
            🔗 View Sales Order
          </NuxtLink>
          <button v-if="batch.status !== 'completed' && batch.status !== 'cancelled'"
                  @click="cancelModal = true"
                  class="btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:border-red-500/30">
            ✕ Cancel Batch
          </button>
        </div>
      </div>
    </div>

    <!-- ══ LOG UPDATE MODAL ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="logModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="logModal = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <h3 class="text-sm font-semibold text-gray-200">Log Progress Update</h3>
            <div class="space-y-3">
              <div>
                <label class="field-label">Bags Completed</label>
                <input v-model.number="logForm.doneBags" type="number" class="field-input w-full"
                       :min="batch.doneBags" :max="batch.targetBags" />
              </div>
              <div>
                <label class="field-label">Note</label>
                <input v-model="logForm.note" type="text" class="field-input w-full"
                       placeholder="e.g. Shift handover, machine cleaned…" />
              </div>
              <div>
                <label class="field-label">By</label>
                <input v-model="logForm.by" type="text" class="field-input w-full" placeholder="Your name" />
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="logModal = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="submitLog" class="btn-gold text-xs flex-1 justify-center">Save</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ COMPLETE MODAL ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="completeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="completeModal = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <h3 class="text-sm font-semibold text-gray-200">Mark Batch Complete</h3>
            <div class="space-y-2 text-xs rounded-xl p-3" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15)">
              <p class="text-gray-400">Final bags: <span class="text-gray-200 font-bold">{{ batch.doneBags }}</span></p>
              <p class="text-gray-400">Output: <span class="text-emerald-400 font-bold">{{ producedMT }} MT</span></p>
            </div>
            <div>
              <label class="field-label">Closing Note (optional)</label>
              <input v-model="completeNote" type="text" class="field-input w-full" placeholder="Any remarks…" />
            </div>
            <div class="flex gap-2">
              <button @click="completeModal = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="markComplete" class="btn-gold text-xs flex-1 justify-center" style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.3);color:#6ee7b7">
                ✓ Complete Batch
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ PAUSE MODAL ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="pauseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="pauseModal = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <h3 class="text-sm font-semibold text-gray-200">Pause Batch</h3>
            <div>
              <label class="field-label">Reason for pause</label>
              <input v-model="pauseReason" type="text" class="field-input w-full"
                     placeholder="e.g. Machine maintenance, shift break…" />
            </div>
            <div class="flex gap-2">
              <button @click="pauseModal = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="pauseBatch" :disabled="!pauseReason"
                      class="btn-ghost text-xs flex-1 justify-center text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10">
                ⏸ Pause
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ CANCEL MODAL ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="cancelModal = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <h3 class="text-sm font-semibold text-red-400">Cancel Batch?</h3>
            <p class="text-xs text-gray-500">This will mark the batch as cancelled. The sales order will be returned to the pending queue.</p>
            <div>
              <label class="field-label">Reason (required)</label>
              <input v-model="cancelReason" type="text" class="field-input w-full" placeholder="Why is this batch being cancelled?" />
            </div>
            <div class="flex gap-2">
              <button @click="cancelModal = false" class="btn-ghost text-xs flex-1 justify-center">Back</button>
              <button @click="cancelBatch" :disabled="!cancelReason"
                      class="btn-ghost text-xs flex-1 justify-center text-red-400 border-red-500/30 hover:bg-red-500/10">
                Cancel Batch
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ QC MODAL ══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="qcModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
             @click.self="qcModal = false">
          <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
            <h3 class="text-sm font-semibold text-gray-200">Add Quality Check</h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Moisture %</label>
                <input v-model.number="qcForm.moisture" type="number" step="0.1" min="0" max="30"
                       class="field-input w-full" placeholder="e.g. 12.4" />
              </div>
              <div>
                <label class="field-label">Grade</label>
                <select v-model="qcForm.grade" class="field-input w-full">
                  <option>A+</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              Pass criteria: moisture &lt; 13%, grade A or above
            </div>
            <div class="flex gap-2">
              <button @click="qcModal = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
              <button @click="submitQC" class="btn-gold text-xs flex-1 justify-center">Add Check</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route  = useRoute()
const { success, info, error } = useToast()

// ── Load from API ─────────────────────────────────────────
const batchId = route.params.id as string
const { data: apiData, error: loadError } = await useFetch(`/api/production/${batchId}`)

if (loadError.value) {
  throw createError({ statusCode: 404, message: 'Production batch not found' })
}

const batch = reactive({
  id:            (apiData.value as any)?.id           ?? batchId,
  dbId:          (apiData.value as any)?.dbId         ?? 0,
  orderId:       (apiData.value as any)?.orderId      ?? '',
  creditOrderId: (apiData.value as any)?.creditOrderId ?? 0,
  product:       (apiData.value as any)?.product      ?? '',
  customer:      (apiData.value as any)?.customer     ?? '',
  status:        (apiData.value as any)?.status       ?? 'pending',
  startDate:     (apiData.value as any)?.startDate    ?? '',
  startTime:     (apiData.value as any)?.startTime    ?? '',
  shift:         (apiData.value as any)?.shift        ?? '—',
  machine:       (apiData.value as any)?.machine      ?? '—',
  operator:      (apiData.value as any)?.operator     ?? '—',
  rawMaterial:   (apiData.value as any)?.rawMaterial  ?? '—',
  bagWeightKg:   (apiData.value as any)?.bagWeightKg  ?? 50,
  targetBags:    (apiData.value as any)?.targetBags   ?? 0,
  doneBags:      (apiData.value as any)?.doneBags     ?? 0,
  updates:       ((apiData.value as any)?.updates     ?? []) as any[],
  qualityChecks: ((apiData.value as any)?.qualityChecks ?? []) as any[],
})

// ── Computed ──────────────────────────────────────────────
const completionPct = computed(() => Math.round((batch.doneBags / batch.targetBags) * 100))
const orderedMT     = computed(() => ((batch.targetBags * batch.bagWeightKg) / 1000).toFixed(2))
const producedMT    = computed(() => ((batch.doneBags  * batch.bagWeightKg) / 1000).toFixed(2))
const remainingMT   = computed(() => (((batch.targetBags - batch.doneBags) * batch.bagWeightKg) / 1000).toFixed(2))

// ── Quick update ──────────────────────────────────────────
const quickBags = ref(batch.doneBags)
function saveQuickUpdate() {
  if (quickBags.value <= batch.doneBags) return
  batch.updates.push({
    time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
    type: 'update',
    note: 'Progress update',
    doneBags: quickBags.value,
    by: 'Current User',
  })
  batch.doneBags = quickBags.value
  success(`Updated — ${batch.doneBags} bags (${completionPct.value}%)`)
}

// ── Log modal ─────────────────────────────────────────────
const logModal = ref(false)
const logForm  = reactive({ doneBags: 0, note: '', by: '' })
function submitLog() {
  batch.updates.push({
    time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
    type: 'update',
    note: logForm.note || 'Progress logged',
    doneBags: logForm.doneBags,
    by: logForm.by || 'User',
  })
  if (logForm.doneBags > batch.doneBags) {
    batch.doneBags = logForm.doneBags
    quickBags.value = logForm.doneBags
  }
  logModal.value = false
  success('Activity logged ✓')
}

// ── API status update ─────────────────────────────────────
const saving = ref(false)
async function patchStatus(newStatus: string, extraNotes?: string) {
  saving.value = true
  try {
    await $fetch(`/api/production/${batch.id}`, {
      method: 'PATCH',
      body: { status: newStatus, ...(extraNotes ? { notes: extraNotes } : {}) },
    })
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to update status')
    throw e
  } finally {
    saving.value = false
  }
}

// ── Complete modal ────────────────────────────────────────
const completeModal = ref(false)
const completeNote  = ref('')
async function markComplete() {
  try {
    await patchStatus('completed')
    batch.updates.push({
      time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      type: 'complete',
      note: completeNote.value || 'Batch completed',
      doneBags: batch.doneBags,
      by: 'Current User',
    })
    batch.status = 'completed'
    completeModal.value = false
    success(`Batch ${batch.id} marked complete ✓`)
  } catch { /* toast already shown */ }
}

// ── Pause / Resume ────────────────────────────────────────
const pauseModal  = ref(false)
const pauseReason = ref('')
async function pauseBatch() {
  try {
    await patchStatus('paused')
    batch.updates.push({
      time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      type: 'pause',
      note: pauseReason.value,
      by: 'Current User',
    })
    batch.status     = 'paused'
    pauseModal.value  = false
    pauseReason.value = ''
    info(`Batch ${batch.id} paused`)
  } catch { /* toast already shown */ }
}
async function resumeBatch() {
  try {
    await patchStatus('running')
    batch.updates.push({
      time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      type: 'update',
      note: 'Batch resumed',
      by: 'Current User',
    })
    batch.status = 'running'
    info(`Batch ${batch.id} resumed ▶`)
  } catch { /* toast already shown */ }
}

// ── Cancel modal ──────────────────────────────────────────
const cancelModal  = ref(false)
const cancelReason = ref('')
async function cancelBatch() {
  if (!cancelReason.value) return
  try {
    await patchStatus('cancelled')
    batch.updates.push({
      time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      type: 'cancel',
      note: `Cancelled: ${cancelReason.value}`,
      by: 'Current User',
    })
    batch.status      = 'cancelled'
    cancelModal.value  = false
    cancelReason.value = ''
    error(`Batch ${batch.id} cancelled`)
  } catch { /* toast already shown */ }
}

// ── QC modal ──────────────────────────────────────────────
const qcModal = ref(false)
const qcForm  = reactive({ moisture: 12.5, grade: 'A' })
function submitQC() {
  const passed = qcForm.moisture < 13 && ['A+', 'A'].includes(qcForm.grade)
  batch.qualityChecks.push({
    time: new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
    moisture: qcForm.moisture,
    grade: qcForm.grade,
    passed,
  })
  qcModal.value = false
  passed ? success('QC check passed ✓') : error('QC check failed — moisture or grade out of spec')
}
</script>
