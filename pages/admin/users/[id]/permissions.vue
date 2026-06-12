<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Permissions — ${user.name}`"
      :subtitle="user.role"
      :breadcrumb="['Admin', 'Users', user.name, 'Permissions']"
    >
      <template #actions>
        <button class="btn-ghost text-xs" @click="$router.back()">← Back</button>
        <button class="btn-gold text-xs" :disabled="saving || changesCount === 0" @click="save">
          <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ saving ? 'Saving…' : 'Save Permissions' }}
        </button>
      </template>
    </UiPageHeader>

    <!-- User info banner -->
    <div class="glass-card p-4 flex items-center gap-4">
      <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
           style="background:linear-gradient(135deg,var(--accent-from),var(--accent-to));color:var(--accent-text)">
        {{ user.name[0] ?? '?' }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-200">{{ user.name }}</p>
        <p class="text-xs text-gray-500">
          {{ user.email }} · Role:
          <span class="font-mono text-[11px]" style="color:var(--accent-from)">{{ user.role }}</span>
        </p>
      </div>
      <div class="text-xs text-gray-600 text-right">
        <p>Last Login</p>
        <p class="text-gray-400">{{ user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—' }}</p>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="loadError" class="glass-card p-4 border border-red-500/30 text-red-400 text-sm">
      ⚠️ {{ loadError }}
    </div>

    <!-- Global data scope -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-1">Global Data Scope</h2>
      <p class="text-xs text-gray-500 mb-4">Controls which records this user can see across all modules.</p>
      <div class="flex flex-wrap gap-5">
        <label v-for="s in scopes" :key="s.value"
          class="flex items-center gap-2.5 cursor-pointer group">
          <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
            globalScope === s.value
              ? 'border-amber-500 bg-amber-500/20'
              : 'border-white/20 group-hover:border-white/40']"
            @click="globalScope = s.value">
            <div v-if="globalScope === s.value" class="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-300">{{ s.label }}</p>
            <p class="text-[11px] text-gray-600">{{ s.desc }}</p>
          </div>
        </label>
      </div>
      <div v-if="globalScope === 'branch'" class="mt-4 flex flex-wrap gap-3">
        <label v-for="b in branches" :key="b.value"
          class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="allowedBranches" :value="b.value"
            class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" />
          <span class="text-sm text-gray-300">{{ b.label }}</span>
        </label>
      </div>
    </div>

    <!-- Quick actions bar -->
    <div class="flex items-center gap-3 px-1">
      <button class="btn-ghost text-xs" @click="enableAll">Enable All Modules</button>
      <button class="btn-ghost text-xs" @click="disableAll">Disable All</button>
      <button class="btn-ghost text-xs" @click="expandAll">Expand All</button>
      <button class="btn-ghost text-xs" @click="collapseAll">Collapse All</button>
      <span class="flex-1" />
      <span class="text-xs text-gray-600">
        {{ enabledCount }} / {{ moduleRegistry.length }} modules enabled
      </span>
    </div>

    <!-- Module permissions -->
    <div class="space-y-2">
      <div v-for="mod in moduleRegistry" :key="mod.key"
           class="glass-card overflow-hidden transition-opacity"
           :class="perms[mod.key]?.enabled ? '' : 'opacity-60'">

        <!-- Module header -->
        <div class="flex items-center gap-3 p-4 cursor-pointer select-none"
             :class="expanded[mod.key] && perms[mod.key]?.enabled ? 'border-b border-white/[0.05]' : ''"
             @click="toggleExpand(mod.key)">
          <div :class="['w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0',
            perms[mod.key]?.enabled
              ? 'bg-amber-500/10 border border-amber-500/20'
              : 'bg-white/[0.04] border border-white/[0.08]']">
            {{ mod.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-200">{{ mod.label }}</p>
            <p class="text-xs text-gray-600">{{ mod.pages.length }} pages · {{ countActions(mod) }} actions</p>
          </div>
          <!-- Pages/actions granted count -->
          <div v-if="perms[mod.key]?.enabled" class="text-[11px] text-gray-600 shrink-0 mr-2 hidden sm:block">
            {{ perms[mod.key]?.pages?.length ?? 0 }}/{{ mod.pages.length }} pages
          </div>
          <!-- Enable toggle (stop click propagation to not toggle expand) -->
          <button @click.stop="toggleModule(mod.key)"
            :class="['relative w-11 h-6 rounded-full transition-all duration-200 border shrink-0',
              perms[mod.key]?.enabled
                ? 'bg-amber-500/20 border-amber-500/40'
                : 'bg-white/[0.05] border-white/[0.08]']">
            <span :class="['absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200',
              perms[mod.key]?.enabled
                ? 'left-5 bg-amber-400'
                : 'left-0.5 bg-gray-600']" />
          </button>
          <!-- Expand chevron -->
          <svg class="w-4 h-4 text-gray-600 transition-transform duration-200 shrink-0"
               :class="expanded[mod.key] ? 'rotate-180' : ''"
               fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        <!-- Pages & actions (expandable) -->
        <Transition name="collapse">
          <div v-if="expanded[mod.key] && perms[mod.key]?.enabled"
               class="divide-y divide-white/[0.04]">

            <!-- Select-all row for this module -->
            <div class="px-4 py-2 flex items-center gap-3 bg-white/[0.02]">
              <input type="checkbox"
                :id="`mod-all-${mod.key}`"
                :checked="allPagesEnabled(mod)"
                :indeterminate="somePagesEnabled(mod) && !allPagesEnabled(mod)"
                @change="toggleAllPages(mod)"
                class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" />
              <label :for="`mod-all-${mod.key}`"
                class="text-xs text-gray-500 cursor-pointer select-none">
                Select all pages &amp; actions
              </label>
            </div>

            <div v-for="pg in mod.pages" :key="pg.key" class="p-4">
              <!-- Page row -->
              <div class="flex items-center gap-3 mb-2">
                <input type="checkbox"
                  :id="`pg-${mod.key}-${pg.key}`"
                  :checked="isPageAllowed(mod.key, pg.key)"
                  @change="togglePage(mod.key, pg.key)"
                  class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" />
                <label :for="`pg-${mod.key}-${pg.key}`"
                  class="text-sm font-medium text-gray-300 cursor-pointer select-none flex-1">
                  {{ pg.label }}
                </label>
                <span class="text-[10px] font-mono text-gray-700 shrink-0">/{{ pg.route }}</span>
              </div>
              <!-- Actions for this page -->
              <div v-if="pg.actions?.length && isPageAllowed(mod.key, pg.key)"
                class="ml-7 flex flex-wrap gap-x-4 gap-y-1.5">
                <label v-for="act in pg.actions" :key="act.key"
                  class="flex items-center gap-1.5 cursor-pointer group">
                  <input type="checkbox"
                    :checked="isActionAllowed(mod.key, pg.key, act.key)"
                    @change="toggleAction(mod.key, pg.key, act.key)"
                    class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" />
                  <span :class="['text-xs transition-colors',
                    isActionAllowed(mod.key, pg.key, act.key)
                      ? 'text-gray-400 group-hover:text-gray-300'
                      : 'text-gray-700 group-hover:text-gray-600']">
                    {{ act.label }}
                  </span>
                </label>
              </div>
              <!-- Hint when page disabled -->
              <div v-else-if="pg.actions?.length && !isPageAllowed(mod.key, pg.key)"
                class="ml-7 text-[11px] text-gray-700 italic">
                Enable page to configure actions
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Sticky save bar -->
    <div class="sticky bottom-4 flex justify-end pt-2">
      <div class="glass-card px-4 py-3 flex items-center gap-3 shadow-xl">
        <!-- Success flash -->
        <span v-if="saveSuccess" class="text-xs text-green-400 font-medium">✓ Saved successfully</span>
        <!-- Error -->
        <span v-else-if="saveError" class="text-xs text-red-400 max-w-xs truncate">⚠ {{ saveError }}</span>
        <!-- Dirty indicator -->
        <span v-else class="text-xs" :class="changesCount ? 'text-amber-400' : 'text-gray-500'">
          {{ changesCount ? 'Unsaved changes' : 'No unsaved changes' }}
        </span>
        <button class="btn-ghost text-xs" @click="reset" :disabled="saving || !changesCount">Reset</button>
        <button class="btn-gold text-xs" :disabled="saving || !changesCount" @click="save">
          <svg v-if="saving" class="w-3.5 h-3.5 animate-spin mr-1 inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ saving ? 'Saving…' : 'Save Permissions' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const userId = Number(route.params.id)

// ── Comprehensive module registry (mirrors AppSidebar.vue) ────────────────────
const moduleRegistry = [
  {
    key: 'dashboard', label: 'Dashboard', icon: '🏠',
    pages: [
      { key: 'main', label: 'Main Dashboard', route: 'dashboard',
        actions: [] },
    ],
  },
  {
    key: 'credit_sales', label: 'Credit Sales', icon: '📋',
    pages: [
      { key: 'dashboard', label: 'CS Dashboard',     route: 'credit-sales',
        actions: [] },
      { key: 'all',       label: 'All Sales',         route: 'credit-sales/all',
        actions: [
          { key: 'create',  label: 'Create Order' },
          { key: 'edit',    label: 'Edit Order' },
          { key: 'delete',  label: 'Delete Order' },
          { key: 'export',  label: 'Export CSV' },
          { key: 'print',   label: 'Print Invoice' },
        ] },
      { key: 'create',    label: 'Create Order Form', route: 'credit-sales/create',
        actions: [
          { key: 'submit',  label: 'Submit Order' },
        ] },
      { key: 'approve',   label: 'Approve Orders',    route: 'credit-sales/approve',
        actions: [
          { key: 'approve',  label: 'Approve' },
          { key: 'reject',   label: 'Reject' },
          { key: 'escalate', label: 'Escalate' },
        ] },
      { key: 'production', label: 'Production Queue', route: 'credit-sales/production',
        actions: [
          { key: 'mark_ready',    label: 'Mark Ready' },
          { key: 'set_priority',  label: 'Set Priority' },
        ] },
      { key: 'dispatch',  label: 'Dispatch Queue',    route: 'credit-sales/dispatch',
        actions: [
          { key: 'mark_dispatched', label: 'Mark Dispatched' },
        ] },
      { key: 'ledger',    label: 'Customer Ledger',   route: 'credit-sales/ledger',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
      { key: 'ageing',    label: 'Ageing Report',     route: 'credit-sales/ageing',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
    ],
  },
  {
    key: 'fleet', label: 'Fleet Management', icon: '🚛',
    pages: [
      { key: 'dashboard',   label: 'Fleet Dashboard',  route: 'fleet',
        actions: [] },
      { key: 'vehicles',    label: 'Vehicles',          route: 'fleet/vehicles',
        actions: [
          { key: 'create', label: 'Add Vehicle' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'drivers',     label: 'Drivers',           route: 'fleet/drivers',
        actions: [
          { key: 'create', label: 'Add Driver' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'trips',       label: 'Trips',             route: 'fleet/trips',
        actions: [
          { key: 'create',   label: 'Create Trip' },
          { key: 'complete', label: 'Mark Complete' },
          { key: 'edit',     label: 'Edit' },
        ] },
      { key: 'maintenance', label: 'Maintenance',       route: 'fleet/maintenance',
        actions: [
          { key: 'create', label: 'Log Maintenance' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'pm_rules',    label: 'PM Rules',          route: 'fleet/maintenance/rules',
        actions: [
          { key: 'create', label: 'Add Rule' },
          { key: 'edit',   label: 'Edit Rule' },
        ] },
      { key: 'fuel',        label: 'Fuel Logs',         route: 'fleet/fuel',
        actions: [
          { key: 'create', label: 'Log Fuel' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'fuel_report', label: 'Fuel Efficiency Report', route: 'fleet/fuel/efficiency',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
      { key: 'purchases',   label: 'Fleet Purchases',   route: 'fleet/purchases',
        actions: [
          { key: 'create', label: 'Create Purchase' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'items',       label: 'Fleet Items',       route: 'fleet/items',
        actions: [
          { key: 'create', label: 'Add Item' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'reports',     label: 'Fleet Reports',     route: 'fleet/reports',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
    ],
  },
  {
    key: 'purchase', label: 'Purchase', icon: '🛒',
    pages: [
      { key: 'dashboard',        label: 'Purchase Dashboard',  route: 'purchase',
        actions: [] },
      { key: 'orders',           label: 'All Purchase Orders', route: 'purchase/orders',
        actions: [
          { key: 'create',  label: 'Create PO' },
          { key: 'approve', label: 'Approve PO' },
          { key: 'cancel',  label: 'Cancel PO' },
          { key: 'print',   label: 'Print PO' },
          { key: 'export',  label: 'Export' },
        ] },
      { key: 'orders_create',    label: 'Create PO Form',      route: 'purchase/orders/create',
        actions: [
          { key: 'submit', label: 'Submit' },
        ] },
      { key: 'grn',              label: 'Goods Received (GRN)', route: 'purchase/grn',
        actions: [
          { key: 'create',  label: 'Create GRN' },
          { key: 'approve', label: 'Approve GRN' },
          { key: 'edit',    label: 'Edit GRN' },
        ] },
      { key: 'grn_variance',     label: 'GRN Variance Report', route: 'purchase/grn/variance',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
      { key: 'payments',         label: 'Purchase Payments',   route: 'purchase/payments',
        actions: [
          { key: 'create',  label: 'Record Payment' },
          { key: 'approve', label: 'Approve Payment' },
          { key: 'export',  label: 'Export' },
        ] },
      { key: 'adjustments',      label: 'Adjustment Notes',    route: 'purchase/adjustments',
        actions: [
          { key: 'create', label: 'Create Note' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'suppliers',        label: 'Suppliers',           route: 'purchase/suppliers',
        actions: [
          { key: 'create', label: 'Add Supplier' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'suppliers_summary', label: 'Supplier Summary',  route: 'purchase/suppliers/summary',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
    ],
  },
  {
    key: 'expenses', label: 'Expenses', icon: '💸',
    pages: [
      { key: 'dashboard', label: 'Expenses Dashboard', route: 'expenses',
        actions: [] },
      { key: 'create',    label: 'Create Expense',     route: 'expenses/create',
        actions: [
          { key: 'submit', label: 'Submit Expense' },
        ] },
      { key: 'history',   label: 'Expense History',    route: 'expenses/history',
        actions: [
          { key: 'export', label: 'Export' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'approve',   label: 'Approve Expenses',   route: 'expenses/approve',
        actions: [
          { key: 'approve', label: 'Approve' },
          { key: 'reject',  label: 'Reject' },
        ] },
      { key: 'categories', label: 'Expense Categories', route: 'expenses/categories',
        actions: [
          { key: 'create', label: 'Add Category' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
    ],
  },
  {
    key: 'bank', label: 'Bank', icon: '🏦',
    pages: [
      { key: 'dashboard',   label: 'Bank Dashboard',    route: 'bank',
        actions: [] },
      { key: 'transaction', label: 'New Transaction',   route: 'bank/transaction/create',
        actions: [
          { key: 'create',  label: 'Create Transaction' },
          { key: 'approve', label: 'Approve' },
        ] },
      { key: 'transfer',    label: 'Bank Transfer',     route: 'bank/transfer',
        actions: [
          { key: 'initiate', label: 'Initiate Transfer' },
          { key: 'approve',  label: 'Approve Transfer' },
        ] },
      { key: 'statement',   label: 'Bank Statement',    route: 'bank/statement',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
      { key: 'accounts',    label: 'Bank Accounts',     route: 'bank/accounts',
        actions: [
          { key: 'create', label: 'Add Account' },
          { key: 'edit',   label: 'Edit' },
        ] },
    ],
  },
  {
    key: 'accounts', label: 'Accounts (GL)', icon: '📊',
    pages: [
      { key: 'coa',           label: 'Chart of Accounts',   route: 'accounts/coa',
        actions: [
          { key: 'create', label: 'Add Account' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'journal_create', label: 'New Journal Entry',  route: 'accounts/journal/create',
        actions: [
          { key: 'post', label: 'Post Entry' },
        ] },
      { key: 'statement',     label: 'GL Statement',        route: 'accounts/statement',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
      { key: 'voucher',       label: 'Debit Voucher',       route: 'accounts/voucher',
        actions: [
          { key: 'create', label: 'Create Voucher' },
          { key: 'print',  label: 'Print' },
        ] },
      { key: 'daily_log',     label: 'Daily Log',           route: 'accounts/daily-log',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
    ],
  },
  {
    key: 'sales', label: 'Sales Reports', icon: '📈',
    pages: [
      { key: 'report', label: 'Sales Overview', route: 'sales',
        actions: [
          { key: 'export', label: 'Export' },
        ] },
    ],
  },
  {
    key: 'production', label: 'Production', icon: '🏭',
    pages: [
      { key: 'dashboard', label: 'Production Dashboard', route: 'production',
        actions: [
          { key: 'update_status', label: 'Update Status' },
        ] },
      { key: 'create',    label: 'New Batch',             route: 'production/create',
        actions: [
          { key: 'submit', label: 'Submit Batch' },
        ] },
    ],
  },
  {
    key: 'dispatch', label: 'Dispatch', icon: '📤',
    pages: [
      { key: 'queue', label: 'Dispatch Queue', route: 'dispatch',
        actions: [
          { key: 'mark_dispatched', label: 'Mark Dispatched' },
          { key: 'export',          label: 'Export' },
        ] },
    ],
  },
  {
    key: 'collector', label: 'Collector', icon: '💰',
    pages: [
      { key: 'collections', label: 'Collections', route: 'collector',
        actions: [
          { key: 'record',  label: 'Record Collection' },
          { key: 'approve', label: 'Approve' },
          { key: 'export',  label: 'Export' },
        ] },
    ],
  },
  {
    key: 'customers', label: 'Customers', icon: '👥',
    pages: [
      { key: 'list', label: 'Customer List', route: 'customers',
        actions: [
          { key: 'create',    label: 'Add Customer' },
          { key: 'edit',      label: 'Edit Customer' },
          { key: 'delete',    label: 'Delete' },
          { key: 'blacklist', label: 'Blacklist' },
          { key: 'export',    label: 'Export' },
        ] },
    ],
  },
  {
    key: 'products', label: 'Products', icon: '📦',
    pages: [
      { key: 'overview',       label: 'Products Overview',   route: 'products',
        actions: [] },
      { key: 'base',           label: 'Base Products',       route: 'products/base',
        actions: [
          { key: 'create', label: 'Add Product' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'variants',       label: 'Product Variants',    route: 'products/variants',
        actions: [
          { key: 'create', label: 'Add Variant' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'pricing',        label: 'Pricing',             route: 'products/pricing',
        actions: [
          { key: 'edit', label: 'Update Price' },
        ] },
      { key: 'pricing_engine', label: 'Pricing Engine',      route: 'products/pricing-engine',
        actions: [
          { key: 'configure', label: 'Configure Rules' },
        ] },
      { key: 'inventory',      label: 'Inventory',           route: 'products/inventory',
        actions: [
          { key: 'adjust', label: 'Adjust Stock' },
          { key: 'export', label: 'Export' },
        ] },
    ],
  },
  {
    key: 'pos', label: 'POS Terminal', icon: '🖥️',
    pages: [
      { key: 'terminal', label: 'POS Terminal', route: 'pos',
        actions: [
          { key: 'sale',     label: 'Complete Sale' },
          { key: 'discount', label: 'Apply Discount' },
          { key: 'refund',   label: 'Process Refund' },
          { key: 'hold',     label: 'Hold Order' },
          { key: 'reprint',  label: 'Reprint Receipt' },
        ] },
    ],
  },
  {
    key: 'admin', label: 'Admin', icon: '⚙️',
    pages: [
      { key: 'dashboard',  label: 'Admin Dashboard',   route: 'admin',
        actions: [] },
      { key: 'users',      label: 'User Management',   route: 'admin/users',
        actions: [
          { key: 'create',      label: 'Create User' },
          { key: 'edit',        label: 'Edit User' },
          { key: 'deactivate',  label: 'Deactivate User' },
          { key: 'delete',      label: 'Delete User' },
          { key: 'permissions', label: 'Set Permissions' },
        ] },
      { key: 'audit',      label: 'Audit Trail',       route: 'admin/audit',
        actions: [
          { key: 'export', label: 'Export Log' },
        ] },
      { key: 'settings',   label: 'Settings',          route: 'admin/settings',
        actions: [
          { key: 'edit', label: 'Edit Settings' },
        ] },
      { key: 'employees',  label: 'Employees (Admin)', route: 'admin/employees',
        actions: [
          { key: 'create', label: 'Add Employee' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
    ],
  },
  {
    key: 'hr', label: 'Human Resources', icon: '👤',
    pages: [
      { key: 'dashboard',       label: 'HR Dashboard',      route: 'hr',
        actions: [] },
      { key: 'employees',       label: 'HR Employees',       route: 'hr/employees',
        actions: [
          { key: 'create', label: 'Add Employee' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
          { key: 'export', label: 'Export' },
        ] },
      { key: 'attendance',      label: 'Attendance',         route: 'hr/attendance',
        actions: [
          { key: 'mark',   label: 'Mark Attendance' },
          { key: 'edit',   label: 'Edit Entry' },
          { key: 'export', label: 'Export' },
        ] },
      { key: 'leave_requests',  label: 'Leave Requests',     route: 'hr/leave-requests',
        actions: [
          { key: 'apply',   label: 'Apply Leave' },
          { key: 'approve', label: 'Approve' },
          { key: 'reject',  label: 'Reject' },
        ] },
      { key: 'salary_structure', label: 'Salary Structure',  route: 'hr/salary-structure',
        actions: [
          { key: 'create', label: 'Create Structure' },
          { key: 'edit',   label: 'Edit' },
        ] },
      { key: 'payroll',         label: 'Payroll',            route: 'hr/payroll',
        actions: [
          { key: 'run',     label: 'Run Payroll' },
          { key: 'approve', label: 'Approve' },
          { key: 'export',  label: 'Export Payslips' },
        ] },
      { key: 'advances',        label: 'Advances',           route: 'hr/advances',
        actions: [
          { key: 'create',  label: 'Issue Advance' },
          { key: 'approve', label: 'Approve' },
          { key: 'reject',  label: 'Reject' },
        ] },
      { key: 'loans',           label: 'Loans',              route: 'hr/loans',
        actions: [
          { key: 'create',  label: 'Create Loan' },
          { key: 'approve', label: 'Approve' },
          { key: 'reject',  label: 'Reject' },
        ] },
      { key: 'overtime',        label: 'Overtime',           route: 'hr/overtime',
        actions: [
          { key: 'record',  label: 'Record Overtime' },
          { key: 'approve', label: 'Approve' },
        ] },
      { key: 'bonuses',         label: 'Bonuses',            route: 'hr/bonuses',
        actions: [
          { key: 'create',  label: 'Create Bonus' },
          { key: 'approve', label: 'Approve' },
        ] },
      { key: 'holidays',        label: 'Holidays',           route: 'hr/holidays',
        actions: [
          { key: 'create', label: 'Add Holiday' },
          { key: 'edit',   label: 'Edit' },
          { key: 'delete', label: 'Delete' },
        ] },
      { key: 'biometric',       label: 'Biometric',          route: 'hr/biometric',
        actions: [
          { key: 'sync',   label: 'Sync Device' },
          { key: 'export', label: 'Export Log' },
        ] },
    ],
  },
] as const

type ModuleKey = typeof moduleRegistry[number]['key']

// ── Scope options ─────────────────────────────────────────────────────────────
const scopes = [
  { value: 'all',    label: 'All Data',    desc: 'Access records from all branches' },
  { value: 'branch', label: 'Branch Only', desc: 'Restricted to selected branches below' },
  { value: 'own',    label: 'Own Only',    desc: 'Only records created by this user' },
] as const

const branches = [
  { value: 'srg',   label: 'Sirajgonj' },
  { value: 'demra', label: 'Demra' },
  { value: 'dhaka', label: 'Dhaka' },
]

// ── State ─────────────────────────────────────────────────────────────────────
const globalScope      = ref<'all' | 'branch' | 'own'>('branch')
const allowedBranches  = ref<string[]>(['srg'])
const loadError        = ref('')

type ModPerm = { enabled: boolean; pages: string[]; actions: Record<string, Record<string, boolean>> }
const perms    = ref<Record<string, ModPerm>>({})
const expanded = ref<Record<string, boolean>>({})

const user = ref({
  id:        userId,
  name:      '…',
  email:     '—',
  role:      '—',
  lastLogin: null as string | null,
})

// ── Load from API ─────────────────────────────────────────────────────────────
function buildDefaultPerms(): Record<string, ModPerm> {
  const out: Record<string, ModPerm> = {}
  for (const mod of moduleRegistry) {
    out[mod.key] = { enabled: false, pages: [], actions: {} }
    expanded.value[mod.key] = false
  }
  return out
}

function mergePerms(saved: Record<string, any>): Record<string, ModPerm> {
  const out = buildDefaultPerms()
  for (const mod of moduleRegistry) {
    const s = saved[mod.key]
    if (!s) continue
    out[mod.key] = {
      enabled: Boolean(s.enabled),
      pages:   Array.isArray(s.pages)   ? s.pages   : [],
      actions: typeof s.actions === 'object' && s.actions ? s.actions : {},
    }
  }
  return out
}

const { data, error } = await useFetch<any>(`/api/admin/users/${userId}/permissions`)

if (error.value) {
  loadError.value = error.value?.statusMessage ?? 'Failed to load permissions'
  perms.value = buildDefaultPerms()
} else if (data.value) {
  const d = data.value
  user.value = {
    id:        d.user?.id        ?? userId,
    name:      d.user?.name      ?? '—',
    email:     d.user?.email     ?? '—',
    role:      d.user?.role      ?? '—',
    lastLogin: d.user?.last_login ?? null,
  }
  globalScope.value     = d.data_scope       ?? 'branch'
  allowedBranches.value = d.allowed_branches ?? ['srg']
  perms.value = mergePerms(d.permissions ?? {})
}

// ── Change detection — deep watcher (JSON.stringify on reactive proxy is unreliable) ──
const isDirty = ref(false)
const changesCount = computed(() => isDirty.value ? 1 : 0)

// Start watching AFTER mount + nextTick so initial data load doesn't trigger dirty
onMounted(() => {
  nextTick(() => {
    watch(globalScope,      () => { isDirty.value = true })
    watch(allowedBranches,  () => { isDirty.value = true }, { deep: true })
    watch(perms,            () => { isDirty.value = true }, { deep: true })
  })
})

const enabledCount = computed(() =>
  moduleRegistry.filter(m => perms.value[m.key]?.enabled).length
)

function isPageAllowed(mod: string, pg: string) {
  return perms.value[mod]?.pages.includes(pg) ?? false
}
function isActionAllowed(mod: string, pg: string, act: string) {
  return perms.value[mod]?.actions[pg]?.[act] ?? false
}
function countActions(mod: typeof moduleRegistry[number]) {
  return mod.pages.reduce((s, p) => s + (p.actions?.length ?? 0), 0)
}

function allPagesEnabled(mod: typeof moduleRegistry[number]) {
  return mod.pages.every(p => isPageAllowed(mod.key, p.key))
}
function somePagesEnabled(mod: typeof moduleRegistry[number]) {
  return mod.pages.some(p => isPageAllowed(mod.key, p.key))
}
function toggleAllPages(mod: typeof moduleRegistry[number]) {
  if (allPagesEnabled(mod)) {
    // disable all
    perms.value[mod.key].pages = []
    perms.value[mod.key].actions = {}
  } else {
    // enable all pages + all actions
    perms.value[mod.key].pages = mod.pages.map(p => p.key)
    const acts: Record<string, Record<string, boolean>> = {}
    for (const pg of mod.pages) {
      if (pg.actions?.length) {
        acts[pg.key] = {}
        for (const a of pg.actions) acts[pg.key][a.key] = true
      }
    }
    perms.value[mod.key].actions = acts
  }
}

function toggleModule(key: string) {
  if (!perms.value[key]) return
  perms.value[key].enabled = !perms.value[key].enabled
  if (perms.value[key].enabled) expanded.value[key] = true
}
function toggleExpand(key: string) {
  expanded.value[key] = !expanded.value[key]
}
function togglePage(mod: string, pg: string) {
  const arr = perms.value[mod].pages
  const idx = arr.indexOf(pg)
  if (idx >= 0) {
    arr.splice(idx, 1)
    // also clear actions for this page
    delete perms.value[mod].actions[pg]
  } else {
    arr.push(pg)
    // Default: enabling a page grants all its actions; admin unticks what to deny
    const def = moduleRegistry.find(m => m.key === mod)?.pages.find(p => p.key === pg)
    if (def?.actions?.length) {
      perms.value[mod].actions[pg] = {}
      for (const a of def.actions) perms.value[mod].actions[pg][a.key] = true
    }
  }
}
function toggleAction(mod: string, pg: string, act: string) {
  if (!perms.value[mod].actions[pg]) perms.value[mod].actions[pg] = {}
  perms.value[mod].actions[pg][act] = !perms.value[mod].actions[pg][act]
}

function enableAll() {
  for (const mod of moduleRegistry) {
    perms.value[mod.key].enabled = true
  }
}
function disableAll() {
  for (const mod of moduleRegistry) {
    perms.value[mod.key].enabled = false
  }
}
function expandAll() {
  for (const mod of moduleRegistry) expanded.value[mod.key] = true
}
function collapseAll() {
  for (const mod of moduleRegistry) expanded.value[mod.key] = false
}

function reset() {
  if (data.value) {
    globalScope.value     = data.value.data_scope       ?? 'branch'
    allowedBranches.value = data.value.allowed_branches ?? ['srg']
    perms.value = mergePerms(data.value.permissions ?? {})
  } else {
    globalScope.value = 'branch'
    allowedBranches.value = ['srg']
    perms.value = buildDefaultPerms()
  }
  nextTick(() => { isDirty.value = false })
}

// ── Save ──────────────────────────────────────────────────────────────────────
const saving      = ref(false)
const saveError   = ref('')
const saveSuccess = ref(false)

async function save() {
  if (saving.value) return
  saving.value  = true
  saveError.value   = ''
  saveSuccess.value = false
  try {
    await $fetch(`/api/admin/users/${userId}/permissions`, {
      method: 'PUT',
      body: {
        data_scope:       globalScope.value,
        allowed_branches: allowedBranches.value,
        permissions:      perms.value,
      },
    })
    isDirty.value     = false
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage ?? e?.message ?? 'Save failed — check console'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active { transition: all .25s ease; overflow: hidden; }
.collapse-enter-from,
.collapse-leave-to  { opacity: 0; max-height: 0; }
.collapse-enter-to,
.collapse-leave-from { opacity: 1; max-height: 4000px; }
</style>
