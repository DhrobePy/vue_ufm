<template>
  <NuxtLink
    :to="route"
    :class="[
      'nav-item group relative',
      sub ? 'ml-1 pl-8 py-2 text-[13px]' : '',
      isActive ? 'nav-item-active' : '',
      collapsed && !sub ? 'justify-center px-0 w-full' : '',
    ]"
    :title="collapsed ? label : undefined"
  >
    <!-- Active left accent bar -->
    <div v-if="isActive && !sub"
         class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
         style="background: linear-gradient(180deg, var(--accent-from), var(--accent-to));" />

    <!-- Sub-item connector dot -->
    <div v-if="sub" class="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center">
      <div :class="['w-1.5 h-1.5 rounded-full transition-all duration-150', isActive ? '' : 'bg-white/20 group-hover:bg-white/40']"
           :style="isActive ? 'background: var(--accent-from)' : ''" />
    </div>

    <!-- Icon -->
    <span v-if="!sub || !collapsed"
          :class="['shrink-0 transition-colors duration-150', isActive ? '' : 'text-gray-500 group-hover:text-gray-300', collapsed && !sub ? 'mx-auto' : '']"
          :style="isActive ? 'color: var(--accent-from)' : ''">
      <SidebarIcon :type="iconType" class="w-4 h-4" />
    </span>

    <!-- Label -->
    <Transition name="label-fade">
      <span v-if="!collapsed"
            :class="['truncate transition-colors duration-150', isActive ? '' : 'text-gray-400 group-hover:text-gray-100']"
            :style="isActive ? 'color: var(--accent-from)' : ''">
        {{ label }}
      </span>
    </Transition>

    <!-- Tooltip when collapsed -->
    <div v-if="collapsed && !sub"
         class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-100 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
         style="background: rgba(28,28,28,0.95); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
      {{ label }}
      <div class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rotate-45"
           style="background: rgba(28,28,28,0.95); border-left: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  route: string
  iconType: string
  collapsed: boolean
  sub?: boolean
}>()

const currentRoute = useRoute()
const isActive = computed(() =>
  props.route === '/dashboard'
    ? currentRoute.path === props.route
    : currentRoute.path.startsWith(props.route)
)
</script>

<style scoped>
.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.12s ease;
}
.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
}
</style>
