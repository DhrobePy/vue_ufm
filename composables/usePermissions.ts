/**
 * usePermissions — client-side permission cache & helpers
 *
 * Fetches /api/me/permissions once per session (or when user changes),
 * then exposes helpers used by AppSidebar and the route middleware.
 *
 * Admin/Superadmin users always get full access without hitting the DB.
 */

interface PermsState {
  loaded: boolean
  isAdmin: boolean
  data_scope: string
  allowed_branches: string[]
  permissions: Record<string, any>
  userId: string | number | null
}

// Module key → first route to navigate to
const MODULE_ROUTES: Record<string, string> = {
  dashboard:    '/dashboard',
  credit_sales: '/credit-sales',
  fleet:        '/fleet',
  purchase:     '/purchase',
  expenses:     '/expenses',
  bank:         '/bank',
  accounts:     '/accounts',
  sales:        '/sales',
  production:   '/production',
  dispatch:     '/dispatch',
  collector:    '/collector',
  customers:    '/customers',
  products:     '/products',
  pos:          '/pos',
  admin:        '/admin',
  hr:           '/hr',
}

// URL first-segment → module key
const ROUTE_MODULE_MAP: Record<string, string> = {
  dashboard:    'dashboard',
  'credit-sales': 'credit_sales',
  fleet:        'fleet',
  purchase:     'purchase',
  expenses:     'expenses',
  bank:         'bank',
  accounts:     'accounts',
  sales:        'sales',
  production:   'production',
  dispatch:     'dispatch',
  collector:    'collector',
  customers:    'customers',
  products:     'products',
  pos:          'pos',
  admin:        'admin',
  hr:           'hr',
}

const DEFAULT_STATE = (): PermsState => ({
  loaded:           false,
  isAdmin:          false,
  data_scope:       'branch',
  allowed_branches: [],
  permissions:      {},
  userId:           null,
})

export const usePermissions = () => {
  const { user } = useUserSession()

  // useState gives SSR-safe shared state across all component instances
  const state = useState<PermsState>('user-perms', DEFAULT_STATE)

  /**
   * Fast-path: check session role directly so admin users see the full sidebar
   * before the API responds (avoids a flash of empty nav).
   */
  const sessionIsAdmin = computed(() =>
    ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()),
  )

  /** Load permissions from the API. Skips if already loaded for this user. */
  async function load(force = false): Promise<void> {
    const uid = user.value?.id ?? null

    // Cache hit — skip unless forced or user changed
    if (!force && state.value.loaded && state.value.userId === uid) return

    try {
      const data = await $fetch<{
        isAdmin:          boolean
        permissions:      Record<string, any>
        data_scope:       string
        allowed_branches: string[]
      }>('/api/me/permissions')

      state.value = {
        loaded:           true,
        isAdmin:          data.isAdmin,
        data_scope:       data.data_scope,
        allowed_branches: data.allowed_branches ?? [],
        permissions:      data.permissions ?? {},
        userId:           uid,
      }
    } catch {
      // Network/server error — default to no-access so we don't leak data
      state.value = { ...DEFAULT_STATE(), loaded: true, userId: uid }
    }
  }

  /** Clear cached permissions (call on logout) */
  function clear(): void {
    state.value = DEFAULT_STATE()
  }

  /**
   * Returns true if the user can see/access a given module.
   * Uses the session role as a fast-path so admins never flash empty sidebar.
   */
  function canAccessModule(key: string): boolean {
    if (sessionIsAdmin.value) return true
    if (!state.value.loaded) return false
    if (state.value.isAdmin) return true
    const mod = state.value.permissions[key]
    if (!mod) return false
    return mod.enabled === true
  }

  /**
   * Page-level check (matches the stored shape from the admin editor:
   * { enabled, pages: string[], actions: { pageKey: { actionKey: bool } } }).
   *
   * Back-compat rule: a module enabled with an EMPTY pages list is a
   * module-level grant — every page (and action) in it is allowed. As soon
   * as the admin selects specific pages, the list becomes a whitelist.
   */
  function canAccessPage(module: string, page: string): boolean {
    if (sessionIsAdmin.value) return true
    if (!state.value.loaded) return false
    if (state.value.isAdmin) return true
    const mod = state.value.permissions[module]
    if (!mod?.enabled) return false
    if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true // module-level grant
    return mod.pages.includes(page)
  }

  /**
   * Fine-grained action check.
   * E.g. canDo('credit_sales', 'all', 'create')
   *
   * Back-compat: when the page is already whitelisted but this specific
   * action key is absent from the saved JSON, default to ALLOWED rather
   * than denied. A page grant historically meant "all its actions" — an
   * action key added to the registry after a user's profile was last
   * saved would otherwise silently vanish for them with no way to notice,
   * even though nothing about their actual entitlement changed. Only an
   * action the admin explicitly unchecked (stored as `false`) is denied.
   */
  function canDo(module: string, page: string, action: string): boolean {
    if (sessionIsAdmin.value) return true
    if (!state.value.loaded) return false
    if (state.value.isAdmin) return true
    const mod = state.value.permissions[module]
    if (!mod?.enabled) return false
    // Module-level grant (no page whitelist) → all actions allowed
    if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true
    if (!mod.pages.includes(page)) return false
    const pageActions = mod.actions?.[page]
    if (!pageActions || !(action in pageActions)) return true // never configured — default allow
    return pageActions[action] === true
  }

  /**
   * Route-based page check used by the sidebar and the route guard.
   * '/credit-sales/create' → canAccessPage('credit_sales', 'create').
   * Unknown routes fall back to the module-level check.
   */
  function canAccessRoute(path: string): boolean {
    if (sessionIsAdmin.value) return true
    const entry = permRouteFor(path)
    if (entry) return canAccessPage(entry.module, entry.page)
    const mod = moduleFromPath(path)
    return mod ? canAccessModule(mod) : true
  }

  /**
   * Resolve the module key from a route path.
   * '/credit-sales/create' → 'credit_sales'
   */
  function moduleFromPath(path: string): string | null {
    const segment = path.replace(/^\//, '').split('/')[0]
    return ROUTE_MODULE_MAP[segment] ?? null
  }

  /**
   * Returns the first route the user is allowed to visit — page-aware:
   * a user granted only credit_sales pages ['all','ledger'] lands on
   * /credit-sales/all, not the module root they may not have access to.
   */
  function firstAllowedRoute(): string {
    if (sessionIsAdmin.value || state.value.isAdmin) return '/dashboard'
    for (const [route, entry] of Object.entries(PERM_ROUTES)) {
      if (canAccessModule(entry.module) && canAccessPage(entry.module, entry.page)) return route
    }
    // Nothing configured — send to POS as safest fallback
    return '/pos'
  }

  return {
    state:            readonly(state),
    sessionIsAdmin,
    load,
    clear,
    canAccessModule,
    canAccessPage,
    canAccessRoute,
    canDo,
    moduleFromPath,
    firstAllowedRoute,
  }
}
