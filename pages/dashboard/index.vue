<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Offline draft restore banner ─────────────── -->
    <Transition name="slide-down">
      <div v-if="hasDraft"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
           style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2)">
        <svg class="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6H9v-2l6-6z"/>
        </svg>
        <span class="text-gold-300 text-xs flex-1">You have an unsaved order draft — restore it before it expires.</span>
        <button @click="restoreDraft" class="text-xs font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-2">Restore</button>
        <button @click="hasDraft = false" class="text-gray-600 hover:text-gray-400 ml-1">✕</button>
      </div>
    </Transition>

    <!-- ── Page header ──────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-white tracking-tight">
          Good {{ greeting }}, <span class="text-gradient-gold">Superadmin</span> 👋
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ formattedDate }} · Here's what's happening today</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-ghost text-xs">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export
        </button>
        <!-- War-room full-screen toggle -->
        <button @click="toggleWarRoom" class="btn-ghost text-xs" title="War Room mode (F)">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path v-if="!warRoom" stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M9 9V4H4v5h5zm6 0h5V4h-5v5zM9 15H4v5h5v-5zm6 0v5h5v-5h-5z"/>
          </svg>
          {{ warRoom ? 'Exit' : 'War Room' }}
        </button>
        <NuxtLink to="/credit-sales/create" class="btn-gold text-xs">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          New Order
        </NuxtLink>
      </div>
    </div>

    <!-- ── War Room overlay ──────────────────────────── -->
    <Teleport to="body">
      <Transition name="warroom">
        <div v-if="warRoom"
             class="fixed inset-0 z-[200] flex flex-col p-6 gap-5 overflow-auto"
             style="background:rgba(6,5,3,0.98)">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-display font-bold text-3xl text-white">🏭 Ujjal FMC — War Room</h1>
              <p class="text-sm text-gray-500 mt-1">{{ formattedDate }} · {{ warRoomTime }}</p>
            </div>
            <button @click="warRoom = false"
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all border border-white/[0.08]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- Big KPIs -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="kpi in kpiCards" :key="kpi.label"
                 class="rounded-2xl p-6 flex flex-col gap-3"
                 style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">
              <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">{{ kpi.label }}</p>
              <p class="text-4xl font-bold tracking-tight" :class="kpi.valueColor">{{ kpi.value }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">{{ kpi.sub }}</span>
                <UiSparkline :values="kpi.spark" :color="kpi.up ? '#10b981' : '#f87171'" type="line" :width="100" :height="36" />
              </div>
            </div>
          </div>
          <!-- Status counters -->
          <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <div v-for="col in warRoomPipeline" :key="(col as any).label"
                 class="rounded-xl p-4 text-center"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
              <div class="w-3 h-3 rounded-full mx-auto mb-2" :style="`background:${col.color}`" />
              <p class="text-3xl font-bold text-white mb-1">{{ col.count }}</p>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">{{ col.label }}</p>
            </div>
          </div>
          <!-- Branch comparison -->
          <div class="grid grid-cols-2 gap-4 flex-1">
            <div v-for="branch in ['Sirajgonj', 'Demra']" :key="branch"
                 class="rounded-2xl p-5"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
              <h3 class="text-lg font-bold text-gray-200 mb-4">{{ branch }}</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Revenue today</span><span class="text-gold-400 font-mono font-bold">{{ branch === 'Sirajgonj' ? '৳2.84M' : '৳1.44M' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Orders pending</span><span class="text-amber-400 font-bold">{{ branch === 'Sirajgonj' ? '9' : '5' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">In production</span><span class="text-blue-400 font-bold">{{ branch === 'Sirajgonj' ? '6' : '3' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Vehicles active</span><span class="text-emerald-400 font-bold">{{ branch === 'Sirajgonj' ? '5' : '3' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── KPI cards with sparklines ────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpiCards" :key="kpi.label"
           class="glass-card p-4 flex flex-col gap-2 hover:border-white/[0.1] transition-all duration-200 cursor-default group">
        <div class="flex items-center justify-between">
          <p class="text-xs text-gray-500">{{ kpi.label }}</p>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                :class="kpi.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'">
            {{ kpi.trend }}
          </span>
        </div>
        <p class="text-2xl font-bold leading-none" :class="kpi.valueColor">{{ kpi.value }}</p>
        <div class="flex items-end justify-between gap-2">
          <p class="text-[11px] text-gray-600 leading-tight">{{ kpi.sub }}</p>
          <UiSparkline :values="kpi.spark" :color="kpi.up ? '#10b981' : '#f87171'"
                       type="line" :width="72" :height="24" class="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>

    <!-- ── Secondary KPIs ────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MiniStatCard label="Credit Orders"    :value="s.total ?? 0"            :delta="`${s.delivered ?? 0} delivered`" icon="sales" />
      <MiniStatCard label="Purchase Orders"  :value="po.total_pos ?? 0"       :delta="`${fmtLakh(po.total_value)} value`" icon="cart" />
      <MiniStatCard label="Expense Vouchers" :value="ex.total ?? 0"           :delta="`${ex.pending_count ?? 0} pending`" :positive="false" icon="receipt" />
      <MiniStatCard label="Outstanding"      :value="fmtLakh(rv.total_outstanding)" delta="this month" icon="money" />
    </div>

    <!-- ── Main content grid ─────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Revenue chart (2/3) -->
      <div class="lg:col-span-2 glass-card p-5">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="section-title">Revenue Overview</h2>
            <p class="text-xs text-gray-500 mt-0.5">Monthly sales performance — BDT</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-for="p in ['7D','1M','3M','YTD']" :key="p"
              @click="chartPeriod = p"
              :class="['px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                       chartPeriod === p ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25' : 'text-gray-600 hover:text-gray-300 hover:bg-white/[0.05]']"
            >{{ p }}</button>
          </div>
        </div>

        <!-- Fake area chart visual -->
        <div class="relative h-48">
          <svg viewBox="0 0 600 180" class="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <line v-for="y in [36,72,108,144]" :key="y" :x1="0" :y1="y" x2="600" :y2="y" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
            <!-- Area fill -->
            <path d="M0,140 C50,130 100,100 150,90 C200,80 240,60 280,50 C320,40 360,70 400,55 C440,40 490,30 540,20 C570,14 590,18 600,15 L600,180 L0,180 Z"
                  fill="url(#areaGradient)" />
            <!-- Line -->
            <path d="M0,140 C50,130 100,100 150,90 C200,80 240,60 280,50 C320,40 360,70 400,55 C440,40 490,30 540,20 C570,14 590,18 600,15"
                  fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Data points -->
            <circle v-for="pt in chartPoints" :key="pt.x" :cx="pt.x" :cy="pt.y" r="3.5" fill="#f59e0b" stroke="#0a0a0a" stroke-width="2"/>
          </svg>
          <!-- X labels -->
          <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-600 px-1">
            <span v-for="l in xLabels" :key="l">{{ l }}</span>
          </div>
        </div>
      </div>

      <!-- Activity feed (1/3) -->
      <div class="glass-card p-5 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Live Activity</h2>
          <span class="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
        <div class="flex-1 space-y-3 overflow-y-auto no-scrollbar">
          <ActivityItem
            v-for="item in activityFeed" :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :time="item.time"
            :type="item.type"
          />
        </div>
      </div>
    </div>

    <!-- ── Bottom row ──────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Pending approvals table -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Pending Approvals</h2>
          <NuxtLink to="/credit-sales/approve" class="text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors">
            View all →
          </NuxtLink>
        </div>
        <div class="space-y-2">
          <PendingRow
            v-for="row in pendingOrdersList" :key="row.id"
            :order-no="row.order_number"
            :customer="row.customer_name"
            :amount="Number(row.total_amount)"
            :status="row.status"
          />
          <p v-if="!pendingOrdersList.length" class="text-xs text-gray-600 text-center py-4">No pending approvals ✓</p>
        </div>
      </div>

      <!-- Payment method breakdown -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Payment Methods</h2>
          <span class="text-xs text-gray-500">Today</span>
        </div>
        <div class="space-y-3">
          <PaymentBar v-for="pm in paymentMethods" :key="pm.label" :label="pm.label" :pct="pm.pct" :value="pm.value" :color="pm.color" />
        </div>
        <div class="mt-4 pt-4 border-t border-white/[0.06] flex justify-between text-sm">
          <span class="text-gray-500">Total collected</span>
          <span class="font-semibold text-gold-400">{{ formatBDT(4_280_500) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// ── Live stats from DB ────────────────────────────
const { data: statsData } = await useFetch('/api/dashboard/stats')
const s  = computed(() => (statsData.value?.orderStats   ?? {}) as any)
const rv = computed(() => (statsData.value?.revenueStats ?? {}) as any)
const ex = computed(() => (statsData.value?.expenseStats ?? {}) as any)
const po = computed(() => (statsData.value?.purchaseStats ?? {}) as any)

// ── Greeting ─────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})
const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const chartPeriod = ref('1M')
const formatBDT = (v: number) => '৳' + new Intl.NumberFormat('en-BD').format(v)

function fmtLakh(val: any): string {
  const n = Number(val ?? 0)
  if (n >= 10_000_000) return '৳' + (n / 10_000_000).toFixed(1) + 'Cr'
  if (n >= 100_000)    return '৳' + (n / 100_000).toFixed(1) + 'L'
  return '৳' + n.toLocaleString()
}

// ── KPI cards — live where possible ──────────────
const kpiCards = computed(() => [
  {
    label: 'Month Revenue',
    value: fmtLakh(rv.value.total_revenue),
    sub: `Collected: ${fmtLakh(rv.value.total_collected)}`,
    trend: `${fmtLakh(rv.value.total_outstanding)} outstanding`,
    up: true,
    valueColor: 'text-gold-400',
    spark: [28, 32, 29, 35, 31, 38, 43],
  },
  {
    label: 'Pending Approvals',
    value: String(statsData.value?.pendingApprovals ?? 0),
    sub: `${s.value.escalated ?? 0} escalated`,
    trend: (statsData.value?.pendingApprovals ?? 0) > 0 ? 'needs action' : 'all clear',
    up: (statsData.value?.pendingApprovals ?? 0) === 0,
    valueColor: 'text-amber-400',
    spark: [5, 8, 6, 11, 9, 12, statsData.value?.pendingApprovals ?? 0],
  },
  {
    label: 'Month Orders',
    value: String(s.value.total ?? 0),
    sub: `${s.value.delivered ?? 0} delivered · ${s.value.in_production ?? 0} in production`,
    trend: `${s.value.cancelled ?? 0} cancelled`,
    up: true,
    valueColor: 'text-orange-400',
    spark: [18, 22, 25, 20, 28, 24, s.value.total ?? 0],
  },
  {
    label: 'Month Expenses',
    value: fmtLakh(ex.value.total_amount),
    sub: `${ex.value.pending_count ?? 0} pending approval`,
    trend: `${ex.value.total ?? 0} vouchers`,
    up: false,
    valueColor: 'text-teal-400',
    spark: [14, 15, 16, 15.5, 17, 17.8, Number(ex.value.total_amount ?? 0) / 100000],
  },
])

// ── War Room ─────────────────────────────────────
const warRoom = ref(false)
const warRoomTime = ref('')
let warRoomClock: ReturnType<typeof setInterval>

function toggleWarRoom() {
  warRoom.value = !warRoom.value
  if (warRoom.value) {
    warRoomTime.value = new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    warRoomClock = setInterval(() => {
      warRoomTime.value = new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }, 1000)
  } else {
    clearInterval(warRoomClock)
  }
}

const warRoomPipeline = computed(() => [
  { label: 'Pending',    count: s.value.pending_approval ?? 0, color: '#eab308' },
  { label: 'Escalated',  count: s.value.escalated        ?? 0, color: '#f97316' },
  { label: 'Approved',   count: s.value.approved         ?? 0, color: '#10b981' },
  { label: 'Production', count: s.value.in_production    ?? 0, color: '#3b82f6' },
  { label: 'Ready',      count: s.value.ready_to_ship    ?? 0, color: '#06b6d4' },
  { label: 'Delivered',  count: s.value.delivered        ?? 0, color: '#14b8a6' },
])

// F key shortcut for war room
if (import.meta.client) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'F' && !e.ctrlKey && !e.metaKey && (e.target as HTMLElement)?.tagName !== 'INPUT') {
      toggleWarRoom()
    }
  })
}

onUnmounted(() => clearInterval(warRoomClock))

// ── Offline draft banner ─────────────────────────
const hasDraft = ref(false)
onMounted(() => {
  hasDraft.value = !!localStorage.getItem('erp_order_draft')
})
function restoreDraft() {
  navigateTo('/credit-sales/create')
  hasDraft.value = false
}

const chartPoints = [
  { x: 0, y: 140 }, { x: 150, y: 90 }, { x: 280, y: 50 },
  { x: 400, y: 55 }, { x: 540, y: 20 }, { x: 600, y: 15 },
]
const xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const activityFeed = [
  { id: 1, icon: 'check', label: 'Order CR-20260525-0001 approved by accounts-srg', time: '2m ago', type: 'success' },
  { id: 2, icon: 'money', label: 'Payment ৳82,000 received — Rahim Traders', time: '8m ago', type: 'gold' },
  { id: 3, icon: 'truck', label: 'Trip TRP-219 departed for Demra via TRK-02', time: '15m ago', type: 'info' },
  { id: 4, icon: 'receipt', label: 'Expense EXP-320 pending approval', time: '22m ago', type: 'warning' },
  { id: 5, icon: 'sales', label: 'New order CR-20260525-0002 created by sales-srg', time: '31m ago', type: 'info' },
  { id: 6, icon: 'bank', label: 'Bank transfer BTX-1082 approved — ৳5,00,000', time: '45m ago', type: 'success' },
  { id: 7, icon: 'check', label: 'GRN-0083 confirmed — 48 MT wheat received', time: '1h ago', type: 'success' },
]

const pendingOrdersList = computed(() => (statsData.value?.pendingOrdersList ?? []) as any[])

const paymentMethods = [
  { label: 'Bank Transfer', pct: 58, value: '৳2.48M', color: '#f59e0b' },
  { label: 'Cash',          pct: 22, value: '৳941K',  color: '#10b981' },
  { label: 'Mobile Banking',pct: 13, value: '৳557K',  color: '#6366f1' },
  { label: 'Cheque',        pct: 7,  value: '৳300K',  color: '#8b5cf6' },
]
</script>

<style scoped>
.warroom-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.warroom-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.warroom-enter-from, .warroom-leave-to { opacity: 0; transform: scale(1.02); }

.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
</style>
