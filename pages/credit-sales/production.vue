<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Production Queue"
      subtitle="Drag to prioritise — changes save automatically"
      :breadcrumb="['Credit Sales', 'Production Queue']"
    >
      <template #actions>
        <button v-if="isAdmin && queue.length > 1" @click="autoRank"
          class="btn-ghost text-xs flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
          </svg>
          Auto-rank
        </button>
        <button @click="refresh" class="btn-ghost text-xs">↻ Refresh</button>
      </template>
    </UiPageHeader>

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center space-y-1">
        <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">In Production</p>
        <p class="text-2xl font-bold text-blue-400">{{ stats.in_production ?? queue.length }}</p>
      </div>
      <div class="glass-card p-4 text-center space-y-1">
        <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Ready Today</p>
        <p class="text-2xl font-bold text-emerald-400">{{ stats.ready_today ?? 0 }}</p>
      </div>
      <div class="glass-card p-4 text-center space-y-1">
        <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Weight</p>
        <p class="text-2xl font-bold text-gold-400">{{ ((stats.total_weight_kg ?? 0) / 1000).toFixed(1) }}MT</p>
      </div>
      <div class="glass-card p-4 text-center space-y-1">
        <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Urgent Orders</p>
        <p class="text-2xl font-bold text-red-400">{{ urgentCount }}</p>
      </div>
    </div>

    <!-- Loading / error -->
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading queue…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Drag hint -->
      <p v-if="isAdmin && queue.length > 1"
         class="text-[11px] text-gray-600 flex items-center gap-2 px-1 select-none">
        <svg class="w-3 h-4 shrink-0" viewBox="0 0 12 18" fill="currentColor">
          <circle cx="3" cy="3"  r="1.4"/><circle cx="9" cy="3"  r="1.4"/>
          <circle cx="3" cy="9"  r="1.4"/><circle cx="9" cy="9"  r="1.4"/>
          <circle cx="3" cy="15" r="1.4"/><circle cx="9" cy="15" r="1.4"/>
        </svg>
        Drag cards to set production priority · saved automatically
      </p>

      <!-- Queue cards -->
      <div class="space-y-3">
        <div
          v-for="(order, idx) in queue"
          :key="order.id"
          :draggable="isAdmin ? 'true' : 'false'"
          @dragstart="onDragStart($event, idx)"
          @dragend="onDragEnd"
          @dragover.prevent="onDragOver(idx)"
          @dragleave.self="dragOver = null"
          @drop.prevent="onDrop(idx)"
          :class="[
            'glass-card p-4 transition-all duration-150 select-none',
            isAdmin ? 'cursor-grab active:cursor-grabbing' : '',
            isDragging && dragOver === idx && dragging !== idx
              ? 'ring-1 ring-gold-400/50 bg-gold-400/[0.03] translate-y-0.5 shadow-xl shadow-gold-400/10'
              : '',
            dragging === idx ? 'opacity-20 scale-[0.98]' : 'opacity-100',
          ]"
        >
          <div class="flex items-center gap-3">

            <!-- Rank badge -->
            <div :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors',
                idx === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                idx === 1 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                idx === 2 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' :
                'bg-white/[0.04] text-gray-500 border border-white/[0.08]'
              ]">
              {{ idx + 1 }}
            </div>

            <!-- Drag handle (admin only) -->
            <div v-if="isAdmin"
                 class="text-gray-600 hover:text-gray-400 transition-colors shrink-0 cursor-grab active:cursor-grabbing"
                 title="Drag to reorder">
              <svg class="w-3.5 h-5" viewBox="0 0 12 20" fill="currentColor">
                <circle cx="3" cy="4"  r="1.5"/><circle cx="9" cy="4"  r="1.5"/>
                <circle cx="3" cy="10" r="1.5"/><circle cx="9" cy="10" r="1.5"/>
                <circle cx="3" cy="16" r="1.5"/><circle cx="9" cy="16" r="1.5"/>
              </svg>
            </div>

            <!-- Order info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-xs font-bold text-gold-400/90">{{ order.orderNo }}</span>
                <UiStatusBadge :status="order.priority" />
                <UiStatusBadge :status="order.status" />
                <span v-if="dueSoon(order)"
                      class="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                  ⏰ Due {{ fmtDate(order.required_date) }}
                </span>
              </div>
              <p class="text-sm font-semibold text-gray-200 mt-1 truncate">{{ order.customer }}</p>
              <p class="text-[11px] text-gray-500 mt-0.5 truncate">
                {{ order.items.map((i: any) => `${i.product} ×${i.qty}`).join(' · ') || '—' }}
              </p>
            </div>

            <!-- Progress bar -->
            <div class="w-28 shrink-0 hidden sm:block">
              <div class="flex justify-between text-[10px] text-gray-600 mb-1.5">
                <span>Progress</span>
                <span class="font-semibold" :class="order.progress >= 100 ? 'text-emerald-400' : 'text-gray-400'">
                  {{ order.progress }}%
                </span>
              </div>
              <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                     :style="`width:${order.progress}%;background:${order.progress >= 100 ? '#10b981' : '#3b82f6'}`" />
              </div>
            </div>

            <!-- Order value -->
            <div class="text-right shrink-0 hidden md:block w-24">
              <p class="text-xs font-bold text-gold-400">৳{{ Number(order.total_amount).toLocaleString() }}</p>
              <p class="text-[10px] text-gray-600 mt-0.5">
                {{ order.items.reduce((s: number, i: any) => s + i.qty, 0).toLocaleString() }} bags
              </p>
            </div>

            <!-- Mark Ready -->
            <button
              v-if="perms.canDo('credit_sales', 'production', 'mark_ready')"
              @click.stop="markReady(order)"
              :disabled="acting === order.id"
              class="btn-gold text-xs py-1.5 px-3 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
              {{ acting === order.id ? '…' : '✓ Ready' }}
            </button>

          </div>
        </div>

        <!-- Empty state -->
        <div v-if="queue.length === 0" class="glass-card p-14 text-center space-y-3">
          <p class="text-4xl">🏭</p>
          <p class="text-sm font-semibold text-gray-400">No orders in production</p>
          <p class="text-xs text-gray-600">Approved orders appear here when sent to production.</p>
          <NuxtLink to="/credit-sales/approve" class="btn-ghost text-xs inline-block mt-2">
            View pending approvals →
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Auto-save indicator -->
    <Transition name="modal">
      <div v-if="saving"
           class="fixed bottom-6 right-6 z-40 glass-card px-4 py-2.5 flex items-center gap-2.5 text-xs text-gray-400 shadow-2xl border border-gold-400/20">
        <div class="w-2 h-2 rounded-full bg-gold-400 animate-pulse shrink-0" />
        Saving queue order…
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
definePageMeta({ layout: 'default' })

const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()),
)

// ── Data fetch ────────────────────────────────────────────
const { data, pending, error, refresh } = await useFetch('/api/credit-sales/production-queue')

const stats       = computed(() => (data.value?.stats ?? {}) as any)
const urgentCount = computed(() => queue.value.filter(o => o.priority === 'urgent').length)

// ── Drag & Drop state (declared before the watch that references isDragging) ──
const dragging   = ref<number | null>(null)
const dragOver   = ref<number | null>(null)
const isDragging = ref(false)

// Local copy of the queue — owned by drag-and-drop logic
const queue = ref<any[]>([])

// Sync server data → local queue (only when not mid-drag)
watch(
  () => data.value?.orders,
  (orders) => {
    if (!isDragging.value && orders) {
      queue.value = (orders as any[]).map(o => ({ ...o }))
    }
  },
  { immediate: true },
)

function onDragStart(_e: DragEvent, idx: number) {
  dragging.value   = idx
  isDragging.value = true
  // Required for Firefox
  _e.dataTransfer?.setData('text/plain', String(idx))
}

function onDragEnd() {
  dragging.value   = null
  dragOver.value   = null
  isDragging.value = false
}

function onDragOver(idx: number) {
  if (dragging.value === null || dragging.value === idx) return
  dragOver.value = idx
}

function onDrop(targetIdx: number) {
  const srcIdx = dragging.value
  if (srcIdx === null || srcIdx === targetIdx) {
    onDragEnd()
    return
  }

  // Reorder the local array
  const next     = [...queue.value]
  const [moved]  = next.splice(srcIdx, 1)
  next.splice(targetIdx, 0, moved)
  queue.value = next

  onDragEnd()
  scheduleSave()
}

// ── Persist to server (debounced 800ms) ───────────────────
const saving = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(persistOrder, 800)
}

async function persistOrder() {
  saving.value = true
  try {
    await $fetch('/api/credit-sales/production-queue/reorder', {
      method: 'PATCH',
      body:   { ids: queue.value.map(o => o.id) },
    })
  } catch {
    toastError('Could not save queue order — please try again')
  } finally {
    saving.value = false
  }
}

// ── Auto-rank ─────────────────────────────────────────────
const PRIORITY_SCORE: Record<string, number> = { urgent: 3, high: 2, normal: 1 }

function autoRank() {
  queue.value = [...queue.value].sort((a, b) => {
    // 1. Priority level
    const pa = PRIORITY_SCORE[a.priority] ?? 1
    const pb = PRIORITY_SCORE[b.priority] ?? 1
    if (pa !== pb) return pb - pa

    // 2. Required date — sooner first
    const da = a.required_date ? new Date(a.required_date).getTime() : Infinity
    const db = b.required_date ? new Date(b.required_date).getTime() : Infinity
    if (da !== db) return da - db

    // 3. Order value — higher first
    return Number(b.total_amount) - Number(a.total_amount)
  })

  scheduleSave()
  success('Queue auto-ranked: urgent → nearest due date → highest value ✓')
}

// ── Helpers ───────────────────────────────────────────────
function dueSoon(order: any): boolean {
  if (!order.required_date) return false
  const daysAway = (new Date(order.required_date).getTime() - Date.now()) / 86_400_000
  return daysAway <= 2
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })
}

// ── Mark Ready ────────────────────────────────────────────
const acting = ref<number | null>(null)

async function markReady(order: any) {
  acting.value = order.id
  try {
    await $fetch(`/api/credit-sales/${order.id}/workflow`, {
      method: 'POST',
      body:   { to_status: 'ready_to_ship', comments: 'Production complete — ready to ship' },
    })
    success(`${order.orderNo} marked as ready to ship ✓`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update status')
  } finally {
    acting.value = null
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; transform: translateY(4px); }
</style>
