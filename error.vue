<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-[#0a0b0d] text-gray-200">
    <div class="max-w-md w-full text-center space-y-5">
      <p class="text-6xl font-bold text-gold-500">{{ code }}</p>
      <h1 class="text-xl font-semibold">{{ copy.title }}</h1>
      <p class="text-sm text-gray-400 leading-relaxed">{{ copy.body }}</p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button class="btn-gold justify-center" @click="goHome">Go to my home page</button>
        <button v-if="code >= 500" class="btn-ghost justify-center" @click="retry">Try again</button>
        <button v-else class="btn-ghost justify-center" @click="back">Go back</button>
      </div>

      <!-- Short reference the owner can read out to support — never a stack trace -->
      <p v-if="code >= 500" class="text-[11px] text-gray-600 pt-4">
        Reference: {{ code }} · {{ error.url || '' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; url?: string } }>()

const code = computed(() => Number(props.error?.statusCode) || 500)

// Plain-language messages. 403 explains what to do (same habit as the legacy
// app: never just say "denied" — say how to get access).
const copy = computed(() => {
  if (code.value === 401) return {
    title: 'Please sign in again',
    body: 'Your session has ended. Sign in and you will be brought straight back to this page.',
  }
  if (code.value === 403) return {
    title: "You don't have access to this page",
    body: 'Your account is not allowed to open this. Ask an administrator to enable it for you under Admin → Users → Permissions.',
  }
  if (code.value === 404) return {
    title: 'Page not found',
    body: 'This page does not exist or has been moved. Check the address, or use the menu to find what you need.',
  }
  return {
    title: 'Something went wrong on our side',
    body: 'Nothing you entered was lost or changed. Please try again in a moment; if it keeps happening, tell the administrator the reference below.',
  }
})

// A session that expired mid-use lands here as a 401: go straight to login,
// remembering the page so the user returns to it afterwards.
if (code.value === 401 && import.meta.client) {
  navigateTo({ path: '/auth/login', query: { return_to: window.location.pathname + window.location.search } })
}

const goHome = () => clearError({ redirect: '/' })
const retry  = () => reloadNuxtApp()
const back   = () => (window.history.length > 1 ? window.history.back() : goHome())
</script>
