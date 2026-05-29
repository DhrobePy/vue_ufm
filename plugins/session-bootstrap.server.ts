/**
 * Server-side session bootstrap plugin.
 *
 * Problem: nuxt-auth-utils' built-in session.server.js plugin calls
 * useRequestFetch() → internal GET /api/_auth/session, but in Nuxt 3.13
 * that internal fetch doesn't always forward the Cookie header, so the
 * session decryption sees no cookie and returns {}. On the client,
 * loggedIn stays false → the auth middleware redirects to /login.
 *
 * Fix: run AFTER the built-in plugin (enforce:'post'), manually forward
 * the Cookie header via $fetch, and overwrite the session state if we get
 * a valid user back.
 */
export default defineNuxtPlugin({
  name: 'session-bootstrap',
  enforce: 'post',
  async setup () {
    const event = useRequestEvent()
    if (!event) return

    const cookieHeader = event.headers.get('cookie')
    if (!cookieHeader) return

    try {
      const data = await $fetch<{ user?: Record<string, unknown> }>(
        '/api/_auth/session',
        {
          headers: { cookie: cookieHeader },
          retry: false,
        }
      )

      if (data?.user) {
        // Overwrite what the built-in plugin may have set to {}
        useState('nuxt-session', () => ({} as Record<string, unknown>)).value = data
        useState('nuxt-auth-ready', () => false).value = true
      }
    } catch {
      // Cookie absent or invalid — leave session state as-is (empty)
    }
  },
})
