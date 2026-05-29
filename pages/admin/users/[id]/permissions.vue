<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Permissions — ${user.name}`"
      :subtitle="user.role"
      :breadcrumb="['Admin', 'Users', user.name, 'Permissions']"
    >
      <template #actions>
        <button class="btn-ghost text-xs" @click="$router.back()">← Back</button>
        <button class="btn-gold text-xs" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          {{ saving ? 'Saving…' : 'Save Permissions' }}
        </button>
      </template>
    </UiPageHeader>

    <!-- User info banner -->
    <div class="glass-card p-4 flex items-center gap-4">
      <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
           style="background:linear-gradient(135deg,#f59e0b,#d97706)">{{ user.name[0] }}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-200">{{ user.name }}</p>
        <p class="text-xs text-gray-500">{{ user.email }} · Role: <span class="text-gold-400 font-mono text-[11px]">{{ user.role }}</span></p>
      </div>
      <div class="text-xs text-gray-600 text-right">
        <p>Last Login</p>
        <p class="text-gray-400">{{ user.lastLogin }}</p>
      </div>
    </div>

    <!-- Global data scope -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Global Data Scope</h2>
      <p class="text-xs text-gray-500 mb-3">Controls which records this user can view across all modules.</p>
      <div class="flex flex-wrap gap-3">
        <label v-for="s in scopes" :key="s.value"
          class="flex items-center gap-2.5 cursor-pointer group">
          <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
            globalScope === s.value
              ? 'border-gold-500 bg-gold-500/20'
              : 'border-white/20 group-hover:border-white/40']"
            @click="globalScope = s.value">
            <div v-if="globalScope === s.value" class="w-2 h-2 rounded-full bg-gold-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-300">{{ s.label }}</p>
            <p class="text-[11px] text-gray-600">{{ s.desc }}</p>
          </div>
        </label>
      </div>
      <div v-if="globalScope === 'branch'" class="mt-4 flex flex-wrap gap-2">
        <label v-for="b in branches" :key="b.value"
          class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="allowedBranches" :value="b.value"
            class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" />
          <span class="text-sm text-gray-300">{{ b.label }}</span>
        </label>
      </div>
    </div>

    <!-- Module permissions -->
    <div class="space-y-3">
      <div v-for="mod in moduleRegistry" :key="mod.key" class="glass-card overflow-hidden">
        <!-- Module header -->
        <div class="flex items-center gap-3 p-4 border-b border-white/[0.05]"
             :class="perms[mod.key]?.enabled ? '' : 'opacity-60'">
          <div :class="['w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0',
            perms[mod.key]?.enabled ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-white/[0.04] border border-white/[0.08]']">
            {{ mod.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-200">{{ mod.label }}</p>
            <p class="text-xs text-gray-600">{{ mod.pages.length }} pages · {{ countActions(mod) }} actions</p>
          </div>
          <!-- Enable toggle -->
          <button @click="toggleModule(mod.key)"
            :class="['relative w-11 h-6 rounded-full transition-all duration-200 border shrink-0',
              perms[mod.key]?.enabled
                ? 'bg-gold-500/20 border-gold-500/40'
                : 'bg-white/[0.05] border-white/[0.08]']">
            <span :class="['absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center',
              perms[mod.key]?.enabled
                ? 'left-5 bg-gold-400 shadow-gold-sm'
                : 'left-0.5 bg-gray-600']" />
          </button>
          <!-- Expand -->
          <button @click="toggleExpand(mod.key)"
            :class="['text-gray-600 hover:text-gray-300 transition-all duration-200 ml-1',
              expanded[mod.key] ? 'rotate-180' : '']">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <!-- Pages & actions (expandable) -->
        <Transition name="collapse">
          <div v-if="expanded[mod.key] && perms[mod.key]?.enabled" class="divide-y divide-white/[0.04]">
            <div v-for="pg in mod.pages" :key="pg.key" class="p-4">
              <div class="flex items-center gap-3 mb-3">
                <!-- Page enable checkbox -->
                <input type="checkbox"
                  :id="`pg-${mod.key}-${pg.key}`"
                  :checked="isPageAllowed(mod.key, pg.key)"
                  @change="togglePage(mod.key, pg.key)"
                  class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" />
                <label :for="`pg-${mod.key}-${pg.key}`"
                  class="text-sm font-medium text-gray-300 cursor-pointer select-none">{{ pg.label }}</label>
                <span class="text-[10px] font-mono text-gray-700 ml-1">/{{ pg.route }}</span>
              </div>
              <!-- Actions -->
              <div v-if="pg.actions?.length && isPageAllowed(mod.key, pg.key)"
                class="ml-7 flex flex-wrap gap-2">
                <label v-for="act in pg.actions" :key="act.key"
                  class="flex items-center gap-1.5 cursor-pointer group">
                  <input type="checkbox"
                    :checked="isActionAllowed(mod.key, pg.key, act.key)"
                    @change="toggleAction(mod.key, pg.key, act.key)"
                    class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-500" />
                  <span :class="['text-xs transition-colors',
                    isActionAllowed(mod.key, pg.key, act.key)
                      ? 'text-gray-400 group-hover:text-gray-300'
                      : 'text-gray-700 group-hover:text-gray-600']">
                    {{ act.label }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Save bar -->
    <div class="sticky bottom-4 flex justify-end">
      <div class="glass-card px-4 py-3 flex items-center gap-3">
        <span class="text-xs text-gray-500">{{ changesCount }} unsaved change{{ changesCount !== 1 ? 's' : '' }}</span>
        <button class="btn-ghost text-xs" @click="reset">Reset</button>
        <button class="btn-gold text-xs" :disabled="saving || changesCount === 0" @click="save">
          Save Permissions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()

// ── Load user from API ────────────────────────────────────────────────────────
const userId  = Number(route.params.id)
const { data: userData } = await useFetch(`/api/admin/users/${userId}`)
const user = computed(() => {
  const u = (userData.value as any)
  return {
    id:        userId,
    name:      u?.display_name ?? '—',
    email:     u?.email        ?? '—',
    role:      u?.role         ?? '—',
    lastLogin: u?.last_login   ?? '—',
  }
})

// ── Module registry (mirrors PHP getModuleRegistry()) ────────────────────────
const moduleRegistry = [
  {
    key: 'credit_orders', label: 'Credit Sales', icon: '📋',
    pages: [
      { key: 'list',           label: 'All Orders',        route: 'credit-sales/all',
        actions: [{ key:'export', label:'Export CSV' }, { key:'create', label:'Create Order' }] },
      { key: 'order_status',   label: 'Track Orders',      route: 'credit-sales',         actions: [] },
      { key: 'approve',        label: 'Approve Orders',    route: 'credit-sales/approve',
        actions: [{ key:'approve', label:'Approve' }, { key:'reject', label:'Reject' }, { key:'escalate', label:'Escalate' }] },
      { key: 'production',     label: 'Production Queue',  route: 'credit-sales/production',
        actions: [{ key:'mark_ready', label:'Mark Ready' }] },
      { key: 'dispatch',       label: 'Dispatch',          route: 'credit-sales/dispatch',
        actions: [{ key:'dispatch', label:'Mark Dispatched' }] },
      { key: 'ledger',         label: 'Customer Ledger',   route: 'credit-sales/ledger',  actions: [] },
      { key: 'ageing',         label: 'Ageing Report',     route: 'credit-sales/ageing',  actions: [] },
    ],
  },
  {
    key: 'purchase', label: 'Purchase', icon: '🛒',
    pages: [
      { key: 'orders',    label: 'Purchase Orders',   route: 'purchase/orders',
        actions: [{ key:'create', label:'Create PO' }, { key:'approve', label:'Approve' }, { key:'cancel', label:'Cancel' }] },
      { key: 'grn',       label: 'GRN',               route: 'purchase/grn',
        actions: [{ key:'create', label:'Create GRN' }, { key:'approve', label:'Approve GRN' }] },
      { key: 'suppliers', label: 'Suppliers',         route: 'purchase/suppliers',
        actions: [{ key:'create', label:'Add Supplier' }, { key:'edit', label:'Edit' }] },
      { key: 'payments',  label: 'Purchase Payments', route: 'purchase/payments',
        actions: [{ key:'create', label:'Record Payment' }] },
    ],
  },
  {
    key: 'expenses', label: 'Expenses', icon: '💸',
    pages: [
      { key: 'list',    label: 'All Expenses',  route: 'expenses',
        actions: [{ key:'create', label:'Create' }, { key:'export', label:'Export' }] },
      { key: 'approve', label: 'Approve',       route: 'expenses/approve',
        actions: [{ key:'approve', label:'Approve' }, { key:'reject', label:'Reject' }] },
    ],
  },
  {
    key: 'bank', label: 'Bank', icon: '🏦',
    pages: [
      { key: 'accounts',     label: 'Accounts Overview', route: 'bank',
        actions: [] },
      { key: 'transactions', label: 'Transactions',      route: 'bank/transactions',
        actions: [{ key:'initiate', label:'Initiate' }, { key:'approve', label:'Approve' }] },
    ],
  },
  {
    key: 'accounts', label: 'Accounts', icon: '📊',
    pages: [
      { key: 'dashboard', label: 'Accounts Dashboard', route: 'accounts', actions: [] },
    ],
  },
  {
    key: 'customers', label: 'Customers', icon: '👥',
    pages: [
      { key: 'list',   label: 'Customer List', route: 'customers',
        actions: [{ key:'create', label:'Add Customer' }, { key:'edit', label:'Edit' }, { key:'blacklist', label:'Blacklist' }] },
    ],
  },
  {
    key: 'products', label: 'Products', icon: '📦',
    pages: [
      { key: 'list', label: 'Product List', route: 'products',
        actions: [{ key:'create', label:'Add Product' }, { key:'edit', label:'Edit' }, { key:'price_update', label:'Update Price' }] },
    ],
  },
  {
    key: 'logistics', label: 'Logistics', icon: '🚛',
    pages: [
      { key: 'vehicles', label: 'Vehicles',  route: 'logistics/vehicles',
        actions: [{ key:'create', label:'Add Vehicle' }, { key:'edit', label:'Edit' }] },
      { key: 'drivers',  label: 'Drivers',   route: 'logistics/drivers',
        actions: [{ key:'create', label:'Add Driver' }, { key:'edit', label:'Edit' }] },
      { key: 'trips',    label: 'Trips',     route: 'logistics/trips',
        actions: [{ key:'create', label:'Create Trip' }, { key:'complete', label:'Mark Complete' }] },
    ],
  },
  {
    key: 'pos', label: 'POS Terminal', icon: '🖥️',
    pages: [
      { key: 'terminal', label: 'POS Terminal', route: 'pos',
        actions: [{ key:'sale', label:'Complete Sale' }, { key:'discount', label:'Apply Discount' }, { key:'refund', label:'Process Refund' }] },
    ],
  },
  {
    key: 'sales', label: 'Sales Reports', icon: '📈',
    pages: [
      { key: 'report', label: 'Sales Report', route: 'sales', actions: [{ key:'export', label:'Export' }] },
    ],
  },
  {
    key: 'production', label: 'Production', icon: '🏭',
    pages: [
      { key: 'floor', label: 'Production Floor', route: 'production',
        actions: [{ key:'update', label:'Update Status' }] },
    ],
  },
  {
    key: 'dispatch', label: 'Dispatch', icon: '📤',
    pages: [
      { key: 'queue', label: 'Dispatch Queue', route: 'dispatch',
        actions: [{ key:'dispatch', label:'Mark Dispatched' }] },
    ],
  },
  {
    key: 'collector', label: 'Collector', icon: '💰',
    pages: [
      { key: 'collections', label: 'Collections', route: 'collector',
        actions: [{ key:'record', label:'Record Collection' }] },
    ],
  },
  {
    key: 'admin', label: 'Admin', icon: '⚙️',
    pages: [
      { key: 'users',     label: 'User Management', route: 'admin/users',
        actions: [{ key:'create', label:'Create User' }, { key:'edit', label:'Edit User' }, { key:'deactivate', label:'Deactivate' }, { key:'permissions', label:'Set Permissions' }] },
      { key: 'audit',     label: 'Audit Trail',     route: 'admin/audit',   actions: [{ key:'export', label:'Export' }] },
      { key: 'settings',  label: 'Settings',        route: 'admin/settings', actions: [] },
      { key: 'employees', label: 'Employees',       route: 'admin/employees',
        actions: [{ key:'create', label:'Add Employee' }, { key:'edit', label:'Edit' }] },
    ],
  },
]

// ── Scope options ─────────────────────────────────────────────────────────────
const scopes = [
  { value: 'all',    label: 'All Data',    desc: 'Access records from all branches' },
  { value: 'branch', label: 'Branch Only', desc: 'Restricted to selected branches' },
  { value: 'own',    label: 'Own Only',    desc: 'Only records created by this user' },
]
const branches = [
  { value: 'srg',   label: 'Sirajgonj' },
  { value: 'demra', label: 'Demra' },
]

// ── State ─────────────────────────────────────────────────────────────────────
const globalScope    = ref<'all' | 'branch' | 'own'>('branch')
const allowedBranches = ref<string[]>(['srg'])

// perms[module_key] = { enabled: bool, pages: string[], actions: {page_key: {action_key: bool}} }
type ModPerm = { enabled: boolean; pages: string[]; actions: Record<string, Record<string, boolean>> }
const perms = ref<Record<string, ModPerm>>({})
const expanded = ref<Record<string, boolean>>({})

// Initialise from mock "loaded" permissions
function initPerms() {
  for (const mod of moduleRegistry) {
    perms.value[mod.key] = {
      enabled: ['credit_orders', 'customers', 'pos'].includes(mod.key),
      pages: mod.key === 'credit_orders'
        ? ['list', 'order_status', 'ledger', 'ageing']
        : mod.key === 'customers' ? ['list']
        : mod.key === 'pos' ? ['terminal']
        : [],
      actions: {},
    }
    expanded.value[mod.key] = false
  }
  // pre-open first active module
  expanded.value['credit_orders'] = true
}
initPerms()
const original = ref(JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value }))

// ── Helpers ───────────────────────────────────────────────────────────────────
function isPageAllowed(mod: string, pg: string) {
  return perms.value[mod]?.pages.includes(pg) ?? false
}
function isActionAllowed(mod: string, pg: string, act: string) {
  return perms.value[mod]?.actions[pg]?.[act] ?? false
}
function countActions(mod: typeof moduleRegistry[0]) {
  return mod.pages.reduce((s, p) => s + (p.actions?.length ?? 0), 0)
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
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(pg)
}
function toggleAction(mod: string, pg: string, act: string) {
  if (!perms.value[mod].actions[pg]) perms.value[mod].actions[pg] = {}
  perms.value[mod].actions[pg][act] = !perms.value[mod].actions[pg][act]
}

const changesCount = computed(() => {
  const curr = JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value })
  return curr === original.value ? 0 : 1
})

function reset() {
  initPerms()
  globalScope.value = 'branch'
  allowedBranches.value = ['srg']
  original.value = JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value })
}

const saving = ref(false)
async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800))
  original.value = JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value })
  saving.value = false
}
</script>

<style scoped>
.collapse-enter-active, .collapse-leave-active { transition: all .25s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 2000px; }
</style>
