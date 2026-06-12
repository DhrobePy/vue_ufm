<template>
  <!-- Holding page — only visible for the instant before redirect on edge cases -->
  <div />
</template>

<script setup lang="ts">
/**
 * Root route redirect — resolved SERVER-SIDE so the browser gets a 302
 * straight to the right page (no blank holding page, dashboard arrives
 * fully server-rendered).
 *
 * Admin/superadmin → /dashboard.
 * Restricted users → first page their permission whitelist allows.
 * useFetch forwards the session cookie during SSR, so this works on the
 * initial request right after login.
 */
const { user } = useUserSession()
const role = ((user.value as any)?.role ?? '').toLowerCase()

if (['admin', 'superadmin'].includes(role)) {
  await navigateTo('/dashboard', { replace: true })
} else if (user.value) {
  const { data } = await useFetch<any>('/api/me/permissions')
  const permissions = data.value?.permissions ?? {}

  let target = '/pos' // fallback when nothing is configured
  if (data.value?.isAdmin) {
    target = '/dashboard'
  } else {
    for (const [route, entry] of Object.entries(PERM_ROUTES)) {
      const mod = permissions[entry.module]
      if (!mod?.enabled) continue
      // Empty page list = full-module grant; otherwise the list is a whitelist
      if (!Array.isArray(mod.pages) || mod.pages.length === 0 || mod.pages.includes(entry.page)) {
        target = route
        break
      }
    }
  }
  await navigateTo(target, { replace: true })
}
// Not logged in → auth middleware redirects to /auth/login
</script>
