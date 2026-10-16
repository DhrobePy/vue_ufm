// Switched-off modules (utils/features.ts) are unreachable by URL for everyone, admins included.
export default defineNuxtRouteMiddleware((to) => {
  if (routeDisabled(to.path)) return navigateTo('/dashboard', { replace: true })
})
