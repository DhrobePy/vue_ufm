<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out',
      // Desktop: collapsed or expanded
      collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
      // Mobile: always full width drawer, hidden off-screen unless open
      'w-[260px]',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    style="background: linear-gradient(180deg, var(--sidebar-from) 0%, var(--sidebar-to) 100%); border-right: 1px solid rgb(var(--tint)/0.07);"
  >

    <!-- Accent top glow line -->
    <div class="absolute top-0 left-0 right-0 h-[2px]"
         style="background: linear-gradient(90deg, transparent, var(--accent-from), transparent);" />

    <!-- Ambient sidebar glow -->
    <div class="absolute top-0 left-0 w-full h-64 pointer-events-none"
         style="background: radial-gradient(ellipse at top left, rgba(var(--accent-glow),0.06) 0%, transparent 70%);" />

    <!-- ── Logo / Brand ─────────────────────────────── -->
    <div class="relative flex items-center h-16 px-4 shrink-0"
         :class="collapsed ? 'justify-center' : 'justify-between'">
      <div class="flex items-center gap-3 overflow-hidden">
        <!-- Logo mark -->
        <div class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center animate-glow-pulse"
             :style="`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); box-shadow: 0 0 16px rgba(var(--accent-glow),0.4)`">
          <span class="font-display font-bold text-base leading-none" :style="`color: var(--accent-text)`">U</span>
        </div>

        <Transition name="label-fade">
          <div v-if="!collapsed" class="flex flex-col">
            <span class="font-display font-bold text-sm text-white leading-tight tracking-tight">Ujjal FMC</span>
            <span class="text-[10px] font-medium uppercase tracking-widest leading-tight" :style="`color: var(--accent-from); opacity: 0.8`">ERP System</span>
          </div>
        </Transition>
      </div>

      <!-- Collapse toggle -->
      <button
        v-if="!collapsed"
        @click="$emit('toggle')"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150 shrink-0"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
    </div>

    <!-- Divider -->
    <div class="mx-4 h-px bg-white/[0.06]" />

    <!-- ── Navigation ────────────────────────────────── -->
    <nav class="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">

      <!-- Dashboard -->
      <SidebarNavItem
        v-if="perms.canAccessModule('dashboard')"
        label="Dashboard"
        route="/dashboard"
        :collapsed="collapsed"
        icon-type="dashboard"
      />

      <!-- Operations section ─────────────────────────── -->
      <div v-if="showOperations" class="py-1">
        <div v-if="!collapsed" class="px-3 mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">Operations</span>
        </div>
        <div v-else class="mx-auto w-6 h-px bg-white/[0.06] my-2" />
      </div>

      <!-- Credit Sales -->
      <SidebarGroup v-if="perms.canAccessModule('credit_sales')" label="Credit Sales" route="/credit-sales" :collapsed="collapsed" icon-type="sales" color="blue">
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales')" label="Dashboard"         route="/credit-sales"              :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/all')" label="All Sales"         route="/credit-sales/all"          :collapsed="collapsed" icon-type="list"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/create')" label="Create Order"      route="/credit-sales/create"       :collapsed="collapsed" icon-type="plus"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/approve')" label="Approve Orders"    route="/credit-sales/approve"      :collapsed="collapsed" icon-type="check"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/production')" label="Production Queue"  route="/credit-sales/production"   :collapsed="collapsed" icon-type="factory"   sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/dispatch')" label="Dispatch Queue"    route="/credit-sales/dispatch"     :collapsed="collapsed" icon-type="truck"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/ledger')" label="Customer Ledger"   route="/credit-sales/ledger"       :collapsed="collapsed" icon-type="book"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/payment-watch')" label="Payment Watch"     route="/credit-sales/payment-watch" :collapsed="collapsed" icon-type="check"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/collect')" label="Collect Payment"   route="/credit-sales/collect"      :collapsed="collapsed" icon-type="money"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/credit-sales/ageing')" label="Ageing Report"     route="/credit-sales/ageing"       :collapsed="collapsed" icon-type="chart"     sub />
      </SidebarGroup>

      <!-- Fleet Management -->
      <SidebarGroup v-if="perms.canAccessModule('fleet')" label="Fleet" route="/fleet" :collapsed="collapsed" icon-type="truck" color="teal">
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet')" label="Dashboard"    route="/fleet"                       :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/vehicles')" label="Vehicles"     route="/fleet/vehicles"              :collapsed="collapsed" icon-type="truck"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/drivers')" label="Drivers"      route="/fleet/drivers"               :collapsed="collapsed" icon-type="users"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/trips')" label="Trips"        route="/fleet/trips"                 :collapsed="collapsed" icon-type="list"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/maintenance')" label="Maintenance"  route="/fleet/maintenance"           :collapsed="collapsed" icon-type="cog"       sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/maintenance/rules')" label="PM Rules"     route="/fleet/maintenance/rules"     :collapsed="collapsed" icon-type="check"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/fuel')" label="Fuel Logs"    route="/fleet/fuel"                  :collapsed="collapsed" icon-type="receipt"   sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/fuel/efficiency')" label="Fuel Report"  route="/fleet/fuel/efficiency"       :collapsed="collapsed" icon-type="chart"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/purchases')" label="Purchases"    route="/fleet/purchases"             :collapsed="collapsed" icon-type="cart"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/items')" label="Items"        route="/fleet/items"                 :collapsed="collapsed" icon-type="box"       sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/fleet/reports')" label="Reports"      route="/fleet/reports"               :collapsed="collapsed" icon-type="chart"     sub />
      </SidebarGroup>

      <!-- Purchase -->
      <SidebarGroup v-if="perms.canAccessModule('purchase')" label="Purchase" route="/purchase" :collapsed="collapsed" icon-type="cart" color="orange">
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase')" label="Dashboard"       route="/purchase"                   :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/orders')" label="All POs"         route="/purchase/orders"            :collapsed="collapsed" icon-type="file"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/orders/create')" label="Create PO"       route="/purchase/orders/create"     :collapsed="collapsed" icon-type="plus"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/grn')" label="Goods Received"  route="/purchase/grn"               :collapsed="collapsed" icon-type="check"     sub />
        <SidebarNavItem v-if="isAdminUser" label="Variance Report" route="/purchase/grn/variance" :collapsed="collapsed" icon-type="chart" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/payments')" label="Payments"        route="/purchase/payments"          :collapsed="collapsed" icon-type="money"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/adjustments')" label="Adj. Notes"      route="/purchase/adjustments"       :collapsed="collapsed" icon-type="file"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/suppliers')" label="Suppliers"       route="/purchase/suppliers"         :collapsed="collapsed" icon-type="users"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/purchase/suppliers/summary')" label="Supplier Summary" route="/purchase/suppliers/summary" :collapsed="collapsed" icon-type="chart"   sub />
      </SidebarGroup>

      <!-- Finance section ────────────────────────────── -->
      <div v-if="showFinance" class="py-1">
        <div v-if="!collapsed" class="px-3 mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">Finance</span>
        </div>
        <div v-else class="mx-auto w-6 h-px bg-white/[0.06] my-2" />
      </div>

      <!-- Expenses -->
      <SidebarGroup v-if="perms.canAccessModule('expenses')" label="Expenses" route="/expenses" :collapsed="collapsed" icon-type="receipt" color="yellow">
        <SidebarNavItem v-if="perms.canAccessRoute('/expenses')" label="Dashboard"      route="/expenses"            :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/expenses/create')" label="Create Expense" route="/expenses/create"     :collapsed="collapsed" icon-type="plus"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/expenses/history')" label="History"        route="/expenses/history"    :collapsed="collapsed" icon-type="clock"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/expenses/approve')" label="Approve"        route="/expenses/approve"    :collapsed="collapsed" icon-type="check"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/expenses/categories')" label="Categories"     route="/expenses/categories" :collapsed="collapsed" icon-type="tag"       sub />
      </SidebarGroup>

      <!-- Bank -->
      <SidebarGroup v-if="perms.canAccessModule('bank')" label="Bank" route="/bank" :collapsed="collapsed" icon-type="bank" color="indigo">
        <SidebarNavItem v-if="perms.canAccessRoute('/bank')" label="Dashboard"       route="/bank"                       :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/bank/transaction/create')" label="New Transaction" route="/bank/transaction/create"    :collapsed="collapsed" icon-type="plus"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/bank/transfer')" label="Transfer"        route="/bank/transfer"              :collapsed="collapsed" icon-type="arrows"    sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/bank/statement')" label="Statement"       route="/bank/statement"             :collapsed="collapsed" icon-type="file"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/bank/accounts')" label="Accounts"        route="/bank/accounts"              :collapsed="collapsed" icon-type="bank"      sub />
      </SidebarGroup>

      <!-- Accounts -->
      <SidebarGroup v-if="perms.canAccessModule('accounts')" label="Accounts" route="/accounts" :collapsed="collapsed" icon-type="book" color="teal">
        <SidebarNavItem v-if="perms.canAccessRoute('/accounts/coa')" label="Chart of Accounts" route="/accounts/coa"            :collapsed="collapsed" icon-type="chart"    sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/accounts/journal/create')" label="New Transaction"   route="/accounts/journal/create" :collapsed="collapsed" icon-type="plus"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/accounts/statement')" label="Statement"         route="/accounts/statement"      :collapsed="collapsed" icon-type="file"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/accounts/voucher')" label="Debit Voucher"     route="/accounts/voucher"        :collapsed="collapsed" icon-type="receipt"  sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/accounts/daily-log')" label="Daily Log"         route="/accounts/daily-log"      :collapsed="collapsed" icon-type="clock"    sub />
      </SidebarGroup>

      <!-- Standalone Modules section ─────────────────── -->
      <div v-if="showStandalone" class="py-1">
        <div v-if="!collapsed" class="px-3 mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">Standalone Modules</span>
        </div>
        <div v-else class="mx-auto w-6 h-px bg-white/[0.06] my-2" />
      </div>

      <!-- Sales Reports -->
      <SidebarNavItem v-if="perms.canAccessModule('sales')"      label="Sales"      route="/sales"      :collapsed="collapsed" icon-type="chart"   />
      <!-- Production -->
      <SidebarGroup v-if="perms.canAccessModule('production')" label="Production" route="/production" :collapsed="collapsed" icon-type="factory" color="teal">
        <SidebarNavItem v-if="perms.canAccessRoute('/production')" label="Dashboard" route="/production"        :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/production/create')" label="New Batch" route="/production/create" :collapsed="collapsed" icon-type="plus"      sub />
      </SidebarGroup>
      <!-- Dispatch -->
      <SidebarNavItem v-if="perms.canAccessModule('dispatch')"   label="Dispatch"   route="/dispatch"   :collapsed="collapsed" icon-type="truck"   />
      <!-- Collector -->
      <SidebarNavItem v-if="perms.canAccessModule('collector')"  label="Collector"  route="/collector"  :collapsed="collapsed" icon-type="money"   />

      <!-- More section ────────────────────────────────── -->
      <div v-if="showMore" class="py-1">
        <div v-if="!collapsed" class="px-3 mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">More</span>
        </div>
        <div v-else class="mx-auto w-6 h-px bg-white/[0.06] my-2" />
      </div>

      <!-- Customers -->
      <SidebarNavItem v-if="perms.canAccessModule('customers')" label="Customers"  route="/customers"  :collapsed="collapsed" icon-type="users"    />
      <!-- Products -->
      <SidebarNavItem v-if="perms.canAccessModule('products')" label="Products" route="/products" :collapsed="collapsed" icon-type="box" />
      <!-- POS -->
      <SidebarNavItem v-if="perms.canAccessModule('pos')"   label="POS"   route="/pos"   :collapsed="collapsed" icon-type="register" />
      <!-- Admin -->
      <SidebarNavItem v-if="perms.canAccessModule('admin')" label="Admin" route="/admin" :collapsed="collapsed" icon-type="cog"      />

      <!-- Human Resources section ─────────────────────── -->
      <div v-if="showHR" class="py-1">
        <div v-if="!collapsed" class="px-3 mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">Human Resources</span>
        </div>
        <div v-else class="mx-auto w-6 h-px bg-white/[0.06] my-2" />
      </div>

      <!-- HR Module -->
      <SidebarGroup v-if="perms.canAccessModule('hr')" label="HR" route="/hr" :collapsed="collapsed" icon-type="users" color="teal">
        <SidebarNavItem v-if="perms.canAccessRoute('/hr')" label="Dashboard"        route="/hr"                    :collapsed="collapsed" icon-type="dashboard" sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/employees')" label="Employees"        route="/hr/employees"          :collapsed="collapsed" icon-type="users"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/attendance')" label="Attendance"       route="/hr/attendance"         :collapsed="collapsed" icon-type="clock"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/leave-requests')" label="Leave Requests"   route="/hr/leave-requests"     :collapsed="collapsed" icon-type="file"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/salary-structure')" label="Salary Structure" route="/hr/salary-structure"   :collapsed="collapsed" icon-type="chart"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/payroll')" label="Payroll"          route="/hr/payroll"            :collapsed="collapsed" icon-type="money"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/advances')" label="Advances"         route="/hr/advances"           :collapsed="collapsed" icon-type="receipt"   sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/loans')" label="Loans"            route="/hr/loans"              :collapsed="collapsed" icon-type="bank"      sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/overtime')" label="Overtime"         route="/hr/overtime"           :collapsed="collapsed" icon-type="clock"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/bonuses')" label="Bonuses"          route="/hr/bonuses"            :collapsed="collapsed" icon-type="money"     sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/holidays')" label="Holidays"         route="/hr/holidays"           :collapsed="collapsed" icon-type="calendar"  sub />
        <SidebarNavItem v-if="perms.canAccessRoute('/hr/biometric')" label="Biometric"        route="/hr/biometric"          :collapsed="collapsed" icon-type="clock"     sub />
      </SidebarGroup>

    </nav>

    <!-- ── User footer ───────────────────────────────── -->
    <div class="shrink-0 mx-2 mb-3">
      <div class="h-px bg-white/[0.06] mb-3" />
      <div
        :class="[
          'flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer',
          'transition-all duration-150 hover:bg-white/[0.06] group',
          collapsed ? 'justify-center' : '',
        ]"
      >
        <!-- Avatar -->
        <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
             :style="`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); color: var(--accent-text)`">
          {{ initials }}
        </div>
        <Transition name="label-fade">
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-200 truncate leading-tight">{{ sessionUser?.name || 'User' }}</p>
            <p class="text-[11px] text-gray-500 truncate leading-tight font-mono">{{ sessionUser?.role || '' }}</p>
          </div>
        </Transition>
        <Transition name="label-fade">
          <button v-if="!collapsed"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
            </svg>
          </button>
        </Transition>
      </div>

      <!-- Collapse toggle when collapsed -->
      <button
        v-if="collapsed"
        @click="$emit('toggle')"
        class="mt-1 w-full h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean; mobileOpen?: boolean }>()
defineEmits(['toggle', 'close-mobile'])

const { user: sessionUser } = useUserSession()
const initials = computed(() => {
  const name = sessionUser.value?.name || 'U'
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})
const isAdminUser = computed(() =>
  ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase())
)

// Permissions —————————————————————————————————————————
const perms = usePermissions()
// Self-load on mount: on a hard page load (e.g. right after login) the route
// middleware may not have populated the cache yet — without this the sidebar
// renders empty for non-admin users until their next client-side navigation.
onMounted(() => { perms.load() })

// Section-level visibility (hide section header when all children are hidden)
const showOperations = computed(() =>
  perms.canAccessModule('credit_sales') ||
  perms.canAccessModule('fleet') ||
  perms.canAccessModule('purchase'),
)
const showFinance = computed(() =>
  perms.canAccessModule('expenses') ||
  perms.canAccessModule('bank') ||
  perms.canAccessModule('accounts'),
)
const showStandalone = computed(() =>
  perms.canAccessModule('sales') ||
  perms.canAccessModule('production') ||
  perms.canAccessModule('dispatch') ||
  perms.canAccessModule('collector'),
)
const showMore = computed(() =>
  perms.canAccessModule('customers') ||
  perms.canAccessModule('products') ||
  perms.canAccessModule('pos') ||
  perms.canAccessModule('admin'),
)
const showHR = computed(() => perms.canAccessModule('hr'))
</script>

<style scoped>
.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
