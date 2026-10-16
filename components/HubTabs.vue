<template>
  <div v-if="tabs.length > 1" class="flex flex-wrap gap-1.5 p-1 rounded-xl w-fit max-w-full" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)">
    <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              :class="hubTabActive(t, route.path) ? 'btn-gold' : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.06]'">
      {{ t.label }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ hub: string }>()
const route = useRoute()
const perms = usePermissions()
const tabs = computed(() => (HUBS[props.hub] ?? []).filter(t => perms.canAccessRoute(t.to)))
</script>
