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
   * Fine-grained action check.
   * E.g. canDo('credit_sales', 'all_sales', 'create')
   */
  function canDo(module: string, page: string, action: string): boolean {
    if (sessionIsAdmin.value) return true
    if (!state.value.loaded) return false
    if (state.value.isAdmin) return true
    const mod = state.value.permissions[module]
    if (!mod?.enabled) return false
    const pg = mod.pages?.[page]
    if (!pg?.enabled) return false
    return pg.actions?.[action] === true
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
   * Returns the first route the user is allowed to visit.
   * Used to redirect after a blocked navigation attempt.
   */
  function firstAllowedRoute(): string {
    if (sessionIsAdmin.value || state.value.isAdmin) return '/dashboard'
    for (const [key, route] of Object.entries(MODULE_ROUTES)) {
      if (canAccessModule(key)) return route
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
    canDo,
    moduleFromPath,
    firstAllowedRoute,
  }
}
