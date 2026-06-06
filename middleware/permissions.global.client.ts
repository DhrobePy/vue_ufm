/**
 * permissions.client.ts — client-side route guard
 *
 * Runs on every client-side navigation.  Loads the user's permissions
 * once (cached in useState), then blocks access to any module the user
 * is not allowed to visit.
 *
 * Admin / Superadmin users always pass through without an API call.
 * Unauthenticated users are not redirected here — the auth middleware
 * (or server-side route rules) handles that separately.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // ── 1. Skip public / auth routes ──────────────────────────────────────────
  const SKIP_PREFIXES = ['/login', '/auth', '/kiosk', '/_nuxt', '/api']
  if (SKIP_PREFIXES.some(p => to.path.startsWith(p))) return

  // ── 2. Skip if not logged in (auth middleware handles redirect) ───────────
  const { user } = useUserSession()
  if (!user.value) return

  // ── 3. Admins / Superadmins always pass through ───────────────────────────
  const role = (user.value.role ?? '').toLowerCase()
  if (['admin', 'superadmin'].includes(role)) return

  // ── 4. Load permissions (no-op if already cached) ────────────────────────
  const perms = usePermissions()
  await perms.load()

  // ── 5. Root path → redirect to first allowed module ───────────────────────
  if (to.path === '/' || to.path === '') {
    return navigateTo(perms.firstAllowedRoute(), { replace: true })
  }

  // ── 6. Resolve the module key for this path ───────────────────────────────
  const moduleKey = perms.moduleFromPath(to.path)

  // Path maps to no known module → allow (404 page will handle it)
  if (!moduleKey) return

  // ── 7. Block if module is not enabled ─────────────────────────────────────
  if (!perms.canAccessModule(moduleKey)) {
    const fallback = perms.firstAllowedRoute()
    // Avoid infinite redirect if fallback is the same path
    if (fallback === to.path) return
    return navigateTo(fallback, { replace: true })
  }
})
