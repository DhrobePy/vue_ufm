<template>
  <!-- Blank holding page shown during the permission check before redirect -->
  <div />
</template>

<script setup lang="ts">
/**
 * Root route redirect.
 *
 * Server-side: we don't have the permissions cache yet, so we return an
 * empty page and let the client handle it.
 *
 * Client-side: load the user's permission config and navigate to whichever
 * module they're actually allowed to see.  Admin/superadmin land on
 * /dashboard; restricted users land on their first enabled module (e.g. /pos).
 */
if (import.meta.client) {
  const perms = usePermissions()
  await perms.load()
  await navigateTo(perms.firstAllowedRoute(), { replace: true })
}
</script>
