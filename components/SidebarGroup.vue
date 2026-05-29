<template>
  <div>
    <!-- Group header -->
    <button
      @click="open = !open"
      :class="[
        'nav-item w-full group relative',
        collapsed ? 'justify-center px-0' : 'justify-between',
        isModuleActive ? 'nav-item-active' : '',
      ]"
      :title="collapsed ? label : undefined"
    >
      <!-- Active accent bar -->
      <div v-if="isModuleActive"
           class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
           style="background: linear-gradient(180deg, #fbbf24, #d97706);" />

      <div class="flex items-center gap-3" :class="collapsed ? 'mx-auto' : ''">
        <span :class="['shrink-0 transition-colors duration-150', isModuleActive ? 'text-gold-400' : 'text-gray-500 group-hover:text-gray-300']">
          <SidebarIcon :type="iconType" class="w-4 h-4" />
        </span>
        <Transition name="label-fade">
          <span v-if="!collapsed"
                :class="['text-sm font-medium transition-colors duration-150', isModuleActive ? 'text-gold-300' : 'text-gray-400 group-hover:text-gray-100']">
            {{ label }}
          </span>
        </Transition>
      </div>

      <!-- Chevron -->
      <Transition name="label-fade">
        <svg v-if="!collapsed"
             :class="['w-3.5 h-3.5 shrink-0 transition-transform duration-200 text-gray-600', open ? 'rotate-180' : '']"
             fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </Transition>

      <!-- Tooltip when collapsed -->
      <div v-if="collapsed"
           class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-100 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
           style="background: rgba(28,28,28,0.95); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
        {{ label }}
        <div class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rotate-45"
             style="background: rgba(28,28,28,0.95); border-left: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);" />
      </div>
    </button>

    <!-- Children -->
    <Transition name="collapse">
      <div v-if="open && !collapsed" class="mt-0.5 space-y-0.5 overflow-hidden">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  route: string
  iconType: string
  collapsed: boolean
  color?: string
}>()

const currentRoute = useRoute()
const isModuleActive = computed(() => currentRoute.path.startsWith(props.route))
const open = ref(isModuleActive.value)

// Auto-open when navigating into this module
watch(isModuleActive, (val) => { if (val) open.value = true })
// Close children when sidebar collapses
watch(() => props.collapsed, (val) => { if (val) open.value = false })
</script>

<style scoped>
.label-fade-enter-active,
.label-fade-leave-active { transition: opacity 0.12s ease; }
.label-fade-enter-from,
.label-fade-leave-to     { opacity: 0; }

.collapse-enter-active   { transition: all 0.22s ease-out; }
.collapse-leave-active   { transition: all 0.18s ease-in; }
.collapse-enter-from,
.collapse-leave-to       { max-height: 0; opacity: 0; transform: translateY(-4px); }
.collapse-enter-to,
.collapse-leave-from     { max-height: 400px; opacity: 1; transform: translateY(0); }
</style>
