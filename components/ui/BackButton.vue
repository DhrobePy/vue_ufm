<template>
  <button @click="goBack" type="button" title="Go back"
          class="mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] border border-white/[0.06] transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
  </button>
</template>

<script setup lang="ts">
/** Same fallback logic as ui/PageHeader.vue's built-in back button — for the
 * handful of pages (mostly HR) that hand-roll their own header markup
 * instead of using UiPageHeader. */
const router = useRouter()
function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/dashboard')
}
</script>
