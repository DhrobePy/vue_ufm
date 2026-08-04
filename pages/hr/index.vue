<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-start gap-3">
        <UiBackButton />
        <div>
          <h1 class="text-2xl font-bold text-white">HR Dashboard</h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ todayLabel }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/hr/payroll" class="btn-primary text-sm">💰 Run Payroll</NuxtLink>
        <NuxtLink to="/hr/attendance" class="btn-secondary text-sm">📋 Attendance</NuxtLink>
      </div>
    </div>

    <!-- ── Employee & Attendance Stats ───────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl shrink-0">👥</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.employees?.total ?? 0 }}</p>
          <p class="text-xs text-gray-400">Total Employees</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ d.employees?.active ?? 0 }} active · {{ d.employees?.ex_count ?? 0 }} ex</p>
        </div>
      </div>

      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-xl shrink-0">✅</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.attendance?.present ?? 0 }}</p>
          <p class="text-xs text-gray-400">Present</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ attendanceDateLabel }}</p>
        </div>
      </div>

      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-xl shrink-0">❌</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.attendance?.absent ?? 0 }}</p>
          <p class="text-xs text-gray-400">Absent</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ d.attendance?.late ?? 0 }} late</p>
        </div>
      </div>

      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">🏦</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.loans?.active ?? 0 }}</p>
          <p class="text-xs text-gray-400">Active Loans</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ d.loans?.total ?? 0 }} total</p>
        </div>
      </div>
    </div>

    <!-- ── Payroll & Workflow Stats ───────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl shrink-0">💰</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.payroll?.approved ?? 0 }}</p>
          <p class="text-xs text-gray-400">Approved Payrolls</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ d.payroll_month }} · {{ d.payroll?.paid ?? 0 }} paid</p>
        </div>
      </div>

      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center text-xl shrink-0">⏳</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.payroll?.pending ?? 0 }}</p>
          <p class="text-xs text-gray-400">Pending Approval</p>
          <p class="text-xs text-gray-600 mt-0.5">payrolls this month</p>
        </div>
      </div>

      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl shrink-0">💸</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.advances?.approved ?? 0 }}</p>
          <p class="text-xs text-gray-400">Approved Advances</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ d.advances?.pending ?? 0 }} pending</p>
        </div>
      </div>

      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl shrink-0">🎁</div>
        <div>
          <p class="text-2xl font-bold text-white">{{ d.holidays?.upcoming ?? 0 }}</p>
          <p class="text-xs text-gray-400">Upcoming Holidays</p>
          <p class="text-xs text-gray-600 mt-0.5">next 30 days</p>
        </div>
      </div>
    </div>

    <!-- ── Body Grid ──────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Recent Attendance (2/3 width) -->
      <div class="lg:col-span-2 glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-semibold text-white">Attendance</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ attendanceDateLabel }}</p>
          </div>
          <NuxtLink to="/hr/attendance" class="text-xs text-amber-400 hover:underline">View all →</NuxtLink>
        </div>

        <div v-if="d.recent_attendance?.length" class="space-y-1">
          <div v-for="a in d.recent_attendance" :key="a.id"
               class="flex items-center justify-between text-sm py-2 border-b border-white/[0.04] last:border-0">
            <span class="text-gray-200 font-medium w-40 truncate">{{ a.first_name }} {{ a.last_name }}</span>
            <div class="flex items-center gap-3">
              <span class="text-gray-500 text-xs font-mono">
                {{ a.clock_in ? a.clock_in.toString().slice(0,5) : '--:--' }}
                <span v-if="a.clock_out" class="text-gray-600"> → {{ a.clock_out.toString().slice(0,5) }}</span>
              </span>
              <span :class="statusBadge(a.status)" class="text-xs capitalize">{{ a.status }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm py-4 text-center">No attendance data for this date.</p>
      </div>

      <!-- Right column -->
      <div class="space-y-5">

        <!-- Dept breakdown -->
        <div class="glass-card p-5">
          <h2 class="font-semibold text-white mb-3">Active by Department</h2>
          <div v-if="d.dept_breakdown?.length" class="space-y-2">
            <div v-for="dep in d.dept_breakdown" :key="dep.dept" class="flex items-center gap-2">
              <div class="flex-1 text-xs text-gray-300 truncate">{{ dep.dept }}</div>
              <div class="text-xs font-bold text-amber-400 w-6 text-right">{{ dep.cnt }}</div>
              <div class="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div class="h-full bg-amber-400 rounded-full"
                     :style="`width:${Math.round(dep.cnt / (d.employees?.active || 1) * 100)}%`"></div>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-xs">No department data.</p>
        </div>

        <!-- Upcoming leaves -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-white">Upcoming Leaves</h2>
            <NuxtLink to="/hr/leave-requests" class="text-xs text-amber-400 hover:underline">View all →</NuxtLink>
          </div>
          <div v-if="d.upcoming_leaves?.length" class="space-y-2">
            <div v-for="lv in d.upcoming_leaves" :key="lv.id"
                 class="text-xs py-1.5 border-b border-white/[0.04] last:border-0">
              <p class="text-gray-200 font-medium">{{ lv.first_name }} {{ lv.last_name }}</p>
              <p class="text-gray-500 mt-0.5">{{ lv.start_date }} → {{ lv.end_date }}
                <span class="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{{ lv.leave_type }}</span>
              </p>
            </div>
          </div>
          <p v-else class="text-gray-500 text-xs">No upcoming approved leaves.</p>
        </div>
      </div>
    </div>

    <!-- ── Payroll Trend ──────────────────────────────────────── -->
    <div v-if="payrollSummary.length" class="glass-card p-5">
      <h2 class="font-semibold text-white mb-4">Payroll — Last 6 Months</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th text-left">Month</th>
              <th class="th text-right">Employees</th>
              <th class="th text-right">Net Paid (৳)</th>
              <th class="th text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payrollSummary" :key="p.month + p.status" class="tr">
              <td class="td font-medium text-gray-200">{{ p.month }}</td>
              <td class="td text-right text-gray-400">{{ p.emp_count }}</td>
              <td class="td text-right text-amber-400 font-semibold">{{ Number(p.total_net).toLocaleString() }}</td>
              <td class="td text-center">
                <span :class="{
                  'badge-green':  p.status === 'paid',
                  'badge-blue':   p.status === 'approved',
                  'badge-yellow': p.status === 'pending_approval',
                  'badge-red':    p.status === 'rejected',
                }" class="text-xs capitalize">{{ p.status.replace('_', ' ') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Quick Access ───────────────────────────────────────── -->
    <div>
      <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h2>
      <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
        <NuxtLink v-for="link in quickLinks" :key="link.route" :to="link.route"
          class="glass-card-hover flex flex-col items-center gap-1.5 rounded-xl p-3 text-center group">
          <div class="text-xl">{{ link.icon }}</div>
          <span class="text-[11px] font-medium text-gray-400 group-hover:text-white leading-tight">{{ link.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, refresh } = await useFetch('/api/hr/dashboard')
const d = computed(() => (data.value as any) ?? {})

const todayLabel = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

// Show "Today" if attendance_date is today, otherwise show the actual date
const attendanceDateLabel = computed(() => {
  const ad = d.value?.attendance_date
  if (!ad) return ''
  const adStr = typeof ad === 'string' ? ad.slice(0, 10) : new Date(ad).toISOString().slice(0, 10)
  const todayStr = new Date().toISOString().slice(0, 10)
  if (adStr === todayStr) return 'Today'
  return new Date(adStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
})

// Deduplicate payroll trend rows (group by month, keep highest-value status)
const payrollSummary = computed(() => {
  const raw = (d.value?.payroll_trend ?? []) as any[]
  // Group by month and pick the dominant status row (most employees)
  const map = new Map<string, any>()
  for (const r of raw) {
    const existing = map.get(r.month)
    if (!existing || Number(r.emp_count) > Number(existing.emp_count)) {
      map.set(r.month, r)
    }
  }
  return Array.from(map.values()).slice(0, 6)
})

function statusBadge(s: string) {
  const m: Record<string, string> = {
    present:  'badge-green',
    absent:   'badge-red',
    late:     'badge-yellow',
    half_day: 'badge-yellow',
    leave:    'badge-blue',
    holiday:  'badge-blue',
  }
  return m[s] || 'badge-gray'
}

const quickLinks = [
  { label: 'Employees',      route: '/hr/employees',        icon: '👥' },
  { label: 'Attendance',     route: '/hr/attendance',       icon: '🕐' },
  { label: 'Leave',          route: '/hr/leave-requests',   icon: '📋' },
  { label: 'Salary',         route: '/hr/salary-structure', icon: '📊' },
  { label: 'Payroll',        route: '/hr/payroll',          icon: '💰' },
  { label: 'Loans',          route: '/hr/loans',            icon: '🏦' },
  { label: 'Advances',       route: '/hr/advances',         icon: '💸' },
  { label: 'Overtime',       route: '/hr/overtime',         icon: '⏱️' },
  { label: 'Bonuses',        route: '/hr/bonuses',          icon: '🎁' },
  { label: 'Holidays',       route: '/hr/holidays',         icon: '📅' },
  { label: 'Biometric',      route: '/hr/biometric',        icon: '🔒' },
  { label: 'Settings',       route: '/hr/settings',         icon: '⚙️' },
  { label: 'Kiosk',          route: '/kiosk',               icon: '🤖' },
  { label: 'Reports',        route: '/hr/reports',          icon: '📈' },
]
</script>
