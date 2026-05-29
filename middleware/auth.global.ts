// Global auth guard
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/auth')) return

  // Server-side: the session-bootstrap plugin has already populated the
  // useState('nuxt-session') state before this middleware runs.
  // Nothing to do here on server — just let the page render.
  if (import.meta.server) return

  // Client-side: check session composable.
  const { loggedIn, fetch: fetchSession } = useUserSession()

  // If loggedIn is false (SSR state not hydrated or stale), try one fresh fetch.
  if (!loggedIn.value) {
    await fetchSession()
  }

  if (!loggedIn.value) {
    return navigateTo('/auth/login', { replace: true })
  }
})
