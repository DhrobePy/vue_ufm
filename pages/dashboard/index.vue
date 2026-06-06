<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Offline draft restore banner (credit-sales users only) ── -->
    <Transition name="slide-down">
      <div v-if="hasDraft && perms.canAccessModule('credit_sales')"
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
          Good {{ greeting }}, <span class="text-gradient-gold">{{ sessionUser?.name || 'User' }}</span> 👋
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
        <NuxtLink v-if="perms.canAccessModule('credit_sales')" to="/credit-sales/create" class="btn-gold text-xs">
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
              <h1 class="font-display font-bold text-3xl text-white">Ujjal FMC — War Room</h1>
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
          <!-- Status pipeline counters (live) -->
          <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <div v-for="col in warRoomPipeline" :key="(col as any).label"
                 class="rounded-xl p-4 text-center"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
              <div class="w-3 h-3 rounded-full mx-auto mb-2" :style="`background:${col.color}`" />
              <p class="text-3xl font-bold text-white mb-1">{{ col.count }}</p>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">{{ col.label }}</p>
            </div>
          </div>
          <!-- Finance overview (live) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="rounded-2xl p-5 flex flex-col gap-3"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Monthly Revenue</p>
              <p class="text-3xl font-bold text-gold-400">{{ fmtLakh(rv.total_revenue) }}</p>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Collected</span>
                <span class="text-emerald-400 font-bold">{{ fmtLakh(rv.total_collected) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Outstanding</span>
                <span class="text-amber-400 font-bold">{{ fmtLakh(rv.total_outstanding) }}</span>
              </div>
            </div>
            <div class="rounded-2xl p-5 flex flex-col gap-3"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Expenses</p>
              <p class="text-3xl font-bold text-teal-400">{{ fmtLakh(ex.total_amount) }}</p>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Vouchers</span>
                <span class="text-gray-300 font-bold">{{ ex.total ?? 0 }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Pending</span>
                <span class="text-amber-400 font-bold">{{ ex.pending_count ?? 0 }}</span>
              </div>
            </div>
            <div class="rounded-2xl p-5 flex flex-col gap-3"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)">
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Purchases</p>
              <p class="text-3xl font-bold text-blue-400">{{ fmtLakh(po.total_value) }}</p>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Purchase Orders</span>
                <span class="text-gray-300 font-bold">{{ po.total_pos ?? 0 }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Credit Orders</span>
                <span class="text-gray-300 font-bold">{{ s.total ?? 0 }}</span>
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

      <!-- Revenue chart (2/3) — live data from DB -->
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

        <!-- Area chart — dynamic SVG from real DB data -->
        <div class="relative h-48">
          <template v-if="chartSvgData.points.length >= 2">
            <svg viewBox="0 0 600 180" class="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line v-for="y in [36,72,108,144]" :key="y" :x1="0" :y1="y" x2="600" :y2="y"
                    stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
              <!-- Area fill -->
              <path :d="chartSvgData.area" fill="url(#areaGradient)" />
              <!-- Line -->
              <path :d="chartSvgData.line" fill="none" stroke="#f59e0b" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Data points -->
              <circle v-for="pt in chartSvgData.points" :key="pt.x"
                      :cx="pt.x" :cy="pt.y" r="3.5" fill="#f59e0b" stroke="#0a0a0a" stroke-width="2"/>
            </svg>
          </template>
          <template v-else>
            <div class="w-full h-full flex items-center justify-center">
              <p class="text-xs text-gray-600">No revenue data for this period yet</p>
            </div>
          </template>
          <!-- X-axis labels -->
          <div v-if="chartLabels.length" class="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-600 px-1">
            <span v-for="l in chartLabels" :key="l">{{ l }}</span>
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
          <div v-if="!activityFeed.length" class="flex flex-col items-center justify-center h-full py-10 gap-2 text-center">
            <svg class="w-9 h-9 text-gray-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-xs text-gray-600">No recent activity</p>
            <p class="text-[11px] text-gray-700">Events appear here as the team works</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bottom row ──────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Pending approvals table -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Pending Approvals</h2>
          <NuxtLink v-if="perms.canAccessModule('credit_sales')" to="/credit-sales/approve" class="text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors">
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

      <!-- Collection summary — live from DB -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Collection Summary</h2>
          <span class="text-xs text-gray-500">This Month</span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-gold-400" />
              <span class="text-xs text-gray-400">Total Billed</span>
            </div>
            <span class="text-sm font-bold text-gold-400">{{ fmtLakh(rv.total_revenue) }}</span>
          </div>
          <div class="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-emerald-400" />
              <span class="text-xs text-gray-400">Collected</span>
            </div>
            <span class="text-sm font-bold text-emerald-400">{{ fmtLakh(rv.total_collected) }}</span>
          </div>
          <div class="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-amber-400" />
              <span class="text-xs text-gray-400">Outstanding</span>
            </div>
            <span class="text-sm font-bold text-amber-400">{{ fmtLakh(rv.total_outstanding) }}</span>
          </div>
          <div class="pt-1">
            <div class="flex justify-between text-[11px] text-gray-600 mb-2">
              <span>Collection Rate</span>
              <span class="font-medium text-gray-400">{{ collectionRate }}%</span>
            </div>
            <div class="h-2 bg-white/[0.05] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :style="`width: ${collectionRate}%; background: linear-gradient(90deg, #f59e0b, #10b981)`" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Permissions — used to gate module-specific links in this page
const perms = usePermissions()

// ── Live stats — SSR fetch, then polled every 30 s ────────────────
const { data: statsData, refresh: refreshStats } =
  await useFetch('/api/dashboard/stats')

// ── Chart period — reactive; re-fetches when changed ─────────────
const chartPeriod = ref('1M')
const { data: monthlyRevenueData, refresh: refreshRevenue } =
  await useFetch('/api/dashboard/monthly-revenue', {
    query: computed(() => ({ period: chartPeriod.value })),
  })
watch(chartPeriod, () => refreshRevenue())

// ── Activity feed ─────────────────────────────────────────────────
interface ActivityItem { id: number; icon: string; label: string; time: string; type: string }
const activityFeed = ref<ActivityItem[]>([])

function activityIcon(action: string, module: string): string {
  if (action === 'approved')   return '✅'
  if (action === 'rejected')   return '❌'
  if (action === 'deleted')    return '🗑️'
  if (action === 'paid')       return '💰'
  if (action === 'dispatched') return '📦'
  if (action === 'other' && module === 'credit_sales') return '📋'
  if (module === 'expense')    return '💸'
  if (module === 'purchase')   return '🛒'
  if (module === 'supplier')   return '🏭'
  if (module === 'authentication') return '🔐'
  return '🔔'
}

function activityType(severity: string): string {
  if (severity === 'critical') return 'error'
  if (severity === 'warning')  return 'warning'
  return 'success'
}

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

async function loadActivity() {
  try {
    const rows = await $fetch<any[]>('/api/dashboard/activity')
    activityFeed.value = (rows ?? []).map((r: any) => ({
      id:    r.id,
      icon:  activityIcon(r.action, r.module),
      label: r.description ?? `${r.action} · ${r.module}`,
      time:  timeAgo(r.created_at),
      type:  activityType(r.severity),
    }))
  } catch { /* keep stale */ }
}

// ── Auto-refresh every 30 s ───────────────────────────────────────
onMounted(() => {
  loadActivity()
  const timer = setInterval(() => {
    refreshStats()
    refreshRevenue()
    loadActivity()
  }, 30_000)
  onUnmounted(() => clearInterval(timer))
})

// ── Logged-in user ────────────────────────────────
const { user: sessionUser } = useUserSession()

// ── Greeting & date ───────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})
const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

function fmtLakh(val: any): string {
  const n = Number(val ?? 0)
  if (n >= 10_000_000) return '৳' + (n / 10_000_000).toFixed(1) + 'Cr'
  if (n >= 100_000)    return '৳' + (n / 100_000).toFixed(1) + 'L'
  return '৳' + n.toLocaleString()
}

const s  = computed(() => (statsData.value?.orderStats    ?? {}) as any)
const rv = computed(() => (statsData.value?.revenueStats  ?? {}) as any)
const ex = computed(() => (statsData.value?.expenseStats  ?? {}) as any)
const po = computed(() => (statsData.value?.purchaseStats ?? {}) as any)

// ── Collection rate ───────────────────────────────
const collectionRate = computed(() => {
  const total     = Number(rv.value.total_revenue  ?? 0)
  const collected = Number(rv.value.total_collected ?? 0)
  if (!total) return 0
  return Math.min(100, Math.round((collected / total) * 100))
})

// ── Real sparkline values from monthly revenue history ────────────
const revenueSpark = computed(() =>
  (monthlyRevenueData.value as any[] ?? []).map((r: any) => Number(r.revenue) / 100_000),
)
const orderCountSpark = computed(() =>
  (monthlyRevenueData.value as any[] ?? []).map((r: any) => Number(r.order_count)),
)

// ── KPI cards ─────────────────────────────────────
const kpiCards = computed(() => [
  {
    label: 'Month Revenue',
    value: fmtLakh(rv.value.total_revenue),
    sub:   `Collected: ${fmtLakh(rv.value.total_collected)}`,
    trend: `${fmtLakh(rv.value.total_outstanding)} outstanding`,
    up: true,
    valueColor: 'text-gold-400',
    spark: revenueSpark.value.length ? revenueSpark.value : [0],
  },
  {
    label: 'Pending Approvals',
    value: String(statsData.value?.pendingApprovals ?? 0),
    sub:   `${s.value.escalated ?? 0} escalated`,
    trend: (statsData.value?.pendingApprovals ?? 0) > 0 ? 'needs action' : 'all clear',
    up: (statsData.value?.pendingApprovals ?? 0) === 0,
    valueColor: 'text-amber-400',
    spark: [0, 0, 0, 0, 0, 0, statsData.value?.pendingApprovals ?? 0],
  },
  {
    label: 'Month Orders',
    value: String(s.value.total ?? 0),
    sub:   `${s.value.delivered ?? 0} delivered · ${s.value.in_production ?? 0} in production`,
    trend: `${s.value.cancelled ?? 0} cancelled`,
    up: true,
    valueColor: 'text-orange-400',
    spark: orderCountSpark.value.length ? orderCountSpark.value : [0],
  },
  {
    label: 'Month Expenses',
    value: fmtLakh(ex.value.total_amount),
    sub:   `${ex.value.pending_count ?? 0} pending approval`,
    trend: `${ex.value.total ?? 0} vouchers`,
    up: false,
    valueColor: 'text-teal-400',
    spark: [0, 0, 0, 0, 0, 0, Number(ex.value.total_amount ?? 0) / 100_000],
  },
])

// ── Revenue chart SVG ─────────────────────────────
const chartSvgData = computed(() => {
  const rows = (monthlyRevenueData.value as any[]) ?? []
  if (rows.length < 2) return { area: '', line: '', points: [] as { x: number; y: number }[] }

  const values = rows.map((r: any) => Number(r.revenue))
  const max    = Math.max(...values, 1)
  const W = 600, H = 160

  const pts = rows.map((_: any, i: number) => ({
    x: Math.round((i / (rows.length - 1)) * W),
    y: Math.round(H - (values[i] / max) * (H - 24) + 8),
  }))

  const lineD = pts.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaD = `${lineD} L${W},${H} L0,${H} Z`

  return { area: areaD, line: lineD, points: pts }
})

const chartLabels = computed(() =>
  (monthlyRevenueData.value as any[] ?? []).map((r: any) => r.month),
)

// ── Pending orders ─────────────────────────────────
const pendingOrdersList = computed(() => (statsData.value?.pendingOrdersList ?? []) as any[])

// ── War Room ──────────────────────────────────────
const warRoom     = ref(false)
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

// ── Offline draft banner ──────────────────────────
const hasDraft = ref(false)
onMounted(() => {
  hasDraft.value = !!localStorage.getItem('erp_order_draft')
})
function restoreDraft() {
  navigateTo('/credit-sales/create')
  hasDraft.value = false
}
</script>

<style scoped>
.warroom-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.warroom-leave-active { transition: opacity 0.2s  ease, transform 0.2s  ease; }
.warroom-enter-from, .warroom-leave-to { opacity: 0; transform: scale(1.02); }

.slide-down-enter-active { transition: all 0.3s ease; }
.slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
</style>
