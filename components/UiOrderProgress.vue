<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-6">
      <h3 class="section-title">Order Progress</h3>
      <UiStatusBadge :status="currentStatus" />
    </div>

    <!-- Rejected / Cancelled banner (above the steps if terminal bad) -->
    <div v-if="isTerminalBad"
         class="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl"
         style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)">
      <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
      </svg>
      <p class="text-xs text-red-400">
        Order <span class="font-semibold uppercase tracking-wider">{{ currentStatus.replace('_', ' ') }}</span>
        <span v-if="terminalEntry?.by"> by <strong>{{ terminalEntry.by }}</strong></span>
        <span v-if="terminalEntry?.at"> · {{ terminalEntry.at }}</span>
        <span v-else> — no further action required</span>
      </p>
    </div>

    <!-- Steps row -->
    <div class="relative">
      <!-- Base track -->
      <div class="absolute top-5 left-5 right-5 h-0.5 bg-white/[0.06] rounded-full" />

      <!-- Animated fill track — only for non-terminal states -->
      <div v-if="!isTerminalBad && progressPct > 0"
           class="absolute top-5 left-5 h-0.5 rounded-full transition-all duration-700 ease-out"
           :style="`width: calc(${progressPct}% - 2.5rem); background: linear-gradient(90deg, #f59e0b, #10b981)`" />

      <!-- Steps -->
      <div class="relative flex justify-between">
        <div v-for="(step, i) in visibleSteps" :key="step.status"
             class="flex flex-col items-center gap-2.5 cursor-pointer relative"
             :style="`width:${100 / visibleSteps.length}%`"
             @click="activeTooltip = activeTooltip === i ? -1 : i">

          <!-- Node circle -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative"
               :class="nodeClass(step, i)">

            <!-- Glow pulse on current (not terminal bad) -->
            <div v-if="isCurrent(step) && !isTerminalBad"
                 class="absolute inset-0 rounded-full animate-ping opacity-30"
                 :style="`background: ${step.color}`" />

            <!-- Icons by state -->
            <svg v-if="isDone(step, i)" class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <!-- Escalated: warning icon -->
            <svg v-else-if="isCurrent(step) && step.status === 'escalated'" class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
            </svg>
            <!-- Spinning loader for any other current step -->
            <svg v-else-if="isCurrent(step)" class="w-3.5 h-3.5 relative z-10 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75"/>
            </svg>
            <span v-else class="text-[11px] font-bold relative z-10">{{ i + 1 }}</span>
          </div>

          <!-- Label -->
          <span class="text-[9px] font-semibold uppercase tracking-wider text-center leading-tight transition-colors"
                :class="isCurrent(step) ? (step.status === 'escalated' ? 'text-orange-400' : 'text-gold-400') : isDone(step, i) ? 'text-emerald-400' : 'text-gray-700'">
            {{ step.label }}
          </span>

          <!-- Click tooltip -->
          <Transition name="pop">
            <div v-if="activeTooltip === i"
                 class="absolute z-30 w-44 rounded-xl px-3 py-2.5 text-xs shadow-2xl"
                 style="top:calc(100% + 4px); background:rgba(20,16,12,0.98);border:1px solid rgba(255,255,255,0.1)">
              <div class="flex items-center gap-1.5 mb-1.5">
                <div class="w-2 h-2 rounded-full" :style="`background:${step.color}`" />
                <p class="font-semibold text-gray-200">{{ step.label }}</p>
              </div>
              <p v-if="step.by" class="text-gray-400">👤 {{ step.by }}</p>
              <p v-if="step.at" class="text-gray-600 font-mono mt-0.5">🕐 {{ step.at }}</p>
              <p v-if="!step.by && !isCurrent(step) && !isDone(step, i)" class="text-gray-700 italic">Not reached yet</p>
              <p v-if="isCurrent(step) && !step.by" class="text-gold-500/70">In progress…</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentStatus: string
  history?: Array<{ status: string; by: string; at: string }>
}>()

const activeTooltip = ref(-1)

// Full pipeline including escalated between pending and approved
const STEPS = [
  { status: 'pending_approval', label: 'Pending',    color: '#eab308' },
  { status: 'escalated',        label: 'Escalated',  color: '#f97316' },
  { status: 'approved',         label: 'Approved',   color: '#10b981' },
  { status: 'in_production',    label: 'Production', color: '#3b82f6' },
  { status: 'ready_to_ship',    label: 'Ready',      color: '#06b6d4' },
  { status: 'delivered',        label: 'Delivered',  color: '#14b8a6' },
  { status: 'completed',        label: 'Completed',  color: '#a855f7' },
]

// For normal (non-escalated) flow, hide the escalated step
const visibleSteps = computed(() => {
  const steps = props.currentStatus === 'escalated'
    ? STEPS  // show all including escalated
    : STEPS.filter(s => s.status !== 'escalated')  // hide escalated step

  return steps.map(s => {
    const hist = props.history?.find(h => h.status === s.status)
    return { ...s, by: hist?.by || '', at: hist?.at || '' }
  })
})

const TERMINAL_BAD = ['rejected', 'cancelled']
const isTerminalBad = computed(() => TERMINAL_BAD.includes(props.currentStatus))

// Index in the VISIBLE steps (not full STEPS)
const currentIdx = computed(() => {
  const idx = visibleSteps.value.findIndex(s => s.status === props.currentStatus)
  return idx  // -1 if not found (terminal bad states)
})

function isDone(step: { status: string }, i: number) {
  if (isTerminalBad.value) return false
  return i < currentIdx.value
}

function isCurrent(step: { status: string }) {
  return step.status === props.currentStatus
}

function nodeClass(step: { status: string; color: string }, i: number) {
  if (isTerminalBad.value) return 'border-white/10 bg-white/[0.03] text-gray-700'
  if (isCurrent(step)) {
    if (step.status === 'escalated') return 'border-orange-400 bg-orange-500/20 text-orange-300 scale-110 shadow-lg shadow-orange-500/20'
    return 'border-gold-400 bg-gold-500/20 text-gold-300 scale-110 shadow-lg shadow-gold-500/20'
  }
  if (isDone(step, i)) return 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
  return 'border-white/10 bg-white/[0.03] text-gray-700'
}

const progressPct = computed(() => {
  if (isTerminalBad.value || currentIdx.value < 0) return 0
  const n = visibleSteps.value.length
  if (n <= 1) return 0
  return Math.round((currentIdx.value / (n - 1)) * 100)
})

// For terminal bad states, find the rejection/cancellation entry in history
const terminalEntry = computed(() =>
  props.history?.find(h => TERMINAL_BAD.includes(h.status))
)

// Close tooltip on outside click
if (import.meta.client) {
  useEventListener('click', () => { activeTooltip.value = -1 }, { capture: false })
}
</script>

<style scoped>
.pop-enter-active { transition: all 0.15s ease-out; }
.pop-leave-active { transition: all 0.1s ease-in; }
.pop-enter-from  { opacity: 0; transform: translateY(-6px) scale(0.95); }
.pop-leave-to    { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
