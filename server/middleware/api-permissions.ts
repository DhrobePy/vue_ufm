/**
 * Server middleware: API-level permission enforcement.
 *
 * Runs on every request.  For non-admin users, any request to a
 * module-specific API path is blocked (403) unless the user has that
 * module enabled in their user_permissions row.
 *
 * This is the authoritative security layer — client-side guards
 * (sidebar v-if, route middleware) are just UX conveniences and CANNOT
 * be relied on for security.
 */
import { getCachedPerms, setCachedPerms } from '~/server/utils/permCache'
import { getDb } from '~/server/utils/db'

// Paths that are always accessible regardless of permissions
const FREE_PREFIXES = [
  '/api/auth/',
  '/api/me/',
  '/api/kiosk/',
  '/api/device/',
  '/api/verify/',   // Public QR delivery scan endpoints — no auth required
  '/_nuxt/',
  '/__nuxt',
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

  // 2. Always allow free paths (auth, me, kiosk, etc.)
  if (FREE_PREFIXES.some(p => path.startsWith(p))) return

  // 3. Require a valid session
  const session = await getUserSession(event)
  if (!session?.user?.id) return // 401 is the individual endpoint's job

  const role = (session.user.role ?? '').toLowerCase()

  // 4. Admin / Superadmin bypass everything
  if (['admin', 'superadmin'].includes(role)) return

  // 5. Settings READS are app-wide config (invoice T&C, delivery toggles, …)
  //    — any authenticated user may fetch them. Writes still require admin.
  if (path.startsWith('/api/settings') && event.method === 'GET') return

  // 6. Find which module(s) this path requires
  const entry = PATH_MODULE_MAP.find(e => path.startsWith(e.prefix))
  if (!entry) return // Unknown path — let the endpoint handle it

  // 6. Fetch (or use cached) permissions for this user
  const userId = session.user.id as number | string
  let permissions = getCachedPerms(userId)

  if (permissions === null) {
    // Cache miss — query DB
    try {
      const db  = getDb()
      const conn = await db.getConnection()
      try {
        const [[row]] = await conn.query<any>(
          'SELECT permissions FROM user_permissions WHERE user_id = ?',
          [userId],
        )
        permissions = {}
        if (row?.permissions) {
          try { permissions = JSON.parse(row.permissions) } catch { /* keep empty */ }
        }
      } finally {
        conn.release()
      }
    } catch {
      // DB error — fail closed (deny)
      permissions = {}
    }
    setCachedPerms(userId, permissions)
  }

  // 7. Check if any of the required modules are enabled
  const hasAccess = entry.modules.some(m => permissions![m]?.enabled === true)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: `Access denied — module '${entry.modules[0]}' is not enabled for your account`,
    })
  }
})
