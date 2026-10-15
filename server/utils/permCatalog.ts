/**
 * Central role → default access matrix (single source for role defaults).
 *
 * A user with a `user_permissions` row uses that row (per-user override).
 * A user WITHOUT a row gets the preset for their role below — so nobody is
 * locked out just because an admin never opened their Permissions screen.
 *
 * Shape matches the stored row: { module: { enabled, pages[], actions{} } }.
 * Empty `pages` = module-level grant (every page). `actions` follow the
 * "unlisted action = allowed" rule used everywhere (see permissions.ts), so
 * only the actions a role must NOT have are listed, as `false`.
 *
 * Source of truth for the page lists: legacy-operations-guide.md (access maps).
 * Page keys MUST match moduleRegistry in pages/admin/users/[id]/permissions.vue.
 */
export type ModulePerm = { enabled: boolean; pages: string[]; actions: Record<string, Record<string, boolean>> }
export type PermMap = Record<string, ModulePerm>

const on = (pages: string[] = [], actions: ModulePerm['actions'] = {}): ModulePerm => ({ enabled: true, pages, actions })

// Dangerous actions that a non-admin page grant must not imply by default.
const NO_ADMIN_EDITS = { edit: false, delete: false, cancel: false, telegram: false }

const CS_COMMON = ['dashboard', 'all']

const PRESETS: Record<string, PermMap> = {
  // Accounts family: approvals, collection, ledger, credit limits, Payment Watch, returns
  'accounts': {
    dashboard: on(['main']),
    credit_sales: on([...CS_COMMON, 'create', 'approve', 'payment-watch', 'approval-requests', 'over-deliveries',
      'collect', 'payments', 'amendments', 'ledger', 'ageing', 'credit-limits', 'delivery-schedule'], { all: { ...NO_ADMIN_EDITS } }),
    customers: on(['list']),
    collector: on(['collections']),
    sales: on(['report']),
    products: on(['overview']),
  },
  'sales-group': {
    dashboard: on(['main']),
    credit_sales: on([...CS_COMMON, 'create', 'ledger', 'amendments'],
      { all: { ...NO_ADMIN_EDITS, collect_payment: false, record_delivery: false } }),
    customers: on(['list']),
    products: on(['overview']),
  },
  'production-group': {
    dashboard: on(['main']),
    credit_sales: on([...CS_COMMON, 'production', 'over-deliveries', 'amendments', 'delivery-schedule'],
      { all: { ...NO_ADMIN_EDITS, collect_payment: false } }),
    production: on(),
    products: on(['overview', 'base', 'variants', 'inventory']),
  },
  'dispatch-group': {
    dashboard: on(['main']),
    credit_sales: on([...CS_COMMON, 'dispatch', 'over-deliveries'],
      { all: { ...NO_ADMIN_EDITS, collect_payment: false } }),
    dispatch: on(),
    products: on(['inventory']),
  },
  'accountspos-group': {
    credit_sales: on(['ledger']),
    customers: on(['list']),
  },
  'collector': {
    credit_sales: on(['collect', 'payments', 'ledger', 'approval-requests']),
    collector: on(['collections']),
    customers: on(['list']),
  },
  'transport manager': { dashboard: on(['main']), fleet: on() },
  'expense initiator': { dashboard: on(['main']), expenses: on(['dashboard', 'create', 'history']) },
  'expense approver': { dashboard: on(['main']), expenses: on(['dashboard', 'history', 'approve']) },
  'bank transaction initiator': { dashboard: on(['main']), bank: on(['dashboard', 'transaction', 'statement']) },
  'bank transaction approver': { dashboard: on(['main']), bank: on(['dashboard', 'statement', 'reconciliation']) },
  'staff': { dashboard: on(['main']) },
}

/** Role string (any case) → preset key, or null when the role has no default. */
function presetKey(role: string): string | null {
  const r = role.trim().toLowerCase()
  if (r === 'accounts' || r.startsWith('accounts-')) return 'accounts'
  if (r.startsWith('accountspos-')) return 'accountspos-group'
  if (r.startsWith('sales-')) return 'sales-group'
  if (r.startsWith('production manager')) return 'production-group'
  if (r.startsWith('dispatch')) return 'dispatch-group'
  return r in PRESETS ? r : null
}

/** Default permissions for a role (deep-copied — callers may mutate). Empty map = no access. */
export function presetPermissions(role: string): PermMap {
  const k = presetKey(role)
  return k ? JSON.parse(JSON.stringify(PRESETS[k])) : {}
}

/** Branch scope implied by the role suffix (-srg / -demra); plain roles see everything. */
export function presetBranches(role: string): string[] {
  const m = role.trim().toLowerCase().match(/-(srg|demra)$/)
  return m?.[1] ? [m[1]] : []
}
