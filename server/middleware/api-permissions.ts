/**
 * Server middleware: API-level permission enforcement.
 *
 * Runs on every request.  No session → 401 (except the PUBLIC_PREFIXES list).
 * Non-admin users are blocked (403) from a module's API paths unless the
 * module is enabled for them (own user_permissions row, else role preset).
 *
 * This is the authoritative security layer — client-side guards
 * (sidebar v-if, route middleware) are just UX conveniences and CANNOT
 * be relied on for security.
 */
import { resolvePermissions } from '~/server/utils/permissions'
import { getAppSettings } from '~/server/utils/appSettings'

// Paths reachable WITHOUT a login. Everything else under /api/ needs a session.
// (cron endpoints check their own secret; kiosk/device are the face-clock and biometric
// machines; verify is the delivery QR scan; /api/branches GET feeds the kiosk branch picker.)
const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/_',         // nuxt-auth-utils session endpoint, nuxt icon, etc.
  '/api/kiosk/',
  '/api/device/',
  '/api/verify/',
  '/api/cron/',
]

/**
 * Map from URL prefix → required module key(s).
 * If the user has ANY of the listed module keys enabled, access is granted.
 * Order matters — longest/most-specific prefixes first.
 */
const PATH_MODULE_MAP: Array<{ prefix: string; modules: string[] }> = [
  { prefix: '/api/credit-sales',  modules: ['credit_sales'] },
  { prefix: '/api/fleet',         modules: ['fleet'] },
  { prefix: '/api/purchase',      modules: ['purchase'] },
  { prefix: '/api/suppliers',     modules: ['purchase'] },
  { prefix: '/api/expenses',      modules: ['expenses'] },
  { prefix: '/api/bank',          modules: ['bank'] },
  { prefix: '/api/accounts',      modules: ['accounts'] },
  { prefix: '/api/sales',         modules: ['sales'] },
  { prefix: '/api/production',    modules: ['production'] },
  { prefix: '/api/collector',     modules: ['collector'] },
  { prefix: '/api/logistics',     modules: ['dispatch'] },
  { prefix: '/api/pos',           modules: ['pos'] },
  { prefix: '/api/hr',            modules: ['hr'] },
  { prefix: '/api/admin',         modules: ['admin'] },
  { prefix: '/api/settings',      modules: ['admin'] },   // GETs exempted below — config reads are needed app-wide
  // NOTE: /api/notifications intentionally unmapped — endpoint scopes to the
  // logged-in user; the bell must work for every role.
  { prefix: '/api/dashboard',     modules: ['dashboard'] },
  // Shared resources — accessible if the user has any module that legitimately needs them
  { prefix: '/api/customers', modules: ['credit_sales', 'pos', 'collector', 'customers'] },
  { prefix: '/api/products',  modules: ['credit_sales', 'pos', 'purchase', 'production', 'products'] },
]

export default defineEventHandler(async (event) => {
  const path = event.path ?? ''

  // 1. Only guard /api/* paths
  if (!path.startsWith('/api/')) return

  // 2. Public paths
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return
  if (path.split('?')[0] === '/api/branches' && event.method === 'GET') return

  // 3. Everything else needs a valid session — secure by default
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Settings → Security → Session timeout: sign-in older than N minutes must log in again (0 = off; older sessions without a stamp are left alone).
  const timeoutMin = Number((await getAppSettings()).security_policy.sessionTimeout) || 0
  const signedInAt = Number((session as any).loggedInAt ?? 0)
  if (timeoutMin > 0 && signedInAt && Date.now() - signedInAt > timeoutMin * 60_000) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Session expired — please sign in again' })
  }

  const role = (session.user.role ?? '').toLowerCase()

  // 4. Admin / Superadmin bypass everything
  if (['admin', 'superadmin'].includes(role)) return

  // 5. Own-profile endpoints, and settings READS (app-wide config: invoice T&C, delivery toggles…)
  if (path.startsWith('/api/me/')) return
  if (path.startsWith('/api/settings') && event.method === 'GET') return

  // 6. Find which module(s) this path requires
  const entry = PATH_MODULE_MAP.find(e => path.startsWith(e.prefix))
  if (!entry) return // Unknown path — let the endpoint handle it

  // 6. Own row, else the role preset (shared resolver, cached 3 min)
  const permissions = await resolvePermissions(session.user.id as number | string, role)

  // 7. Check if any of the required modules are enabled
  const hasAccess = entry.modules.some(m => permissions[m]?.enabled === true)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: `Access denied — module '${entry.modules[0]}' is not enabled for your account`,
    })
  }
})
